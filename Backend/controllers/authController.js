const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/emailService');
const Notification = require('../models/Notification');
const { getSocketIO } = require('../utils/socketRedis');
require('dotenv').config();

const register = async (req, res) => {
  const io = getSocketIO();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const notification = await Notification.create({
      user: null,
      type: 'auth',
      content: 'Invalid registration data.',
      relatedId: null,
    });
    io.emit('auth', notification);
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { name, email, password, username } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const notification = await Notification.create({
        user: null,
        type: 'auth',
        content: existingUser.email === email ? 'Email already exists.' : 'Username already exists.',
        relatedId: null,
      });
      io.emit('auth', notification);
      return res.status(400).json({ status: 'error', error: existingUser.email === email ? 'Email already exists' : 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, username });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    await sendEmail(email, 'Welcome to StackIt!', `<p>Hi ${name}, welcome to StackIt! Start asking and answering questions today.</p>`);

    const notification = await Notification.create({
      user: user._id,
      type: 'auth',
      content: 'Registration successful! Welcome to StackIt.',
      relatedId: user._id,
    });
    io.to(user._id.toString()).emit('auth', notification);

    res.json({ status: 'ok', token, user: { id: user._id, name: user.name, email: user.email, username: user.username } });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

const login = async (req, res) => {
  const io = getSocketIO();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const notification = await Notification.create({
      user: null,
      type: 'auth',
      content: 'Invalid email/username or password.',
      relatedId: null,
    });
    io.emit('auth', notification);
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { emailOrUsername, password } = req.body;
    console.log("Login attempt for:", emailOrUsername);
    console.log("Request body:", req.body);
    
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    console.log("User found:", user ? "Yes" : "No");
    if (user) {
      console.log("User email:", user.email);
      console.log("User username:", user.username);
    }
    
    if (!user) {
      const notification = await Notification.create({
        user: null,
        type: 'auth',
        content: 'Invalid email/username or password.',
        relatedId: null,
      });
      io.emit('auth', notification);
      return res.status(400).json({ status: 'error', error: 'Invalid email/username or password' });
    }

    console.log("Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      const notification = await Notification.create({
        user: null,
        type: 'auth',
        content: 'Invalid email/username or password.',
        relatedId: null,
      });
      io.emit('auth', notification);
      return res.status(400).json({ status: 'error', error: 'Invalid email/username or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    const notification = await Notification.create({
      user: user._id,
      type: 'auth',
      content: 'Login successful!',
      relatedId: user._id,
    });
    io.to(user._id.toString()).emit('auth', notification);

    res.json({ status: 'ok', token, user: { id: user._id, name: user.name, email: user.email, username: user.username } });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

const verifyToken = async (req, res) => {
  const io = getSocketIO();
  const token = req.headers['x-access-token'];
  if (!token) {
    const notification = await Notification.create({
      user: null,
      type: 'auth',
      content: 'No token provided.',
      relatedId: null,
    });
    io.emit('auth', notification);
    return res.status(401).json({ status: 'error', error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const notification = await Notification.create({
        user: null,
        type: 'auth',
        content: 'User not found.',
        relatedId: null,
      });
      io.emit('auth', notification);
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }
    res.json({ status: 'ok', user });
  } catch (error) {
    const notification = await Notification.create({
      user: null,
      type: 'auth',
      content: 'Invalid or expired token.',
      relatedId: null,
    });
    io.emit('auth', notification);
    res.status(401).json({ status: 'error', error: 'Invalid or expired token' });
  }
};

const suggestUsernames = async (req, res) => {
  try {
    const { query, context } = req.query;
    if (!query || query.length < 2) {
      return res.json({ status: 'ok', usernames: [] });
    }

    if (context === 'registration') {
      // Suggest 3 non-existing usernames based on query
      let baseUsername = query.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '');
      if (baseUsername.length < 3) baseUsername = baseUsername.padEnd(3, '0');
      if (baseUsername.length > 30) baseUsername = baseUsername.slice(0, 30);

      const usernames = [];
      let counter = 0;
      while (usernames.length < 3 && counter < 100) {
        const testUsername = counter === 0 ? baseUsername : `${baseUsername}${counter}`;
        const existingUser = await User.findOne({ username: testUsername });
        if (!existingUser && testUsername.match(/^[a-zA-Z0-9_]+$/) && testUsername.length >= 3 && testUsername.length <= 30) {
          usernames.push(testUsername);
        }
        counter++;
      }
      return res.json({ status: 'ok', usernames });
    } else {
      // Default context: 'mention' - suggest existing usernames
      const regex = new RegExp(`^${query}`, 'i');
      const users = await User.find({ username: regex })
        .select('username')
        .limit(5)
        .lean();
      const usernames = users.map((user) => user.username);
      return res.json({ status: 'ok', usernames });
    }
  } catch (error) {
    console.error('Error fetching username suggestions:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch username suggestions' });
  }
};

module.exports = { register, login, verifyToken, suggestUsernames };