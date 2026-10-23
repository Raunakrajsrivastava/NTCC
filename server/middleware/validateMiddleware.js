/**
 * Input Validation Middleware — Module 12
 *
 * Lightweight, zero-dependency validation middleware using native JS.
 * Returns 400 Bad Request with a structured error message on validation failure.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Build a validation chain that returns a middleware function.
 * @param {Array<{ field: string, checks: Array<(val:any) => string|null> }>} rules
 */
const validate = (rules) => (req, res, next) => {
  const errors = [];
  for (const { field, checks } of rules) {
    const value = req.body[field];
    for (const check of checks) {
      const error = check(value, req.body);
      if (error) { errors.push(`${field}: ${error}`); break; }
    }
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: { message: errors.join(' | '), details: errors },
    });
  }
  next();
};

// ─── Reusable Check Functions ─────────────────────────────────────────────────
const required     = (msg = 'This field is required.') =>
  (v) => (!v && v !== 0 && v !== false) ? msg : null;

const minLength    = (n) =>
  (v) => (typeof v === 'string' && v.trim().length < n) ? `Must be at least ${n} characters.` : null;

const maxLength    = (n) =>
  (v) => (typeof v === 'string' && v.trim().length > n) ? `Cannot exceed ${n} characters.` : null;

const isEmail      = () =>
  (v) => (typeof v === 'string' && !EMAIL_REGEX.test(v.trim())) ? 'Must be a valid email address.' : null;

const isNumber     = () =>
  (v) => (v !== undefined && v !== null && v !== '' && isNaN(Number(v))) ? 'Must be a valid number.' : null;

const minValue     = (n) =>
  (v) => (v !== undefined && v !== null && v !== '' && Number(v) < n) ? `Must be at least ${n}.` : null;

const maxValue     = (n) =>
  (v) => (v !== undefined && v !== null && v !== '' && Number(v) > n) ? `Cannot exceed ${n}.` : null;

const isOneOf      = (options) =>
  (v) => (v && !options.includes(v)) ? `Must be one of: ${options.join(', ')}.` : null;

// ─── Validation Rule Sets ─────────────────────────────────────────────────────

/** POST /api/auth/register */
export const validateRegister = validate([
  { field: 'name',     checks: [required(), minLength(2), maxLength(50)] },
  { field: 'email',    checks: [required(), isEmail()] },
  { field: 'password', checks: [required(), minLength(6), maxLength(128)] },
]);

/** POST /api/auth/login */
export const validateLogin = validate([
  { field: 'email',    checks: [required(), isEmail()] },
  { field: 'password', checks: [required()] },
]);

/** POST /api/projects */
export const validateCreateProject = validate([
  { field: 'projectName',    checks: [required(), minLength(3), maxLength(100)] },
  { field: 'applicationType', checks: [isOneOf(['Web App', 'Mobile App', 'API Service', 'Microservices', 'Monolith', 'Desktop App', 'Other'])] },
]);

/** POST /api/projects/:id/requirements */
export const validateRequirements = validate([
  { field: 'expectedUsers',  checks: [isNumber(), minValue(0), maxValue(1_000_000_000)] },
  { field: 'dailyRequests',  checks: [isNumber(), minValue(0), maxValue(100_000_000_000)] },
]);

export default validate;
