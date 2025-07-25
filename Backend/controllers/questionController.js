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

// Configure sanitization options for RichTextEditor
const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'p', 'b', 'i', 'u', 'strike', 'ul', 'ol', 'li',
    'a', 'img', 'blockquote', 'code', 'pre', 'div', 'span'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    div: ['style'],
    span: ['style'],
    p: ['style'],
    blockquote: ['style'],
    pre: ['style'],
    code: ['style']
  },
  allowedStyles: {
    '*': {
      'text-align': [/^left$/, /^right$/, /^center$/],
      'font-size': [/^\d+(?:px|em|rem)$/],
      'color': [/^#[0-9a-fA-F]{6}$/],
      'background-color': [/^#[0-9a-fA-F]{6}$/]
    }
  },
  transformTags: {
    'a': (tagName, attribs) => {
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      };
    }
  }
};

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

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ status: 'error', error: 'Invalid user ID' });
    }

    // Sanitize description
    const sanitizedDescription = sanitizeHtml(description, sanitizeOptions);

    // Validate description length (after stripping HTML)
    const cleanDescription = sanitizedDescription.replace(/<[^>]*>/g, '');
    if (cleanDescription.length > 10000) {
      return res.status(400).json({ status: 'error', error: 'Question content cannot exceed 10,000 characters' });
    }

    // Process tags
    let processedTags = tags;
    if (typeof tags === 'string') {
      processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    }
    if (processedTags.length > 5) {
      return res.status(400).json({ status: 'error', error: 'Maximum 5 tags allowed' });
    }

    // Validate tag format
    const tagRegex = /^[a-z0-9-]+$/;
    for (const tag of processedTags) {
      if (!tagRegex.test(tag) || tag.length > 30) {
        return res.status(400).json({
          status: 'error',
          error: 'Tags must be lowercase, contain only letters, numbers, and hyphens, and be 30 characters or less'
        });
      }
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({ status: 'error', error: 'Maximum 10 images allowed' });
      }
      const uploadPromises = req.files.map((file) => {
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
          throw new Error(`Invalid file type: ${file.mimetype}`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File size exceeds 10MB: ${file.originalname}`);
        }
        return cloudinary.uploader.upload(file.path, {
          folder: 'stackit/questions',
          allowed_formats: ['jpg', 'png', 'gif', 'webp'],
          max_file_size: 10 * 1024 * 1024
        });
      });
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    let descriptionWithImages = sanitizedDescription;
    if (imageUrls.length > 0) {
      const imageTags = imageUrls.map((url) => `<img src="${url}" alt="question-image" />`).join('');
      descriptionWithImages = `${sanitizedDescription}${imageTags}`;
    }

    // Extract mentions
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
      tags: processedTags,
      user: userId,
      mentions,
    });

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
      }
    }

    // Clear all question-related cache keys
    const keys = await redisClient.keys('questions:*');
    for (const key of keys) {
      await redisClient.del(key);
    }
    await redisClient.del('trending_tags');

    res.json({ status: 'ok', question });
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(500).json({ status: 'error', error: 'Failed to post question' });
  }
};

const getQuestions = async (req, res) => {
  const redisClient = getRedisClient();
  try {
    const {
      page = 1,
      limit = 10,
      tag,
      search,
      sort = 'newest',
      answered,
      userId,
      username,
      mentioned,
      hasAccepted,
    } = req.query;

    // Build cache key with all query parameters
    const cacheKey = `questions:${page}:${limit}:${tag || ''}:${search || ''}:${sort}:${answered || ''}:${userId || ''}:${username || ''}:${mentioned || ''}:${hasAccepted || ''}`;
    console.log('Cache key:', cacheKey); // Debug log

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Returning cached result for:', cacheKey);
      return res.json(JSON.parse(cached));
    }

    // Build query
    const query = {};
    if (tag) query.tags = tag.toLowerCase();
    if (search) query.title = { $regex: search, $options: 'i' };
    if (userId) query.user = userId;
    if (username) {
      const user = await User.findOne({ username });
      if (user) query.user = user._id;
    }
    if (mentioned) {
      const mentionedUser = await User.findOne({ username: mentioned });
      if (mentionedUser) query.mentions = mentionedUser._id;
    }

    // Handle answered and hasAccepted filters
    let questionIds = null;
    if (answered || hasAccepted) {
      const answerQuery = { deleted: { $ne: true } };
      if (hasAccepted === 'true') answerQuery.accepted = true;
      const answers = await Answer.find(answerQuery).select('question');
      questionIds = [...new Set(answers.map((answer) => answer.question.toString()))];
      if (answered === 'true') {
        query._id = { $in: questionIds };
      } else if (answered === 'false') {
        query._id = { $nin: questionIds };
      }
    }

    // Common lookup and projection for answer count and upvotes
    const answerLookup = {
      $lookup: {
        from: 'answers',
        localField: '_id',
        foreignField: 'question',
        as: 'answers',
      },
    };
    const answerMetrics = {
      $addFields: {
        answerCount: {
          $size: {
            $filter: {
              input: '$answers',
              as: 'answer',
              cond: { $ne: ['$$answer.deleted', true] },
            },
          },
        },
        totalUpvotes: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$answers',
                  as: 'answer',
                  cond: { $ne: ['$$answer.deleted', true] },
                },
              },
              as: 'answer',
              in: { $size: '$$answer.upvotes' },
            },
          },
        },
      },
    };

    // Build sort options
    let sortOption = {};
    let aggregatePipeline = null;

    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'mostUpvoted':
        aggregatePipeline = [
          { $match: query },
          answerLookup,
          answerMetrics,
          { $sort: { totalUpvotes: -1, createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: Number(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              user: {
                $cond: {
                  if: { $eq: ['$user', null] },
                  then: { name: null, email: null, username: null, profileImage: null },
                  else: '$user',
                },
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions',
            },
          },
          {
            $project: {
              'user.name': 1,
              'user.email': 1,
              'user.username': 1,
              'user.profileImage': 1,
              'mentions.name': 1,
              'mentions.email': 1,
              'mentions.username': 1,
              title: 1,
              description: 1,
              tags: 1,
              imageUrl: 1,
              status: 1,
              views: 1,
              createdAt: 1,
              updatedAt: 1,
              answerCount: 1,
              totalUpvotes: 1,
            },
          },
        ];
        break;
      case 'mostViewed':
        sortOption = { views: -1, createdAt: -1 };
        break;
      case 'mostCommented':
        aggregatePipeline = [
          { $match: query },
          answerLookup,
          answerMetrics,
          {
            $lookup: {
              from: 'comments',
              localField: 'answers._id',
              foreignField: 'answer',
              as: 'comments',
            },
          },
          {
            $addFields: {
              totalComments: { $size: '$comments' },
            },
          },
          { $sort: { totalComments: -1, createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: Number(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              user: {
                $cond: {
                  if: { $eq: ['$user', null] },
                  then: { name: null, email: null, username: null, profileImage: null },
                  else: '$user',
                },
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions',
            },
          },
          {
            $project: {
              'user.name': 1,
              'user.email': 1,
              'user.username': 1,
              'user.profileImage': 1,
              'mentions.name': 1,
              'mentions.email': 1,
              'mentions.username': 1,
              title: 1,
              description: 1,
              tags: 1,
              imageUrl: 1,
              status: 1,
              views: 1,
              createdAt: 1,
              updatedAt: 1,
              answerCount: 1,
              totalUpvotes: 1,
            },
          },
        ];
        break;
      case 'newestAnswered':
        aggregatePipeline = [
          { $match: query },
          answerLookup,
          answerMetrics,
          { $match: { answers: { $ne: [] } } },
          {
            $addFields: {
              latestAnswer: { $max: '$answers.createdAt' },
            },
          },
          { $sort: { latestAnswer: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: Number(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              user: {
                $cond: {
                  if: { $eq: ['$user', null] },
                  then: { name: null, email: null, username: null, profileImage: null },
                  else: '$user',
                },
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions',
            },
          },
          {
            $project: {
              'user.name': 1,
              'user.email': 1,
              'user.username': 1,
              'user.profileImage': 1,
              'mentions.name': 1,
              'mentions.email': 1,
              'mentions.username': 1,
              title: 1,
              description: 1,
              tags: 1,
              imageUrl: 1,
              status: 1,
              views: 1,
              createdAt: 1,
              updatedAt: 1,
              answerCount: 1,
              totalUpvotes: 1,
            },
          },
        ];
        break;
      case 'notNewestAnswered':
        aggregatePipeline = [
          { $match: query },
          answerLookup,
          answerMetrics,
          { $match: { answers: { $ne: [] } } },
          {
            $addFields: {
              latestAnswer: { $min: '$answers.createdAt' },
            },
          },
          { $sort: { latestAnswer: 1 } },
          { $skip: (page - 1) * limit },
          { $limit: Number(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              user: {
                $cond: {
                  if: { $eq: ['$user', null] },
                  then: { name: null, email: null, username: null, profileImage: null },
                  else: '$user',
                },
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions',
            },
          },
          {
            $project: {
              'user.name': 1,
              'user.email': 1,
              'user.username': 1,
              'user.profileImage': 1,
              'mentions.name': 1,
              'mentions.email': 1,
              'mentions.username': 1,
              title: 1,
              description: 1,
              tags: 1,
              imageUrl: 1,
              status: 1,
              views: 1,
              createdAt: 1,
              updatedAt: 1,
              answerCount: 1,
              totalUpvotes: 1,
            },
          },
        ];
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    let questions;
    let total;

    if (aggregatePipeline) {
      console.log('Using aggregation pipeline for sort:', sort); // Debug log
      questions = await Question.aggregate(aggregatePipeline);
      total = (await Question.aggregate([...aggregatePipeline.slice(0, -4), { $count: 'total' }]))[0]?.total || 0;
    } else {
      console.log('Using aggregation for non-complex sort:', sort, 'Query:', query); // Debug log
      questions = await Question.aggregate([
        { $match: query },
        answerLookup,
        answerMetrics,
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            user: {
              $cond: {
                if: { $eq: ['$user', null] },
                then: { name: null, email: null, username: null, profileImage: null },
                else: '$user',
              },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions',
          },
        },
        {
          $project: {
            'user.name': 1,
            'user.email': 1,
            'user.username': 1,
            'user.profileImage': 1,
            'mentions.name': 1,
            'mentions.email': 1,
            'mentions.username': 1,
            title: 1,
            description: 1,
            tags: 1,
            imageUrl: 1,
            status: 1,
            views: 1,
            createdAt: 1,
            updatedAt: 1,
            answerCount: 1,
            totalUpvotes: 1,
          },
        },
        { $sort: sortOption },
        { $skip: (page - 1) * limit },
        { $limit: Number(limit) },
      ]);
      total = await Question.countDocuments(query);
    }

    // Debug log for questions with missing usernames
    questions.forEach((q, index) => {
      if (!q.user || !q.user.username) {
        console.log(`Question ${index + 1} (ID: ${q._id}) has missing user or username:`, q.user);
      }
    });
    console.log('Questions fetched:', questions.length, 'Total:', total); // Debug log

    const response = { status: 'ok', questions, total, page: Number(page), limit: Number(limit) };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    console.log('Cached response for:', cacheKey); // Debug log

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
      .populate('user', 'name email username profileImage')
      .populate('mentions', 'name email username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

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
    const question = await Question.findById(req.params.id)
      .where({ status: 'active' })
      .populate('user', 'name email username profileImage')
      .populate('mentions', 'name email username')
      .lean();

    if (!question) {
      return res.status(404).json({ status: 'error', error: 'Question not found' });
    }

    // Increment views
    await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const answers = await Answer.find({ question: req.params.id, deleted: { $ne: true } })
      .populate('user', 'name email username profileImage')
      .populate('mentions', 'name email username')
      .lean();

    const answersWithComments = await Promise.all(
      answers.map(async (answer) => {
        const comments = await Comment.find({ answer: answer._id, deleted: { $ne: true } })
          .populate('user', 'name email username profileImage')
          .populate('mentions', 'name email username')
          .lean();
        return { ...answer, comments };
      })
    );

    question.answers = answersWithComments;

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

    // Sanitize description
    let sanitizedDescription = description;
    let mentions = question.mentions || [];
    if (description) {
      sanitizedDescription = sanitizeHtml(description, sanitizeOptions);

      // Validate description length
      const cleanDescription = sanitizedDescription.replace(/<[^>]*>/g, '');
      if (cleanDescription.length > 10000) {
        return res.status(400).json({ status: 'error', error: 'Question content cannot exceed 10,000 characters' });
      }

      // Extract mentions
      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
      mentions = [];
      let match;
      while ((match = mentionRegex.exec(sanitizedDescription)) !== null) {
        const username = match[1];
        const user = await User.findOne({ username });
        if (user) mentions.push(user._id);
      }
    }

    // Process tags
    let processedTags = tags;
    if (typeof tags === 'string') {
      processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    }
    if (processedTags.length > 5) {
      return res.status(400).json({ status: 'error', error: 'Maximum 5 tags allowed' });
    }

    // Validate tag format
    const tagRegex = /^[a-z0-9-]+$/;
    for (const tag of processedTags) {
      if (!tagRegex.test(tag) || tag.length > 30) {
        return res.status(400).json({
          status: 'error',
          error: 'Tags must be lowercase, contain only letters, numbers, and hyphens, and be 30 characters or less'
        });
      }
    }

    // Handle image uploads
    let imageUrls = question.imageUrl || [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({ status: 'error', error: 'Maximum 10 images allowed' });
      }
      const uploadPromises = req.files.map((file) => {
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
          throw new Error(`Invalid file type: ${file.mimetype}`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File size exceeds 10MB: ${file.originalname}`);
        }
        return cloudinary.uploader.upload(file.path, {
          folder: 'stackit/questions',
          allowed_formats: ['jpg', 'png', 'gif', 'webp'],
          max_file_size: 10 * 1024 * 1024
        });
      });
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
    if (processedTags) updates.tags = processedTags;
    if (status && ['active', 'deleted'].includes(status)) updates.status = status;
    if (imageUrls.length > 0) updates.imageUrl = imageUrls;
    if (description) updates.mentions = mentions;
    updates.updatedAt = Date.now();

    const updatedQuestion = await Question.findByIdAndUpdate(questionId, updates, { new: true })
      .populate('user', 'name email username profileImage')
      .populate('mentions', 'name email username');

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
      }
    }

    // Clear all question-related cache keys
    const keys = await redisClient.keys('questions:*');
    for (const key of keys) {
      await redisClient.del(key);
    }
    await redisClient.del(`userQuestions:${userId}`);
    await redisClient.del(`questions:${questionId}`);
    await redisClient.del('trending_tags');

    res.json({ status: 'ok', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ status: 'error', error: 'Failed to update question' });
  }
};

const deleteQuestion = async (req, res) => {
  const io = getSocketIO();
  const redisClient = getRedisClient();
  const userId = req.user.id;
  const questionId = req.params.id;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ status: 'error', error: 'Question not found' });
    }

    if (question.user.toString() !== userId) {
      return res.status(403).json({ status: 'error', error: 'Unauthorized' });
    }

    question.status = 'deleted';
    await question.save();

    const notification = await Notification.create({
      user: userId,
      type: 'question',
      content: `Your question "${question.title}" has been deleted.`,
      relatedId: questionId,
    });

    io.to(userId.toString()).emit('notification', notification);
    io.to('questions').emit('questionDeleted', questionId);

    // Clear all question-related cache keys
    const keys = await redisClient.keys('questions:*');
    for (const key of keys) {
      await redisClient.del(key);
    }
    await redisClient.del(`userQuestions:${userId}`);
    await redisClient.del(`questions:${questionId}`);
    await redisClient.del('trending_tags');

    res.json({ status: 'ok', message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ status: 'error', error: 'Failed to delete question' });
  }
};

const getTrendingTags = async (req, res) => {
  const redisClient = getRedisClient();
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `trendingTags:${limit}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const tagsAgg = await Question.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          totalViews: { $sum: '$views' },
          questionCount: { $sum: 1 },
          latestQuestion: { $max: '$createdAt' },
        },
      },
      {
        $sort: {
          totalViews: -1,
          questionCount: -1,
          latestQuestion: -1,
        },
      },
      { $limit: Number(limit) },
    ]);

    const trendingTags = tagsAgg.map((t) => ({
      tag: t._id,
      totalViews: t.totalViews,
      questionCount: t.questionCount,
      latestQuestion: t.latestQuestion,
    }));

    const response = { status: 'ok', tags: trendingTags };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch trending tags' });
  }
};

module.exports = { askQuestion, getQuestions, getUserQuestions, getQuestionById, updateQuestion, deleteQuestion, getTrendingTags };