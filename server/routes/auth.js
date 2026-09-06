const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Current user — used by the account management UI.
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      email: user.email,
      createdAt: user.createdAt,
      hasPassword: !!user.password,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password for password-based accounts.
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google sign-in and has no password' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Google sign-in (GIS ID token). Verifies the token server-side, then
// finds-or-creates a matching user by email and issues a Capiche JWT.
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ message: 'Google auth is not configured' });

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload.email_verified) {
      return res.status(400).json({ message: 'Google email is not verified' });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) user = await User.create({ email: payload.email });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user._id });
  } catch {
    res.status(401).json({ message: 'Invalid Google credential' });
  }
});

module.exports = router;