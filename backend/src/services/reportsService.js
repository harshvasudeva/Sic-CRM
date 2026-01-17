/**
 * Financial Reports Service
 * Generates accounting reports (Balance Sheet, P&L, GST, etc.)
 * QuickBooks/Zoho style API
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get fiscal year dates
 * @param {Date} date - A date within the fiscal year
 * @returns {object} - { start, end } dates
 */
function getFiscalYear(date = new Date()) {
    const month = date.getMonth();
    const year = date.getFullYear();

    // Indian fiscal year: April 1 to March 31
    if (month >= 3) { // April onwards
        return {
            start: new Date(year, 3, 1), // April 1st of current year
            end: new Date(year + 1, 2, 31), // March 31st of next year
            label: `FY ${year}-${(year + 1).toString().slice(-2)}`,
        };
    } else {
        return {
            start: new Date(year - 1, 3, 1), // April 1st of previous year
            end: new Date(year, 2, 31), // March 31st of current year
            label: `FY ${year - 1}-${year.toString().slice(-2)}`,
        };
    }
}

/**
 * Get trial balance
 * @param {Date} asOfDate - Report date
 */
async function getTrialBalance(asOfDate = new Date()) {
    try {
        // Get all posted journal entries up to the date
        const entries = await prisma.journalEntry.findMany({
            where: {
                status: 'posted',
                entryDate: { lte: asOfDate },
            },
            include: { lines: { include: { debitAccount: true, creditAccount: true } } },
        });

        // Calculate balances by account
        const balances = new Map();

        entries.forEach(entry => {
            entry.lines.forEach(line => {
                const debitId = line.debitAccountId;
                const creditId = line.creditAccountId;

                if (debitId) {
                    const current = balances.get(debitId) || { debit: 0, credit: 0, account: line.debitAccount };
                    current.debit += Number(line.amount);
                    balances.set(debitId, current);
                }

                if (creditId) {
                    const current = balances.get(creditId) || { debit: 0, credit: 0, account: line.creditAccount };
                    current.credit += Number(line.amount);
                    balances.set(creditId, current);
                }
            });
        });

        // Format response
        const accounts = [];
        let totalDebit = 0;
        let totalCredit = 0;

        balances.forEach((value, key) => {
            const balance = value.debit - value.credit;
            totalDebit += value.debit;
            totalCredit += value.credit;

            accounts.push({
                accountId: key,
                accountCode: value.account?.code,
                accountName: value.account?.name,
                accountType: value.account?.type,
                debit: value.debit,
                credit: value.credit,
                balance,
            });
        });

        return {
            asOfDate: asOfDate.toISOString().split('T')[0],
            accounts: accounts.sort((a, b) => (a.accountCode || '').localeCompare(b.accountCode || '')),
            totals: { debit: totalDebit, credit: totalCredit },
            isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
        };
    } catch (error) {
        console.error('Trial balance error:', error);
        throw error;
    }
}

/**
 * Get Profit & Loss statement
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 */
async function getProfitAndLoss(startDate, endDate) {
    try {
        const entries = await prisma.journalEntry.findMany({
            where: {
                status: 'posted',
                entryDate: { gte: startDate, lte: endDate },
            },
            include: { lines: { include: { debitAccount: true, creditAccount: true } } },
        });

        const incomeAccounts = [];
        const expenseAccounts = [];
        let totalIncome = 0;
        let totalExpenses = 0;

        const accountTotals = new Map();

        entries.forEach(entry => {
            entry.lines.forEach(line => {
                const account = line.debitAccount || line.creditAccount;
                if (!account) return;

                const isDebit = !!line.debitAccountId;
                const amount = Number(line.amount);

                const current = accountTotals.get(account.id) || {
                    account,
                    amount: 0
                };

                if (account.type === 'income' || account.type === 'revenue') {
                    // Income: credits increase, debits decrease
                    current.amount += isDebit ? -amount : amount;
                } else if (account.type === 'expense') {
                    // Expenses: debits increase, credits decrease
                    current.amount += isDebit ? amount : -amount;
                }

                accountTotals.set(account.id, current);
            });
        });

        accountTotals.forEach((value) => {
            const { account, amount } = value;

            if (account.type === 'income' || account.type === 'revenue') {
                incomeAccounts.push({
                    accountId: account.id,
                    accountCode: account.code,
                    accountName: account.name,
                    amount,
                });
                totalIncome += amount;
            } else if (account.type === 'expense') {
                expenseAccounts.push({
                    accountId: account.id,
                    accountCode: account.code,
                    accountName: account.name,
                    amount,
                });
                totalExpenses += amount;
            }
        });

        const netProfit = totalIncome - totalExpenses;

        return {
            period: { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
            income: {
                accounts: incomeAccounts.sort((a, b) => b.amount - a.amount),
                total: totalIncome,
            },
            expenses: {
                accounts: expenseAccounts.sort((a, b) => b.amount - a.amount),
                total: totalExpenses,
            },
            grossProfit: totalIncome, // Simplified
            netProfit,
            netProfitMargin: totalIncome > 0 ? (netProfit / totalIncome * 100).toFixed(2) : 0,
        };
    } catch (error) {
        console.error('P&L error:', error);
        throw error;
    }
}

/**
 * Get Balance Sheet
 * @param {Date} asOfDate - Report date
 */
async function getBalanceSheet(asOfDate = new Date()) {
    try {
        const trialBalance = await getTrialBalance(asOfDate);

        const assets = { accounts: [], total: 0 };
        const liabilities = { accounts: [], total: 0 };
        const equity = { accounts: [], total: 0 };

        trialBalance.accounts.forEach(account => {
            const entry = {
                accountId: account.accountId,
                accountCode: account.accountCode,
                accountName: account.accountName,
                balance: Math.abs(account.balance),
            };

            switch (account.accountType) {
                case 'asset':
                    assets.accounts.push(entry);
                    assets.total += account.balance; // Debit balance for assets
                    break;
                case 'liability':
                    liabilities.accounts.push(entry);
                    liabilities.total += -account.balance; // Credit balance for liabilities
                    break;
                case 'equity':
                case 'capital':
                    equity.accounts.push(entry);
                    equity.total += -account.balance; // Credit balance for equity
                    break;
            }
        });

        // Accounting equation: Assets = Liabilities + Equity
        const isBalanced = Math.abs(assets.total - (liabilities.total + equity.total)) < 0.01;

        return {
            asOfDate: asOfDate.toISOString().split('T')[0],
            assets: {
                accounts: assets.accounts.sort((a, b) => b.balance - a.balance),
                total: assets.total,
            },
            liabilities: {
                accounts: liabilities.accounts.sort((a, b) => b.balance - a.balance),
                total: liabilities.total,
            },
            equity: {
                accounts: equity.accounts.sort((a, b) => b.balance - a.balance),
                total: equity.total,
            },
            isBalanced,
        };
    } catch (error) {
        console.error('Balance sheet error:', error);
        throw error;
    }
}

/**
 * Get GST Report (Indian tax)
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 */
async function getGSTReport(startDate, endDate) {
    try {
        // Get invoices for GST output
        const invoices = await prisma.invoice.findMany({
            where: {
                invoiceDate: { gte: startDate, lte: endDate },
                status: { in: ['sent', 'paid', 'partial'] },
            },
            select: {
                id: true,
                invoiceNumber: true,
                invoiceDate: true,
                subtotal: true,
                taxAmount: true,
                total: true,
            },
        });

        // Get bills for GST input
        const bills = await prisma.bill.findMany({
            where: {
                billDate: { gte: startDate, lte: endDate },
                status: { in: ['posted', 'paid', 'partial'] },
            },
            select: {
                id: true,
                billNumber: true,
                billDate: true,
                subtotal: true,
                taxAmount: true,
                totalAmount: true,
            },
        });

        const outputGST = invoices.reduce((sum, inv) => sum + (Number(inv.taxAmount) || 0), 0);
        const inputGST = bills.reduce((sum, bill) => sum + (Number(bill.taxAmount) || 0), 0);
        const netGST = outputGST - inputGST;

        return {
            period: { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
            output: {
                transactions: invoices.length,
                taxableValue: invoices.reduce((sum, inv) => sum + (Number(inv.subtotal) || 0), 0),
                gst: outputGST,
            },
            input: {
                transactions: bills.length,
                taxableValue: bills.reduce((sum, bill) => sum + (Number(bill.subtotal) || 0), 0),
                gst: inputGST,
            },
            netPayable: netGST,
            isRefund: netGST < 0,
        };
    } catch (error) {
        console.error('GST report error:', error);
        throw error;
    }
}

/**
 * Get Accounts Receivable Aging Report
 * @param {Date} asOfDate - Report date
 */
async function getARAgingReport(asOfDate = new Date()) {
    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                status: { in: ['sent', 'partial', 'overdue'] },
                dueDate: { lte: asOfDate },
            },
        });

        const aging = {
            current: { count: 0, amount: 0 },      // Not yet due
            days1to30: { count: 0, amount: 0 },    // 1-30 days overdue
            days31to60: { count: 0, amount: 0 },   // 31-60 days overdue
            days61to90: { count: 0, amount: 0 },   // 61-90 days overdue
            over90: { count: 0, amount: 0 },       // > 90 days overdue
        };

        const today = asOfDate.getTime();

        invoices.forEach(inv => {
            const dueDate = new Date(inv.dueDate).getTime();
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            const balance = Number(inv.balance) || 0;

            if (daysOverdue <= 0) {
                aging.current.count++;
                aging.current.amount += balance;
            } else if (daysOverdue <= 30) {
                aging.days1to30.count++;
                aging.days1to30.amount += balance;
            } else if (daysOverdue <= 60) {
                aging.days31to60.count++;
                aging.days31to60.amount += balance;
            } else if (daysOverdue <= 90) {
                aging.days61to90.count++;
                aging.days61to90.amount += balance;
            } else {
                aging.over90.count++;
                aging.over90.amount += balance;
            }
        });

        const totalOutstanding = Object.values(aging).reduce((sum, bucket) => sum + bucket.amount, 0);

        return {
            asOfDate: asOfDate.toISOString().split('T')[0],
            aging,
            totalOutstanding,
            totalInvoices: invoices.length,
        };
    } catch (error) {
        console.error('AR aging error:', error);
        throw error;
    }
}

/**
 * Get Accounts Payable Aging Report
 * @param {Date} asOfDate - Report date
 */
async function getAPAgingReport(asOfDate = new Date()) {
    try {
        const bills = await prisma.bill.findMany({
            where: {
                status: { in: ['posted', 'partial'] },
                dueDate: { lte: asOfDate },
            },
        });

        const aging = {
            current: { count: 0, amount: 0 },
            days1to30: { count: 0, amount: 0 },
            days31to60: { count: 0, amount: 0 },
            days61to90: { count: 0, amount: 0 },
            over90: { count: 0, amount: 0 },
        };

        const today = asOfDate.getTime();

        bills.forEach(bill => {
            const dueDate = new Date(bill.dueDate).getTime();
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            const balance = Number(bill.balance) || 0;

            if (daysOverdue <= 0) {
                aging.current.count++;
                aging.current.amount += balance;
            } else if (daysOverdue <= 30) {
                aging.days1to30.count++;
                aging.days1to30.amount += balance;
            } else if (daysOverdue <= 60) {
                aging.days31to60.count++;
                aging.days31to60.amount += balance;
            } else if (daysOverdue <= 90) {
                aging.days61to90.count++;
                aging.days61to90.amount += balance;
            } else {
                aging.over90.count++;
                aging.over90.amount += balance;
            }
        });

        const totalPayable = Object.values(aging).reduce((sum, bucket) => sum + bucket.amount, 0);

        return {
            asOfDate: asOfDate.toISOString().split('T')[0],
            aging,
            totalPayable,
            totalBills: bills.length,
        };
    } catch (error) {
        console.error('AP aging error:', error);
        throw error;
    }
}

/**
 * Get Cash Flow Statement
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 */
async function getCashFlowStatement(startDate, endDate) {
    try {
        // Simplified cash flow based on payments
        const paymentsReceived = await prisma.payment.findMany({
            where: {
                paymentDate: { gte: startDate, lte: endDate },
                status: { not: 'void' },
            },
        });

        const paymentsMade = await prisma.billPayment.findMany({
            where: {
                paymentDate: { gte: startDate, lte: endDate },
            },
        });

        const cashInflow = paymentsReceived.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const cashOutflow = paymentsMade.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const netCashFlow = cashInflow - cashOutflow;

        return {
            period: { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
            operating: {
                inflows: {
                    customerReceipts: cashInflow,
                    total: cashInflow,
                },
                outflows: {
                    supplierPayments: cashOutflow,
                    total: cashOutflow,
                },
                net: netCashFlow,
            },
            netCashFlow,
        };
    } catch (error) {
        console.error('Cash flow error:', error);
        throw error;
    }
}

module.exports = {
    getFiscalYear,
    getTrialBalance,
    getProfitAndLoss,
    getBalanceSheet,
    getGSTReport,
    getARAgingReport,
    getAPAgingReport,
    getCashFlowStatement,
};
