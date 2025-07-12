const express = require('express');
const router = express.Router();
const passport = require('passport');
const { handleGoogleCallback } = require('../controllers/socialAuthController');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/register' }), handleGoogleCallback);

module.exports = router;