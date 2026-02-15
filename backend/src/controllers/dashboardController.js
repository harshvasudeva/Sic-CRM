const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Run all queries in parallel for performance
    const [
      revenueResult,
      leadsResult,
      ordersResult,
      invoicesResult,
      customersResult,
      recentOrdersResult,
      monthlyRevenueResult,
      topCustomersResult
    ] = await Promise.all([
      // Total revenue (from paid invoices)
      pool.query(`
        SELECT
          COALESCE(SUM(paid_amount), 0) as total_revenue,
          COALESCE(SUM(paid_amount) FILTER (WHERE invoice_date >= date_trunc('month', CURRENT_DATE)), 0) as revenue_mtd,
          COALESCE(SUM(paid_amount) FILTER (WHERE invoice_date >= date_trunc('year', CURRENT_DATE)), 0) as revenue_ytd,
          COALESCE(SUM(total_amount - paid_amount) FILTER (WHERE status != 'paid' AND status != 'void'), 0) as outstanding
        FROM invoices
      `),

      // Lead stats (from CRM contacts/leads table)
      pool.query(`
        SELECT
          COUNT(*) as total_leads,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as new_leads_mtd,
          COUNT(*) FILTER (WHERE status = 'qualified') as qualified_leads
        FROM leads
      `).catch(() => ({ rows: [{ total_leads: 0, new_leads_mtd: 0, qualified_leads: 0 }] })),

      // Order stats
      pool.query(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as orders_today,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as orders_mtd,
          COALESCE(SUM(total_amount), 0) as orders_value
        FROM sales_orders
      `).catch(() => ({ rows: [{ total_orders: 0, orders_today: 0, orders_mtd: 0, orders_value: 0 }] })),

      // Invoice stats
      pool.query(`
        SELECT
          COUNT(*) as total_invoices,
          COUNT(*) FILTER (WHERE status = 'sent' OR status = 'partial') as unpaid_invoices,
          COUNT(*) FILTER (WHERE status != 'paid' AND status != 'void' AND due_date < CURRENT_DATE) as overdue_invoices,
          COALESCE(SUM(total_amount - paid_amount) FILTER (WHERE status != 'paid' AND status != 'void' AND due_date < CURRENT_DATE), 0) as overdue_amount
        FROM invoices
      `).catch(() => ({ rows: [{ total_invoices: 0, unpaid_invoices: 0, overdue_invoices: 0, overdue_amount: 0 }] })),

      // Customer stats
      pool.query(`
        SELECT
          COUNT(*) as total_customers,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as new_customers_mtd
        FROM customers
      `).catch(() => ({ rows: [{ total_customers: 0, new_customers_mtd: 0 }] })),

      // Recent orders (last 5)
      pool.query(`
        SELECT so.id, so.order_number, so.total_amount, so.status, so.created_at,
               c.first_name, c.last_name
        FROM sales_orders so
        LEFT JOIN customers c ON so.customer_id = c.id
        ORDER BY so.created_at DESC
        LIMIT 5
      `).catch(() => ({ rows: [] })),

      // Monthly revenue trend (last 6 months)
      pool.query(`
        SELECT
          to_char(date_trunc('month', invoice_date), 'Mon YYYY') as month,
          COALESCE(SUM(paid_amount), 0) as revenue
        FROM invoices
        WHERE invoice_date >= date_trunc('month', CURRENT_DATE) - interval '5 months'
        GROUP BY date_trunc('month', invoice_date)
        ORDER BY date_trunc('month', invoice_date)
      `).catch(() => ({ rows: [] })),

      // Top 5 customers by revenue
      pool.query(`
        SELECT c.id, c.first_name, c.last_name, c.company,
               COALESCE(SUM(i.paid_amount), 0) as total_revenue,
               COUNT(i.id) as invoice_count
        FROM customers c
        LEFT JOIN invoices i ON c.id = i.customer_id
        GROUP BY c.id, c.first_name, c.last_name, c.company
        ORDER BY total_revenue DESC
        LIMIT 5
      `).catch(() => ({ rows: [] })),
    ]);

    res.json({
      revenue: revenueResult.rows[0],
      leads: leadsResult.rows[0],
      orders: ordersResult.rows[0],
      invoices: invoicesResult.rows[0],
      customers: customersResult.rows[0],
      recentOrders: recentOrdersResult.rows,
      monthlyRevenue: monthlyRevenueResult.rows,
      topCustomers: topCustomersResult.rows,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSalesStats = async (req, res) => {
  try {
    const [quotations, orders, invoices, payments] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'sent') as sent,
          COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
          COALESCE(SUM(total_amount), 0) as total_value,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'accepted'), 0) as accepted_value
        FROM quotations
      `).catch(() => ({ rows: [{ total: 0, draft: 0, sent: 0, accepted: 0, rejected: 0, total_value: 0, accepted_value: 0 }] })),

      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
          COALESCE(SUM(total_amount), 0) as total_value
        FROM sales_orders
      `).catch(() => ({ rows: [{ total: 0, pending: 0, confirmed: 0, delivered: 0, total_value: 0 }] })),

      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'sent' OR status = 'partial') as unpaid,
          COUNT(*) FILTER (WHERE status = 'paid') as paid,
          COUNT(*) FILTER (WHERE status != 'paid' AND status != 'void' AND due_date < CURRENT_DATE) as overdue,
          COALESCE(SUM(total_amount), 0) as total_value,
          COALESCE(SUM(paid_amount), 0) as paid_value,
          COALESCE(SUM(total_amount - paid_amount) FILTER (WHERE status != 'paid' AND status != 'void'), 0) as outstanding
        FROM invoices
      `).catch(() => ({ rows: [{ total: 0, draft: 0, unpaid: 0, paid: 0, overdue: 0, total_value: 0, paid_value: 0, outstanding: 0 }] })),

      pool.query(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(SUM(amount) FILTER (WHERE payment_date >= date_trunc('month', CURRENT_DATE)), 0) as mtd_amount
        FROM payments WHERE status = 'received'
      `).catch(() => ({ rows: [{ total: 0, total_amount: 0, mtd_amount: 0 }] })),
    ]);

    res.json({
      quotations: quotations.rows[0],
      orders: orders.rows[0],
      invoices: invoices.rows[0],
      payments: payments.rows[0],
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCRMStats = async (req, res) => {
  try {
    const [leads, opportunities, activities] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'new') as new_leads,
          COUNT(*) FILTER (WHERE status = 'qualified') as qualified,
          COUNT(*) FILTER (WHERE status = 'converted') as converted
        FROM leads
      `).catch(() => ({ rows: [{ total: 0, new_leads: 0, qualified: 0, converted: 0 }] })),

      pool.query(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(expected_revenue), 0) as pipeline_value,
          COUNT(*) FILTER (WHERE stage = 'won') as won,
          COUNT(*) FILTER (WHERE stage = 'lost') as lost
        FROM opportunities
      `).catch(() => ({ rows: [{ total: 0, pipeline_value: 0, won: 0, lost: 0 }] })),

      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE completed = false AND due_date >= CURRENT_DATE) as upcoming,
          COUNT(*) FILTER (WHERE completed = false AND due_date < CURRENT_DATE) as overdue
        FROM activities
      `).catch(() => ({ rows: [{ total: 0, upcoming: 0, overdue: 0 }] })),
    ]);

    res.json({
      leads: leads.rows[0],
      opportunities: opportunities.rows[0],
      activities: activities.rows[0],
    });
  } catch (error) {
    console.error('Get CRM stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHRStats = async (req, res) => {
  try {
    const [employees, leaves, departments] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as new_hires
        FROM employees
      `).catch(() => ({ rows: [{ total: 0, active: 0, on_leave: 0, new_hires: 0 }] })),

      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'approved') as approved
        FROM leave_requests
      `).catch(() => ({ rows: [{ total: 0, pending: 0, approved: 0 }] })),

      pool.query(`
        SELECT d.name, COUNT(e.id) as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        GROUP BY d.id, d.name
        ORDER BY employee_count DESC
      `).catch(() => ({ rows: [] })),
    ]);

    res.json({
      employees: employees.rows[0],
      leaves: leaves.rows[0],
      departments: departments.rows,
    });
  } catch (error) {
    console.error('Get HR stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getSalesStats,
  getCRMStats,
  getHRStats,
};
