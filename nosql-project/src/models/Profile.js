const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  bio: String,
  avatar: String,
  location: String
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);