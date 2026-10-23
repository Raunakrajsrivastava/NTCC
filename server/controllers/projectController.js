import Project from '../models/Project.js';
import { logger } from '../utils/logger.js';

// ─── POST /api/projects ────────────────────────────────────────────────────
export const createProject = async (req, res, next) => {
  try {
    const { projectName, description, applicationType, budget, expectedUsers, expectedTraffic, priority } = req.body;

    if (!projectName) {
      res.status(400);
      throw new Error('Project name is required.');
    }

    const project = await Project.create({
      userId: req.user.id,
      projectName,
      description,
      applicationType,
      budget,
      expectedUsers,
      expectedTraffic,
      priority,
    });

    logger.info(`Project created: ${project._id} by user ${req.user.id}`);
    res.status(201).json({ success: true, project: project.toJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects ─────────────────────────────────────────────────────
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, projects: projects.map((p) => p.toJSON()) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:id ─────────────────────────────────────────────────
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found.');
    }

    // Ownership check
    if (project.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('You are not authorized to access this project.');
    }

    res.status(200).json({ success: true, project: project.toJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/projects/:id ─────────────────────────────────────────────────
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found.');
    }

    if (project.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('You are not authorized to update this project.');
    }

    const allowedFields = ['projectName', 'description', 'applicationType', 'budget', 'expectedUsers', 'expectedTraffic', 'priority', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();
    logger.info(`Project updated: ${project._id}`);
    res.status(200).json({ success: true, project: project.toJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/projects/:id ──────────────────────────────────────────────
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found.');
    }

    if (project.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('You are not authorized to delete this project.');
    }

    await project.deleteOne();
    logger.info(`Project deleted: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
