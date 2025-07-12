const express = require('express');
const router = express.Router();
const { askQuestion, getQuestions, getQuestionById, getUserQuestions, updateQuestion } = require('../controllers/questionController');
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

router.get('/:id', getQuestionById);

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

module.exports = router;