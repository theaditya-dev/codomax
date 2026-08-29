/**
 * authController.js
 * ------------------------------------------------------------------
 * MODULE 3 UPDATE: Registration and login now use MongoDB (via the
 * User model) instead of the in-memory `users` array from Module 2.
 *
 * Passwords are hashed with bcrypt before being saved, and the
 * password/hash is NEVER included in any API response.
 * ------------------------------------------------------------------
 */

const bcrypt = require('bcrypt');
const User = require('../models/User');

const SALT_ROUNDS = 10; // cost factor for bcrypt — 10 is a good default

// Simple email format check using a regular expression
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/auth/register
 * Creates a new user in MongoDB after validating the input.
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // ---------- Validation ----------
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // ---------- Duplicate email check ----------
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // ---------- Hash the password before saving ----------
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ---------- Create and store the new user in MongoDB ----------
    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Registration successful'
    });
  } catch (error) {
    // Mongoose validation errors (e.g. bad email format, missing field)
    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message: firstMessage });
    }

    // Duplicate key error from MongoDB's unique index on email (race condition safety net)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * POST /api/auth/login
 * Verifies email + password against the hashed password in MongoDB.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // ---------- Validation ----------
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // ---------- Find the user by email ----------
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Same generic message as a wrong password, so we don't reveal
      // whether an email is registered or not.
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ---------- Compare the entered password with the stored hash ----------
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ---------- Success: return only SAFE user info, never the password ----------
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

module.exports = { register, login };
