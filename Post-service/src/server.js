require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/post-routes');
const logger = require('./utils/logger');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const Redis = require('ioredis');
const cors = require('cors');
const connectDB = require('./utils/dbConnect');

const app = express();

connectDB();

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next) => {
  logger.info( `Received ${req.method} request to ${req.url}`);
  next();
})



app.use('/api/posts', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  logger.info(`Post Service is running on port ${PORT}`);
});