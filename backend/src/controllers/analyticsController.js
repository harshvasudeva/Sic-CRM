const pool = require('../config/database');
const { exportToExcel, exportToCSV } = require('../utils/export');

const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateCondition = startDate && endDate 
      ? `AND i.invoice_date BETWEEN $1 AND $2`
      : '';
    const dateParams = startDate && endDate ? [startDate, endDate] : [];

    const salesResult = await pool.query(`
      SELECT 
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_sales,
        SUM(paid_amount) as total_paid,
        AVG(total_amount) as avg_invoice_amount
      FROM invoices
      WHERE status != 'cancelled' ${dateCondition}
    `, dateParams);

    const topProductsResult = await pool.query(`
      SELECT 
        p.name,
        SUM(ii.quantity) as total_sold,
        SUM(ii.total) as total_revenue
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.status != 'cancelled' ${dateCondition}
      GROUP BY p.id, p.name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, dateParams);

    const salesByMonthResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', invoice_date) as month,
        SUM(total_amount) as total_sales,
        COUNT(*) as invoice_count
      FROM invoices
      WHERE status != 'cancelled' ${dateCondition}
      GROUP BY DATE_TRUNC('month', invoice_date)
      ORDER BY month DESC
      LIMIT 12
    `, dateParams);

    const pendingInvoicesResult = await pool.query(`
      SELECT COUNT(*), SUM(total_amount - paid_amount) as pending_amount
      FROM invoices
      WHERE status = 'sent' OR status = 'partial'
    `);

    res.json({
      sales: salesResult.rows[0],
      topProducts: topProductsResult.rows,
      salesByMonth: salesByMonthResult.rows,
      pendingInvoices: pendingInvoicesResult[0],
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportData = async (req, res) => {
  try {
    const { type, format, startDate, endDate } = req.query;

    let query, filename, sheetName;

    const dateCondition = startDate && endDate 
      ? `WHERE i.invoice_date BETWEEN $1 AND $2`
      : '';
    const dateParams = startDate && endDate ? [startDate, endDate] : [];

    switch (type) {
      case 'invoices':
        query = `
          SELECT 
            i.invoice_number,
            i.invoice_date,
            c.first_name,
            c.last_name,
            i.total_amount,
            i.status,
            i.paid_amount
          FROM invoices i
          LEFT JOIN customers c ON i.customer_id = c.id
          ${dateCondition}
          ORDER BY i.invoice_date DESC
        `;
        filename = 'invoices';
        sheetName = 'Invoices';
        break;
      case 'customers':
        query = 'SELECT * FROM customers ORDER BY created_at DESC';
        filename = 'customers';
        sheetName = 'Customers';
        break;
      case 'products':
        query = 'SELECT * FROM products ORDER BY name';
        filename = 'products';
        sheetName = 'Products';
        break;
      case 'sales':
        query = `
          SELECT 
            i.invoice_number,
            i.invoice_date,
            c.first_name,
            c.last_name,
            i.total_amount
          FROM invoices i
          LEFT JOIN customers c ON i.customer_id = c.id
          WHERE i.status = 'paid' ${dateCondition}
          ORDER BY i.invoice_date DESC
        `;
        filename = 'sales';
        sheetName = 'Sales';
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    const result = await pool.query(query, dateParams);

    if (format === 'csv') {
      const filepath = await exportToCSV(result.rows, filename);
      res.download(filepath, `${filename}.csv`);
    } else {
      const filepath = await exportToExcel(result.rows, filename, sheetName);
      res.download(filepath, `${filename}.xlsx`);
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAnalytics,
  exportData,
};
