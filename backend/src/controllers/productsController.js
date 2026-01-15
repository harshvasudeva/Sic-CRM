const pool = require('../config/database');

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR sku ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (status !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(status === 'active');
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
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      category,
      type,
      price,
      cost,
      stock_quantity,
      reorder_level,
      image,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (sku, name, description, category, type, price, cost, stock_quantity, reorder_level, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [sku, name, description, category, type || 'good', price, cost, stock_quantity || 0, reorder_level || 10, image]
    );

    res.status(201).json({ message: 'Product created successfully', product: result.rows[0] });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sku,
      name,
      description,
      category,
      type,
      price,
      cost,
      stock_quantity,
      reorder_level,
      image,
      is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET sku = COALESCE($1, sku),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           category = COALESCE($4, category),
           type = COALESCE($5, type),
           price = COALESCE($6, price),
           cost = COALESCE($7, cost),
           stock_quantity = COALESCE($8, stock_quantity),
           reorder_level = COALESCE($9, reorder_level),
           image = COALESCE($10, image),
           is_active = COALESCE($11, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [sku, name, description, category, type, price, cost, stock_quantity, reorder_level, image, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
