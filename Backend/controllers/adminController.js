const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/emailService');
const { getSocketIO, getRedisClient } = require('../utils/socketRedis');

const moderateContent = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const notification = await Notification.create({
      user: req.user.id,
      type: 'admin',
      content: 'Invalid moderation data.',
      relatedId: null,
    });
    io.to(req.user.id.toString()).emit('notification', notification);
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  if (req.user.role !== 'admin') {
    const notification = await Notification.create({
      user: req.user.id,
      type: 'admin',
      content: 'Unauthorized access.',
      relatedId: null,
    });
    io.to(req.user.id.toString()).emit('notification', notification);
    return res.status(403).json({ status: 'error', error: 'Unauthorized' });
  }

  try {
    const { type, id, action } = req.body;
    let item;
    let user;

    if (type === 'question') {
      item = await Question.findById(id).populate('user');
      if (action === 'delete') {
        item.status = 'deleted';
      }
      await item.save();
      user = item.user;
      await redisClient.del(`questions:${id}`);
      io.to('questions').emit('questionModerated', { questionId: id, status: item.status });
    } else if (type === 'answer') {
      item = await Answer.findById(id).populate('question user');
      if (action === 'delete') {
        await Answer.deleteOne({ _id: id });
        await redisClient.del(`questions:${item.question._id}`);
        io.to('questions').emit('answerDeleted', { questionId: item.question._id, answerId: id });
      }
      user = item.user;
    } else if (type === 'comment') {
      item = await Comment.findById(id).populate('answer user');
      if (action === 'delete') {
        await Comment.deleteOne({ _id: id });
        await redisClient.del(`questions:${item.answer.question}`);
        io.to('questions').emit('commentDeleted', { questionId: item.answer.question, commentId: id });
      }
      user = item.user;
    } else {
      const notification = await Notification.create({
        user: req.user.id,
        type: 'admin',
        content: 'Invalid content type.',
        relatedId: null,
      });
      io.to(req.user.id.toString()).emit('notification', notification);
      return res.status(400).json({ status: 'error', error: 'Invalid content type' });
    }

    await sendEmail(
      user.email,
      `Your ${type} was ${action === 'delete' ? 'Deleted' : 'Moderated'}`,
      `<p>Your ${type} on StackIt has been ${action === 'delete' ? 'deleted' : 'moderated'} by an admin.</p>`
    );

    const notification = await Notification.create({
      user: user._id,
      type: 'admin',
      content: `Your ${type} was ${action === 'delete' ? 'deleted' : 'moderated'} by an admin.`,
      relatedId: id,
    });
    io.to(user._id.toString()).emit('notification', notification);

    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Failed to moderate content' });
  }
};

const getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', error: 'Unauthorized' });
  }
  try {
    const users = await User.find().select('-password');
    res.json({ status: 'ok', users });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Failed to fetch users' });
  }
};

module.exports = { moderateContent, getAllUsers };