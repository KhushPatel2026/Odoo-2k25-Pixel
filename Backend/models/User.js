const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: false },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/, 
  },
  googleId: { type: String, required: false, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.username && this.name) {
    let baseUsername = this.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '');
    let username = baseUsername;
    let counter = 1;
    while (await mongoose.model('User').findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    this.username = username;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);