/**
 * Credit Notes Controller
 * Handles customer credit notes (returns/adjustments)
 * QuickBooks/Zoho style API
 */

const { PrismaClient } = require('@prisma/client');
const { generateVoucherNumber } = require('../services/voucherNumberService');
const { createAuditLog } = require('../services/accountingService');

const prisma = new PrismaClient();

/**
 * Get all credit notes with pagination and filters
 */
const getAllCreditNotes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            customerId,
            status,
            fromDate,
            toDate,
            search,
            sortBy = 'issueDate',
            sortOrder = 'desc',
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (customerId) where.customerId = customerId;
        if (status) where.status = status;

        if (fromDate || toDate) {
            where.issueDate = {};
            if (fromDate) where.issueDate.gte = new Date(fromDate);
            if (toDate) where.issueDate.lte = new Date(toDate);
        }

        if (search) {
            where.OR = [
                { creditNoteNumber: { contains: search, mode: 'insensitive' } },
                { reason: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [creditNotes, total] = await Promise.all([
            prisma.creditNote.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: {
                    items: true,
                },
            }),
            prisma.creditNote.count({ where }),
        ]);

        res.json({
            creditNotes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get credit notes error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get single credit note by ID
 */
const getCreditNote = async (req, res) => {
    try {
        const { id } = req.params;

        const creditNote = await prisma.creditNote.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });

        if (!creditNote) {
            return res.status(404).json({ message: 'Credit note not found' });
        }

        res.json({ creditNote });
    } catch (error) {
        console.error('Get credit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new credit note
 */
const createCreditNote = async (req, res) => {
    try {
        const {
            customerId,
            invoiceId,
            issueDate,
            reason,
            items,
            notes,
        } = req.body;

        // Validate required fields
        if (!customerId || !issueDate || !reason || !items || items.length === 0) {
            return res.status(400).json({
                message: 'Missing required fields: customerId, issueDate, reason, items',
            });
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unitPrice;
            return sum + (itemTotal * (item.taxRate || 0) / 100);
        }, 0);
        const totalAmount = subtotal + taxAmount;

        // Generate credit note number
        const creditNoteNumber = await generateVoucherNumber('credit_note');

        // Create credit note with items
        const creditNote = await prisma.creditNote.create({
            data: {
                creditNoteNumber,
                customerId,
                invoiceId,
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
            entity: 'credit_note',
            entityId: creditNote.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { created: creditNote },
        });

        res.status(201).json({
            message: 'Credit note created successfully',
            creditNote,
        });
    } catch (error) {
        console.error('Create credit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Issue credit note (change status from draft to issued)
 */
const issueCreditNote = async (req, res) => {
    try {
        const { id } = req.params;

        const creditNote = await prisma.creditNote.findUnique({ where: { id } });
        if (!creditNote) {
            return res.status(404).json({ message: 'Credit note not found' });
        }

        if (creditNote.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft credit notes can be issued' });
        }

        const updated = await prisma.creditNote.update({
            where: { id },
            data: { status: 'issued' },
        });

        // Create audit log
        await createAuditLog({
            action: 'issue',
            entity: 'credit_note',
            entityId: id,
            userId: req.user?.id,
            userName: req.user?.name,
        });

        res.json({ message: 'Credit note issued successfully', creditNote: updated });
    } catch (error) {
        console.error('Issue credit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Apply credit note to invoice
 */
const applyCreditNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { invoiceId, amount } = req.body;

        const creditNote = await prisma.creditNote.findUnique({ where: { id } });
        if (!creditNote) {
            return res.status(404).json({ message: 'Credit note not found' });
        }

        const availableCredit = creditNote.totalAmount - creditNote.appliedAmount;
        if (amount > availableCredit) {
            return res.status(400).json({
                message: `Amount exceeds available credit. Available: ${availableCredit}`,
            });
        }

        // Update credit note
        const updated = await prisma.creditNote.update({
            where: { id },
            data: {
                appliedAmount: creditNote.appliedAmount + amount,
                status: creditNote.appliedAmount + amount >= creditNote.totalAmount ? 'applied' : 'issued',
            },
        });

        // Here you would also update the invoice balance
        // This depends on your invoice structure

        res.json({
            message: 'Credit note applied successfully',
            creditNote: updated,
            appliedToInvoice: invoiceId,
            amountApplied: amount,
        });
    } catch (error) {
        console.error('Apply credit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Void credit note
 */
const voidCreditNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const creditNote = await prisma.creditNote.findUnique({ where: { id } });
        if (!creditNote) {
            return res.status(404).json({ message: 'Credit note not found' });
        }

        if (creditNote.appliedAmount > 0) {
            return res.status(400).json({
                message: 'Cannot void a credit note that has been applied',
            });
        }

        const updated = await prisma.creditNote.update({
            where: { id },
            data: {
                status: 'void',
                notes: `${creditNote.notes || ''}\n[VOIDED: ${reason || 'No reason provided'}]`,
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'void',
            entity: 'credit_note',
            entityId: id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { reason },
        });

        res.json({ message: 'Credit note voided successfully', creditNote: updated });
    } catch (error) {
        console.error('Void credit note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllCreditNotes,
    getCreditNote,
    createCreditNote,
    issueCreditNote,
    applyCreditNote,
    voidCreditNote,
};
