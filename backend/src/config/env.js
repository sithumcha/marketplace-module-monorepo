const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace_db',
  JWT_SECRET: process.env.JWT_SECRET || 'marketplace_secret_jwt_key_2026',
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'demo_cloud',
    API_KEY: process.env.CLOUDINARY_API_KEY || 'demo_key',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || 'demo_secret',
  }
};
