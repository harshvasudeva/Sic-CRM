const pool = require('../config/database');

const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      query.replace(/SELECT \*/i, 'SELECT COUNT(*)').split('LIMIT')[0],
      params.slice(0, -2)
    );

    res.json({
      customers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const {
      company_id,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      country,
      zip_code,
      tax_id,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO customers (company_id, first_name, last_name, email, phone, address, city, state, country, zip_code, tax_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [company_id, first_name, last_name, email, phone, address, city, state, country, zip_code, tax_id, notes]
    );

    res.status(201).json({ message: 'Customer created successfully', customer: result.rows[0] });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      country,
      zip_code,
      tax_id,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           state = COALESCE($7, state),
           country = COALESCE($8, country),
           zip_code = COALESCE($9, zip_code),
           tax_id = COALESCE($10, tax_id),
           notes = COALESCE($11, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [first_name, last_name, email, phone, address, city, state, country, zip_code, tax_id, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', customer: result.rows[0] });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
