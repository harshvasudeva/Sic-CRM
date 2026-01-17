const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:5432/sic_crm_db"
});

async function testConnection() {
    try {
        await client.connect();
        console.log("SUCCESS: Connected to PostgreSQL database.");
        const res = await client.query('SELECT NOW()');
        console.log("Database Time:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("FAILURE: Could not connect to database.");
        console.error(err);
    }
}

testConnection();
