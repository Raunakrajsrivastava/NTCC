import Project from '../models/Project.js';
import { generateHLD } from '../services/hldGenerator.js';
import { generateLLD } from '../services/lldGenerator.js';
import { logger } from '../utils/logger.js';

const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── GET & POST /api/projects/:projectId/hld ────────────────────────────────
export const getHLD = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    res.status(200).json({ success: true, hld: project.hld || null });
  } catch (err) {
    next(err);
  }
};

export const generateHLDHandler = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const hld = generateHLD(project);
    project.hld = hld;
    await project.save();
    logger.info(`HLD generated for project: ${project._id}`);
    res.status(200).json({ success: true, hld });
  } catch (err) {
    next(err);
  }
};

// ─── GET & POST /api/projects/:projectId/lld ────────────────────────────────
export const getLLD = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    res.status(200).json({ success: true, lld: project.lld || null });
  } catch (err) {
    next(err);
  }
};

export const generateLLDHandler = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const lld = generateLLD(project);
    project.lld = lld;
    await project.save();
    logger.info(`LLD generated for project: ${project._id}`);
    res.status(200).json({ success: true, lld });
  } catch (err) {
    next(err);
  }
};
