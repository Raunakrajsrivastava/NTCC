import Technology from '../models/Technology.js';
import { logger } from '../utils/logger.js';

// ─── GET /api/technologies ─────────────────────────────────────────────────
export const getTechnologies = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const technologies = await Technology.find(filter).sort({ category: 1, popularityScore: -1 });
    res.status(200).json({ success: true, count: technologies.length, technologies: technologies.map((t) => t.toJSON()) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/technologies/:id ─────────────────────────────────────────────
export const getTechnologyById = async (req, res, next) => {
  try {
    const tech = await Technology.findById(req.params.id);
    if (!tech) {
      res.status(404);
      throw new Error('Technology not found.');
    }
    res.status(200).json({ success: true, technology: tech.toJSON() });
  } catch (err) {
    next(err);
  }
};
