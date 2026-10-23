import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateCreateProject } from '../middleware/validateMiddleware.js';
import requirementRoutes from './requirementRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import comparisonRoutes from './comparisonRoutes.js';
import aiRoutes from './aiRoutes.js';
import designRoutes from './designRoutes.js';
import diagramRoutes from './diagramRoutes.js';
import reportRoutes from './reportRoutes.js';
import validationRoutes from './validationRoutes.js';
import scenarioRoutes from './scenarioRoutes.js';
import capacityCostRoutes from './capacityCostRoutes.js';
import traceabilityRoutes from './traceabilityRoutes.js';

const router = express.Router();

// All project routes require authentication
router.use(protect);

router.route('/').get(getProjects).post(validateCreateProject, createProject);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);

// Nested sub-routers
router.use('/:projectId/requirements', requirementRoutes);
router.use('/:projectId/recommendations', recommendationRoutes);
router.use('/:projectId/compare', comparisonRoutes);
router.use('/:projectId/explain', aiRoutes);
router.use('/:projectId/design', designRoutes);
router.use('/:projectId/diagrams', diagramRoutes);
router.use('/:projectId/report', reportRoutes);
router.use('/:projectId/validate', validationRoutes);
router.use('/:projectId/scenarios', scenarioRoutes);
router.use('/:projectId/capacity-cost', capacityCostRoutes);
router.use('/:projectId/traceability', traceabilityRoutes);

export default router;
