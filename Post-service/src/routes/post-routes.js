const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, deletePost , getPostById } = require('../controllers/postController');

// middleware to authenticate the user
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, createPost);
router.get('/getposts', authenticateToken, getAllPosts);
router.delete('/delete/:postId', authenticateToken, deletePost);
router.get('/getpostbyid/:postId', authenticateToken, getPostById);
module.exports = router;



