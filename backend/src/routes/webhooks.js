/**
 * Webhooks Routes
 * RESTful API endpoints for webhook management
 */

const express = require('express');
const router = express.Router();
const webhooksController = require('../controllers/webhooksController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/webhooks - List all webhooks
router.get('/', webhooksController.getWebhooks);

// GET /api/webhooks/events - Get available webhook events
router.get('/events', webhooksController.getAvailableEvents);

// POST /api/webhooks - Create new webhook subscription
router.post('/', webhooksController.createWebhook);

// GET /api/webhooks/:id/logs - Get webhook delivery logs
router.get('/:id/logs', webhooksController.getWebhookLogs);

// POST /api/webhooks/:id/test - Test webhook with a ping
router.post('/:id/test', webhooksController.testWebhook);

// PATCH /api/webhooks/:id/toggle - Toggle webhook active status
router.patch('/:id/toggle', webhooksController.toggleWebhook);

// DELETE /api/webhooks/:id - Delete webhook
router.delete('/:id', webhooksController.deleteWebhook);

module.exports = router;
