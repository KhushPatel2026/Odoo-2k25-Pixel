const express = require('express');
const router = express.Router();
const { moderateContent, getAllUsers } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.post(
  '/moderate',
  verifyToken,
  [
    body('type').isIn(['question', 'answer', 'comment']).withMessage('Invalid content type'),
    body('id').notEmpty().withMessage('Content ID is required'),
    body('action').isIn(['delete']).withMessage('Invalid action'),
  ],
  moderateContent
);

router.get('/users', verifyToken, getAllUsers);

module.exports = router;