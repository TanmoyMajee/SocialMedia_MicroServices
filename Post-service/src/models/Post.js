const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'UserSocialMedia', required: true},
  content: {type: String, required: true},
  mediaIds: [  
    { 
      type: String
    }
  ]
} , {timestamps: true});

// we can skip this as we are implementing diff search service for this
postSchema.index({ content: 'text' });

const Post = mongoose.model('PostSocialMedia', postSchema);

module.exports = Post;
