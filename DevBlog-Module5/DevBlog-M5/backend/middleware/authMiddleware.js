/**
 * authMiddleware.js
 * ------------------------------------------------------------------
 * MODULE 5: Protects private routes using JWT.
 *
 * How it works:
 *   1. Reads the token from the "Authorization: Bearer <token>" header
 *   2. Verifies it with jwt.verify() using the JWT_SECRET from .env
 *   3. Looks up the user in MongoDB (so a deleted user can't keep
 *      using an old, still-valid token) and excludes the password
 *   4. Attaches the safe user info to req.user for the route/controller
 *      to use — e.g. req.user.id, req.user.name, req.user.email
 *
 * Any route that uses this middleware will reject the request with
 * 401 Unauthorized if the token is missing, malformed, expired, or
 * belongs to a user that no longer exists.
 * ------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // ---------- Missing token ----------
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authentication token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token provided. Please log in.' });
    }

    // ---------- Verify token ----------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid authentication token. Please log in again.' });
    }

    // ---------- Confirm the user still exists ----------
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists. Please log in again.' });
    }

    // ---------- Attach safe user info for the next handler ----------
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong while verifying your session.' });
  }
}

module.exports = authMiddleware;
