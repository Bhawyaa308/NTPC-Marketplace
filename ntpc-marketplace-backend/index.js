require('dotenv').config();

console.log('PG_PASSWORD:', process.env.PG_PASSWORD);
console.log('TYPE:', typeof process.env.PG_PASSWORD);
const app = require('./src/app');
const { testConnection } = require('./src/config/db');
const initializeSocket = require('./src/socket');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();

    const server = app.listen(PORT, () => {
      console.log(`NTPC Marketplace backend is running on port ${PORT}`);
    });

    initializeSocket(server);

    server.on('error', (error) => {
      console.error('Server failed to start:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Application startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
