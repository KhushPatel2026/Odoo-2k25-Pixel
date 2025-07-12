const { Server } = require('socket.io');
const redis = require('redis');
require('dotenv').config();

let ioInstance = null;
let redisClientInstance = null;

const initSocketIO = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });
    socket.on('joinQuestions', () => {
      socket.join('questions');
      console.log('User joined questions room');
    });
    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  });

  return io;
};

const initRedis = () => {
  const redisClient = redis.createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
  return redisClient;
};

const setSocketIO = (io) => {
  ioInstance = io;
};

const getSocketIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized');
  }
  return ioInstance;
};

const setRedisClient = (redisClient) => {
  redisClientInstance = redisClient;
};

const getRedisClient = () => {
  if (!redisClientInstance) {
    throw new Error('Redis client not initialized');
  }
  return redisClientInstance;
};

module.exports = { initSocketIO, initRedis, setSocketIO, getSocketIO, setRedisClient, getRedisClient };