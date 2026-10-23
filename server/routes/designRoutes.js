import express from 'express';
import { getHLD, generateHLDHandler, getLLD, generateLLDHandler } from '../controllers/designController.js';

const router = express.Router({ mergeParams: true });

router.get('/hld', getHLD);
router.post('/hld', generateHLDHandler);

router.get('/lld', getLLD);
router.post('/lld', generateLLDHandler);

export default router;
