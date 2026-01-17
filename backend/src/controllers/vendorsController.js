const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { vendorCode: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count({ where }),
    ]);

    res.json({
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: { take: 5, orderBy: { createdAt: 'desc' } },
        bills: { take: 5, orderBy: { createdAt: 'desc' } },
        evaluations: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createVendor = async (req, res) => {
  try {
    const data = req.body;

    // Auto-generate vendor code if not provided
    if (!data.vendorCode) {
      const count = await prisma.vendor.count();
      data.vendorCode = `VEN-${String(count + 1).padStart(3, '0')}`;
    }

    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        rating: parseFloat(data.rating) || 0,
        creditLimit: parseFloat(data.creditLimit) || 0,
      }
    });

    res.status(201).json({ message: 'Vendor created successfully', vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Vendor code or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Remove immutable fields if present
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...data,
        rating: data.rating !== undefined ? parseFloat(data.rating) : undefined,
        creditLimit: data.creditLimit !== undefined ? parseFloat(data.creditLimit) : undefined,
      }
    });

    res.json({ message: 'Vendor updated successfully', vendor });
  } catch (error) {
    console.error('Update vendor error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.vendor.delete({ where: { id } });

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    // Check for foreign key constraint errors
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Cannot delete vendor with associated records (Orders/Bills)' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
};
