const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {

  const userId = req.headers['x-user-id']
  if (!userId) {
    logger.warn('No user id found in the request');
    return res.status(401).json({ message: 'Unauthorized', success: false });
  }
  req.userId = userId;
  next();
}

module.exports = { authenticateToken };
