import express from 'express';
import {
  getScenarios,
  createScenario,
  deleteScenario,
} from '../controllers/scenarioController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getScenarios);
router.post('/', createScenario);
router.delete('/:scenarioId', deleteScenario);

export default router;
