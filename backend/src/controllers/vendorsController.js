const pool = require('../config/database');

const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
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
      vendors: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
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

    const result = await pool.query('SELECT * FROM vendors WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor: result.rows[0] });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createVendor = async (req, res) => {
  try {
    const {
      company_id,
      name,
      email,
      phone,
      address,
      city,
      state,
      country,
      zip_code,
      tax_id,
      rating,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vendors (company_id, name, email, phone, address, city, state, country, zip_code, tax_id, rating, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [company_id, name, email, phone, address, city, state, country, zip_code, tax_id, rating || 0, notes]
    );

    res.status(201).json({ message: 'Vendor created successfully', vendor: result.rows[0] });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      country,
      zip_code,
      tax_id,
      rating,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE vendors
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           state = COALESCE($6, state),
           country = COALESCE($7, country),
           zip_code = COALESCE($8, zip_code),
           tax_id = COALESCE($9, tax_id),
           rating = COALESCE($10, rating),
           notes = COALESCE($11, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [name, email, phone, address, city, state, country, zip_code, tax_id, rating, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ message: 'Vendor updated successfully', vendor: result.rows[0] });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM vendors WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
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
