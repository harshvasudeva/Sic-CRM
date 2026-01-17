const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');

// ==================== LEADS ====================

// GET /api/crm/leads - Fetch all leads
router.get('/leads', async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// POST /api/crm/leads - Create a new lead
router.post('/leads', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Invalid email')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const lead = await prisma.lead.create({
            data: req.body
        });
        res.status(201).json(lead);
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// PATCH /api/crm/leads/:id/status - Update lead status
router.patch('/leads/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const lead = await prisma.lead.update({
            where: { id },
            data: { status }
        });
        res.json(lead);
    } catch (error) {
        console.error('Error updating lead status:', error);
        res.status(500).json({ error: 'Failed to update lead status' });
    }
});

// DELETE /api/crm/leads/:id - Delete a lead
router.delete('/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lead.delete({ where: { id } });
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

// ==================== DEALS (Opportunities) ====================

// GET /api/crm/opportunities
router.get('/opportunities', async (req, res) => {
    try {
        const deals = await prisma.deal.findMany({
            include: { contact: true, pipeline: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(deals);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
});

// POST /api/crm/opportunities
router.post('/opportunities', async (req, res) => {
    try {
        const deal = await prisma.deal.create({ data: req.body });
        res.status(201).json(deal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
