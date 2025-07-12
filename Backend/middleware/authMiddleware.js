const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const { getSocketIO } = require('../utils/socketRedis');

const verifyToken = async (req, res, next) => {
  const io = getSocketIO();
  const token = req.headers['x-access-token'];
  if (!token) {
    const notification = await Notification.create({
      user: null,
      type: 'auth',
      content: 'No token provided.',
      relatedId: null,
    });
    io.emit('auth', notification);
    return res.status(401).json({ status: 'error', error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const notification = await Notification.create({
      user: null,
      type: 'auth',
      content: 'Invalid or expired token.',
      relatedId: null,
    });
    io.emit('auth', notification);
    res.status(401).json({ status: 'error', error: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };