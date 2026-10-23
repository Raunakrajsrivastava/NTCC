import express from 'express';
import {
  saveRequirements,
  getRequirements,
  updateRequirements,
} from '../controllers/requirementController.js';

// mergeParams allows access to :projectId from parent router
const router = express.Router({ mergeParams: true });

router.route('/').get(getRequirements).post(saveRequirements).put(updateRequirements);

export default router;
