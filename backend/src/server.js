const express = require('express');
const router = express.Router();
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const invoicesRoutes = require('./routes/invoices');
const customersRoutes = require('./routes/customers');
const vendorsRoutes = require('./routes/vendors');
const quotationsRoutes = require('./routes/quotations');
const reportsRoutes = require('./routes/reports');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sic CRM API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
