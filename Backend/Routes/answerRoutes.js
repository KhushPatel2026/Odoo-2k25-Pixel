const express = require('express');
const router = express.Router();
const { postAnswer, acceptAnswer, voteAnswer, updateAnswer } = require('../controllers/answerController');
const { postComment, updateComment } = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post(
  '/post',
  verifyToken,
  upload.array('images', 10), // Support up to 10 images
  [
    body('questionId').isMongoId().withMessage('Invalid question ID'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  postAnswer
);

router.post(
  '/accept',
  verifyToken,
  [
    body('answerId').isMongoId().withMessage('Invalid answer ID'),
  ],
  acceptAnswer
);

router.post(
  '/vote',
  verifyToken,
  [
    body('answerId').isMongoId().withMessage('Invalid answer ID'),
    body('voteType').isIn(['upvote', 'downvote', 'noVote']).withMessage('Invalid vote type'),
  ],
  voteAnswer
);

router.post(
  '/comment',
  verifyToken,
  [
    body('answerId').isMongoId().withMessage('Invalid answer ID'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  postComment
);

router.post(
  '/update/:id',
  verifyToken,
  upload.array('images', 10), // Support up to 10 images
  [
    param('id').isMongoId().withMessage('Invalid answer ID'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  ],
  updateAnswer
);

router.post(
  '/comment/update/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid comment ID'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  updateComment
);

module.exports = router;