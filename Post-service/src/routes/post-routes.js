const express = require('express');
const router = express.Router();
const { createPost, getPosts, deletePost } = require('../controllers/postController');

// middleware to authenticate the user
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, createPost);
router.get('/get', authenticateToken, getPosts);
router.delete('/delete/:postId', authenticateToken, deletePost);

module.exports = router;



