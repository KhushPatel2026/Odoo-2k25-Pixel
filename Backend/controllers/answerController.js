const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Vote = require('../models/Vote');
const { validationResult } = require('express-validator');
const cloudinary = require('../utils/cloudinaryConfig');
const { sendEmail } = require('../utils/emailService');
const { getSocketIO, getRedisClient } = require('../utils/socketRedis');
const sanitizeHtml = require('sanitize-html');

const postAnswer = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { questionId, content } = req.body;
    const userId = req.user.id;

    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'div']),
      allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
    });

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: 'stackit/answers' })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    let contentWithImages = sanitizedContent;
    if (imageUrls.length > 0) {
      const imageTags = imageUrls.map((url) => `<img src="${url}" alt="answer-image" />`).join('');
      contentWithImages = `${sanitizedContent}${imageTags}`;
    }

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(sanitizedContent)) !== null) {
      const username = match[1];
      const user = await User.findOne({ username });
      if (user) mentions.push(user._id);
    }

    const question = await Question.findById(questionId).where({ status: 'active' });
    if (!question) {
      const notification = await Notification.create({
        user: userId,
        type: 'answer',
        content: 'Question not found.',
        relatedId: questionId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Question not found' });
    }

    const answer = await Answer.create({
      content: contentWithImages,
      imageUrl: imageUrls,
      question: questionId,
      user: userId,
      mentions,
    });

    if (question.user.toString() !== userId) {
      const notification = await Notification.create({
        user: question.user,
        type: 'answer',
        content: `Your question "${question.title}" has a new answer.`,
        relatedId: answer._id,
      });
      io.to(question.user.toString()).emit('notification', notification);
      const questionOwner = await User.findById(question.user);
    }

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== userId) {
        const mentionedUser = await User.findById(mentionedUserId);
        const mentionNotification = await Notification.create({
          user: mentionedUserId,
          type: 'mention',
          content: `You were mentioned in an answer to "${question.title}".`,
          relatedId: answer._id,
        });
        io.to(mentionedUserId.toString()).emit('notification', mentionNotification);
      }
    }

    io.to('questions').emit('newAnswer', { questionId, answer });
    await redisClient.del(`questions:${questionId}`);

    res.json({ status: 'ok', answer });
  } catch (error) {
    console.error('Error posting answer:', error);
    res.status(500).json({ status: 'error', error: 'Failed to post answer' });
  }
};

const acceptAnswer = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { answerId } = req.body;
    const userId = req.user.id;

    const answer = await Answer.findById(answerId).populate('question');
    if (!answer || answer.deleted) {
      const notification = await Notification.create({
        user: userId,
        type: 'answer',
        content: 'Answer not found.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Answer not found' });
    }

    if (answer.question.user.toString() !== userId) {
      const notification = await Notification.create({
        user: userId,
        type: 'answer',
        content: 'Only question owner can accept answers.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(403).json({ status: 'error', error: 'Only question owner can accept answers' });
    }

    await Answer.updateMany({ question: answer.question._id, accepted: true }, { accepted: false });

    answer.accepted = true;
    await answer.save();

    if (answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: answer.user,
        type: 'answer',
        content: `Your answer to "${answer.question.title}" was accepted.`,
        relatedId: answer._id,
      });
      io.to(answer.user.toString()).emit('notification', notification);
      const answerAuthor = await User.findById(answer.user);
    }

    io.to('questions').emit('answerAccepted', { questionId: answer.question._id, answerId });
    await redisClient.del(`questions:${answer.question._id}`);

    res.json({ status: 'ok', answer });
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({ status: 'error', error: 'Failed to accept answer' });
  }
};

const voteAnswer = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { answerId, voteType } = req.body;
    const userId = req.user.id;

    const answer = await Answer.findById(answerId).populate('question');
    if (!answer || answer.deleted) {
      const notification = await Notification.create({
        user: userId,
        type: 'vote',
        content: 'Answer not found.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Answer not found' });
    }

    const existingVote = await Vote.findOne({ user: userId, answer: answerId });
    if (existingVote) {
      if (voteType === 'noVote') {
        await Vote.deleteOne({ user: userId, answer: answerId });
        if (existingVote.type === 'upvote') {
          answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId);
        } else {
          answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId);
        }
      } else if (existingVote.type === voteType) {
        const notification = await Notification.create({
          user: userId,
          type: 'vote',
          content: `Already ${voteType}d this answer.`,
          relatedId: answerId,
        });
        io.to(userId.toString()).emit('notification', notification);
        return res.status(400).json({ status: 'error', error: `Already ${voteType}d this answer` });
      } else {
        await Vote.deleteOne({ user: userId, answer: answerId });
        if (existingVote.type === 'upvote') {
          answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId);
        } else {
          answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId);
        }
      }
    }

    if (voteType !== 'noVote') {
      await Vote.create({ user: userId, answer: answerId, type: voteType });
      if (voteType === 'upvote') {
        answer.upvotes.push(userId);
      } else {
        answer.downvotes.push(userId);
      }
    }

    await answer.save();

    if (voteType !== 'noVote' && answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: answer.user,
        type: 'vote',
        content: `Your answer to "${answer.question.title}" was ${voteType}d.`,
        relatedId: answer._id,
      });
      io.to(answer.user.toString()).emit('notification', notification);
      const answerAuthor = await User.findById(answer.user);
    } else if (voteType === 'noVote' && answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: answer.user,
        type: 'vote',
        content: `A vote was removed from your answer to "${answer.question.title}".`,
        relatedId: answer._id,
      });
      io.to(answer.user.toString()).emit('notification', notification);
      const answerAuthor = await User.findById(answer.user);
    }

    io.to('questions').emit('voteUpdate', {
      answerId,
      upvotes: answer.upvotes.length,
      downvotes: answer.downvotes.length,
    });

    await redisClient.del(`questions:${answer.question}`);

    res.json({ status: 'ok', answer });
  } catch (error) {
    console.error('Error voting on answer:', error);
    res.status(500).json({ status: 'error', error: 'Failed to vote on answer' });
  }
};

const updateAnswer = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { content } = req.body;
    const userId = req.user.id;
    const answerId = req.params.id;

    const answer = await Answer.findById(answerId).populate('question');
    if (!answer || answer.deleted) {
      const notification = await Notification.create({
        user: userId,
        type: 'answer',
        content: 'Answer not found.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Answer not found' });
    }

    if (answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: userId,
        type: 'answer',
        content: 'You are not authorized to update this answer.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(403).json({ status: 'error', error: 'Unauthorized' });
    }

    let sanitizedContent = content;
    let mentions = answer.mentions || [];
    if (content) {
      sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'div']),
        allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
      });

      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
      mentions = [];
      let match;
      while ((match = mentionRegex.exec(sanitizedContent)) !== null) {
        const username = match[1];
        const user = await User.findOne({ username });
        if (user) mentions.push(user._id);
      }
    }

    let imageUrls = answer.imageUrl || [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: 'stackit/answers' })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    let contentWithImages = sanitizedContent || answer.content;
    if (imageUrls.length > 0) {
      const imageTags = imageUrls.map((url) => `<img src="${url}" alt="answer-image" />`).join('');
      contentWithImages = `${sanitizedContent || answer.content}${imageTags}`;
    }

    const updates = {};
    if (content) updates.content = contentWithImages;
    if (imageUrls.length > 0) updates.imageUrl = imageUrls;
    if (content) updates.mentions = mentions;

    const updatedAnswer = await Answer.findByIdAndUpdate(answerId, updates, { new: true })
      .populate('question');

    if (answer.question.user.toString() !== userId) {
      const notification = await Notification.create({
        user: answer.question.user,
        type: 'answer',
        content: `An answer to your question "${answer.question.title}" was updated.`,
        relatedId: answerId,
      });
      io.to(answer.question.user.toString()).emit('notification', notification);
      const questionOwner = await User.findById(answer.question.user);
    }

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== userId && !answer.mentions.includes(mentionedUserId)) {
        const mentionedUser = await User.findById(mentionedUserId);
        const mentionNotification = await Notification.create({
          user: mentionedUserId,
          type: 'mention',
          content: `You were mentioned in an updated answer to "${answer.question.title}".`,
          relatedId: answerId,
        });
        io.to(mentionedUserId.toString()).emit('notification', mentionNotification);
      }
    }

    io.to('questions').emit('answerUpdated', { questionId: answer.question._id, answer: updatedAnswer });
    await redisClient.del(`questions:${answer.question._id}`);

    res.json({ status: 'ok', answer: updatedAnswer });
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ status: 'error', error: 'Failed to update answer' });
  }
};

const deleteAnswer = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const answerId = req.params.id;
    const userId = req.user.id;

    const answer = await Answer.findById(answerId).populate('question');
    if (!answer || answer.deleted) {
      const notification = await Notification.create({
        user: userId,
        type: 'answer',
        content: 'Answer not found.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(404).json({ status: 'error', error: 'Answer not found' });
    }

    if (answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: userId,
        type: 'answer',
        content: 'You are not authorized to delete this answer.',
        relatedId: answerId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(403).json({ status: 'error', error: 'Unauthorized' });
    }

    answer.deleted = true;
    await answer.save();

    const notification = await Notification.create({
      user: answer.question.user,
      type: 'answer',
      content: `An answer to your question "${answer.question.title}" was deleted.`,
      relatedId: answer._id,
    });
    io.to(answer.question.user.toString()).emit('notification', notification);
    const questionOwner = await User.findById(answer.question.user);

    io.to('questions').emit('answerDeleted', { questionId: answer.question._id, answerId });
    await redisClient.del(`questions:${answer.question._id}`);

    res.json({ status: 'ok', message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ status: 'error', error: 'Failed to delete answer' });
  }
};

module.exports = { postAnswer, acceptAnswer, voteAnswer, updateAnswer, deleteAnswer };