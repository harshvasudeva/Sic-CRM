const pool = require('../config/database');
const { sendInvoiceEmail } = require('../utils/email');
const { generateInvoicePDF } = require('../utils/pdf');

const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, c.first_name, c.last_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (i.invoice_number ILIKE $${paramCount} OR c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      query.replace(/SELECT i\.\*, c\.first_name, c\.last_name/i, 'SELECT COUNT(*)').split('LIMIT')[0],
      params.slice(0, -2)
    );

    res.json({
      invoices: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const itemsResult = await pool.query(
      `SELECT ii.*, p.name as product_name
       FROM invoice_items ii
       LEFT JOIN products p ON ii.product_id = p.id
       WHERE ii.invoice_id = $1`,
      [id]
    );

    res.json({
      invoice: result.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createInvoice = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      customer_id,
      invoice_date,
      due_date,
      quotation_id,
      items,
      notes,
      terms,
    } = req.body;

    const invoiceNumber = `INV-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate / 100), 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.discount_percent / 100), 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoiceResult = await client.query(
      `INSERT INTO invoices (customer_id, invoice_number, invoice_date, due_date, quotation_id, subtotal, tax_amount, discount_amount, total_amount, notes, terms, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [customer_id, invoiceNumber, invoice_date, due_date, quotation_id, subtotal, taxAmount, discountAmount, totalAmount, notes, terms, req.user.id]
    );

    const invoiceId = invoiceResult.rows[0].id;

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price * (1 - item.discount_percent / 100) * (1 + item.tax_rate / 100);
      await client.query(
        `INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, discount_percent, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [invoiceId, item.product_id, item.description, item.quantity, item.unit_price, item.tax_rate, item.discount_percent, itemTotal]
      );
    }

    await client.query('COMMIT');

    const customerResult = await client.query('SELECT email FROM customers WHERE id = $1', [customer_id]);
    if (customerResult.rows.length > 0) {
      await sendInvoiceEmail(customerResult.rows[0].email, invoiceNumber, totalAmount);
    }

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: invoiceResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const updateInvoice = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, paid_amount } = req.body;

    const result = await client.query(
      `UPDATE invoices
       SET status = COALESCE($1, status),
           paid_amount = COALESCE($2, paid_amount),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, paid_amount, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await client.query('COMMIT');

    res.json({ message: 'Invoice updated successfully', invoice: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const generateInvoicePDFDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const invoiceResult = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const itemsResult = await pool.query(
      `SELECT ii.*, p.name as product_name
       FROM invoice_items ii
       LEFT JOIN products p ON ii.product_id = p.id
       WHERE ii.invoice_id = $1`,
      [id]
    );

    const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [invoiceResult.rows[0].customer_id]);
    const companyResult = await pool.query('SELECT * FROM companies WHERE id = $1', [invoiceResult.rows[0].company_id || 1]);

    const pdfPath = await generateInvoicePDF(
      invoiceResult.rows[0],
      companyResult.rows[0] || {},
      customerResult.rows[0] || {},
      itemsResult.rows
    );

    res.download(pdfPath);
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  generateInvoicePDFDocument,
};
