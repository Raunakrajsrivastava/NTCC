import Project from '../models/Project.js';
import Technology from '../models/Technology.js';
import { generateRecommendations, DEFAULT_WEIGHTS } from '../services/recommendationEngine.js';
import { logger } from '../utils/logger.js';

// ─── Helper ────────────────────────────────────────────────────────────────
const getOwnedProject = async (projectId, userId, res) => {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404); throw new Error('Project not found.'); }
  if (project.userId.toString() !== userId) { res.status(403); throw new Error('Not authorized.'); }
  return project;
};

// ─── POST /api/projects/:projectId/recommendations/generate ───────────────
export const generateProjectRecommendations = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.requirements || !project.requirements.normalizedRequirements) {
      res.status(400);
      throw new Error(
        'No requirements found for this project. Please complete the requirement wizard (Module 4) before generating recommendations.'
      );
    }

    const technologies = await Technology.find({});
    if (!technologies.length) {
      res.status(503);
      throw new Error(
        'Technology knowledge base is empty. Please run the tech seeder: node seed/techSeeder.js'
      );
    }

    const customWeights = req.body?.weights || null;
    const result = generateRecommendations(
      project.requirements.normalizedRequirements,
      technologies,
      customWeights
    );

    // Persist to project document
    project.recommendations = result;
    project.status = 'Architecture Generated';
    await project.save();

    logger.info(`Recommendations generated for project: ${project._id} | Score: ${result.overallScore} | CustomWeights: ${result.isCustomWeights}`);

    res.status(200).json({
      success: true,
      overallScore: result.overallScore,
      recommendations: result.recommendations,
      requiredLayers: result.requiredLayers,
      engineReasons: result.engineReasons,
      appliedWeights: result.appliedWeights,
      configuredWeights: result.configuredWeights,
      isCustomWeights: result.isCustomWeights,
      scoringFormula: result.scoringFormula,
      allScoredCandidates: result.allScoredCandidates,
      defaultWeights: DEFAULT_WEIGHTS,
      generatedAt: result.generatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:projectId/recommendations ─────────────────────────
export const getRecommendations = async (req, res, next) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user.id, res);

    if (!project.recommendations) {
      return res.status(200).json({
        success: true,
        recommendations: null,
        defaultWeights: DEFAULT_WEIGHTS,
      });
    }

    res.status(200).json({
      success: true,
      overallScore: project.recommendations.overallScore,
      recommendations: project.recommendations.recommendations,
      requiredLayers: project.recommendations.requiredLayers,
      engineReasons: project.recommendations.engineReasons,
      appliedWeights: project.recommendations.appliedWeights,
      configuredWeights: project.recommendations.configuredWeights || DEFAULT_WEIGHTS,
      isCustomWeights: !!project.recommendations.isCustomWeights,
      scoringFormula: project.recommendations.scoringFormula || 'Final Score = Σ(CriterionScore × Weight) + CompatibilityBonus',
      allScoredCandidates: project.recommendations.allScoredCandidates || null,
      defaultWeights: DEFAULT_WEIGHTS,
      generatedAt: project.recommendations.generatedAt,
    });
  } catch (err) {
    next(err);
  }
};
