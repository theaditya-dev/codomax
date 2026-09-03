/**
 * authController.js
 * ------------------------------------------------------------------
 * MODULE 3: register/login using MongoDB + bcrypt password hashing.
 * MODULE 5 UPDATE:
 *   - Both register and login now generate a JWT (generateToken()).
 *   - Added getProfile() for the new protected GET /api/auth/me route,
 *     used by the frontend Profile page.
 *
 * Passwords are hashed with bcrypt and NEVER included in any response.
 * ------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Blog = require('../models/Blog');

const SALT_ROUNDS = 10; // cost factor for bcrypt — 10 is a good default

// Simple email format check using a regular expression
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Creates a signed JWT containing only the user's id.
// We deliberately keep the payload small — the middleware looks the
// user back up in MongoDB on every request anyway, so there's no need
// to cram name/email into the token itself.
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/register
 * Creates a new user in MongoDB after validating the input.
 * Also issues a JWT (Module 5), even though the current frontend flow
 * still redirects to the Login page after registering rather than
 * auto-logging the user in — the token is there if that ever changes.
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

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
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
 * Verifies email + password against the hashed password in MongoDB,
 * then issues a JWT the frontend stores and sends back on every
 * request to a protected route.
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

    const token = generateToken(user._id);

    // ---------- Success: return the token + SAFE user info, never the password ----------
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * GET /api/auth/me   (protected — requires a valid JWT)
 * Returns the logged-in user's own profile info, including how many
 * blogs they've written. Used by the frontend Profile page.
 */
async function getProfile(req, res) {
  try {
    // req.user was attached by authMiddleware after verifying the JWT
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const blogCount = await Blog.countDocuments({ user: user._id });

    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        blogCount
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

module.exports = { register, login, getProfile };
