/**
 * Webhook Service
 * Dispatches webhooks for external integrations (QuickBooks-style)
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();

// Webhook event types
const WEBHOOK_EVENTS = {
    INVOICE_CREATED: 'invoice.created',
    INVOICE_UPDATED: 'invoice.updated',
    INVOICE_PAID: 'invoice.paid',
    INVOICE_VOIDED: 'invoice.voided',

    BILL_CREATED: 'bill.created',
    BILL_UPDATED: 'bill.updated',
    BILL_PAID: 'bill.paid',
    BILL_VOIDED: 'bill.voided',

    PAYMENT_RECEIVED: 'payment.received',
    PAYMENT_VOIDED: 'payment.voided',

    CREDIT_NOTE_CREATED: 'credit_note.created',
    CREDIT_NOTE_APPLIED: 'credit_note.applied',

    DEBIT_NOTE_CREATED: 'debit_note.created',
    DEBIT_NOTE_APPLIED: 'debit_note.applied',

    JOURNAL_POSTED: 'journal.posted',

    CUSTOMER_CREATED: 'customer.created',
    CUSTOMER_UPDATED: 'customer.updated',

    VENDOR_CREATED: 'vendor.created',
    VENDOR_UPDATED: 'vendor.updated',

    INVENTORY_ADJUSTED: 'inventory.adjusted',
    STOCK_LOW: 'stock.low',
};

/**
 * Generate HMAC signature for webhook payload
 * @param {string} payload - JSON payload string
 * @param {string} secret - Webhook secret
 * @returns {string} - HMAC signature
 */
function generateSignature(payload, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}

/**
 * Send HTTP request to webhook URL
 * @param {string} url - Target URL
 * @param {object} options - Request options
 * @returns {Promise<object>} - Response
 */
function sendRequest(url, headers, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                ...headers,
            },
        };

        const startTime = Date.now();

        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    response: data,
                    duration: Date.now() - startTime,
                    success: res.statusCode >= 200 && res.statusCode < 300,
                });
            });
        });

        req.on('error', (error) => {
            reject({
                statusCode: 0,
                response: null,
                errorMessage: error.message,
                duration: Date.now() - startTime,
                success: false,
            });
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject({
                statusCode: 0,
                response: null,
                errorMessage: 'Request timeout',
                duration: Date.now() - startTime,
                success: false,
            });
        });

        req.write(body);
        req.end();
    });
}

/**
 * Dispatch a webhook event to all registered webhooks
 * @param {string} event - Event type
 * @param {object} data - Event data
 */
async function dispatchWebhook(event, data) {
    try {
        // Get active webhooks for this event
        const webhooks = await prisma.webhook.findMany({
            where: {
                event,
                isActive: true,
            },
        });

        if (webhooks.length === 0) {
            return { dispatched: 0 };
        }

        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data,
        };

        const payloadString = JSON.stringify(payload);

        // Dispatch to all webhooks
        const results = await Promise.allSettled(
            webhooks.map(async (webhook) => {
                const signature = generateSignature(payloadString, webhook.secret);

                const headers = {
                    'X-Webhook-Event': event,
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Timestamp': payload.timestamp,
                    ...(webhook.headers || {}),
                };

                try {
                    const result = await sendRequest(webhook.targetUrl, headers, payloadString);

                    // Log the webhook delivery
                    await prisma.webhookLog.create({
                        data: {
                            webhookId: webhook.id,
                            event,
                            payload,
                            response: result.response?.substring(0, 1000), // Truncate response
                            statusCode: result.statusCode,
                            success: result.success,
                            duration: result.duration,
                        },
                    });

                    return result;
                } catch (error) {
                    // Log failed delivery
                    await prisma.webhookLog.create({
                        data: {
                            webhookId: webhook.id,
                            event,
                            payload,
                            response: null,
                            statusCode: 0,
                            success: false,
                            errorMessage: error.errorMessage || error.message,
                            duration: error.duration || 0,
                        },
                    });

                    throw error;
                }
            })
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

        return {
            dispatched: webhooks.length,
            successful,
            failed,
        };
    } catch (error) {
        console.error('Webhook dispatch error:', error);
        return { dispatched: 0, error: error.message };
    }
}

/**
 * Create a new webhook
 * @param {object} data - Webhook data
 */
async function createWebhook(data) {
    // Generate secret if not provided
    const secret = data.secret || crypto.randomBytes(32).toString('hex');

    return prisma.webhook.create({
        data: {
            name: data.name,
            event: data.event,
            targetUrl: data.targetUrl,
            secret,
            headers: data.headers,
            isActive: data.isActive ?? true,
            retryCount: data.retryCount || 3,
        },
    });
}

/**
 * Get all webhooks
 */
async function getWebhooks() {
    return prisma.webhook.findMany({
        include: {
            logs: {
                take: 10,
                orderBy: { sentAt: 'desc' },
            },
        },
    });
}

/**
 * Get webhook logs
 * @param {string} webhookId - Webhook ID
 * @param {object} options - Query options
 */
async function getWebhookLogs(webhookId, options = {}) {
    return prisma.webhookLog.findMany({
        where: { webhookId },
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: { sentAt: 'desc' },
    });
}

/**
 * Delete a webhook
 * @param {string} id - Webhook ID
 */
async function deleteWebhook(id) {
    return prisma.webhook.delete({
        where: { id },
    });
}

/**
 * Toggle webhook active status
 * @param {string} id - Webhook ID
 * @param {boolean} isActive - New status
 */
async function toggleWebhook(id, isActive) {
    return prisma.webhook.update({
        where: { id },
        data: { isActive },
    });
}

module.exports = {
    WEBHOOK_EVENTS,
    dispatchWebhook,
    createWebhook,
    getWebhooks,
    getWebhookLogs,
    deleteWebhook,
    toggleWebhook,
    generateSignature,
};
