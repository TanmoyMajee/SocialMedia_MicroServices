const mongoose = require('mongoose');
const logger =  require('./logger');


const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);   
    logger.info('Database connected successfully');
    // console.log('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1); // Exit the process with failure
  }
}

module.exports = dbConnect;