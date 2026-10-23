import express from 'express';
import {
  generateProjectRecommendations,
  getRecommendations,
} from '../controllers/recommendationController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getRecommendations);
router.post('/generate', generateProjectRecommendations);
router.post('/recalculate', generateProjectRecommendations);

export default router;
