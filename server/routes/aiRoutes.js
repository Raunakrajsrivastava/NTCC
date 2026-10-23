import express from 'express';
import rateLimit from 'express-rate-limit';
import { getExplanation, generateExplanation } from '../controllers/aiController.js';

const router = express.Router({ mergeParams: true });

// Rate limiter for AI explanation generation (5 requests per minute per IP)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      message: 'Too many AI explanation requests. Please wait a minute before trying again.',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', getExplanation);
router.post('/', aiLimiter, generateExplanation);

export default router;
