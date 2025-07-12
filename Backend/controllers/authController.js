const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/emailService');
const Notification = require('../models/Notification');
const { getSocketIO } = require('../utils/socketRedis');

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
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const notification = await Notification.create({
        user: null,
        type: 'auth',
        content: 'Email already exists. Please use a different email.',
        relatedId: null,
      });
      io.emit('auth', notification);
      return res.status(400).json({ status: 'error', error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
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

    res.json({ status: 'ok', token });
  } catch (err) {
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
      content: 'Invalid email or password.',
      relatedId: null,
    });
    io.emit('auth', notification);
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const notification = await Notification.create({
        user: null,
        type: 'auth',
        content: 'Invalid email or password.',
        relatedId: null,
      });
      io.emit('auth', notification);
      return res.status(400).json({ status: 'error', error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const notification = await Notification.create({
        user: null,
        type: 'auth',
        content: 'Invalid email or password.',
        relatedId: null,
      });
      io.emit('auth', notification);
      return res.status(400).json({ status: 'error', error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    const notification = await Notification.create({
      user: user._id,
      type: 'auth',
      content: 'Login successful!',
      relatedId: user._id,
    });
    io.to(user._id.toString()).emit('auth', notification);

    res.json({ status: 'ok', token });
  } catch (err) {
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

module.exports = { register, login, verifyToken };