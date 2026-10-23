import { analyzeRequirements } from './requirementAnalyzer.js';
import { generateRecommendations } from './recommendationEngine.js';
import { validateArchitecture } from './architectureValidator.js';

/**
 * Scenario Simulator — Module 7+
 *
 * Allows non-destructive what-if architecture exploration.
 */

/**
 * Calculates differences between baseline recommendations and simulated scenario recommendations.
 */
export const compareScenarios = (baselineRecs, scenarioRecs, baselineReqs, scenarioReqs) => {
  const baseScore = baselineRecs?.overallScore || 0;
  const scenScore = scenarioRecs?.overallScore || 0;
  const scoreDelta = +(scenScore - baseScore).toFixed(2);

  const basePicks = baselineRecs?.recommendations || {};
  const scenPicks = scenarioRecs?.recommendations || {};

  const techChanges = [];
  const categories = Array.from(new Set([...Object.keys(basePicks), ...Object.keys(scenPicks)]));

  for (const cat of categories) {
    const baseTech = basePicks[cat]?.recommended?.name || 'None';
    const scenTech = scenPicks[cat]?.recommended?.name || 'None';

    if (baseTech !== scenTech) {
      techChanges.push({
        category: cat,
        baseline: baseTech,
        simulated: scenTech,
        baselineScore: basePicks[cat]?.recommended?.score || 0,
        simulatedScore: scenPicks[cat]?.recommended?.score || 0,
        reason: `Changed from ${baseTech} to ${scenTech} to satisfy simulated requirement constraints.`,
      });
    }
  }

  // Detect input differences
  const requirementDeltas = [];
  const allReqKeys = [
    'expectedUsers', 'dailyRequests', 'trafficLevel', 'performanceReq',
    'availabilityReq', 'securityReq', 'scalabilityReq', 'budget', 'hasRealtime',
    'hasPayments', 'hasFileUploads', 'hasSearch', 'hasAnalytics', 'hasAuth'
  ];

  for (const key of allReqKeys) {
    if (baselineReqs[key] !== scenarioReqs[key]) {
      requirementDeltas.push({
        field: key,
        baselineValue: baselineReqs[key],
        simulatedValue: scenarioReqs[key],
      });
    }
  }

  // Analyze impact summary
  const impactNotes = [];
  if (scoreDelta > 0) {
    impactNotes.push(`Overall architecture fitness improved by +${scoreDelta} points.`);
  } else if (scoreDelta < 0) {
    impactNotes.push(`Architecture fitness decreased by ${scoreDelta} points due to stricter architectural constraints or cost trade-offs.`);
  } else {
    impactNotes.push('Overall fitness score remains identical, though component rankings may have shifted.');
  }

  if (techChanges.length > 0) {
    impactNotes.push(`${techChanges.length} technology selection(s) altered: ${techChanges.map((t) => t.category).join(', ')}.`);
  } else {
    impactNotes.push('Current technology choices remain optimal despite requirement alterations.');
  }

  return {
    scoreDelta,
    baselineOverallScore: baseScore,
    simulatedOverallScore: scenScore,
    techChanges,
    requirementDeltas,
    impactNotes,
  };
};

/**
 * Executes a simulated what-if scenario against a project baseline.
 *
 * @param {Object} project - The baseline project document
 * @param {Object} overrides - Modified requirement properties
 * @param {Array} technologies - Master technology documents
 * @returns {Object} Simulated scenario outcome with full diff and validation
 */
export const runScenarioSimulation = (project, overrides, technologies) => {
  const baseReqs = project.requirements ? project.requirements.toObject?.() || project.requirements : {};
  const mergedReqs = { ...baseReqs, ...overrides };

  // 1. Re-analyze requirements
  const normalized = analyzeRequirements(mergedReqs);

  // 2. Re-run deterministic recommendation engine
  const simulatedRecommendations = generateRecommendations(normalized, technologies);

  // 3. Diff against baseline
  const comparison = compareScenarios(
    project.recommendations,
    simulatedRecommendations,
    baseReqs,
    mergedReqs
  );

  // 4. Run architecture validation on the simulated state
  const mockSimulatedProject = {
    ...project.toObject?.() || project,
    requirements: { ...mergedReqs, normalizedRequirements: normalized },
    recommendations: simulatedRecommendations,
  };
  const validation = validateArchitecture(mockSimulatedProject);

  return {
    normalizedRequirements: normalized,
    recommendations: simulatedRecommendations,
    comparisonToBaseline: comparison,
    validation,
    simulatedAt: new Date().toISOString(),
  };
};
