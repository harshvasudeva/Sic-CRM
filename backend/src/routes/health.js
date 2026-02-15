const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  })
})

// Database health check
router.get('/db', async (req, res) => {
  try {
    const start = Date.now()
    const result = await pool.query('SELECT NOW() as time, current_database() as database')
    const latency = Date.now() - start

    res.json({
      status: 'healthy',
      latency,
      database: result.rows[0].database,
      serverTime: result.rows[0].time,
    })
  } catch (err) {
    res.status(503).json({
      status: 'down',
      error: err.message,
    })
  }
})

module.exports = router
