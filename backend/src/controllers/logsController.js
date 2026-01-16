const { client } = require('../config/scylla');
const { v4: uuidv4 } = require('uuid');

// Create a new activity log
exports.createLog = async (req, res) => {
    const { action, entity, entity_id, details } = req.body;
    const user_id = req.user ? req.user.id : 'system';

    try {
        const query = 'INSERT INTO activity_logs (id, user_id, action, entity, entity_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const params = [uuidv4(), user_id, action, entity, entity_id, JSON.stringify(details), new Date()];

        await client.execute(query, params, { prepare: true });

        res.status(201).json({ message: 'Log created' });
    } catch (error) {
        console.error('ScyllaDB Error:', error);
        res.status(500).json({ message: 'Error creating log' });
    }
};

// Get recent logs
exports.getLogs = async (req, res) => {
    try {
        // Limitation: Cassandra/Scylla requires filtering by partition key usually. 
        // For simple "latest global logs", we might need a different schema or a bucket strategy.
        // For now, let's assuming we select by entity if provided, or filtered by client side for small datasets
        // Or strictly strictly allow querying by entity (partition key)

        const { entity } = req.query;

        let query;
        let params = [];

        if (entity) {
            query = 'SELECT * FROM activity_logs WHERE entity = ? LIMIT 50';
            params = [entity];
        } else {
            // Expensive Allow Filtering - only for low volume dev
            query = 'SELECT * FROM activity_logs LIMIT 50 ALLOW FILTERING';
        }

        const result = await client.execute(query, params, { prepare: true });
        res.json(result.rows);
    } catch (error) {
        console.error('ScyllaDB Error:', error);
        res.status(500).json({ message: 'Error fetching logs' });
    }
};
