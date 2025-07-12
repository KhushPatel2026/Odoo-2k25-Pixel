const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);
router.post('/read', verifyToken, markNotificationsRead);

module.exports = router;