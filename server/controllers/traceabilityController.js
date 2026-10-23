import Project from '../models/Project.js';
import {
  extractRequirementsWithIDs,
  buildTraceabilityMatrix,
  generateDefaultADRs,
} from '../services/traceabilityService.js';
import { logger } from '../utils/logger.js';

// ─── Helper ────────────────────────────────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── GET /api/projects/:projectId/traceability ────────────────────────────
export const getTraceability = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.requirements) {
      res.status(400);
      throw new Error('Project requirements must be entered before building a traceability matrix.');
    }

    const { functional, nonFunctional } = extractRequirementsWithIDs(project);
    const matrix = buildTraceabilityMatrix(project, { functional, nonFunctional });

    // Initialize ADRs if empty
    if (!project.adrs || project.adrs.length === 0) {
      project.adrs = generateDefaultADRs(project, { functional, nonFunctional });
    }

    project.traceability = {
      functional,
      nonFunctional,
      matrix,
      generatedAt: new Date().toISOString(),
    };
    await project.save();

    res.status(200).json({
      success: true,
      traceability: project.traceability,
      adrs: project.adrs,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:projectId/traceability/adrs ──────────────────────
export const createADR = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const { title, context, decisionRationale, status, requirementReferences } = req.body;

    if (!title || !decisionRationale) {
      res.status(400);
      throw new Error('Title and Decision Rationale are required for an ADR.');
    }

    if (!Array.isArray(project.adrs)) {
      project.adrs = [];
    }

    const nextNumber = project.adrs.length + 1;
    const newAdr = {
      id: `ADR-${String(nextNumber).padStart(3, '0')}`,
      title: title.trim(),
      status: status || 'Accepted',
      context: context || '',
      decisionRationale: decisionRationale.trim(),
      requirementReferences: requirementReferences || [],
      alternativesConsidered: req.body.alternativesConsidered || [],
      positiveConsequences: req.body.positiveConsequences || [],
      negativeConsequences: req.body.negativeConsequences || [],
      risksAndMitigations: req.body.risksAndMitigations || '',
      relatedComponents: req.body.relatedComponents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    project.adrs.push(newAdr);
    await project.save();

    res.status(201).json({
      success: true,
      adr: newAdr,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/projects/:projectId/traceability/adrs/:adrId ────────────────
export const updateADR = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const { adrId } = req.params;

    if (!Array.isArray(project.adrs)) {
      res.status(404);
      throw new Error('No ADRs found.');
    }

    const adrIndex = project.adrs.findIndex((a) => a.id === adrId);
    if (adrIndex === -1) {
      res.status(404);
      throw new Error('ADR not found.');
    }

    project.adrs[adrIndex] = {
      ...project.adrs[adrIndex],
      ...req.body,
      id: adrId, // prevent changing ID
      updatedAt: new Date().toISOString(),
    };

    project.markModified('adrs');
    await project.save();

    res.status(200).json({
      success: true,
      adr: project.adrs[adrIndex],
    });
  } catch (err) {
    next(err);
  }
};
