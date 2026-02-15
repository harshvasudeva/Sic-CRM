const pool = require('../config/database');

const getAllSalesOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, customerId, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT so.*, c.first_name, c.last_name, c.company
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND so.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (customerId) {
      query += ` AND so.customer_id = $${paramCount}`;
      params.push(customerId);
      paramCount++;
    }

    if (assignedTo) {
      query += ` AND so.assigned_to = $${paramCount}`;
      params.push(assignedTo);
      paramCount++;
    }

    if (search) {
      query += ` AND (so.order_number ILIKE $${paramCount} OR c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY so.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      query.replace(/SELECT so\.\*, c\.first_name, c\.last_name, c\.company/i, 'SELECT COUNT(*)').split('LIMIT')[0],
      params.slice(0, -2)
    );

    res.json({
      salesOrders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get sales orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM sales_orders WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT soi.*, p.name as product_name
       FROM sales_order_items soi
       LEFT JOIN products p ON soi.product_id = p.id
       WHERE soi.sales_order_id = $1`,
      [id]
    );

    res.json({
      salesOrder: result.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('Get sales order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      customer_id,
      quotation_id,
      order_date,
      expected_delivery,
      items,
      shipping_address,
      billing_address,
      notes,
      payment_terms,
      assigned_to,
    } = req.body;

    const orderNumber = `SO-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.tax_rate || 0) / 100), 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.discount_percent || 0) / 100), 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    const orderResult = await client.query(
      `INSERT INTO sales_orders (customer_id, quotation_id, order_number, order_date, expected_delivery, subtotal, tax_amount, discount_amount, total_amount, shipping_address, billing_address, notes, payment_terms, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [customer_id, quotation_id, orderNumber, order_date || new Date(), expected_delivery, subtotal, taxAmount, discountAmount, totalAmount, shipping_address, billing_address, notes, payment_terms, assigned_to, req.user.id]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100) * (1 + (item.tax_rate || 0) / 100);
      await client.query(
        `INSERT INTO sales_order_items (sales_order_id, product_id, description, quantity, unit_price, tax_rate, discount_percent, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [orderId, item.product_id, item.description, item.quantity, item.unit_price, item.tax_rate || 0, item.discount_percent || 0, itemTotal]
      );
    }

    // If created from quotation, update quotation status
    if (quotation_id) {
      await client.query(
        `UPDATE quotations SET status = 'converted', converted_order_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [orderId, quotation_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Sales order created successfully',
      salesOrder: orderResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create sales order error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const updateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shipping_address, billing_address, notes, payment_terms, expected_delivery } = req.body;

    const result = await pool.query(
      `UPDATE sales_orders
       SET status = COALESCE($1, status),
           shipping_address = COALESCE($2, shipping_address),
           billing_address = COALESCE($3, billing_address),
           notes = COALESCE($4, notes),
           payment_terms = COALESCE($5, payment_terms),
           expected_delivery = COALESCE($6, expected_delivery),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [status, shipping_address, billing_address, notes, payment_terms, expected_delivery, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    res.json({ message: 'Sales order updated successfully', salesOrder: result.rows[0] });
  } catch (error) {
    console.error('Update sales order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const confirmSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE sales_orders
       SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sales order not found or not in pending status' });
    }

    res.json({ message: 'Sales order confirmed', salesOrder: result.rows[0] });
  } catch (error) {
    console.error('Confirm sales order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deliverSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_date } = req.body;

    const result = await pool.query(
      `UPDATE sales_orders
       SET status = 'delivered', actual_delivery = COALESCE($1, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status IN ('confirmed', 'processing', 'shipped')
       RETURNING *`,
      [delivery_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sales order not found or not in valid status for delivery' });
    }

    res.json({ message: 'Sales order marked as delivered', salesOrder: result.rows[0] });
  } catch (error) {
    console.error('Deliver sales order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSalesOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    await client.query('DELETE FROM sales_order_items WHERE sales_order_id = $1', [id]);
    const result = await client.query('DELETE FROM sales_orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Sales order not found' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete sales order error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const getSalesStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COALESCE(SUM(total_amount), 0) as total_value,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'confirmed'), 0) as confirmed_value,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'delivered'), 0) as delivered_value
      FROM sales_orders
    `);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  confirmSalesOrder,
  deliverSalesOrder,
  deleteSalesOrder,
  getSalesStats,
};
