import Project from '../models/Project.js';
import { compareArchitectures, ARCHITECTURE_PRESETS } from '../services/architectureComparer.js';
import { logger } from '../utils/logger.js';

// ─── Helper ────────────────────────────────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── GET /api/projects/:projectId/compare ─────────────────────────────────
// Returns list of available presets + cached comparison if one exists
export const getComparison = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    res.status(200).json({
      success: true,
      availablePresets: Object.values(ARCHITECTURE_PRESETS).map(({ id, name, description, tags, technologies }) => ({
        id, name, description, tags, technologies,
      })),
      comparison: project.comparison || null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:projectId/compare ────────────────────────────────
export const compareArchitecturesHandler = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.requirements?.normalizedRequirements) {
      res.status(400);
      throw new Error('Requirements must be collected before running a comparison. Complete the requirement wizard first.');
    }

    const { presetIds } = req.body;
    if (!Array.isArray(presetIds) || presetIds.length < 2) {
      res.status(400);
      throw new Error('Please provide at least 2 preset IDs to compare.');
    }

    const result = await compareArchitectures(presetIds, project.requirements.normalizedRequirements);

    // Persist comparison to project
    project.comparison = result;
    await project.save();

    logger.info(`Architecture comparison completed for project: ${project._id} | winner: ${result.winner.name}`);

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
