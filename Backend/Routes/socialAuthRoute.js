const express = require('express');
const passport = require('passport');
const { handleGoogleCallback } = require('../Controller/socialAuthController');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/register' }), handleGoogleCallback);

module.exports = router;