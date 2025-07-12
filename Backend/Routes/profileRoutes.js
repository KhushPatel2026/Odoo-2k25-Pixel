const express = require('express');
const router = express.Router();
const { getProfile, editProfile, changePassword } = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/profile', verifyToken, getProfile);

router.post(
  '/profile/edit',
  verifyToken,
  upload.single('profileImage'),
  [
    body('name').optional().isString().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Invalid email'),
  ],
  editProfile
);

router.post(
  '/profile/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  changePassword
);

module.exports = router;