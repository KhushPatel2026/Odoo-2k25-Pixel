const express = require('express');
const router = express.Router();
const { askQuestion, getQuestions, getQuestionById, getUserQuestions, updateQuestion, deleteQuestion, getTrendingTags } = require('../controllers/questionController');
const { verifyToken } = require('../middleware/authMiddleware');
const { body, query, param } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post(
  '/ask',
  verifyToken,
  upload.array('images', 10),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('tags').notEmpty().withMessage('At least one tag is required'),
  ],
  askQuestion
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
    query('tag').optional().isString().withMessage('Invalid tag'),
    query('search').optional().isString().withMessage('Invalid search query'),
    query('sort').optional().isIn([
      'newest',
      'oldest',
      'mostUpvoted',
      'mostViewed',
      'mostCommented',
      'newestAnswered',
      'notNewestAnswered',
    ]).withMessage('Invalid sort option'),
    query('answered').optional().isIn(['true', 'false']).withMessage('Invalid answered filter'),
    query('userId').optional().isMongoId().withMessage('Invalid user ID'),
    query('username').optional().isString().withMessage('Invalid username'),
    query('mentioned').optional().isString().withMessage('Invalid mentioned username'),
    query('hasAccepted').optional().isIn(['true', 'false']).withMessage('Invalid hasAccepted filter'),
  ],
  getQuestions
);

router.get(
  '/user-questions',
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
  ],
  getUserQuestions
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid question ID')],
  getQuestionById
);

router.post(
  '/update/:id',
  verifyToken,
  upload.array('images', 10),
  [
    param('id').isMongoId().withMessage('Invalid question ID'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('tags').optional().notEmpty().withMessage('Tags cannot be empty'),
    body('status').optional().isIn(['active', 'deleted']).withMessage('Invalid status'),
  ],
  updateQuestion
);

router.delete(
  '/delete/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid question ID')
  ],
  deleteQuestion
)

router.get(
  '/trending/tags',
  [
    query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
  ],
  getTrendingTags
)

module.exports = router;