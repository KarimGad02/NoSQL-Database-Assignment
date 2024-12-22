const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Category = require('../models/Category');

// Create post
router.post('/', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    
    // Update user's posts array
    await User.findByIdAndUpdate(req.body.author, {
      $push: { posts: post._id }
    });

    // Update category's posts array
    if (req.body.category) {
      await Category.findByIdAndUpdate(req.body.category, {
        $push: { posts: post._id }
      });
    }
    
    const populatedPost = await Post.findById(post._id)
      .populate('author')
      .populate('category')
      .populate('comments');
      
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ...existing code for GET routes...

// Update post
router.put('/:id', async (req, res) => {
  try {
    const oldPost = await Post.findById(req.params.id);
    if (!oldPost) return res.status(404).json({ message: 'Post not found' });

    // Remove post from old category if category is being changed
    if (req.body.category && oldPost.category && req.body.category !== oldPost.category.toString()) {
      await Category.findByIdAndUpdate(oldPost.category, {
        $pull: { posts: oldPost._id }
      });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Add post to new category
    if (req.body.category) {
      await Category.findByIdAndUpdate(req.body.category, {
        $push: { posts: post._id }
      });
    }

    const updatedPost = await Post.findById(post._id)
      .populate('author')
      .populate('category')
      .populate('comments');
      
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Remove post from user's posts
    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: post._id }
    });

    // Remove post from category's posts
    if (post.category) {
      await Category.findByIdAndUpdate(post.category, {
        $pull: { posts: post._id }
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;