/**
 * Recommendation Engine — Module 6 (Enhanced Architecture Decision Platform)
 *
 * Pipeline:
 *   normalizedRequirements → applyRules → weightCategories
 *   → checkHardConstraints → scoreTechnologiesWithBreakdown → rankByCategory → buildOutput
 *
 * All logic is deterministic and rule-based. No ML inference required.
 * Fully transparent scoring formula:
 *   Weighted Score = Sum(Normalized Criterion Score × Weight) + Compatibility Affinity
 */

// ─── Default weights for each scoring dimension (Sum = 1.00 / 100%) ───────
export const DEFAULT_WEIGHTS = {
  scalability: 0.25,
  performance: 0.20,
  cost:        0.15,
  complexity:  0.15, // lower complexity = better; inverted during scoring
  security:    0.15,
  popularity:  0.10,
};

/**
 * Validate and normalize user-provided weights to sum to 1.00 (100%)
 */
export const normalizeWeights = (customWeights) => {
  if (!customWeights || typeof customWeights !== 'object') {
    return { ...DEFAULT_WEIGHTS };
  }

  const keys = Object.keys(DEFAULT_WEIGHTS);
  const sanitized = {};
  let rawTotal = 0;

  for (const key of keys) {
    const val = Number(customWeights[key]);
    if (!Number.isFinite(val) || val < 0) {
      sanitized[key] = DEFAULT_WEIGHTS[key];
    } else {
      sanitized[key] = val;
    }
    rawTotal += sanitized[key];
  }

  if (rawTotal <= 0) {
    return { ...DEFAULT_WEIGHTS };
  }

  const normalized = {};
  for (const key of keys) {
    normalized[key] = +(sanitized[key] / rawTotal).toFixed(4);
  }
  return normalized;
};

// ─── Rule Engine ───────────────────────────────────────────────────────────
/**
 * Takes normalizedRequirements and produces rule adjustments plus flags & explanations.
 */
export const applyRules = (norm, baseWeights = DEFAULT_WEIGHTS) => {
  const weights = { ...baseWeights };
  const reasons = [];
  const flags = {
    preferPostgres: false,
    preferMongo: false,
    requireCache: false,
    requireCDN: false,
    requireMessageQueue: false,
    preferServerless: false,
    preferMicroservices: false,
    requireRealtime: false,
    requireHighSecurity: false,
  };

  const traffic = norm.trafficLevel || 'LOW';
  const security = norm.securityLevel || 'STANDARD';

  // ── Traffic rules ────────────────────────────────────────────────────────
  if (traffic === 'HIGH' || traffic === 'VERY_HIGH') {
    weights.scalability = Math.min(weights.scalability + 0.15, 0.45);
    weights.performance = Math.min(weights.performance + 0.10, 0.35);
    weights.cost = Math.max(weights.cost - 0.05, 0.05);
    flags.requireCache = true;
    reasons.push('High traffic detected — scalability and performance weights boosted; caching layer required.');
  }

  if (traffic === 'VERY_HIGH') {
    flags.requireMessageQueue = true;
    flags.requireCDN = true;
    reasons.push('Very high traffic — message queue (async decoupled ingestion) and global CDN strongly recommended.');
  }

  // ── Scalability rules ────────────────────────────────────────────────────
  if (norm.scalabilityRequired) {
    weights.scalability = Math.min(weights.scalability + 0.10, 0.45);
    reasons.push('Auto-scaling requirement detected — horizontal scalability weight boosted.');
  }

  // ── Security rules ────────────────────────────────────────────────────────
  if (security === 'HIGH' || security === 'CRITICAL') {
    weights.security = Math.min(weights.security + 0.15, 0.40);
    weights.cost = Math.max(weights.cost - 0.05, 0.05);
    flags.requireHighSecurity = true;
    reasons.push(`Security level is ${security} — enterprise security certifications and access controls preferred.`);
  }

  if (security === 'CRITICAL') {
    weights.security = Math.min(weights.security + 0.10, 0.45);
    reasons.push('Critical compliance requirement (e.g. PCI-DSS/HIPAA payments) — zero-trust & hardened security stacks selected.');
  }

  // ── Database preference rules ─────────────────────────────────────────────
  if (norm.recommendedDbType === 'RELATIONAL') {
    flags.preferPostgres = true;
    reasons.push('ACID transaction / relational constraints detected — PostgreSQL preferred over non-relational alternatives.');
  }

  if (norm.recommendedDbType === 'NOSQL_PRIMARY' || norm.recommendedDbType === 'POLYGLOT') {
    flags.preferMongo = true;
    reasons.push('High-write ingestion or flexible schema workload detected — MongoDB preferred.');
  }

  if (norm.hasAnalytics) {
    flags.requireCache = true;
    reasons.push('Analytical aggregation workload detected — caching and read-optimized storage recommended.');
  }

  // ── Real-time rules ────────────────────────────────────────────────────────
  if (norm.realtimeRequired) {
    flags.requireRealtime = true;
    flags.requireMessageQueue = true;
    weights.performance = Math.min(weights.performance + 0.05, 0.35);
    reasons.push('Real-time bidirectional features required — WebSocket-ready backend and event queue recommended.');
  }

  // ── Cost / budget rules ────────────────────────────────────────────────────
  if (norm.budgetTier === 'STARTUP') {
    weights.cost = Math.min(weights.cost + 0.10, 0.35);
    weights.complexity = Math.max(weights.complexity - 0.05, 0.05);
    reasons.push('Startup budget tier detected — operational cost efficiency and simplicity prioritized.');
  }

  if (norm.budgetTier === 'ENTERPRISE') {
    weights.security = Math.min(weights.security + 0.05, 0.40);
    weights.scalability = Math.min(weights.scalability + 0.05, 0.45);
    weights.cost = Math.max(weights.cost - 0.10, 0.05);
    reasons.push('Enterprise budget tier — resilience, multi-region scalability, and governance prioritized over license cost.');
  }

  // ── File storage rules ─────────────────────────────────────────────────────
  if (norm.hasFileStorage) {
    reasons.push('File uploads required — S3-compatible cloud object storage layer required.');
  }

  // ── Search rules ───────────────────────────────────────────────────────────
  if (norm.hasSearch) {
    reasons.push('Full-text search required — distributed search index integration (Elasticsearch/OpenSearch) recommended.');
  }

  // ── Geographic / CDN rules ─────────────────────────────────────────────────
  if (norm.cdnRequired) {
    flags.requireCDN = true;
    reasons.push('Global user distribution detected — multi-PoP CDN edge delivery required.');
  }

  // ── Cache rules ────────────────────────────────────────────────────────────
  if (norm.cachingRequired && !flags.requireCache) {
    flags.requireCache = true;
    reasons.push('Sub-100ms latency requirement — low-latency distributed in-memory cache (Redis) recommended.');
  }

  // Re-normalize weights so sum = 1.0000
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach((k) => (weights[k] = +(weights[k] / total).toFixed(4)));

  return { weights, flags, reasons };
};

// ─── Hard Constraints Checker ──────────────────────────────────────────────
/**
 * Evaluates whether a candidate technology violates non-negotiable project constraints.
 * Disqualified candidates remain in results for transparency but are flagged and barred from winning.
 */
export const checkHardConstraints = (tech, flags, norm) => {
  const security = norm.securityLevel || 'STANDARD';

  // Critical security requires tech security score >= 7
  if (security === 'CRITICAL' && (tech.securityScore || 0) < 7) {
    return {
      isDisqualified: true,
      reason: `Fails mandatory security constraint: Security score (${tech.securityScore}/10) is below the minimum threshold of 7/10 for ${security} security tier.`,
    };
  }

  // Mandatory relational requirement for strict financial ledger / payments
  if (norm.hasPayments && norm.recommendedDbType === 'RELATIONAL' && tech.category === 'Database' && tech.name === 'MongoDB') {
    return {
      isDisqualified: true,
      reason: 'Disqualified for primary payments ledger: Strict ACID relational integrity with schema-enforced foreign keys is mandated.',
    };
  }

  return {
    isDisqualified: false,
    reason: null,
  };
};

// ─── Scorer with Detailed Transparency Breakdown ──────────────────────────
/**
 * Calculates a composite score with full mathematical transparency breakdown.
 */
export const scoreTechnologyWithBreakdown = (tech, weights, flags, norm) => {
  // Invert complexity so that lower operational complexity yields higher score (1..10)
  const rawComplexity = tech.complexityScore || 5;
  const invertedComplexity = Math.max(1, Math.min(10, 11 - rawComplexity));

  const criterionScores = {
    scalability: tech.scalabilityScore || 6,
    performance: tech.performanceScore || 6,
    cost: tech.costScore || 6,
    complexity: invertedComplexity,
    security: tech.securityScore || 6,
    popularity: tech.popularityScore || 6,
  };

  const weightedContributions = {
    scalability: +(criterionScores.scalability * weights.scalability).toFixed(2),
    performance: +(criterionScores.performance * weights.performance).toFixed(2),
    cost: +(criterionScores.cost * weights.cost).toFixed(2),
    complexity: +(criterionScores.complexity * weights.complexity).toFixed(2),
    security: +(criterionScores.security * weights.security).toFixed(2),
    popularity: +(criterionScores.popularity * weights.popularity).toFixed(2),
  };

  const baseWeightedScore = Object.values(weightedContributions).reduce((a, b) => a + b, 0);

  // Affinity & compatibility adjustments
  let compatibilityBonus = 0;
  const compatible = tech.compatibility || [];
  if (norm.hasRealtime && compatible.includes('Socket.io')) compatibilityBonus += 0.3;
  if (flags.preferPostgres && tech.name === 'PostgreSQL') compatibilityBonus += 0.5;
  if (flags.preferMongo && tech.name === 'MongoDB') compatibilityBonus += 0.5;
  if (flags.requireHighSecurity && tech.securityScore >= 9) compatibilityBonus += 0.4;

  const constraintCheck = checkHardConstraints(tech, flags, norm);

  let finalScore = +(baseWeightedScore + compatibilityBonus).toFixed(2);
  finalScore = Math.min(10, Math.max(1, finalScore));

  if (constraintCheck.isDisqualified) {
    finalScore = Math.min(finalScore, 4.0); // Capped below competitive range
  }

  return {
    finalScore,
    criterionScores,
    weightedContributions,
    rawComplexity,
    compatibilityBonus: +compatibilityBonus.toFixed(2),
    isDisqualified: constraintCheck.isDisqualified,
    disqualificationReason: constraintCheck.reason,
    scoringFormula: 'Score = Σ(CriterionScore × Weight) + CompatibilityBonus',
  };
};

// ─── Category-specific candidate limits ────────────────────────────────────
const CATEGORY_LIMITS = {
  Frontend: 3,
  Backend:  3,
  Database: 3,
  Cache:    2,
  Cloud:    3,
  DevOps:   3,
  Storage:  2,
  Authentication: 2,
  Messaging: 2,
  Monitoring: 2,
};

// ─── Build reasons & trade-offs per recommendation ─────────────────────────
const buildTechReasons = (tech, breakdown, weights, flags, norm) => {
  const pros = [...(tech.strengths || [])].slice(0, 4);
  const cons = [...(tech.weaknesses || [])].slice(0, 3);
  const reasons = [];

  if (tech.scalabilityScore >= 8 && weights.scalability > 0.20)
    reasons.push(`High scalability rating (${tech.scalabilityScore}/10) strongly aligns with your target traffic requirement.`);
  if (tech.securityScore >= 9 && flags.requireHighSecurity)
    reasons.push(`Enterprise security grade (${tech.securityScore}/10) satisfies ${norm.securityLevel} compliance constraints.`);
  if (tech.costScore >= 8 && norm.budgetTier === 'STARTUP')
    reasons.push(`Cost efficiency score of ${tech.costScore}/10 minimizes cloud run-rate for startup budgets.`);
  if (tech.performanceScore >= 8 && weights.performance > 0.20)
    reasons.push(`Superior execution latency rating (${tech.performanceScore}/10) supports performance SLA targets.`);
  if (tech.popularityScore >= 9)
    reasons.push(`Deep ecosystem adoption (${tech.popularityScore}/10) ensures extensive library support and developer availability.`);

  if (reasons.length === 0)
    reasons.push(`Selected based on top overall composite weighted score (${breakdown.finalScore}/10) across all 6 architectural dimensions.`);

  return {
    reasons,
    advantages: pros,
    disadvantages: cons,
    tradeoffs: (tech.limitations || []).slice(0, 3),
  };
};

// ─── Alternatives Ranking Justification ───────────────────────────────────
const buildAlternativeJustification = (topPick, alt) => {
  const scoreDelta = +(topPick.score - alt.score).toFixed(2);
  const weaknesses = [];

  if (alt.criterionScores.scalability < topPick.criterionScores.scalability) {
    weaknesses.push(`lower scalability (${alt.criterionScores.scalability}/10 vs ${topPick.criterionScores.scalability}/10)`);
  }
  if (alt.criterionScores.performance < topPick.criterionScores.performance) {
    weaknesses.push(`lower performance (${alt.criterionScores.performance}/10 vs ${topPick.criterionScores.performance}/10)`);
  }
  if (alt.rawComplexity > topPick.rawComplexity) {
    weaknesses.push(`higher operational complexity (${alt.rawComplexity}/10 vs ${topPick.rawComplexity}/10)`);
  }
  if (alt.criterionScores.security < topPick.criterionScores.security) {
    weaknesses.push(`lower security score (${alt.criterionScores.security}/10 vs ${topPick.criterionScores.security}/10)`);
  }
  if (alt.criterionScores.cost < topPick.criterionScores.cost) {
    weaknesses.push(`higher infrastructure cost impact`);
  }

  const comparisonNote = weaknesses.length
    ? `Ranked #${alt.rank} (${scoreDelta > 0 ? `-${scoreDelta} pts` : 'tied'}): Sits lower primarily due to ${weaknesses.slice(0, 2).join(' and ')}.`
    : `Ranked #${alt.rank}: Viable alternative with similar profile (${alt.score}/10).`;

  return comparisonNote;
};

// ─── Main Engine Export ────────────────────────────────────────────────────
/**
 * generateRecommendations
 *
 * @param {Object} normalizedRequirements  Output of requirementAnalyzer.js
 * @param {Array}  technologies            All Technology documents from DB
 * @param {Object} [customWeights]         Optional user-configured weights
 * @returns {Object}  Structured recommendation report
 */
export const generateRecommendations = (normalizedRequirements, technologies, customWeights = null) => {
  const norm = normalizedRequirements || {};
  const isCustomWeights = customWeights !== null && typeof customWeights === 'object';
  const baseWeights = isCustomWeights ? normalizeWeights(customWeights) : DEFAULT_WEIGHTS;

  const { weights, flags, reasons: engineReasons } = applyRules(norm, baseWeights);

  // Score every technology in the database
  const scoredTechs = (technologies || []).map((tech) => {
    const breakdown = scoreTechnologyWithBreakdown(tech, weights, flags, norm);
    const techReasons = buildTechReasons(tech, breakdown, weights, flags, norm);

    return {
      techId: tech.techId || tech._id?.toString(),
      name: tech.name,
      category: tech.category,
      description: tech.description || '',
      score: breakdown.finalScore,
      criterionScores: breakdown.criterionScores,
      weightedContributions: breakdown.weightedContributions,
      rawComplexity: breakdown.rawComplexity,
      compatibilityBonus: breakdown.compatibilityBonus,
      isDisqualified: breakdown.isDisqualified,
      disqualificationReason: breakdown.disqualificationReason,
      scoringFormula: breakdown.scoringFormula,
      ...techReasons,
    };
  });

  // Group by category and sort descending by score
  const byCategory = {};
  scoredTechs.forEach((t) => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  Object.keys(byCategory).forEach((cat) => {
    // Sort qualified above disqualified, then by score descending
    byCategory[cat].sort((a, b) => {
      if (a.isDisqualified !== b.isDisqualified) return a.isDisqualified ? 1 : -1;
      return b.score - a.score;
    });
    // Assign rankings
    byCategory[cat].forEach((t, idx) => {
      t.rank = idx + 1;
    });
  });

  // Build final recommendations per category (top pick + ranked alternatives with justification)
  const recommendations = {};
  Object.entries(byCategory).forEach(([category, techs]) => {
    const limit = CATEGORY_LIMITS[category] || 3;
    const [top, ...rest] = techs;

    const alternatives = rest.slice(0, limit - 1).map((alt) => ({
      ...alt,
      comparisonJustification: top ? buildAlternativeJustification(top, alt) : '',
    }));

    recommendations[category] = {
      recommended: top || null,
      alternatives,
      allCandidatesCount: techs.length,
    };
  });

  // Required infrastructure layers based on architectural flags
  const requiredLayers = [];
  if (flags.requireCache)        requiredLayers.push({ layer: 'Cache', technology: 'Redis', reason: 'Sub-millisecond latency & query cache required for high throughput workloads.' });
  if (flags.requireMessageQueue) requiredLayers.push({ layer: 'Message Queue', technology: 'RabbitMQ / Apache Kafka', reason: 'Asynchronous task offloading and event stream decoupling required.' });
  if (flags.requireCDN)          requiredLayers.push({ layer: 'CDN', technology: 'Cloudflare / AWS CloudFront', reason: 'Global edge caching, TLS termination, and DDoS mitigation required.' });
  if (flags.requireRealtime)     requiredLayers.push({ layer: 'WebSocket', technology: 'Socket.io / ws', reason: 'Bidirectional persistent socket connections required for live client updates.' });
  if (norm.hasFileStorage)       requiredLayers.push({ layer: 'Object Storage', technology: 'AWS S3 / Cloudflare R2', reason: 'Scalable immutable blob storage with CDN presigned URL support.' });

  // Compute overall stack health score (average of top recommended technologies across core layers)
  const topScores = Object.values(recommendations)
    .map((r) => r.recommended?.score)
    .filter((s) => typeof s === 'number' && !isNaN(s));

  const overallScore = topScores.length
    ? +(topScores.reduce((a, b) => a + b, 0) / topScores.length).toFixed(2)
    : 0;

  return {
    overallScore,
    appliedWeights: weights,
    configuredWeights: baseWeights,
    isCustomWeights,
    scoringFormula: 'Final Score = Σ(CriterionScore[1..10] × Weight) + CompatibilityBonus',
    engineReasons,
    requiredLayers,
    recommendations,
    allScoredCandidates: byCategory,
    generatedAt: new Date().toISOString(),
    engineVersion: '2.0-Explainable',
  };
};
