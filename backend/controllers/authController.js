/**
 * authController.js
 * ------------------------------------------------------------------
 * Handles the business logic for authentication:
 *   - register: create a new user
 *   - login: verify a user's credentials
 *
 * Data is read from / written to the in-memory `users` array in
 * ../data/data.js. No database and no JWT tokens are used in
 * Module 2 — sessions are handled simply on the frontend by storing
 * the returned user object in localStorage after a successful login.
 * ------------------------------------------------------------------
 */

const { users } = require('../data/data');

// Simple email format check using a regular expression
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/auth/register
 * Creates a new user after validating the input.
 */
function register(req, res) {
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
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // ---------- Create and store the new user ----------
    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      password // NOTE: plain text for this learning module only
    };

    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
  }
}

/**
 * POST /api/auth/login
 * Verifies email + password against the stored users.
 */
function login(req, res) {
  try {
    const { email, password } = req.body;

    // ---------- Validation ----------
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // ---------- Find matching user ----------
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

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
