const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.splat(),
    winston.format.errors({ stack: true }),
  ),
  defaultMeta: { service: 'identity-service' },
  // This is particularly useful in microservices or multi-module applications to quickly identify which service or part of your system produced the log
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // This adds colors to your console output
        winston.format.simple(), // This formats the output to be more readable
      ),
    }),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
  ],
});
// Transports are the different destinations where your logs are sent. In this configuration, there are three transports:

// The error.log file will contain only error-level logs, isolating critical issues.
// The combined.log file will contain all logs, providing a full history of events.

// The console transport will output logs to the console, which is useful for development and debugging.


module.exports = logger;



// winston.format.splat():
// Enables string interpolation. It lets you use placeholders (like %s) in your log messages.

// winston.format.errors({ stack: true }):
// When logging error objects, this format ensures that the error’s stack trace is included in the output.