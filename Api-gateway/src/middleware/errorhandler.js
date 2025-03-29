const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;

// Yes, you do need to include the next parameter in the function signature. Even though you aren’t using it inside the function, its presence is required for Express to recognize this middleware as an error handler. If you later decide to pass the error to another middleware by calling next(err), having the parameter already in place makes that possible.