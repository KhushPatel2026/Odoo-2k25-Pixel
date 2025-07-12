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
      await sendEmail(
        questionOwner.email,
        'New Answer to Your Question',
        `<p>Your question "${question.title}" has a new answer.</p>`
      );
    }

    io.to('questions').emit('newAnswer', { questionId, answer });
    await redisClient.del(`questions:${questionId}`);

    res.json({ status: 'ok', answer });
  } catch (error) {
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
    if (!answer) {
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
      await sendEmail(
        answerAuthor.email,
        'Your Answer Was Accepted',
        `<p>Your answer to "${answer.question.title}" was accepted.</p>`
      );
    }

    io.to('questions').emit('answerAccepted', { questionId: answer.question._id, answerId });
    await redisClient.del(`questions:${answer.question._id}`);

    res.json({ status: 'ok', answer });
  } catch (error) {
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
    if (!answer) {
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
      await sendEmail(
        answerAuthor.email,
        `Your Answer Was ${voteType.charAt(0).toUpperCase() + voteType.slice(1)}d`,
        `<p>Your answer to "${answer.question.title}" was ${voteType}d.</p>`
      );
    } else if (voteType === 'noVote' && answer.user.toString() !== userId) {
      const notification = await Notification.create({
        user: answer.user,
        type: 'vote',
        content: `A vote was removed from your answer to "${answer.question.title}".`,
        relatedId: answer._id,
      });
      io.to(answer.user.toString()).emit('notification', notification);
      const answerAuthor = await User.findById(answer.user);
      await sendEmail(
        answerAuthor.email,
        'Vote Removed from Your Answer',
        `<p>A vote was removed from your answer to "${answer.question.title}".</p>`
      );
    }

    io.to('questions').emit('voteUpdate', {
      answerId,
      upvotes: answer.upvotes.length,
      downvotes: answer.downvotes.length,
    });

    await redisClient.del(`questions:${answer.question}`);

    res.json({ status: 'ok', answer });
  } catch (error) {
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
    if (!answer) {
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
    if (content) {
      sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'div']),
        allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
      });
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
      await sendEmail(
        questionOwner.email,
        'Answer Updated',
        `<p>An answer to your question "${answer.question.title}" was updated.</p>`
      );
    }

    io.to('questions').emit('answerUpdated', { questionId: answer.question._id, answer: updatedAnswer });
    await redisClient.del(`questions:${answer.question._id}`);

    res.json({ status: 'ok', answer: updatedAnswer });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Failed to update answer' });
  }
};

module.exports = { postAnswer, acceptAnswer, voteAnswer, updateAnswer };