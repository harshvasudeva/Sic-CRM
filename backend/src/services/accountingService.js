/**
 * Accounting Service
 * Handles cross-module integration for automatic journal entry creation
 * Inspired by QuickBooks/Zoho auto-posting
 */

const { PrismaClient } = require('@prisma/client');
const { generateVoucherNumber } = require('./voucherNumberService');
const prisma = new PrismaClient();

// Default account codes (should be configurable)
const DEFAULT_ACCOUNTS = {
    ACCOUNTS_RECEIVABLE: '1200',
    ACCOUNTS_PAYABLE: '2000',
    SALES_REVENUE: '4000',
    PURCHASE_EXPENSE: '5000',
    GST_OUTPUT: '2100', // GST collected on sales
    GST_INPUT: '1400',  // GST paid on purchases
    CASH: '1000',
    BANK: '1100',
    INVENTORY: '1300',
    COST_OF_GOODS_SOLD: '5100',
    SALARY_EXPENSE: '6000',
    SALARY_PAYABLE: '2200',
};

/**
 * Get account by code
 */
async function getAccountByCode(code) {
    return prisma.account.findFirst({
        where: { code },
    });
}

/**
 * Create a journal entry with lines
 * @param {object} entryData - Journal entry data
 * @param {string} entryData.reference - Reference number/document
 * @param {string} entryData.description - Entry description
 * @param {Date} entryData.entryDate - Date of entry
 * @param {array} entryData.lines - Array of { accountCode, debit, credit, description }
 * @param {string} entryData.createdBy - User ID
 */
async function createJournalEntry(entryData) {
    const { reference, description, entryDate, lines, createdBy } = entryData;

    // Validate debits = credits
    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Journal entry not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
    }

    const journalNumber = await generateVoucherNumber('journal');

    // Create the journal entry with lines
    const entry = await prisma.journalEntry.create({
        data: {
            journalNumber,
            entryDate: entryDate || new Date(),
            reference,
            description,
            totalDebit,
            totalCredit,
            status: 'draft',
            createdBy,
            lines: {
                create: await Promise.all(lines.map(async (line) => {
                    const account = await getAccountByCode(line.accountCode);
                    if (!account) {
                        throw new Error(`Account not found: ${line.accountCode}`);
                    }

                    return {
                        debitAccountId: line.debit ? account.id : null,
                        creditAccountId: line.credit ? account.id : null,
                        amount: line.debit || line.credit,
                        description: line.description,
                    };
                })),
            },
        },
        include: {
            lines: true,
        },
    });

    return entry;
}

/**
 * Create journal entry for a posted Sales Invoice
 * Debit: Accounts Receivable
 * Credit: Sales Revenue + GST Payable
 */
async function createInvoiceEntry(invoice) {
    const lines = [
        {
            accountCode: DEFAULT_ACCOUNTS.ACCOUNTS_RECEIVABLE,
            debit: invoice.totalAmount,
            credit: 0,
            description: `AR for Invoice ${invoice.invoiceNumber}`,
        },
        {
            accountCode: DEFAULT_ACCOUNTS.SALES_REVENUE,
            debit: 0,
            credit: invoice.subtotal,
            description: `Sales Revenue - ${invoice.invoiceNumber}`,
        },
    ];

    if (invoice.taxAmount > 0) {
        lines.push({
            accountCode: DEFAULT_ACCOUNTS.GST_OUTPUT,
            debit: 0,
            credit: invoice.taxAmount,
            description: `GST Output - ${invoice.invoiceNumber}`,
        });
    }

    return createJournalEntry({
        reference: invoice.invoiceNumber,
        description: `Sales Invoice ${invoice.invoiceNumber} - ${invoice.customerName || 'Customer'}`,
        entryDate: invoice.invoiceDate,
        lines,
        createdBy: invoice.createdBy,
    });
}

/**
 * Create journal entry for a posted Bill (Vendor Invoice)
 * Debit: Purchase/Expense + GST Input
 * Credit: Accounts Payable
 */
async function createBillEntry(bill) {
    const lines = [
        {
            accountCode: DEFAULT_ACCOUNTS.PURCHASE_EXPENSE,
            debit: bill.subtotal,
            credit: 0,
            description: `Purchase - Bill ${bill.billNumber}`,
        },
        {
            accountCode: DEFAULT_ACCOUNTS.ACCOUNTS_PAYABLE,
            debit: 0,
            credit: bill.totalAmount,
            description: `AP for Bill ${bill.billNumber}`,
        },
    ];

    if (bill.taxAmount > 0) {
        lines.push({
            accountCode: DEFAULT_ACCOUNTS.GST_INPUT,
            debit: bill.taxAmount,
            credit: 0,
            description: `GST Input - ${bill.billNumber}`,
        });
    }

    return createJournalEntry({
        reference: bill.billNumber,
        description: `Vendor Bill ${bill.billNumber} - ${bill.vendorName || 'Vendor'}`,
        entryDate: bill.billDate,
        lines,
        createdBy: bill.createdBy,
    });
}

/**
 * Create journal entry for Payment Received (from Customer)
 * Debit: Bank/Cash
 * Credit: Accounts Receivable
 */
async function createPaymentReceivedEntry(payment) {
    const accountCode = payment.paymentMode === 'cash'
        ? DEFAULT_ACCOUNTS.CASH
        : DEFAULT_ACCOUNTS.BANK;

    return createJournalEntry({
        reference: payment.paymentNumber,
        description: `Payment Received - ${payment.paymentNumber}`,
        entryDate: payment.paymentDate,
        lines: [
            {
                accountCode,
                debit: payment.amount,
                credit: 0,
                description: `Payment received from customer`,
            },
            {
                accountCode: DEFAULT_ACCOUNTS.ACCOUNTS_RECEIVABLE,
                debit: 0,
                credit: payment.amount,
                description: `AR reduced - ${payment.paymentNumber}`,
            },
        ],
        createdBy: payment.createdBy,
    });
}

/**
 * Create journal entry for Payment Made (to Vendor)
 * Debit: Accounts Payable
 * Credit: Bank/Cash
 */
async function createPaymentMadeEntry(billPayment) {
    const accountCode = billPayment.paymentMode === 'cash'
        ? DEFAULT_ACCOUNTS.CASH
        : DEFAULT_ACCOUNTS.BANK;

    return createJournalEntry({
        reference: billPayment.paymentNumber,
        description: `Payment Made - ${billPayment.paymentNumber}`,
        entryDate: billPayment.paymentDate,
        lines: [
            {
                accountCode: DEFAULT_ACCOUNTS.ACCOUNTS_PAYABLE,
                debit: billPayment.amount,
                credit: 0,
                description: `AP reduced - ${billPayment.paymentNumber}`,
            },
            {
                accountCode,
                debit: 0,
                credit: billPayment.amount,
                description: `Payment to vendor`,
            },
        ],
        createdBy: billPayment.createdBy,
    });
}

/**
 * Create journal entry for Stock Adjustment
 * Debit/Credit: Inventory
 * Credit/Debit: Cost adjustment account
 */
async function createStockAdjustmentEntry(stockJournal) {
    const lines = [];

    for (const item of stockJournal.items) {
        if (item.quantityIn > 0) {
            // Stock increase
            lines.push({
                accountCode: DEFAULT_ACCOUNTS.INVENTORY,
                debit: item.totalValue,
                credit: 0,
                description: `Stock In - ${item.productName || item.productId}`,
            });
            lines.push({
                accountCode: DEFAULT_ACCOUNTS.COST_OF_GOODS_SOLD, // Or adjustment account
                debit: 0,
                credit: item.totalValue,
                description: `Stock adjustment`,
            });
        } else if (item.quantityOut > 0) {
            // Stock decrease
            lines.push({
                accountCode: DEFAULT_ACCOUNTS.COST_OF_GOODS_SOLD,
                debit: item.totalValue,
                credit: 0,
                description: `Stock Out - ${item.productName || item.productId}`,
            });
            lines.push({
                accountCode: DEFAULT_ACCOUNTS.INVENTORY,
                debit: 0,
                credit: item.totalValue,
                description: `Stock adjustment`,
            });
        }
    }

    if (lines.length === 0) return null;

    return createJournalEntry({
        reference: stockJournal.journalNumber,
        description: `Stock Journal - ${stockJournal.reason}`,
        entryDate: stockJournal.journalDate,
        lines,
        createdBy: stockJournal.createdBy,
    });
}

/**
 * Create journal entry for Payroll
 * Debit: Salary Expense
 * Credit: Salary Payable / Bank
 */
async function createPayrollEntry(payroll) {
    return createJournalEntry({
        reference: payroll.payrollNumber,
        description: `Payroll - ${payroll.period}`,
        entryDate: payroll.processDate,
        lines: [
            {
                accountCode: DEFAULT_ACCOUNTS.SALARY_EXPENSE,
                debit: payroll.totalGross,
                credit: 0,
                description: `Salary expense for ${payroll.period}`,
            },
            {
                accountCode: DEFAULT_ACCOUNTS.SALARY_PAYABLE,
                debit: 0,
                credit: payroll.totalNet,
                description: `Salary payable`,
            },
            // Add more lines for deductions, taxes, etc.
        ],
        createdBy: payroll.createdBy,
    });
}

/**
 * Create audit log entry
 */
async function createAuditLog(data) {
    return prisma.auditLog.create({
        data: {
            action: data.action,
            entity: data.entity,
            entityId: data.entityId,
            userId: data.userId,
            userName: data.userName,
            changes: data.changes,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        },
    });
}

module.exports = {
    createJournalEntry,
    createInvoiceEntry,
    createBillEntry,
    createPaymentReceivedEntry,
    createPaymentMadeEntry,
    createStockAdjustmentEntry,
    createPayrollEntry,
    createAuditLog,
    DEFAULT_ACCOUNTS,
    getAccountByCode,
};
