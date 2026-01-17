/**
 * Accounts Controller
 * Handles Chart of Accounts CRUD operations
 * QuickBooks/Zoho style API
 */

const { PrismaClient } = require('@prisma/client');
const { createAuditLog } = require('../services/accountingService');

const prisma = new PrismaClient();

/**
 * Get all accounts with filters
 */
const getAllAccounts = async (req, res) => {
    try {
        const {
            type,
            isActive,
            search,
            sortBy = 'code',
            sortOrder = 'asc',
        } = req.query;

        const where = {};

        if (type) where.type = type;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const accounts = await prisma.account.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
        });

        res.json({ accounts });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get single account by ID with transaction history
 */
const getAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const account = await prisma.account.findUnique({
            where: { id },
            include: {
                journalDebits: {
                    include: {
                        journalEntry: true,
                    },
                    take: 50,
                    orderBy: {
                        journalEntry: { entryDate: 'desc' },
                    },
                },
                journalCredits: {
                    include: {
                        journalEntry: true,
                    },
                    take: 50,
                    orderBy: {
                        journalEntry: { entryDate: 'desc' },
                    },
                },
            },
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.json({ account });
    } catch (error) {
        console.error('Get account error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get account ledger (transactions)
 */
const getAccountLedger = async (req, res) => {
    try {
        const { id } = req.params;
        const { fromDate, toDate, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const account = await prisma.account.findUnique({ where: { id } });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Get journal entries where this account is debited or credited
        const where = {
            status: 'posted',
            OR: [
                { lines: { some: { debitAccountId: id } } },
                { lines: { some: { creditAccountId: id } } },
            ],
        };

        if (fromDate || toDate) {
            where.entryDate = {};
            if (fromDate) where.entryDate.gte = new Date(fromDate);
            if (toDate) where.entryDate.lte = new Date(toDate);
        }

        const [entries, total] = await Promise.all([
            prisma.journalEntry.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { entryDate: 'desc' },
                include: {
                    lines: {
                        where: {
                            OR: [
                                { debitAccountId: id },
                                { creditAccountId: id },
                            ],
                        },
                    },
                },
            }),
            prisma.journalEntry.count({ where }),
        ]);

        // Format ledger entries
        const ledger = entries.map(entry => {
            const line = entry.lines[0];
            const isDebit = line.debitAccountId === id;
            return {
                date: entry.entryDate,
                journalNumber: entry.journalNumber,
                reference: entry.reference,
                description: entry.description,
                debit: isDebit ? line.amount : 0,
                credit: !isDebit ? line.amount : 0,
            };
        });

        res.json({
            account: { id: account.id, code: account.code, name: account.name },
            ledger,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get account ledger error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new account
 */
const createAccount = async (req, res) => {
    try {
        const {
            code,
            name,
            type,
            subType,
            normalBalance,
            openingBalance,
        } = req.body;

        // Validate required fields
        if (!code || !name || !type) {
            return res.status(400).json({
                message: 'Missing required fields: code, name, type',
            });
        }

        // Check for duplicate code
        const existing = await prisma.account.findUnique({ where: { code } });
        if (existing) {
            return res.status(400).json({ message: 'Account code already exists' });
        }

        const account = await prisma.account.create({
            data: {
                code,
                name,
                type,
                subType,
                normalBalance: normalBalance || (type === 'asset' || type === 'expense' ? 'debit' : 'credit'),
                balance: openingBalance || 0,
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'create',
            entity: 'account',
            entityId: account.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { created: account },
        });

        res.status(201).json({
            message: 'Account created successfully',
            account,
        });
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update account
 */
const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existing = await prisma.account.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Don't allow changing code if there are transactions
        if (updateData.code && updateData.code !== existing.code) {
            const hasTransactions = await prisma.journalLine.findFirst({
                where: {
                    OR: [
                        { debitAccountId: id },
                        { creditAccountId: id },
                    ],
                },
            });
            if (hasTransactions) {
                return res.status(400).json({
                    message: 'Cannot change account code. Account has transactions.',
                });
            }
        }

        const account = await prisma.account.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'update',
            entity: 'account',
            entityId: account.id,
            userId: req.user?.id,
            userName: req.user?.name,
            changes: { before: existing, after: account },
        });

        res.json({ message: 'Account updated successfully', account });
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Deactivate account (soft delete)
 */
const deactivateAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const account = await prisma.account.findUnique({ where: { id } });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Check if account has balance
        if (account.balance !== 0) {
            return res.status(400).json({
                message: 'Cannot deactivate account with non-zero balance',
            });
        }

        const updated = await prisma.account.update({
            where: { id },
            data: { isActive: false },
        });

        // Create audit log
        await createAuditLog({
            action: 'deactivate',
            entity: 'account',
            entityId: id,
            userId: req.user?.id,
            userName: req.user?.name,
        });

        res.json({ message: 'Account deactivated successfully', account: updated });
    } catch (error) {
        console.error('Deactivate account error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get account types summary
 */
const getAccountsSummary = async (req, res) => {
    try {
        const summary = await prisma.account.groupBy({
            by: ['type'],
            _sum: { balance: true },
            _count: true,
            where: { isActive: true },
        });

        const formattedSummary = summary.map(item => ({
            type: item.type,
            count: item._count,
            totalBalance: item._sum.balance || 0,
        }));

        res.json({ summary: formattedSummary });
    } catch (error) {
        console.error('Get accounts summary error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllAccounts,
    getAccount,
    getAccountLedger,
    createAccount,
    updateAccount,
    deactivateAccount,
    getAccountsSummary,
};
