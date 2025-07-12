const express = require('express');
const router = express.Router();
const { register, login, verifyToken, suggestUsernames } = require('../controllers/authController');
const { body, query } = require('express-validator');

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 characters, alphanumeric or underscore'),
  ],
  register
);

router.post(
  '/login',
  [
    body('emailOrUsername').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/verify-token', verifyToken);

router.get(
  '/suggest-usernames',
  [
    query('query').optional().isString().withMessage('Invalid query'),
    query('context').optional().isIn(['registration', 'mention']).withMessage('Invalid context'),
  ],
  suggestUsernames
);

module.exports = router;