
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');


const validateToken = (req,res,next) => {

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // extract token from header as head will be like this "Bearer <token>" so we will split it and get the
      // token from the second index
      token = req.headers.authorization.split(' ')[1];
     jwt.verify(token, process.env.JWT_SECRET ,(err,decoded) => {
      if(err){
        logger.warn('Error in validating token:', err);
        return res.status(401).json({message : 'Unauthorized' , success : false } );
      }
      req.user = decoded;  
      next();
     });
    } catch (error) {
      logger.warn('Error in validating token:', error);
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }
  } else {
    logger.warn('No token found in the request');
    return res.status(401).json({ message: 'Unauthorized', success: false });
  }
}

module.exports = {validateToken};

