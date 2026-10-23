import express from 'express';
import { getComparison, compareArchitecturesHandler } from '../controllers/comparisonController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getComparison);
router.post('/', compareArchitecturesHandler);

export default router;
