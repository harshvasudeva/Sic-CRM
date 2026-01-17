/**
 * Voucher Number Service
 * Generates auto-incrementing voucher numbers like Tally/QuickBooks
 * Format: PREFIX/FISCAL-YEAR/NUMBER (e.g., INV/2025-26/0001)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default voucher configurations
const DEFAULT_CONFIGS = {
    invoice: { prefix: 'INV', padding: 4 },
    credit_note: { prefix: 'CN', padding: 4 },
    debit_note: { prefix: 'DN', padding: 4 },
    payment: { prefix: 'RCV', padding: 4 },
    receipt: { prefix: 'RCT', padding: 4 },
    journal: { prefix: 'JV', padding: 4 },
    bill: { prefix: 'BILL', padding: 4 },
    bill_payment: { prefix: 'PAY', padding: 4 },
    purchase_order: { prefix: 'PO', padding: 4 },
    grn: { prefix: 'GRN', padding: 4 },
    sales_order: { prefix: 'SO', padding: 4 },
    quotation: { prefix: 'QT', padding: 4 },
    stock_journal: { prefix: 'STK', padding: 4 },
};

/**
 * Get current fiscal year in format "2025-26"
 */
function getCurrentFiscalYear() {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    // Fiscal year starts in April (month 3)
    if (month >= 3) {
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
}

/**
 * Generate the next voucher number for a given type
 * @param {string} voucherType - Type of voucher (invoice, bill, payment, etc.)
 * @returns {Promise<string>} - Generated voucher number
 */
async function generateVoucherNumber(voucherType) {
    const fiscalYear = getCurrentFiscalYear();
    const config = DEFAULT_CONFIGS[voucherType] || { prefix: voucherType.toUpperCase(), padding: 4 };

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
        // Try to find existing sequence
        let sequence = await tx.voucherNumber.findFirst({
            where: {
                voucherType,
                fiscalYear,
            },
        });

        if (!sequence) {
            // Create new sequence for this fiscal year
            sequence = await tx.voucherNumber.create({
                data: {
                    voucherType,
                    prefix: config.prefix,
                    fiscalYear,
                    nextNumber: 1,
                    padding: config.padding,
                },
            });
        }

        const currentNumber = sequence.nextNumber;

        // Increment the sequence
        await tx.voucherNumber.update({
            where: { id: sequence.id },
            data: { nextNumber: currentNumber + 1 },
        });

        // Format the number with padding
        const paddedNumber = currentNumber.toString().padStart(sequence.padding, '0');
        return `${sequence.prefix}/${fiscalYear}/${paddedNumber}`;
    });

    return result;
}

/**
 * Reset voucher sequence for a new fiscal year
 * @param {string} voucherType - Type of voucher
 * @param {string} fiscalYear - Fiscal year to reset
 */
async function resetVoucherSequence(voucherType, fiscalYear) {
    await prisma.voucherNumber.updateMany({
        where: {
            voucherType,
            fiscalYear,
        },
        data: {
            nextNumber: 1,
        },
    });
}

/**
 * Get current sequence info
 * @param {string} voucherType - Type of voucher
 */
async function getSequenceInfo(voucherType) {
    const fiscalYear = getCurrentFiscalYear();
    return prisma.voucherNumber.findFirst({
        where: {
            voucherType,
            fiscalYear,
        },
    });
}

/**
 * Update voucher configuration
 * @param {string} voucherType - Type of voucher
 * @param {object} config - New configuration
 */
async function updateVoucherConfig(voucherType, config) {
    const fiscalYear = getCurrentFiscalYear();
    return prisma.voucherNumber.upsert({
        where: {
            voucherType_fiscalYear: {
                voucherType,
                fiscalYear,
            },
        },
        update: config,
        create: {
            voucherType,
            fiscalYear,
            ...DEFAULT_CONFIGS[voucherType],
            ...config,
        },
    });
}

module.exports = {
    generateVoucherNumber,
    resetVoucherSequence,
    getSequenceInfo,
    updateVoucherConfig,
    getCurrentFiscalYear,
    DEFAULT_CONFIGS,
};
