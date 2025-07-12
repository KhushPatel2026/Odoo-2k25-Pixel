const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { getSocketIO } = require('../utils/socketRedis');
const cloudinary = require('../utils/cloudinaryConfig');

const getProfile = async (req, res) => {
  const io = getSocketIO();
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      const notification = await Notification.create({
        user: req.user.id,
        type: 'auth',
        content: 'User not found.',
        relatedId: req.user.id,
      });
      io.to(req.user.id.toString()).emit('auth', notification);
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }
    res.json({ status: 'ok', profile: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

const editProfile = async (req, res) => {
  const io = getSocketIO();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const notification = await Notification.create({
      user: req.user.id,
      type: 'auth',
      content: 'Invalid profile update data.',
      relatedId: req.user.id,
    });
    io.to(req.user.id.toString()).emit('auth', notification);
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { name, email } = req.body;
    const updates = { name, email };

    // Handle profile image upload
    let profileImage = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'stackit/profiles',
      });
      updates.profileImage = result.secure_url;
      profileImage = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) {
      const notification = await Notification.create({
        user: req.user.id,
        type: 'auth',
        content: 'User not found.',
        relatedId: req.user.id,
      });
      io.to(req.user.id.toString()).emit('auth', notification);
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    const notificationContent = profileImage
      ? 'Profile updated successfully with new image.'
      : 'Profile updated successfully.';
    const notification = await Notification.create({
      user: req.user.id,
      type: 'auth',
      content: notificationContent,
      relatedId: user._id,
    });
    io.to(req.user.id.toString()).emit('auth', notification);

    res.json({ status: 'ok', profile: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const io = getSocketIO();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const notification = await Notification.create({
      user: req.user.id,
      type: 'auth',
      content: 'Invalid password update data.',
      relatedId: req.user.id,
    });
    io.to(req.user.id.toString()).emit('auth', notification);
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      const notification = await Notification.create({
        user: req.user.id,
        type: 'auth',
        content: 'User not found.',
        relatedId: req.user.id,
      });
      io.to(req.user.id.toString()).emit('auth', notification);
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const notification = await Notification.create({
        user: req.user.id,
        type: 'auth',
        content: 'Current password is incorrect.',
        relatedId: req.user.id,
      });
      io.to(req.user.id.toString()).emit('auth', notification);
      return res.status(400).json({ status: 'error', error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    const notification = await Notification.create({
      user: req.user.id,
      type: 'auth',
      content: 'Password changed successfully.',
      relatedId: req.user.id,
    });
    io.to(req.user.id.toString()).emit('auth', notification);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

module.exports = { getProfile, editProfile, changePassword };