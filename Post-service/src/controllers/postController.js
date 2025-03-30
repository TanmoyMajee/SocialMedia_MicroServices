const logger = require('../utils/logger');
const Post = require('../models/Post');

const createPost = async (req, res) => {
  logger.info(' Post endpoint hit');
  try {
    const { content, mediaIds } = req.body;
    const newPost = new Post({
      user: req.user._id,
      content,
      mediaIds
    })
    await newPost.save();
    logger.info('Post created successfully');
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    })
  } catch (error) {
    logger.error('Error in creating post:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
}

const getPosts = async (req, res) => {
  logger.info('Get posts endpoint hit');
  try {
    const posts = await Post.find();
    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      posts
    })
  } catch (error) {
    logger.error('Error in fetching posts:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
}

const deletePost = async (req, res) => {
  logger.info('Delete post endpoint hit');
  try {
    const { postId } = req.params;

  } catch (error) {
    logger.error('Error in deleting post:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
}


module.exports = { createPost, getPosts, deletePost };
