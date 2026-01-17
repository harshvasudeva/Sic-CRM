const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const testConnection = async (req, res) => {
    const { user, password, host, port, database } = req.body;

    if (!user || !host || !port || !database) {
        return res.status(400).json({ valid: false, message: 'Missing required fields' });
    }

    const targetConnectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    const defaultConnectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/postgres`; // Always connect to postgres for admin tasks

    // 1. Try connecting to the target DB directly
    const client = new Client({ connectionString: targetConnectionString, connectionTimeoutMillis: 5000 });

    try {
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        return res.status(200).json({ valid: true, message: 'Connection successful!' });
    } catch (error) {
        // 2. If error is "database does not exist" (code 3D000), try to create it
        if (error.code === '3D000') {
            console.log(`Database ${database} does not exist. Attempting to create...`);
            await client.end().catch(() => { }); // Ensure closed

            // Connect to default 'postgres' db to create new db
            const adminClient = new Client({ connectionString: defaultConnectionString, connectionTimeoutMillis: 5000 });

            try {
                await adminClient.connect();
                // Check credentials by running a simple query
                await adminClient.query('SELECT 1');

                // Create the database
                // parameterized queries don't work for CREATE DATABASE identifiers, so be careful with input (though this is local setup)
                // We sanitize strictly to be safe
                const sanitizedDbName = database.replace(/[^a-zA-Z0-9_]/g, '');
                if (sanitizedDbName !== database) {
                    return res.status(400).json({ valid: false, message: 'Invalid database name characters.' });
                }

                await adminClient.query(`CREATE DATABASE "${sanitizedDbName}"`);
                await adminClient.end();

                return res.status(200).json({
                    valid: true,
                    message: `Database '${database}' created successfully! Connection valid.`
                });

            } catch (adminError) {
                console.error('Failed to create database', adminError);
                await adminClient.end().catch(() => { });
                return res.status(400).json({
                    valid: false,
                    message: `Credentials valid, but failed to create DB: ${adminError.message}`
                });
            }
        }

        // Other errors (auth failed, etc)
        console.error('DB Connection Test Error:', error);
        return res.status(400).json({ valid: false, message: error.message });
    }
};

const saveConfiguration = async (req, res) => {
    const { user, password, host, port, database } = req.body;

    if (!user || !host || !port || !database) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Construct the DATABASE_URL
    const databaseUrl = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}?schema=public`;

    try {
        const envPath = path.join(__dirname, '../../.env');

        // Read existing .env
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Update or add DATABASE_URL
        const envLines = envContent.split('\n');
        let found = false;
        const newLines = envLines.map(line => {
            if (line.trim().startsWith('DATABASE_URL=')) {
                found = true;
                return `DATABASE_URL="${databaseUrl}"`;
            }
            return line;
        });

        if (!found) {
            newLines.push(`DATABASE_URL="${databaseUrl}"`);
        }

        // Write back to .env
        fs.writeFileSync(envPath, newLines.join('\n'));

        return res.status(200).json({ success: true, message: 'Configuration saved. Please restart the backend.' });
    } catch (error) {
        console.error('Save Configuration Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to write to .env file' });
    }
};

const checkStatus = async (req, res) => {
    console.log('--- CHECK STATUS ---');
    console.log('ENV DATABASE_URL:', process.env.DATABASE_URL);

    // Check if we have a URL
    if (!process.env.DATABASE_URL) {
        console.log('Status: False (No DATABASE_URL)');
        return res.json({ configured: false });
    }

    // Try to connect using pg client to verify validity
    // Parse connection string for params
    try {
        console.log('Attempting status check connection...');
        // Quick regex to parse connection string or just use new Client(url)
        // Note: Client supports connection string directly
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            connectionTimeoutMillis: 2000 // Short timeout
        });

        await client.connect();
        console.log('Status: Connected!');
        await client.query('SELECT 1');
        await client.end();

        res.json({ configured: true });
    } catch (error) {
        console.error('DB Status Check Failed:', error.message);
        res.json({ configured: false, error: error.message });
    }
};

module.exports = {
    testConnection,
    saveConfiguration,
    checkStatus
};
