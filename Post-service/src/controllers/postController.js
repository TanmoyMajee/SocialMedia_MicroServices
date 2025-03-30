const logger = require('../utils/logger');
const Post = require('../models/Post');
const {createPostValidation} = require('../utils/validation');

const createPost = async (req, res) => {
  logger.info(' Post endpoint hit');
  try {
    const {error,value} = createPostValidation(req.body);
    if(error){
      logger.error('Validation error in creating post:', error);
      return res.status(400).json({message : error.details[0].message , success : false});
    }
    const {content,mediaIds} = value;
    const newPost = new Post({
      user: req.userId,
      content,
      mediaIds : mediaIds || []
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
