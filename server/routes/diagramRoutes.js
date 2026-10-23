import express from 'express';
import { getDiagrams, generateDiagramsHandler } from '../controllers/diagramController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getDiagrams);
router.post('/', generateDiagramsHandler);

export default router;
