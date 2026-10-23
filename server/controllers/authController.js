import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// ─── Helper: generate JWT ──────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Helper: standard success response ────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password.');
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409);
      throw new Error('An account with this email already exists.');
    }

    // Create user (password is hashed by pre-save hook)
    const user = await User.create({ name, email, password });
    logger.info(`New user registered: ${user.email}`);

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password.');
    }

    // Explicitly select password (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    logger.info(`User logged in: ${user.email}`);
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
export const logout = async (req, res) => {
  // JWT is stateless — client is responsible for dropping the token
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }
    res.status(200).json({ success: true, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};
