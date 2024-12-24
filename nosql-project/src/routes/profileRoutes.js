const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { userId, bio, location, avatar } = req.body;
    
    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    const profile = await Profile.create({
      user: userId,
      bio,
      location,
      avatar
    });

    await User.findByIdAndUpdate(userId, { profile: profile._id });

    const populatedProfile = await Profile.findById(profile._id).populate('user');
    res.status(201).json(populatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('user');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('user');
    
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    await User.findByIdAndUpdate(profile.user, { $unset: { profile: "" } });
    
    await Profile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;