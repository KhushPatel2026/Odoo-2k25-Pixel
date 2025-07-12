const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: [{ type: String, required: false }], 
  status: { type: String, enum: ['active', 'closed', 'deleted'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

questionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);