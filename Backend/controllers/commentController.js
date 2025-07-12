const Comment = require('../models/Comment');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/emailService');
const { getSocketIO, getRedisClient } = require('../utils/socketRedis');
const sanitizeHtml = require('sanitize-html');

const postComment = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { answerId, content } = req.body;
    const userId = req.user.id;

    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['p', 'strong', 'em', 'a', 'div']),
      allowedAttributes: { a: ['href'] },
    });

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(sanitizedContent)) !== null) {
      const username = match[1];
      const user = await User.findOne({ username });
      if (user) mentions.push(user._id);
    }

    const answer = await Answer.findById(answerId).populate('question');
    if (!answer || answer.deleted) {
      const notification = await Notification.create({
        user: userId,
        type: 'comment',
        content: 'Answer not found.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Answer not found' });
    }

    const comment = await Comment.create({
      content: sanitizedContent,
      answer: answerId,
      user: userId,
      mentions,
    });

    if (answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: answer.user,
        type: 'comment',
        content: `Your answer to "${answer.question.title}" has a new comment.`,
        relatedId: comment._id,
      });
      io.to(answer.user.toString()).emit('notification', notification);
      const answerAuthor = await User.findById(answer.user);
    }

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== userId) {
        const mentionedUser = await User.findById(mentionedUserId);
        const mentionNotification = await Notification.create({
          user: mentionedUserId,
          type: 'mention',
          content: `You were mentioned in a comment on "${answer.question.title}".`,
          relatedId: comment._id,
        });
        io.to(mentionedUserId.toString()).emit('notification', mentionNotification);
      }
    }

    io.to('questions').emit('newComment', { questionId: answer.question._id, comment });
    await redisClient.del(`questions:${answer.question}`);

    res.json({ status: 'ok', comment });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ status: 'error', error: 'Failed to post comment' });
  }
};

const updateComment = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { content } = req.body;
    const userId = req.user.id;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate({ path: 'answer', populate: { path: 'question' } });
    if (!comment || comment.deleted) {
      const notification = await Notification.create({
        user: userId,
        type: 'comment',
        content: 'Comment not found.',
        relatedId: commentId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Comment not found' });
    }

    if (comment.user.toString() !== userId) {
      const notification = await Notification.create({
        user: userId,
        type: 'comment',
        content: 'You are not authorized to update this comment.',
        relatedId: commentId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(403).json({ status: 'error', error: 'Unauthorized' });
    }

    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['p', 'strong', 'em', 'a', 'div']),
      allowedAttributes: { a: ['href'] },
    });

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(sanitizedContent)) !== null) {
      const username = match[1];
      const user = await User.findOne({ username });
      if (user) mentions.push(user._id);
    }

    const updates = { content: sanitizedContent, mentions };
    const updatedComment = await Comment.findByIdAndUpdate(commentId, updates, { new: true })
      .populate({ path: 'answer', populate: { path: 'question' } });

    if (comment.answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: comment.answer.user,
        type: 'comment',
        content: `A comment on your answer to "${comment.answer.question.title}" was updated.`,
        relatedId: commentId,
      });
      io.to(comment.answer.user.toString()).emit('notification', notification);
      const answerAuthor = await User.findById(comment.answer.user);
    }

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== userId && !comment.mentions.includes(mentionedUserId)) {
        const mentionedUser = await User.findById(mentionedUserId);
        const mentionNotification = await Notification.create({
          user: mentionedUserId,
          type: 'mention',
          content: `You were mentioned in an updated comment on "${comment.answer.question.title}".`,
          relatedId: commentId,
        });
        io.to(mentionedUserId.toString()).emit('notification', mentionNotification);
      }
    }

    io.to('questions').emit('commentUpdated', { questionId: comment.answer.question._id, comment: updatedComment });
    await redisClient.del(`questions:${comment.answer.question}`);

    res.json({ status: 'ok', comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ status: 'error', error: 'Failed to update comment' });
  }
};

const deleteComment = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const userId = req.user.id;
  const commentId = req.params.id;

  try {
    const comment = await Comment.findById(commentId).populate({ path: 'answer', populate: { path: 'question' } });
    if (!comment || comment.deleted) {
      const notification = await Notification.create({
        user: userId,
        type: 'comment',
        content: 'Comment not found.',
        relatedId: commentId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Comment not found' });
    }
    if (comment.user.toString() !== userId) {
      const notification = await Notification.create({
        user: userId,
        type: 'comment',
        content: 'You are not authorized to delete this comment.',
        relatedId: commentId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(403).json({ status: 'error', error: 'Unauthorized' });
    }
    comment.deleted = true;
    await comment.save();
    const notification = await Notification.create({
      user: comment.user,
      type: 'comment',
      content: `Your comment on "${comment.answer.question.title}" has been deleted.`,
      relatedId: commentId,
    });
    io.to(comment.user.toString()).emit('notification', notification);
    const answerAuthor = await User.findById(comment.answer.user);
    io.to('questions').emit('commentDeleted', { questionId: comment.answer.question._id, commentId });
    await redisClient.del(`questions:${comment.answer.question}`);
    res.json({ status: 'ok', message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ status: 'error', error: 'Failed to delete comment' });
  }
};

module.exports = { postComment, updateComment, deleteComment };