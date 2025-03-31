const logger = require('../utils/logger');
const Post = require('../models/Post');
const {createPostValidation} = require('../utils/validation');


// we need to invalidate the cache when a post is created or deleted
const invalidateCache = async (redisClient) => {
  const cacheKey = await redisClient.keys("posts:page:*");
  if (cacheKey.length > 0) {
    await redisClient.del(cacheKey);
    logger.info('Cache invalidated successfully');
  }
};

const invalidateSinglePostCache = async (redisClient , postId) => {
  const cacheKey = `post:id:${postId}`;
  await redisClient.del(cacheKey);
  logger.info('Single post cache invalidated successfully');
}

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
    // we need to invalidate the cache for the get posts request
     await invalidateCache(req.redisClient);

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


// we ger the redis client from the middleware which we set in the server.js file before the routes [ so all the routes have access to the redis client] 
const getAllPosts = async (req, res) => {
  logger.info('Get posts endpoint hit');
  try {
  //  implement paginatio
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
    // now find in redis if the posts are present
    // set a cache key for the posts 
    const cacheKey = `posts:page:${page}:limit:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);
    if(cachedPosts){
      logger.info('Posts fetched from cache');
      return res.status(200).json({
        success : true,
        message : 'Posts fetched successfully',
        posts : JSON.parse(cachedPosts)
        // we need to parse the cachedPosts because it is a string and we need to return it as an object
      })
    }
    // if not present then fetch from db
    const posts = await Post.find()
    .skip(skip)
    .limit(limit)
    .sort({createdAt : -1});
    const totalPosts = await Post.countDocuments();

    const result = {
      posts,
      totalPages : Math.ceil(totalPosts / limit),
      currentPage : page,
      totalPosts : totalPosts
    }
    // save to cache
    await req.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);
    // 300 is the time to live for the cache in seconds its 5 minutes   | so for 5 minutes the posts will be cached || then we need to stringify the result because it is an object and we need to save it as a string in the cache
    logger.info('Posts fetched from db and saved to cache');
    return res.status(200).json({
      success : true,
      message : 'Posts fetched successfully',
      ...result // this is used to return the result as an object { posts : posts , totalPages : totalPages , currentPage : currentPage , totalPosts : totalPosts }
    })
    

  } catch (error) {
    logger.error('Error in fetching posts:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
}

// we need to get the post by id
const getPostById = async (req, res) => {
  logger.info('Get post by id endpoint hit');
  try {
    const { postId } = req.params;
    // first check in cache
    const cacheKey = `post:id:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);
    if(cachedPost){
      logger.info('Post fetched from cache');
      return res.status(200).json({
        success : true,
        message : 'Post fetched successfully',
        post : JSON.parse(cachedPost)
      })
    }
    // if not present then fetch from db
    const post = await Post.findById(postId);
    if(!post){
      logger.error('Post not found');
      return res.status(404).json({message : 'Post not found', success : false});
    }
    // save to cache
    await req.redisClient.set(cacheKey, JSON.stringify(post), 'EX', 3600);
    logger.info('Post fetched from db and saved to cache');
    return res.status(200).json({message : 'Post found', success : true, post});
  }catch(error){
    logger.error('Error in fetching post by id:', error);
    res.status(500).json({message : 'Internal server error', success : false});
  }
}


const deletePost = async (req, res) => {
  logger.info('Delete post endpoint hit');
  try {
    const { postId } = req.params;
    // // we will first check if the post is present in the cache , if present then we will delete it from the cache and then we will delete it from the db
    // const cacheKey = `post:${postId}`;
    // const cachedPost = await req.redisClient.get(cacheKey);
    // if(cachedPost){
    //   await req.redisClient.del(cacheKey);
    //   logger.info('Post deleted from cache');
    // }
    // now delete from db
    const deletedPost = await Post.findByIdAndDelete(postId);
    if(!deletedPost){
      logger.error('Post not found');
      return res.status(404).json({message : 'Post not found', success : false});
    }
    // now invalidate the cache
    await invalidateSinglePostCache(req.redisClient , postId);
    await invalidateCache(req.redisClient);
    logger.info('Post deleted from db');
    return res.status(200).json({message : 'Post deleted successfully', success : true});

  } catch (error) {
    logger.error('Error in deleting post:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
}


module.exports = { createPost, getAllPosts, deletePost , getPostById};
