const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String, enum: ['answer', 'comment', 'mention', 'vote', 'auth','question', 'admin'], required: true },
  content: { type: String, required: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);