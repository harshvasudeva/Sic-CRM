/**
 * Debit Notes Controller
 * Handles vendor debit notes (returns/adjustments)
 * QuickBooks/Zoho style API
 */

const { PrismaClient } = require('@prisma/client');
const { generateVoucherNumber } = require('../services/voucherNumberService');
const { createAuditLog } = require('../services/accountingService');

const prisma = new PrismaClient();

/**
 * Get all debit notes with pagination and filters
 */
const getAllDebitNotes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            vendorId,
            status,
            fromDate,
            toDate,
            search,
            sortBy = 'issueDate',
            sortOrder = 'desc',
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (vendorId) where.vendorId = vendorId;
        if (status) where.status = status;

        if (fromDate || toDate) {
            where.issueDate = {};
            if (fromDate) where.issueDate.gte = new Date(fromDate);
            if (toDate) where.issueDate.lte = new Date(toDate);
        }

        if (search) {
            where.OR = [
                { debitNoteNumber: { contains: search, mode: 'insensitive' } },
                { reason: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [debitNotes, total] = await Promise.all([
            prisma.debitNote.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: {
                    items: true,
                },
            }),
            prisma.debitNote.count({ where }),
        ]);

        res.json({
            debitNotes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get debit notes error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get single debit note by ID
 */
const getDebitNote = async (req, res) => {
    try {
        const { id } = req.params;

        const debitNote = await prisma.debitNote.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });

        if (!debitNote) {
            return res.status(404).json({ message: 'Debit note not found' });
        }

        res.json({ debitNote });
    } catch (error) {
        console.error('Get debit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new debit note
 */
const createDebitNote = async (req, res) => {
    try {
        const {
            vendorId,
            billId,
            issueDate,
            reason,
            items,
            notes,
        } = req.body;

        // Validate required fields
        if (!vendorId || !issueDate || !reason || !items || items.length === 0) {
            return res.status(400).json({
                message: 'Missing required fields: vendorId, issueDate, reason, items',
            });
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unitPrice;
            return sum + (itemTotal * (item.taxRate || 0) / 100);
        }, 0);
        const totalAmount = subtotal + taxAmount;

        // Generate debit note number
        const debitNoteNumber = await generateVoucherNumber('debit_note');

        // Create debit note with items
        const debitNote = await prisma.debitNote.create({
            data: {
                debitNoteNumber,
                vendorId,
                billId,
                issueDate: new Date(issueDate),
                reason,
                subtotal,
                taxAmount,
                totalAmount,
                notes,
                createdBy: req.user?.id,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        taxRate: item.taxRate || 0,
                        total: item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100),
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
            entity: 'debit_note',
            entityId: debitNote.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { created: debitNote },
        });

        res.status(201).json({
            message: 'Debit note created successfully',
            debitNote,
        });
    } catch (error) {
        console.error('Create debit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Issue debit note
 */
const issueDebitNote = async (req, res) => {
    try {
        const { id } = req.params;

        const debitNote = await prisma.debitNote.findUnique({ where: { id } });
        if (!debitNote) {
            return res.status(404).json({ message: 'Debit note not found' });
        }

        if (debitNote.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft debit notes can be issued' });
        }

        const updated = await prisma.debitNote.update({
            where: { id },
            data: { status: 'issued' },
        });

        // Create audit log
        await createAuditLog({
            action: 'issue',
            entity: 'debit_note',
            entityId: id,
            userId: req.user?.id,
            userName: req.user?.name,
        });

        res.json({ message: 'Debit note issued successfully', debitNote: updated });
    } catch (error) {
        console.error('Issue debit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Apply debit note to bill
 */
const applyDebitNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { billId, amount } = req.body;

        const debitNote = await prisma.debitNote.findUnique({ where: { id } });
        if (!debitNote) {
            return res.status(404).json({ message: 'Debit note not found' });
        }

        const availableCredit = debitNote.totalAmount - debitNote.appliedAmount;
        if (amount > availableCredit) {
            return res.status(400).json({
                message: `Amount exceeds available credit. Available: ${availableCredit}`,
            });
        }

        // Update debit note
        const updated = await prisma.debitNote.update({
            where: { id },
            data: {
                appliedAmount: debitNote.appliedAmount + amount,
                status: debitNote.appliedAmount + amount >= debitNote.totalAmount ? 'applied' : 'issued',
            },
        });

        res.json({
            message: 'Debit note applied successfully',
            debitNote: updated,
            appliedToBill: billId,
            amountApplied: amount,
        });
    } catch (error) {
        console.error('Apply debit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Void debit note
 */
const voidDebitNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const debitNote = await prisma.debitNote.findUnique({ where: { id } });
        if (!debitNote) {
            return res.status(404).json({ message: 'Debit note not found' });
        }

        if (debitNote.appliedAmount > 0) {
            return res.status(400).json({
                message: 'Cannot void a debit note that has been applied',
            });
        }

        const updated = await prisma.debitNote.update({
            where: { id },
            data: {
                status: 'void',
                notes: `${debitNote.notes || ''}\n[VOIDED: ${reason || 'No reason provided'}]`,
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'void',
            entity: 'debit_note',
            entityId: id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { reason },
        });

        res.json({ message: 'Debit note voided successfully', debitNote: updated });
    } catch (error) {
        console.error('Void debit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllDebitNotes,
    getDebitNote,
    createDebitNote,
    issueDebitNote,
    applyDebitNote,
    voidDebitNote,
};
