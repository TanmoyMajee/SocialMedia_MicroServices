const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to Post Service MongoDB ');
  }catch (error) {
    logger.error('Error connecting to Post Service MongoDB:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
