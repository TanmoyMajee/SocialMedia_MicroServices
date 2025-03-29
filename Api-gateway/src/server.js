require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const Redis = require('ioredis');
const {rateLimit} = require('express-rate-limit');
// const {RateLimiterRedis} = require('rate-limiter-flexible');
const {RedisStore} = require('rate-limit-redis');
const proxy = require('express-http-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware to log request details
app.use((req, res, next) => {
  logger.info(`Request method: ${req.method}, Request URL: ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

// rate limiting middleware

const exressRatelimitOption = rateLimit({
  windowMs:   1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
 standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
 handler: (req, res) => {
    logger.warn('Rate limit exceeded for IP from sensitive route : ', req.ip);
    res.status(429).json({ success: false, message: 'Too many requests' });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(exressRatelimitOption);



const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, '/api');
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error('Proxy error: ', err);
    res.status(500).json({ success: false, message: 'Proxy error' });
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Add a custom header to the proxied request
   proxyReqOpts.headers['Content-Type'] = 'application/json';
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info('Response from Identity service: ', proxyResData);
    return proxyResData;
  }
}

// setting path for each service

app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, proxyOptions));


app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Api gateway is running on port ${PORT}`);
  logger.info(`Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`);
  logger.info("Redis is running on port ", process.env.REDIS_URL);
});



