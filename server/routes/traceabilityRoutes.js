import express from 'express';
import {
  getTraceability,
  createADR,
  updateADR,
} from '../controllers/traceabilityController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getTraceability);
router.post('/adrs', createADR);
router.put('/adrs/:adrId', updateADR);

export default router;
