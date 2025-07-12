const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: { type: String, required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  imageUrl: [{ type: String, required: false }],
  accepted: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

answerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Answer', answerSchema);