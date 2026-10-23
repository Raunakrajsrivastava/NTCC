import Project from '../models/Project.js';
import { analyzeRequirements } from '../services/requirementAnalyzer.js';
import { logger } from '../utils/logger.js';

// ─── Helper: verify project ownership ─────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }
  if (project.userId.toString() !== userId) {
    res.status(403);
    throw new Error('You are not authorized to access this project.');
  }
  return project;
};

// ─── POST /api/projects/:projectId/requirements ────────────────────────────
export const saveRequirements = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    const normalizedRequirements = analyzeRequirements(req.body);

    project.requirements = { ...req.body, normalizedRequirements };
    project.status = 'Requirements Collected';
    await project.save();

    logger.info(`Requirements saved for project: ${project._id}`);
    res.status(200).json({
      success: true,
      requirements: project.requirements,
      normalizedRequirements,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:projectId/requirements ─────────────────────────────
export const getRequirements = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.requirements) {
      return res.status(200).json({ success: true, requirements: null });
    }

    res.status(200).json({ success: true, requirements: project.requirements });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/projects/:projectId/requirements ─────────────────────────────
export const updateRequirements = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    const normalizedRequirements = analyzeRequirements(req.body);

    project.requirements = {
      ...(project.requirements?.toObject ? project.requirements.toObject() : project.requirements || {}),
      ...req.body,
      normalizedRequirements,
    };
    await project.save();

    logger.info(`Requirements updated for project: ${project._id}`);
    res.status(200).json({
      success: true,
      requirements: project.requirements,
      normalizedRequirements,
    });
  } catch (err) {
    next(err);
  }
};
