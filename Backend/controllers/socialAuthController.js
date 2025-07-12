const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const { getSocketIO } = require('../utils/socketRedis');

const handleGoogleCallback = async (req, res) => {
  const io = getSocketIO();
  try {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    const notification = await Notification.create({
      user: req.user._id,
      type: 'auth',
      content: 'Google login successful!',
      relatedId: req.user._id,
    });
    io.to(req.user._id.toString()).emit('auth', notification);

    res.redirect(`${process.env.CLIENT_URL}/profile?token=${token}`);
  } catch (error) {
    const notification = await Notification.create({
      user: req.user._id,
      type: 'auth',
      content: 'Google login failed.',
      relatedId: req.user._id,
    });
    io.to(req.user._id.toString()).emit('auth', notification);
    res.redirect(`${process.env.CLIENT_URL}/register`);
  }
};

module.exports = { handleGoogleCallback };