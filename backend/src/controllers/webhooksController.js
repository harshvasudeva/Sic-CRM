/**
 * Webhooks Controller
 * Manages webhook subscriptions and logs
 */

const webhookService = require('../services/webhookService');

/**
 * Get all webhooks
 */
const getWebhooks = async (req, res) => {
    try {
        const webhooks = await webhookService.getWebhooks();
        res.json({
            webhooks,
            availableEvents: Object.values(webhookService.WEBHOOK_EVENTS),
        });
    } catch (error) {
        console.error('Get webhooks error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new webhook subscription
 */
const createWebhook = async (req, res) => {
    try {
        const { name, event, targetUrl, headers } = req.body;

        if (!name || !event || !targetUrl) {
            return res.status(400).json({
                message: 'Missing required fields: name, event, targetUrl',
            });
        }

        // Validate event type
        const validEvents = Object.values(webhookService.WEBHOOK_EVENTS);
        if (!validEvents.includes(event)) {
            return res.status(400).json({
                message: `Invalid event type. Valid events: ${validEvents.join(', ')}`,
            });
        }

        // Validate URL format
        try {
            new URL(targetUrl);
        } catch {
            return res.status(400).json({ message: 'Invalid target URL format' });
        }

        const webhook = await webhookService.createWebhook({
            name,
            event,
            targetUrl,
            headers,
        });

        res.status(201).json({
            message: 'Webhook created successfully',
            webhook: {
                ...webhook,
                // Don't expose the full secret, just a preview
                secretPreview: webhook.secret.substring(0, 8) + '...',
            },
        });
    } catch (error) {
        console.error('Create webhook error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get webhook logs
 */
const getWebhookLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const logs = await webhookService.getWebhookLogs(id, {
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({ logs });
    } catch (error) {
        console.error('Get webhook logs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Toggle webhook status
 */
const toggleWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const webhook = await webhookService.toggleWebhook(id, isActive);

        res.json({
            message: `Webhook ${isActive ? 'activated' : 'deactivated'} successfully`,
            webhook,
        });
    } catch (error) {
        console.error('Toggle webhook error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete webhook
 */
const deleteWebhook = async (req, res) => {
    try {
        const { id } = req.params;

        await webhookService.deleteWebhook(id);

        res.json({ message: 'Webhook deleted successfully' });
    } catch (error) {
        console.error('Delete webhook error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Test webhook by sending a test event
 */
const testWebhook = async (req, res) => {
    try {
        const { id } = req.params;

        // Send a test event
        const result = await webhookService.dispatchWebhook('test.ping', {
            webhookId: id,
            message: 'This is a test event from Sic CRM',
            timestamp: new Date().toISOString(),
        });

        res.json({
            message: 'Test webhook dispatched',
            result,
        });
    } catch (error) {
        console.error('Test webhook error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get available webhook events
 */
const getAvailableEvents = (req, res) => {
    res.json({
        events: Object.entries(webhookService.WEBHOOK_EVENTS).map(([key, value]) => ({
            key,
            value,
            category: value.split('.')[0],
        })),
    });
};

module.exports = {
    getWebhooks,
    createWebhook,
    getWebhookLogs,
    toggleWebhook,
    deleteWebhook,
    testWebhook,
    getAvailableEvents,
};
