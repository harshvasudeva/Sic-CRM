const pool = require('./config/database');
const initDatabase = require('./models/init');
const app = require('./server');

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized successfully');
    app.emit('ready');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { startServer };
