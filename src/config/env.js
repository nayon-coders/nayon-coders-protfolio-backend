require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

module.exports = { env };
