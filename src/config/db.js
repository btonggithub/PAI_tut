const mongoose = require('mongoose');
const env = require('./env');

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let isConnected = false;

const connect = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(env.MONGO_URI, MONGO_OPTIONS);
    isConnected = true;
    console.log(`[DB] Connected to MongoDB (${env.NODE_ENV})`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
};

const disconnect = async () => {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
  console.log('[DB] Disconnected from MongoDB');
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  if (!env.isTest) {
    console.warn('[DB] Lost MongoDB connection');
  }
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[DB] Reconnected to MongoDB');
});

module.exports = { connect, disconnect };
