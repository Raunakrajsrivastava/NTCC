import express from 'express';
import { getTechnologies, getTechnologyById } from '../controllers/technologyController.js';

const router = express.Router();

// Public routes — no auth required
router.get('/', getTechnologies);
router.get('/:id', getTechnologyById);

export default router;
