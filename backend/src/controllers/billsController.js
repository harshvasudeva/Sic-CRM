/**
 * Bills Controller
 * Handles vendor invoices/bills CRUD operations
 * QuickBooks/Zoho style API
 */

const { PrismaClient } = require('@prisma/client');
const { generateVoucherNumber } = require('../services/voucherNumberService');
const { createBillEntry, createAuditLog } = require('../services/accountingService');

const prisma = new PrismaClient();

/**
 * Get all bills with pagination and filters
 */
const getAllBills = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            vendorId,
            fromDate,
            toDate,
            search,
            sortBy = 'billDate',
            sortOrder = 'desc',
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};

        if (status) where.status = status;
        if (vendorId) where.vendorId = vendorId;

        if (fromDate || toDate) {
            where.billDate = {};
            if (fromDate) where.billDate.gte = new Date(fromDate);
            if (toDate) where.billDate.lte = new Date(toDate);
        }

        if (search) {
            where.OR = [
                { billNumber: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [bills, total] = await Promise.all([
            prisma.bill.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: {
                    items: true,
                    payments: true,
                },
            }),
            prisma.bill.count({ where }),
        ]);

        res.json({
            bills,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get single bill by ID
 */
const getBill = async (req, res) => {
    try {
        const { id } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { id },
            include: {
                items: true,
                payments: true,
            },
        });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.json({ bill });
    } catch (error) {
        console.error('Get bill error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new bill
 */
const createBill = async (req, res) => {
    try {
        const {
            vendorId,
            purchaseOrderId,
            grnId,
            billDate,
            dueDate,
            items,
            paymentTerms,
            notes,
        } = req.body;

        // Validate required fields
        if (!vendorId || !billDate || !dueDate || !items || items.length === 0) {
            return res.status(400).json({
                message: 'Missing required fields: vendorId, billDate, dueDate, items',
            });
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => {
            const itemSubtotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
            return sum + itemSubtotal;
        }, 0);

        const taxAmount = items.reduce((sum, item) => {
            const itemSubtotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
            return sum + (itemSubtotal * (item.taxRate || 0) / 100);
        }, 0);

        const totalAmount = subtotal + taxAmount;

        // Generate bill number
        const billNumber = await generateVoucherNumber('bill');

        // Create bill with items
        const bill = await prisma.bill.create({
            data: {
                billNumber,
                vendorId,
                purchaseOrderId,
                grnId,
                billDate: new Date(billDate),
                dueDate: new Date(dueDate),
                subtotal,
                taxAmount,
                totalAmount,
                balance: totalAmount,
                paymentTerms,
                notes,
                createdBy: req.user?.id,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        taxRate: item.taxRate || 0,
                        discount: item.discount || 0,
                        total: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100) * (1 + (item.taxRate || 0) / 100),
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'create',
            entity: 'bill',
            entityId: bill.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { created: bill },
        });

        res.status(201).json({
            message: 'Bill created successfully',
            bill,
        });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update bill
 */
const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if bill exists
        const existingBill = await prisma.bill.findUnique({ where: { id } });
        if (!existingBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Don't allow update of paid/void bills
        if (['paid', 'void'].includes(existingBill.status)) {
            return res.status(400).json({
                message: `Cannot update bill with status: ${existingBill.status}`,
            });
        }

        const bill = await prisma.bill.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
            include: {
                items: true,
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'update',
            entity: 'bill',
            entityId: bill.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { before: existingBill, after: bill },
        });

        res.json({ message: 'Bill updated successfully', bill });
    } catch (error) {
        console.error('Update bill error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Post bill (finalize and create journal entry)
 */
const postBill = async (req, res) => {
    try {
        const { id } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        if (bill.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft bills can be posted' });
        }

        // Update bill status
        const updatedBill = await prisma.bill.update({
            where: { id },
            data: { status: 'pending' },
        });

        // Create accounting journal entry
        try {
            await createBillEntry(bill);
        } catch (journalError) {
            console.error('Journal entry creation failed:', journalError);
            // Continue even if journal entry fails (for now)
        }

        // Create audit log
        await createAuditLog({
            action: 'post',
            entity: 'bill',
            entityId: bill.id,
            userId: req.user?.id,
            userName: req.user?.name,
        });

        res.json({ message: 'Bill posted successfully', bill: updatedBill });
    } catch (error) {
        console.error('Post bill error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Record payment against bill
 */
const recordPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, paymentDate, paymentMode, referenceNumber, bankAccountId, notes } = req.body;

        const bill = await prisma.bill.findUnique({ where: { id } });
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        if (amount > bill.balance) {
            return res.status(400).json({
                message: `Payment amount (${amount}) exceeds bill balance (${bill.balance})`,
            });
        }

        // Generate payment number
        const paymentNumber = await generateVoucherNumber('bill_payment');

        // Create payment record
        const payment = await prisma.billPayment.create({
            data: {
                paymentNumber,
                vendorId: bill.vendorId,
                billId: id,
                paymentDate: new Date(paymentDate),
                amount,
                paymentMode,
                referenceNumber,
                bankAccountId,
                notes,
                createdBy: req.user?.id,
            },
        });

        // Update bill
        const newPaidAmount = bill.paidAmount + amount;
        const newBalance = bill.totalAmount - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';

        const updatedBill = await prisma.bill.update({
            where: { id },
            data: {
                paidAmount: newPaidAmount,
                balance: newBalance,
                status: newStatus,
            },
        });

        res.json({
            message: 'Payment recorded successfully',
            payment,
            bill: updatedBill,
        });
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Void a bill
 */
const voidBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const bill = await prisma.bill.findUnique({ where: { id } });
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        if (bill.paidAmount > 0) {
            return res.status(400).json({
                message: 'Cannot void a bill with payments. Refund payments first.',
            });
        }

        const updatedBill = await prisma.bill.update({
            where: { id },
            data: {
                status: 'void',
                notes: `${bill.notes || ''}\n[VOIDED: ${reason || 'No reason provided'}]`,
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'void',
            entity: 'bill',
            entityId: bill.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { reason },
        });

        res.json({ message: 'Bill voided successfully', bill: updatedBill });
    } catch (error) {
        console.error('Void bill error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get bill summary/statistics
 */
const getBillsSummary = async (req, res) => {
    try {
        const { fromDate, toDate, vendorId } = req.query;

        const where = {};
        if (vendorId) where.vendorId = vendorId;
        if (fromDate || toDate) {
            where.billDate = {};
            if (fromDate) where.billDate.gte = new Date(fromDate);
            if (toDate) where.billDate.lte = new Date(toDate);
        }

        const [
            totalBills,
            draftBills,
            pendingBills,
            paidBills,
            overdueBills,
            totalAmount,
            totalPaid,
            totalBalance,
        ] = await Promise.all([
            prisma.bill.count({ where }),
            prisma.bill.count({ where: { ...where, status: 'draft' } }),
            prisma.bill.count({ where: { ...where, status: 'pending' } }),
            prisma.bill.count({ where: { ...where, status: 'paid' } }),
            prisma.bill.count({
                where: {
                    ...where,
                    status: { in: ['pending', 'partial'] },
                    dueDate: { lt: new Date() },
                },
            }),
            prisma.bill.aggregate({ where, _sum: { totalAmount: true } }),
            prisma.bill.aggregate({ where, _sum: { paidAmount: true } }),
            prisma.bill.aggregate({ where, _sum: { balance: true } }),
        ]);

        res.json({
            summary: {
                totalBills,
                draftBills,
                pendingBills,
                paidBills,
                overdueBills,
                totalAmount: totalAmount._sum.totalAmount || 0,
                totalPaid: totalPaid._sum.paidAmount || 0,
                totalBalance: totalBalance._sum.balance || 0,
            },
        });
    } catch (error) {
        console.error('Get bills summary error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllBills,
    getBill,
    createBill,
    updateBill,
    postBill,
    recordPayment,
    voidBill,
    getBillsSummary,
};
