const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../utils/cloudinaryConfig');
const { sendEmail } = require('../utils/emailService');
const { getSocketIO, getRedisClient } = require('../utils/socketRedis');
const sanitizeHtml = require('sanitize-html');

const askQuestion = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { title, description, tags } = req.body;
    const userId = req.user.id;

    const sanitizedDescription = sanitizeHtml(description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'div']),
      allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
    });

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: 'stackit/questions' })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    let descriptionWithImages = sanitizedDescription;
    if (imageUrls.length > 0) {
      const imageTags = imageUrls.map((url) => `<img src="${url}" alt="question-image" />`).join('');
      descriptionWithImages = `${sanitizedDescription}${imageTags}`;
    }

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(sanitizedDescription)) !== null) {
      const username = match[1];
      const user = await User.findOne({ username });
      if (user) mentions.push(user._id);
    }

    const question = await Question.create({
      title,
      description: descriptionWithImages,
      imageUrl: imageUrls,
      tags: tags.split(',').map((tag) => tag.trim().toLowerCase()),
      user: userId,
      mentions,
    });

    await sendEmail(
      req.user.email,
      'Question Posted',
      `<p>Your question "${title}" has been posted successfully.</p>`
    );

    const notification = await Notification.create({
      user: userId,
      type: 'question',
      content: `Your question "${title}" has been posted.`,
      relatedId: question._id,
    });

    io.to(userId.toString()).emit('notification', notification);
    io.to('questions').emit('newQuestion', question);

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== userId) {
        const mentionedUser = await User.findById(mentionedUserId);
        const mentionNotification = await Notification.create({
          user: mentionedUserId,
          type: 'mention',
          content: `You were mentioned in the question "${title}".`,
          relatedId: question._id,
        });
        io.to(mentionedUserId.toString()).emit('notification', mentionNotification);
        await sendEmail(
          mentionedUser.email,
          'You Were Mentioned',
          `<p>You were mentioned in the question "${title}".</p>`
        );
      }
    }

    await redisClient.del('questions');

    res.json({ status: 'ok', question });
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(500).json({ status: 'error', error: 'Failed to post question' });
  }
};

const getQuestions = async (req, res) => {
  const redisClient = getRedisClient();
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const cacheKey = `questions:${page}:${limit}:${tag || ''}:${search || ''}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const query = { status: 'active' };
    if (tag) query.tags = tag.toLowerCase();
    if (search) query.title = { $regex: search, $options: 'i' };

    const questions = await Question.find(query)
      .populate('user', 'name email username')
      .populate('mentions', 'name email username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);
    const response = { status: 'ok', questions, total, page: Number(page), limit: Number(limit) };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch questions' });
  }
};

const getUserQuestions = async (req, res) => {
  const redisClient = getRedisClient();
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const cacheKey = `userQuestions:${userId}:${page}:${limit}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const questions = await Question.find({ user: userId })
      .populate('user', 'name email username')
      .populate('mentions', 'name email username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments({ user: userId });
    const response = { status: 'ok', questions, total, page: Number(page), limit: Number(limit) };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);
  } catch (error) {
    console.error('Error fetching user questions:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch user questions' });
  }
};

const getQuestionById = async (req, res) => {
  try {
    console.log('Fetching question by ID:', req.params.id);
    const question = await Question.findById(req.params.id)
      .where({ status: 'active' })
      .populate('user', 'name email username')
      .populate('mentions', 'name email username')
      .lean();

    if (!question) {
      console.log('Question not found for ID:', req.params.id);
      return res.status(404).json({ status: 'error', error: 'Question not found' });
    }

    const answers = await Answer.find({ question: req.params.id, deleted: { $ne: true } })
      .populate('user', 'name email username')
      .populate('mentions', 'name email username')
      .lean();

    const answersWithComments = await Promise.all(
      answers.map(async (answer) => {
        const comments = await Comment.find({ answer: answer._id, deleted: { $ne: true } })
          .populate('user', 'name email username')
          .populate('mentions', 'name email username')
          .lean();
        return { ...answer, comments };
      })
    );

    question.answers = answersWithComments;

    console.log('Question fetched with answers and comments:', question);

    res.json({ status: 'ok', question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch question' });
  }
};

const updateQuestion = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { title, description, tags, status } = req.body;
    const userId = req.user.id;
    const questionId = req.params.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ status: 'error', error: 'Question not found' });
    }

    if (question.user.toString() !== userId) {
      const notification = await Notification.create({
        user: userId,
        type: 'question',
        content: 'You are not authorized to update this question.',
        relatedId: questionId,
      });
      io.to(userId.toString()).emit('notification', notification);
      return res.status(403).json({ status: 'error', error: 'Unauthorized' });
    }

    let sanitizedDescription = description;
    let mentions = question.mentions || [];
    if (description) {
      sanitizedDescription = sanitizeHtml(description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'div']),
        allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
      });

      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
      mentions = [];
      let match;
      while ((match = mentionRegex.exec(sanitizedDescription)) !== null) {
        const username = match[1];
        const user = await User.findOne({ username });
        if (user) mentions.push(user._id);
      }
    }

    let imageUrls = question.imageUrl || [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: 'stackit/questions' })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    let descriptionWithImages = sanitizedDescription || question.description;
    if (imageUrls.length > 0) {
      const imageTags = imageUrls.map((url) => `<img src="${url}" alt="question-image" />`).join('');
      descriptionWithImages = `${sanitizedDescription || question.description}${imageTags}`;
    }

    const updates = {};
    if (title) updates.title = title;
    if (sanitizedDescription) updates.description = descriptionWithImages;
    if (tags) updates.tags = tags.split(',').map((tag) => tag.trim().toLowerCase());
    if (status && ['active', 'deleted'].includes(status)) updates.status = status;
    if (imageUrls.length > 0) updates.imageUrl = imageUrls;
    if (description) updates.mentions = mentions;

    const updatedQuestion = await Question.findByIdAndUpdate(questionId, updates, { new: true })
      .populate('user', 'name email username')
      .populate('mentions', 'name email username');

    await sendEmail(
      req.user.email,
      'Question Updated',
      `<p>Your question "${updatedQuestion.title}" has been updated successfully.</p>`
    );

    const notification = await Notification.create({
      user: userId,
      type: 'question',
      content: `Your question "${updatedQuestion.title}" has been updated.`,
      relatedId: questionId,
    });

    io.to(userId.toString()).emit('notification', notification);
    io.to('questions').emit('questionUpdated', updatedQuestion);

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== userId && !question.mentions.includes(mentionedUserId)) {
        const mentionedUser = await User.findById(mentionedUserId);
        const mentionNotification = await Notification.create({
          user: mentionedUserId,
          type: 'mention',
          content: `You were mentioned in the updated question "${updatedQuestion.title}".`,
          relatedId: questionId,
        });
        io.to(mentionedUserId.toString()).emit('notification', mentionNotification);
        await sendEmail(
          mentionedUser.email,
          'You Were Mentioned',
          `<p>You were mentioned in the updated question "${updatedQuestion.title}".</p>`
        );
      }
    }

    await redisClient.del('questions');
    await redisClient.del(`userQuestions:${userId}`);
    await redisClient.del(`questions:${questionId}`);

    res.json({ status: 'ok', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ status: 'error', error: 'Failed to update question' });
  }
};

module.exports = { askQuestion, getQuestions, getUserQuestions, getQuestionById, updateQuestion };