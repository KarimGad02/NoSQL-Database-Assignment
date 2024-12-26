const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
  
    const profile = await Profile.create({ 
      user: user._id,
      bio: req.body.bio || '',
      location: req.body.location || ''
    });

    user.profile = profile._id;
    await user.save();

    const populatedUser = await User.findById(user._id).populate('profile');
    res.status(201).json(populatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().populate('posts');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('posts')
      .populate('profile');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete associated profile
    await Profile.findOneAndDelete({ user: user._id });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and profile deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;