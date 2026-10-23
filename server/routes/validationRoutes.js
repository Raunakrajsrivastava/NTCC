import express from 'express';
import { runValidation, getValidation } from '../controllers/validationController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getValidation);
router.post('/', runValidation);

export default router;
