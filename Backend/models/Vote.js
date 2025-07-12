const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', required: true },
  type: { type: String, enum: ['upvote', 'downvote'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vote', voteSchema);