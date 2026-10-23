import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import technologyRoutes from './routes/technologyRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disabled — handled by frontend build
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// ── Rate Limiters ────────────────────────────────────────────────────────────
// NOTE: /api/health is EXEMPT — it is polled every 30s by the frontend Navbar.
// Keeping it in a rate-limit bucket would falsely show "API Offline" after ~25 min.

// General API: 500 req / 15 min per IP — generous enough for normal dev & prod usage
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // health check is NEVER rate-limited
  message: { success: false, error: { message: 'Too many requests. Please slow down and retry in 15 minutes.' } },
});

// Auth routes: 20 attempts / 15 min per IP — stops brute-force without locking out devs
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many authentication attempts. Please try again in 15 minutes.' } },
});

// AI routes: 30 req / 15 min per IP — AI calls are expensive & slow; cap them
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'AI request limit reached. Please wait 15 minutes before generating again.' } },
});

// ── Request Logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
// Health check — NO rate limit (frontend polls this every 30 seconds)
app.use('/api', healthRoutes);

// Apply general rate limit to all other /api routes
app.use('/api', apiLimiter);

// Auth routes — stricter limit to prevent brute-force
app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);

// Project routes — AI sub-routes get an extra stricter limiter
app.use('/api/projects/:projectId/explain',  aiLimiter);
app.use('/api/projects/:projectId/recommendations', aiLimiter);
app.use('/api/projects', projectRoutes);

app.use('/api/technologies', technologyRoutes);

// ── Root Info Endpoint ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'AI-Powered Software Architecture Advisor API',
    version: '5.0.0',
    modules: [
      'M1: Infrastructure',
      'M2: Auth & User Management',
      'M3: Project Management',
      'M4: Requirement Collection',
      'M5: Technology Knowledge Base',
      'M6: Rule-Based Recommendation Engine',
      'M7: Architecture Scoring & Comparison',
      'M8: AI Explanation Module',
      'M9: HLD & LLD Generator',
      'M10: Diagram Generator',
      'M11: Final Architecture Report',
      'M12: Testing, Security & Deployment',
    ],
    security: {
      headers: 'helmet@^8 — X-Content-Type-Options, X-Frame-Options, HSTS, etc.',
      rateLimit: 'API: 100 req/15min | Auth: 10 req/15min per IP',
      authentication: 'JWT (jsonwebtoken) with Bearer scheme',
      passwordHashing: 'bcryptjs salt factor 12',
      cors: 'Restricted to configured CLIENT_URL origin',
    },
    endpoints: {
      health:          'GET  /api/health',
      register:        'POST /api/auth/register',
      login:           'POST /api/auth/login',
      me:              'GET  /api/auth/me',
      projects:        'GET  /api/projects',
      requirements:    'POST /api/projects/:id/requirements',
      recommendations: 'POST /api/projects/:id/recommendations/generate',
      compare:         'POST /api/projects/:id/compare',
      explain:         'POST /api/projects/:id/explain',
      hld:             'POST /api/projects/:id/design/hld',
      lld:             'POST /api/projects/:id/design/lld',
      diagrams:        'POST /api/projects/:id/diagrams',
      report:          'POST /api/projects/:id/report',
      reportSave:      'PUT  /api/projects/:id/report',
      technologies:    'GET  /api/technologies',
    },
    status: 'Running',
  });
});

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Security: helmet headers enabled, rate limiting active`);
  await connectDB();
});
