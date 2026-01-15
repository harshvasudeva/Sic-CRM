const pool = require('../config/database');

const getAllQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT q.*, c.first_name, c.last_name
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND q.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (q.quotation_number ILIKE $${paramCount} OR c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY q.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      query.replace(/SELECT q\.\*, c\.first_name, c\.last_name/i, 'SELECT COUNT(*)').split('LIMIT')[0],
      params.slice(0, -2)
    );

    res.json({
      quotations: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM quotations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const itemsResult = await pool.query(
      `SELECT qi.*, p.name as product_name
       FROM quotation_items qi
       LEFT JOIN products p ON qi.product_id = p.id
       WHERE qi.quotation_id = $1`,
      [id]
    );

    res.json({
      quotation: result.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createQuotation = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      customer_id,
      quotation_date,
      valid_until,
      items,
      notes,
      terms,
    } = req.body;

    const quotationNumber = `QT-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate / 100), 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.discount_percent / 100), 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    const quotationResult = await client.query(
      `INSERT INTO quotations (customer_id, quotation_number, quotation_date, valid_until, subtotal, tax_amount, discount_amount, total_amount, notes, terms, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [customer_id, quotationNumber, quotation_date, valid_until, subtotal, taxAmount, discountAmount, totalAmount, notes, terms, req.user.id]
    );

    const quotationId = quotationResult.rows[0].id;

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price * (1 - item.discount_percent / 100) * (1 + item.tax_rate / 100);
      await client.query(
        `INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, tax_rate, discount_percent, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [quotationId, item.product_id, item.description, item.quantity, item.unit_price, item.tax_rate, item.discount_percent, itemTotal]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Quotation created successfully',
      quotation: quotationResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create quotation error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE quotations
       SET status = COALESCE($1, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json({ message: 'Quotation updated successfully', quotation: result.rows[0] });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
};
