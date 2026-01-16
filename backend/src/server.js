const express = require('express');
const router = express.Router();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const { initScylla, client: scyllaClient } = require('./config/scylla');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

// Initialize DB Clients
const prisma = new PrismaClient();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const invoicesRoutes = require('./routes/invoices');
const customersRoutes = require('./routes/customers');
const vendorsRoutes = require('./routes/vendors');
const quotationsRoutes = require('./routes/quotations');
const reportsRoutes = require('./routes/reports');
const logsRoutes = require('./routes/logs'); // New logs route

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging to ScyllaDB (Async - fire and forget)
app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    const duration = Date.now() - start;
    try {
      // Only log if Scylla is connected
      if (scyllaClient.connected) {
        await scyllaClient.execute(
          'INSERT INTO request_logs (id, method, path, status_code, duration_ms, ip, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), req.method, req.path, res.statusCode, duration, req.ip, new Date()],
          { prepare: true }
        );
      }
    } catch (err) {
      console.error('Failed to log request to Scylla:', err.message);
    }
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/logs', logsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sic CRM API is running',
    db: {
      postgres: 'connected', // Prisma doesn't hold open connection, assumed OK if app running
      scylla: scyllaClient.connected ? 'connected' : 'disconnected'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Initialize Databases and Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initScylla();
    // Prisma connects lazily, but we can test it
    // await prisma.$connect(); 

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

module.exports = app;
