const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  // Optional for accounts created via Google sign-in (no password).
  password: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);