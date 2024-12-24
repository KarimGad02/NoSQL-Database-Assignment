const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Category = require('../models/Category');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author')
      .populate('comments')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author')
      .populate('comments');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    
    await User.findByIdAndUpdate(req.body.author, {
      $push: { posts: post._id }
    });

    if (req.body.category) {
      await Category.findByIdAndUpdate(req.body.category, {
        $push: { posts: post._id }
      });
    }
    
    const populatedPost = await Post.findById(post._id)
      .populate('author')
      .populate('categories')
      .populate('comments');
      
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const oldPost = await Post.findById(req.params.id);
    if (!oldPost) return res.status(404).json({ message: 'Post not found' });

    if (req.body.category && oldPost.category && req.body.category !== oldPost.category.toString()) {
      await Category.findByIdAndUpdate(oldPost.category, {
        $pull: { posts: oldPost._id }
      });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (req.body.category) {
      await Category.findByIdAndUpdate(req.body.category, {
        $push: { posts: post._id }
      });
    }

    const updatedPost = await Post.findById(post._id)
      .populate('author')
      .populate('categories')
      .populate('comments');
      
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: post._id }
    });

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
