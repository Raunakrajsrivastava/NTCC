import Project from '../models/Project.js';
import { validateArchitecture } from '../services/architectureValidator.js';
import { logger } from '../utils/logger.js';

// ─── Helper ────────────────────────────────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── POST /api/projects/:projectId/validate ───────────────────────────────
export const runValidation = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.recommendations) {
      res.status(400);
      throw new Error('Please generate recommendations before running architecture validation.');
    }

    const report = validateArchitecture(project);

    // Save validation output on project document
    project.validation = report;
    await project.save();

    logger.info(`Validation run for project: ${project._id} | Status: ${report.validationStatus} | Score: ${report.complianceScore}`);

    res.status(200).json({
      success: true,
      validation: report,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:projectId/validate ────────────────────────────────
export const getValidation = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.validation) {
      // If recommendations exist but no validation run yet, execute automatically
      if (project.recommendations) {
        const report = validateArchitecture(project);
        project.validation = report;
        await project.save();
        return res.status(200).json({
          success: true,
          validation: report,
        });
      }
      return res.status(200).json({
        success: true,
        validation: null,
      });
    }

    res.status(200).json({
      success: true,
      validation: project.validation,
    });
  } catch (err) {
    next(err);
  }
};
