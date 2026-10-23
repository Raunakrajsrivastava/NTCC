import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Access denied. No token provided.');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      res.status(401);
      if (jwtErr.name === 'TokenExpiredError') {
        throw new Error('Your session has expired. Please log in again.');
      }
      throw new Error('Invalid token. Please log in again.');
    }

    // Attach user to request
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('User associated with this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
