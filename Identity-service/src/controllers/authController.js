
const logger = require('../utils/logger');
const {validateRegistration , validateLogin} = require('../utils/validation');
const User = require('../models/User'); 
const  generateToken  = require('../utils/generateToken');
const RefreshToken = require('../models/RefreshToken');
// User Registration

const registerUser = async (req,res) => {
    logger.info('User registration endpoint hit');
    try {
      const {error} = validateRegistration(req.body);
      if(error) {
       //validateRegistration is used for req body validation useing Joi  
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

const loginUser = async (req,res) => {
  logger.info('User login endpoint hit');
  try {
    const {error} = validateLogin(req.body);
    if(error) {
      logger.warn('Validation error:', error.details[0].message);
      return res.status(400).json({
        message: error.details[0].message,
        success: false});
    }
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
      logger.warn('User not found');
      return res.status(400).json({message: 'User not found', success: false});
    }
    // check password
    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid) {
      logger.warn('Invalid password');
      return res.status(400).json({message: 'Invalid password', success: false});
    }
    // generate token
    const { accessToken, refreshToken } = await generateToken(user);
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      accessToken,
      refreshToken,
      userId: user._id,
      username: user.username,
      email: user.email
    })
    
  }catch (error) {
    logger.error('Error in login:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
}

// refresh token

// User Logouterror
const logoutUser = async (req,res) => {
  logger.info('User logout endpoint hit');
  try {
    const {refreshToken} = req.body;
    if(!refreshToken) {
      logger.warn('Refresh token is required');
      return res.status(400).json({message: 'Refresh token is required', success: false});
    }
    await RefreshToken.deleteOne({token: refreshToken});
    logger.info('Refresh token deleted successfully for Logout');
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    })
    
  }catch (error) {
    logger.error('Error in refresh token:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
}

module.exports = { registerUser , loginUser , logoutUser };