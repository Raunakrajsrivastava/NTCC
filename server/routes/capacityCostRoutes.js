import express from 'express';
import { getCapacityAndCost } from '../controllers/capacityCostController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getCapacityAndCost);

export default router;
