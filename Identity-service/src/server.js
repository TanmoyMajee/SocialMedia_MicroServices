require('dotenv').config();
const express = require('express');
const dbConnect = require('./utils/dbConnect');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const Redis = require('ioredis');
const {RateLimiterRedis} = require('rate-limiter-flexible');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const routes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// async function connectToDatabase() {
//     await dbConnect(); // Connect to MongoDB
// }
// connectToDatabase()
dbConnect();
 //Applying await ensures that the database connection is fully established before the rest of your application
const redisClient  = new Redis(process.env.REDIS_URL)

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req,res,next) => {
  logger.info(`Request method: ${req.method}, Request URL: ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

// DDOS protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10, // max Number of requests allowed : 10 per sec
  duration: 1, // Per second
});
// toreClient: redisClient ensures that the rate limiter uses Redis to store counters, which is crucial for distributed setups.
// keyPrefix: 'middleware' adds a namespace to the keys in Redis, preventing conflicts and making them easier to manage.

app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      logger.warn(' Rate limit exceed for ip : ', req.ip);
      res.status(429).json({ success: false, message: 'Too many requests' });
    });
})

// IP based rate limiting for sensitive routes [ Login , refgister ]
const sensitiveEndpointLimiter = rateLimit({
  windowMs:   1 * 60 * 1000, // 15 minute
  max: 10, // Limit each IP to 5 requests per windowMs
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

// apply the rate limiting middleware to sensitive routes
app.use('/api/auth/register', sensitiveEndpointLimiter);
app.use('/api/auth/login', sensitiveEndpointLimiter);

// standardHeaders and disabling legacyHeaders, it ensures that clients receive modern, standardized rate limit information in their responses this helps to notify the client about the rate limit status. how many attempts are remaining, when the limit resets, etc.

// Handler fun  :  When an IP exceeds the rate limit (more than 5 requests in 15 minutes), this function is executed.Purpose:
// Logs a warning message indicating that the rate limit was exceeded for that IP.
// Sends a 429 Too Many Requests response to the client with a JSON message.

//Using a Redis store (via the store option) ensures that rate limiting is enforced across all server instances by sharing request count data in Redis. Without this, each server would keep its own in-memory counters, which can lead to inconsistent rate limiting in a distributed environment.
   //                              ******* WHy WE USE RADIS STORE  ******* 
//In production, even a monolithic application may run on multiple servers (horizontal scaling). If each instance uses an in-memory rate limiter, the counters aren't shared, and a user could bypass the rate limit by distributing requests across servers. To ensure consistent enforcement of rate limits across all instances, we use a shared store (Redis). This setup prevents abuse regardless of whether the application is structured as a monolith or microservices.


// Health check route
app.get('/health', (req, res) => {  
  res.status(200).json({ status: 'OK' });
}
);

// Routes
app.use('/api/auth', routes);

// Error handling middleware
app.use(errorHandler);
  // The error handling middleware is placed at the end of the middleware chain so that it can catch and process errors from all previous routes and middleware. If you don't use it, unhandled errors may cause the server to crash or send default, less secure error responses. Ensuring a custom error handler at the end allows for consistent logging and proper responses to the client when errors occur.

app.listen(process.env.PORT, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});