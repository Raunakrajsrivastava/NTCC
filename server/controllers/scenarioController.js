import crypto from 'crypto';
import Project from '../models/Project.js';
import Technology from '../models/Technology.js';
import { runScenarioSimulation } from '../services/scenarioSimulator.js';
import { logger } from '../utils/logger.js';

// ─── Helper ────────────────────────────────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── GET /api/projects/:projectId/scenarios ───────────────────────────────
export const getScenarios = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    res.status(200).json({
      success: true,
      scenarios: project.scenarios || [],
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:projectId/scenarios ──────────────────────────────
export const createScenario = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.requirements || !project.recommendations) {
      res.status(400);
      throw new Error('Project must have completed requirements and recommendations before branching a what-if scenario.');
    }

    const { scenarioName, description, overrides } = req.body;
    if (!scenarioName) {
      res.status(400);
      throw new Error('Scenario name is required.');
    }

    const technologies = await Technology.find({});
    const simulationResult = runScenarioSimulation(project, overrides || {}, technologies);

    const newScenario = {
      scenarioId: `SCEN-${crypto.randomBytes(4).toString('hex')}`,
      scenarioName: scenarioName.trim(),
      description: description?.trim() || '',
      overrides: overrides || {},
      ...simulationResult,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!Array.isArray(project.scenarios)) {
      project.scenarios = [];
    }
    project.scenarios.push(newScenario);
    await project.save();

    logger.info(`Scenario created: ${newScenario.scenarioId} for project: ${project._id}`);

    res.status(201).json({
      success: true,
      scenario: newScenario,
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/projects/:projectId/scenarios/:scenarioId ────────────────
export const deleteScenario = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const { scenarioId } = req.params;

    const initialLength = project.scenarios?.length || 0;
    project.scenarios = (project.scenarios || []).filter((s) => s.scenarioId !== scenarioId);

    if (project.scenarios.length === initialLength) {
      res.status(404);
      throw new Error('Scenario not found.');
    }

    await project.save();
    logger.info(`Scenario deleted: ${scenarioId} from project: ${project._id}`);

    res.status(200).json({
      success: true,
      message: 'Scenario deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
