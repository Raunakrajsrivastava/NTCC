import Project from '../models/Project.js';
import { generateDiagrams } from '../services/diagramGenerator.js';
import { logger } from '../utils/logger.js';

const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

export const getDiagrams = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    res.status(200).json({ success: true, diagrams: project.diagrams || null });
  } catch (err) {
    next(err);
  }
};

export const generateDiagramsHandler = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const diagrams = generateDiagrams(project);
    project.diagrams = diagrams;
    await project.save();
    logger.info(`Diagrams generated for project: ${project._id}`);
    res.status(200).json({ success: true, diagrams });
  } catch (err) {
    next(err);
  }
};
