/**
 * Payments Controller
 * Handles customer payments received
 * QuickBooks/Zoho style API
 */

const { PrismaClient } = require('@prisma/client');
const { generateVoucherNumber } = require('../services/voucherNumberService');
const { createPaymentReceivedEntry, createAuditLog } = require('../services/accountingService');

const prisma = new PrismaClient();

/**
 * Get all payments with pagination and filters
 */
const getAllPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            customerId,
            fromDate,
            toDate,
            paymentMode,
            status,
            search,
            sortBy = 'paymentDate',
            sortOrder = 'desc',
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (customerId) where.customerId = customerId;
        if (paymentMode) where.paymentMode = paymentMode;
        if (status) where.status = status;

        if (fromDate || toDate) {
            where.paymentDate = {};
            if (fromDate) where.paymentDate.gte = new Date(fromDate);
            if (toDate) where.paymentDate.lte = new Date(toDate);
        }

        if (search) {
            where.OR = [
                { paymentNumber: { contains: search, mode: 'insensitive' } },
                { referenceNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { [sortBy]: sortOrder },
                include: {
                    applications: true,
                },
            }),
            prisma.payment.count({ where }),
        ]);

        res.json({
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get single payment by ID
 */
const getPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                applications: true,
            },
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json({ payment });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new payment and apply to invoices
 */
const createPayment = async (req, res) => {
    try {
        const {
            customerId,
            paymentDate,
            amount,
            paymentMode,
            referenceNumber,
            bankAccountId,
            depositTo,
            notes,
            applications, // Array of { invoiceId, amount }
        } = req.body;

        // Validate required fields
        if (!customerId || !paymentDate || !amount || !paymentMode) {
            return res.status(400).json({
                message: 'Missing required fields: customerId, paymentDate, amount, paymentMode',
            });
        }

        // Validate applications sum
        if (applications && applications.length > 0) {
            const appliedTotal = applications.reduce((sum, app) => sum + app.amount, 0);
            if (appliedTotal > amount) {
                return res.status(400).json({
                    message: `Applied amount (${appliedTotal}) exceeds payment amount (${amount})`,
                });
            }
        }

        // Generate payment number
        const paymentNumber = await generateVoucherNumber('payment');

        // Create payment with applications
        const payment = await prisma.payment.create({
            data: {
                paymentNumber,
                customerId,
                paymentDate: new Date(paymentDate),
                amount,
                paymentMode,
                referenceNumber,
                bankAccountId,
                depositTo,
                notes,
                createdBy: req.user?.id,
                applications: applications ? {
                    create: applications.map(app => ({
                        invoiceId: app.invoiceId,
                        amount: app.amount,
                    })),
                } : undefined,
            },
            include: {
                applications: true,
            },
        });

        // Update invoice balances if applications exist
        if (applications && applications.length > 0) {
            for (const app of applications) {
                // This would update invoice paid_amount and status
                // Implementation depends on your invoice table structure
            }
        }

        // Create accounting journal entry
        try {
            await createPaymentReceivedEntry(payment);
        } catch (journalError) {
            console.error('Journal entry creation failed:', journalError);
        }

        // Create audit log
        await createAuditLog({
            action: 'create',
            entity: 'payment',
            entityId: payment.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { created: payment },
        });

        res.status(201).json({
            message: 'Payment recorded successfully',
            payment,
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Apply payment to invoices
 */
const applyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { applications } = req.body; // Array of { invoiceId, amount }

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { applications: true },
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Calculate already applied amount
        const alreadyApplied = payment.applications.reduce((sum, app) => sum + app.amount, 0);
        const newApplicationsTotal = applications.reduce((sum, app) => sum + app.amount, 0);

        if (alreadyApplied + newApplicationsTotal > payment.amount) {
            return res.status(400).json({
                message: `Cannot apply. Total would exceed payment amount. Available: ${payment.amount - alreadyApplied}`,
            });
        }

        // Create new applications
        const createdApplications = await prisma.paymentApplication.createMany({
            data: applications.map(app => ({
                paymentId: id,
                invoiceId: app.invoiceId,
                amount: app.amount,
            })),
        });

        res.json({
            message: 'Payment applied successfully',
            applicationsCreated: createdApplications.count,
        });
    } catch (error) {
        console.error('Apply payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Void a payment
 */
const voidPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { applications: true },
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status === 'void') {
            return res.status(400).json({ message: 'Payment is already voided' });
        }

        // Remove applications first
        await prisma.paymentApplication.deleteMany({
            where: { paymentId: id },
        });

        // Update payment status
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                status: 'void',
                notes: `${payment.notes || ''}\n[VOIDED: ${reason || 'No reason provided'}]`,
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'void',
            entity: 'payment',
            entityId: payment.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { reason },
        });

        res.json({ message: 'Payment voided successfully', payment: updatedPayment });
    } catch (error) {
        console.error('Void payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get payment summary/statistics
 */
const getPaymentsSummary = async (req, res) => {
    try {
        const { fromDate, toDate, customerId } = req.query;

        const where = { status: { not: 'void' } };
        if (customerId) where.customerId = customerId;
        if (fromDate || toDate) {
            where.paymentDate = {};
            if (fromDate) where.paymentDate.gte = new Date(fromDate);
            if (toDate) where.paymentDate.lte = new Date(toDate);
        }

        const [
            totalPayments,
            totalAmount,
            byPaymentMode,
        ] = await Promise.all([
            prisma.payment.count({ where }),
            prisma.payment.aggregate({ where, _sum: { amount: true } }),
            prisma.payment.groupBy({
                by: ['paymentMode'],
                where,
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        res.json({
            summary: {
                totalPayments,
                totalAmount: totalAmount._sum.amount || 0,
                byPaymentMode: byPaymentMode.map(item => ({
                    mode: item.paymentMode,
                    count: item._count,
                    amount: item._sum.amount || 0,
                })),
            },
        });
    } catch (error) {
        console.error('Get payments summary error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllPayments,
    getPayment,
    createPayment,
    applyPayment,
    voidPayment,
    getPaymentsSummary,
};
