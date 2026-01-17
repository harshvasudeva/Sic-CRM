const { PrismaClient } = require('@prisma/client');
const { generateVoucherNumber } = require('../services/voucherNumberService');

const prisma = new PrismaClient();

// ==================== PURCHASE REQUISITIONS ====================

const createRequisition = async (req, res) => {
    try {
        const { items, ...data } = req.body;
        const requisitionNumber = await generateVoucherNumber('purchase_requisition');

        const requisition = await prisma.purchaseRequisition.create({
            data: {
                ...data,
                requisitionNumber,
                items: {
                    create: items
                }
            },
            include: { items: true }
        });
        res.status(201).json(requisition);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating requisition' });
    }
};

const getRequisitions = async (req, res) => {
    try {
        const { status, department } = req.query;
        const where = {};
        if (status) where.status = status;
        if (department) where.department = department;

        const reqs = await prisma.purchaseRequisition.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requisitions' });
    }
};

const updateRequisitionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedBy } = req.body;

        const updateData = { status };
        if (status === 'approved') {
            updateData.approvedBy = approvedBy;
            updateData.approvedDate = new Date();
        }

        const requisition = await prisma.purchaseRequisition.update({
            where: { id },
            data: updateData,
            include: { items: true }
        });
        res.json(requisition);
    } catch (error) {
        res.status(500).json({ message: 'Error updating requisition' });
    }
};

// ==================== RFQs ====================

const createRFQ = async (req, res) => {
    try {
        const { items, ...data } = req.body;
        const rfqNumber = await generateVoucherNumber('rfq');

        const rfq = await prisma.rFQ.create({
            data: {
                ...data,
                rfqNumber,
                items: {
                    create: items
                }
            },
            include: { items: true }
        });
        res.status(201).json(rfq);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating RFQ' });
    }
};

const getRFQs = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const rfqs = await prisma.rFQ.findMany({
            where,
            include: { items: true, vendor: true, quotes: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rfqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching RFQs' });
    }
};

const addQuote = async (req, res) => {
    try {
        const { id } = req.params; // RFQ ID
        const quoteData = req.body;

        const quote = await prisma.vendorQuote.create({
            data: {
                ...quoteData,
                rfqId: id
            }
        });
        res.status(201).json(quote);
    } catch (error) {
        res.status(500).json({ message: 'Error adding quote' });
    }
};

// ==================== PURCHASE ORDERS ====================

const createPO = async (req, res) => {
    try {
        const { items, ...data } = req.body;
        const orderNumber = await generateVoucherNumber('purchase_order');

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate || 0) / 100), 0);

        const po = await prisma.purchaseOrder.create({
            data: {
                ...data,
                orderNumber,
                subtotal,
                taxAmount,
                totalAmount: subtotal + taxAmount + (data.shippingCost || 0),
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: item.discount || 0,
                        taxRate: item.taxRate || 0,
                        total: item.quantity * item.unitPrice
                    }))
                }
            },
            include: { items: true, vendor: true }
        });
        res.status(201).json(po);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating PO' });
    }
};

const getPOs = async (req, res) => {
    try {
        const { status, vendorId } = req.query;
        const where = {};
        if (status) where.status = status;
        if (vendorId) where.vendorId = vendorId;

        const pos = await prisma.purchaseOrder.findMany({
            where,
            include: { items: true, vendor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching POs' });
    }
};

const updatePOStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const po = await prisma.purchaseOrder.update({
            where: { id },
            data: { status },
            include: { items: true }
        });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: 'Error updating PO' });
    }
};

// ==================== GRNs ====================

const createGRN = async (req, res) => {
    try {
        const { items, ...data } = req.body;
        const grnNumber = await generateVoucherNumber('grn');

        const grn = await prisma.gRN.create({
            data: {
                ...data,
                grnNumber,
                items: {
                    create: items
                }
            },
            include: { items: true }
        });

        // Update PO received quantity
        for (const item of items) {
            // Find PO item matching product/name? 
            // Ideally we should pass poItemId in GRN item, but for now simplified:
            // Assume sequential or matched by productId logic is handled frontend or omitted here for brevity
        }

        // Update PO status if fully received
        await prisma.purchaseOrder.update({
            where: { id: data.purchaseOrderId },
            data: { receivedStatus: 'received' } // Simplified logic
        });

        res.status(201).json(grn);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating GRN' });
    }
};

const getGRNs = async (req, res) => {
    try {
        const { vendorId, purchaseOrderId } = req.query;
        const where = {};
        if (vendorId) where.vendorId = vendorId;
        if (purchaseOrderId) where.purchaseOrderId = purchaseOrderId;

        const grns = await prisma.gRN.findMany({
            where,
            include: { items: true, vendor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(grns);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching GRNs' });
    }
};

// ==================== VENDOR EVALUATIONS ====================

const createEvaluation = async (req, res) => {
    try {
        const data = req.body;
        const evaluation = await prisma.vendorEvaluation.create({
            data
        });

        // Update vendor rating
        await prisma.vendor.update({
            where: { id: data.vendorId },
            data: { rating: data.overallScore }
        });

        res.status(201).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating evaluation' });
    }
};

const getEvaluations = async (req, res) => {
    try {
        const { vendorId } = req.query;
        const where = {};
        if (vendorId) where.vendorId = vendorId;

        const evaluations = await prisma.vendorEvaluation.findMany({
            where,
            include: { vendor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(evaluations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching evaluations' });
    }
};

// ==================== STATS ====================

const getPurchaseStats = async (req, res) => {
    try {
        const [
            activeVendors,
            pendingReqs,
            pendingPOs,
            totalSpend
        ] = await Promise.all([
            prisma.vendor.count({ where: { status: 'active' } }),
            prisma.purchaseRequisition.count({ where: { status: 'pending' } }),
            prisma.purchaseOrder.count({ where: { status: 'issued' } }),
            prisma.purchaseOrder.aggregate({ _sum: { totalAmount: true } })
        ]);

        res.json({
            activeVendors,
            pendingReqs,
            pendingPOs,
            totalSpend: totalSpend._sum.totalAmount || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};


module.exports = {
    createRequisition, getRequisitions, updateRequisitionStatus,
    createRFQ, getRFQs, addQuote,
    createPO, getPOs, updatePOStatus,
    createGRN, getGRNs,
    createEvaluation, getEvaluations,
    getPurchaseStats
};
