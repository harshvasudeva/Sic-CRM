const pool = require('../config/database');

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(20),
        avatar TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip_code VARCHAR(20),
        tax_id VARCHAR(50),
        logo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        type VARCHAR(50) DEFAULT 'good',
        price DECIMAL(12, 2) NOT NULL,
        cost DECIMAL(12, 2),
        stock_quantity INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        image TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip_code VARCHAR(20),
        tax_id VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip_code VARCHAR(20),
        tax_id VARCHAR(50),
        rating INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        customer_id INTEGER REFERENCES customers(id),
        quotation_number VARCHAR(100) UNIQUE NOT NULL,
        quotation_date DATE NOT NULL,
        valid_until DATE,
        subtotal DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(12, 2) DEFAULT 0,
        discount_amount DECIMAL(12, 2) DEFAULT 0,
        total_amount DECIMAL(12, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        terms TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id SERIAL PRIMARY KEY,
        quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        description TEXT,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(12, 2) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        total DECIMAL(12, 2) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        customer_id INTEGER REFERENCES customers(id),
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE,
        quotation_id INTEGER REFERENCES quotations(id),
        subtotal DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(12, 2) DEFAULT 0,
        discount_amount DECIMAL(12, 2) DEFAULT 0,
        total_amount DECIMAL(12, 2) NOT NULL,
        paid_amount DECIMAL(12, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        terms TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        description TEXT,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(12, 2) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        total DECIMAL(12, 2) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        vendor_id INTEGER REFERENCES vendors(id),
        order_number VARCHAR(100) UNIQUE NOT NULL,
        order_date DATE NOT NULL,
        expected_date DATE,
        subtotal DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(12, 2) DEFAULT 0,
        discount_amount DECIMAL(12, 2) DEFAULT 0,
        total_amount DECIMAL(12, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        terms TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        description TEXT,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(12, 2) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        total DECIMAL(12, 2) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        company VARCHAR(255),
        position VARCHAR(100),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        probability INTEGER DEFAULT 0,
        estimated_value DECIMAL(12, 2),
        expected_close_date DATE,
        notes TEXT,
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        lead_id INTEGER REFERENCES leads(id),
        name VARCHAR(255) NOT NULL,
        account VARCHAR(255),
        stage VARCHAR(50) DEFAULT 'prospecting',
        probability INTEGER DEFAULT 0,
        amount DECIMAL(12, 2),
        expected_close_date DATE,
        description TEXT,
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        duration INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        related_to_type VARCHAR(50),
        related_to_id INTEGER,
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        employee_number VARCHAR(50) UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        department VARCHAR(100),
        position VARCHAR(100),
        hire_date DATE,
        salary DECIMAL(12, 2),
        status VARCHAR(50) DEFAULT 'active',
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip_code VARCHAR(20),
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip_code VARCHAR(20),
        manager_id INTEGER REFERENCES employees(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_moves (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        warehouse_id INTEGER REFERENCES warehouses(id),
        type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type VARCHAR(50),
        reference_id INTEGER,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        entry_number VARCHAR(100) UNIQUE NOT NULL,
        entry_date DATE NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        total_debit DECIMAL(12, 2) NOT NULL,
        total_credit DECIMAL(12, 2) NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_entry_lines (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_code VARCHAR(50) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        description TEXT,
        debit DECIMAL(12, 2) DEFAULT 0,
        credit DECIMAL(12, 2) DEFAULT 0
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        size INTEGER,
        path TEXT NOT NULL,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = initDatabase;
