import Project from '../models/Project.js';
import { explainArchitecture } from '../services/aiExplainer.js';
import { logger } from '../utils/logger.js';

// ─── Helper ────────────────────────────────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── GET /api/projects/:projectId/explain ─────────────────────────────────
export const getExplanation = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    res.status(200).json({
      success: true,
      explanation: project.aiExplanation || null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:projectId/explain ────────────────────────────────
export const generateExplanation = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.recommendations) {
      res.status(400);
      throw new Error(
        'No recommendations found. Generate architecture recommendations (Module 6) before requesting an AI explanation.'
      );
    }

    // explainArchitecture handles AI errors gracefully — always returns something
    const explanation = await explainArchitecture(project);

    // Persist to project document
    project.aiExplanation = {
      ...explanation,
      generatedAt: new Date().toISOString(),
    };
    await project.save();

    logger.info(`AI explanation generated for project: ${project._id} | fallback: ${explanation._isFallback}`);

    res.status(200).json({
      success: true,
      explanation: project.aiExplanation,
      isFallback: explanation._isFallback || false,
    });
  } catch (err) {
    next(err);
  }
};
