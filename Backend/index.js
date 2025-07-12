require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./utils/passportConfig');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const socialAuthRoutes = require('./routes/socialAuthRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const rateLimit = require('express-rate-limit');
const { initSocketIO, initRedis, setSocketIO, setRedisClient } = require('./utils/socketRedis');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO and Redis
const io = initSocketIO(server);
const redisClient = initRedis();

// Set singleton instances
setSocketIO(io);
setRedisClient(redisClient);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connection open'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/auth', socialAuthRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));