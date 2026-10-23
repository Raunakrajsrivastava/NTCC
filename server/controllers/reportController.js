import Project from '../models/Project.js';
import { generateFinalReport, generateReportMarkdown } from '../services/reportGenerator.js';
import { logger } from '../utils/logger.js';

const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── GET /api/projects/:projectId/report ────────────────────────────────────
export const getReport = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    res.status(200).json({ success: true, report: project.report || null });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:projectId/report — Generate new report ─────────────
export const generateReportHandler = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const report = generateFinalReport(project);
    project.report = report;
    await project.save();
    logger.info(`Final architecture report generated for project: ${project._id}`);
    res.status(200).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/projects/:projectId/report — Explicitly save / update report ──
export const saveReport = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    if (!req.body.report) {
      res.status(400);
      throw new Error('No report data provided in request body.');
    }
    project.report = req.body.report;
    await project.save();
    logger.info(`Report manually saved for project: ${project._id}`);
    res.status(200).json({ success: true, message: 'Report saved successfully.', savedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:projectId/report/export/markdown ────────────────────
export const exportMarkdown = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const report = project.report || generateFinalReport(project);
    const markdown = generateReportMarkdown(report);

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${project.projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_architecture_report.md"`);
    res.status(200).send(markdown);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:projectId/report/export/json ────────────────────────
export const exportJson = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);
    const report = project.report || generateFinalReport(project);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${project.projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_architecture_spec.json"`);
    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
};
