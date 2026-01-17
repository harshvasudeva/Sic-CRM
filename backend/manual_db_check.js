const { Client } = require('pg');

const password = process.argv[2];
const user = process.argv[3] || 'postgres';
const port = process.argv[4] || 5432;

if (!password) {
    console.log('Usage: node manual_db_check.js <password> [user] [port]');
    process.exit(1);
}

const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@localhost:${port}/postgres`;

console.log(`Testing connection for user '${user}' on port ${port}...`);

const client = new Client({ connectionString });

client.connect()
    .then(async () => {
        console.log('\n✅ SUCCESS! Connection established.');
        const res = await client.query('SELECT version()');
        console.log('Server version:', res.rows[0].version);
        await client.end();
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ FAILED:', err.message);
        if (err.message.includes('authentication failed')) {
            console.error('--> The password was incorrect.');
        }
        if (err.message.includes('ECONNREFUSED')) {
            console.error('--> Could not reach the server. Is it running?');
        }
        client.end();
        process.exit(1);
    });
