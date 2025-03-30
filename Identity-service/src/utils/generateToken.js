const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken'); 
const logger = require('./logger');

const generateToken = async (user) => {
  try {
    const accessToken = jwt.sign({ 
      userId : user._id,
      username : user.username
    }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ 
      userId : user._id,
      username : user.username
    }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });
    const expiresAt = new Date(Date.now() + 7); 
    // refresh token will expire in 7 days

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: expiresAt,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    // console.error('Error generating token:', error);
    logger.error('Error generating token:', error);
    throw new Error('Token generation failed');
  }
}

module.exports = generateToken;

// generate token based on userId , username