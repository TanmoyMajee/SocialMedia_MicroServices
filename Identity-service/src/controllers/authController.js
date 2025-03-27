
const logger = require('../utils/logger');
const validateRegistration = require('../utils/validation').validateRegistration;
const User = require('../models/User'); 
const { generateToken } = require('../utils/token');
// User Registration

const registerUser = async (req,res) => {
    logger.info('User registration endpoint hit');
    try {
      const {error} = validateRegistration(req.body);
      if(error) {
        // console.log('Validation error:', error);
        logger.warn('Validation error:', error.details[0].message);
        return res.status(400).json({
        // error: error,
        message: error.details[0].message,
        success: false});
      }
      const {username, email, password} = req.body;
      let user = await User.findOne({ $or: [{username}, {email}]});
      if(user){
        logger.warn('User already exists' ,);
        return res.status(400).json({message: 'User already exists', success: false});
      }
      user = new User({username, email, password});
      await user.save();
      logger.info('User registered successfully',user._id);

      const { accessToken, refreshToken } = await generateToken(user);

      res.status(201).json({
        success: true,
        message:"User registered successfully",
        accessToken,
        refreshToken
      })

      }catch (error) {
      logger.error('Error in registration:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        success: false,
      });
    }
}

// User Login

// refresh token

// User Logouterror

module.exports = { registerUser };