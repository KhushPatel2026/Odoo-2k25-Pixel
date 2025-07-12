const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const { getSocketIO } = require('../utils/socketRedis');

const getNotifications = async (req, res) => {
  const io = getSocketIO();
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ status: 'ok', notifications, unreadCount });
  } catch (error) {
    const notification = await Notification.create({
      user: req.user.id,
      type: 'notification',
      content: 'Failed to fetch notifications.',
      relatedId: null,
    });
    io.to(req.user.id.toString()).emit('notification', notification);
    res.status(500).json({ status: 'error', error: 'Failed to fetch notifications' });
  }
};

const markNotificationsRead = async (req, res) => {
  const io = getSocketIO();
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ status: 'ok', message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Failed to mark notifications as read' });
  }
};

module.exports = { getNotifications, markNotificationsRead };