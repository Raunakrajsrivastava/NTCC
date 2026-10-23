import Project from '../models/Project.js';
import { calculateCapacity, calculateCostEstimate } from '../services/capacityCostService.js';
import { logger } from '../utils/logger.js';

// ─── Helper ────────────────────────────────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── GET /api/projects/:projectId/capacity-cost ───────────────────────────
export const getCapacityAndCost = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.requirements) {
      res.status(400);
      throw new Error('Project requirements must be defined to estimate capacity and infrastructure cost.');
    }

    const capacity = calculateCapacity(project.requirements);
    const costEstimate = calculateCostEstimate(capacity, project.recommendations);

    // Save to project document
    project.capacity = capacity;
    project.costEstimate = costEstimate;
    await project.save();

    res.status(200).json({
      success: true,
      capacity,
      costEstimate,
    });
  } catch (err) {
    next(err);
  }
};
