const cassandra = require('cassandra-driver');

// ScyllaDB/Cassandra Client Configuration
const client = new cassandra.Client({
    contactPoints: (process.env.SCYLLA_CONTACT_POINTS || '127.0.0.1').split(','),
    localDataCenter: process.env.SCYLLA_LOCAL_DC || 'datacenter1',
    keyspace: process.env.SCYLLA_KEYSPACE || 'sic_crm_logs',
    credentials: {
        username: process.env.SCYLLA_USERNAME || 'cassandra',
        password: process.env.SCYLLA_PASSWORD || 'cassandra'
    }
});

// Initialize Keyspace and Tables
const initScylla = async () => {
    try {
        // Connect specifically to system to create keyspace if needed (limitation of some drivers, 
        // strictly speaking we might need a separate client for system ops if keyspace doesn't exist 
        // but typically we can connect without keyspace first)

        // Use a temporary client to check/create keyspace
        const tempClient = new cassandra.Client({
            contactPoints: (process.env.SCYLLA_CONTACT_POINTS || '127.0.0.1').split(','),
            localDataCenter: process.env.SCYLLA_LOCAL_DC || 'datacenter1',
        });

        await tempClient.connect();

        const keyspace = process.env.SCYLLA_KEYSPACE || 'sic_crm_logs';

        await tempClient.execute(`
            CREATE KEYSPACE IF NOT EXISTS ${keyspace} 
            WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
        `);

        console.log(`ScyllaDB Keyspace '${keyspace}' verified.`);
        await tempClient.shutdown();

        // Connect actual client
        await client.connect();
        console.log('Connected to ScyllaDB');

        // Create Logs Table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id uuid,
                user_id text,
                action text,
                entity text,
                entity_id text,
                details text,
                timestamp timestamp,
                PRIMARY KEY (entity, timestamp)
            ) WITH CLUSTERING ORDER BY (timestamp DESC);
        `);

        // Create Request Logs Table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS request_logs (
                id uuid,
                method text,
                path text,
                status_code int,
                duration_ms int,
                ip text,
                timestamp timestamp,
                PRIMARY KEY (path, timestamp)
            ) WITH CLUSTERING ORDER BY (timestamp DESC);
        `);

        console.log('ScyllaDB Schema verified.');

    } catch (error) {
        console.error('Failed to initialize ScyllaDB:', error);
        // Don't exit process, allow partial startup if DB is down (unless critical)
    }
};

module.exports = {
    client,
    initScylla
};
