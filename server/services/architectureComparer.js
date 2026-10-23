/**
 * Architecture Comparer — Module 7
 *
 * Evaluates predefined full-stack presets against a project's
 * normalizedRequirements and produces side-by-side scoring across
 * 8 comparison criteria.
 *
 * Pipeline:
 *   presetIds + normalizedRequirements
 *       ↓
 *   Resolve preset → fetch tech docs from DB
 *       ↓
 *   Score each tech on all dimensions
 *       ↓
 *   Aggregate into 8 criteria per preset
 *       ↓
 *   Rank, annotate, return comparison table
 */

import Technology from '../models/Technology.js';

// ─── Fallback Scores (used when DB lookup misses a technology) ─────────────
// Fields: scalabilityScore, performanceScore, costScore,
//         complexityScore, securityScore, popularityScore, strengths, weaknesses
const FALLBACK_SCORES = {
  'React':        { scalabilityScore:8, performanceScore:8, costScore:9, complexityScore:5, securityScore:7, popularityScore:10, strengths:['Virtual DOM','Component reuse','Huge ecosystem'], weaknesses:['Library only','JSX curve'] },
  'Next.js':      { scalabilityScore:9, performanceScore:9, costScore:8, complexityScore:6, securityScore:8, popularityScore:9,  strengths:['SSR/SSG','SEO','File routing'],               weaknesses:['Opinionated','Cold starts'] },
  'Angular':      { scalabilityScore:9, performanceScore:7, costScore:7, complexityScore:8, securityScore:9, popularityScore:7,  strengths:['Full framework','TypeScript','DI'],              weaknesses:['Steep curve','Verbose'] },
  'Vue':          { scalabilityScore:7, performanceScore:8, costScore:9, complexityScore:4, securityScore:7, popularityScore:7,  strengths:['Easy learning','Two-way binding'],               weaknesses:['Smaller ecosystem'] },
  'Node.js':      { scalabilityScore:8, performanceScore:8, costScore:9, complexityScore:5, securityScore:7, popularityScore:10, strengths:['Non-blocking I/O','JS everywhere'],              weaknesses:['Single-threaded CPU'] },
  'Express.js':   { scalabilityScore:7, performanceScore:8, costScore:9, complexityScore:4, securityScore:6, popularityScore:10, strengths:['Minimal','Flexible','Middleware ecosystem'],      weaknesses:['No structure enforced'] },
  'Spring Boot':  { scalabilityScore:9, performanceScore:8, costScore:5, complexityScore:8, securityScore:10,popularityScore:8,  strengths:['Enterprise-grade','Strong security'],            weaknesses:['Verbose','Heavy memory'] },
  'Django':       { scalabilityScore:7, performanceScore:6, costScore:8, complexityScore:5, securityScore:9, popularityScore:8,  strengths:['Batteries-included','Rapid dev'],                weaknesses:['Monolithic','No real-time'] },
  'FastAPI':      { scalabilityScore:8, performanceScore:9, costScore:9, complexityScore:5, securityScore:7, popularityScore:8,  strengths:['Fast','Auto docs','Async'],                      weaknesses:['Smaller ecosystem'] },
  'MongoDB':      { scalabilityScore:9, performanceScore:8, costScore:8, complexityScore:5, securityScore:7, popularityScore:9,  strengths:['Flexible schema','Horizontal scaling'],          weaknesses:['No joins','Not ACID by default'] },
  'PostgreSQL':   { scalabilityScore:8, performanceScore:8, costScore:9, complexityScore:6, securityScore:9, popularityScore:9,  strengths:['ACID','Complex queries','JSON support'],         weaknesses:['Horizontal scaling expertise'] },
  'MySQL':        { scalabilityScore:7, performanceScore:7, costScore:9, complexityScore:5, securityScore:7, popularityScore:8,  strengths:['Widely known','Good reads'],                      weaknesses:['Less advanced than PostgreSQL'] },
  'Redis':        { scalabilityScore:9, performanceScore:10,costScore:7, complexityScore:4, securityScore:7, popularityScore:9,  strengths:['Sub-ms latency','Pub/Sub','Versatile'],          weaknesses:['Memory-bound','Not primary DB'] },
  'Docker':       { scalabilityScore:8, performanceScore:8, costScore:9, complexityScore:4, securityScore:7, popularityScore:10, strengths:['Portability','Isolation','Fast startup'],         weaknesses:['Not orchestration alone'] },
  'Kubernetes':   { scalabilityScore:10,performanceScore:9, costScore:4, complexityScore:10,securityScore:8, popularityScore:9,  strengths:['Auto-scaling','Self-healing','Multi-cloud'],      weaknesses:['Very complex','DevOps overhead'] },
};

// ─── Architecture Preset Definitions ──────────────────────────────────────
// Each preset lists the canonical technology names it uses per role.
// The comparer resolves these names against the Technology collection.
export const ARCHITECTURE_PRESETS = {
  mern: {
    id: 'mern',
    name: 'MERN Stack',
    description: 'MongoDB · Express.js · React · Node.js — the classic JavaScript full-stack',
    tags: ['JavaScript', 'NoSQL', 'Flexible', 'Startup-friendly'],
    technologies: {
      Frontend: 'React',
      Backend: 'Node.js',
      Database: 'MongoDB',
      Cache: 'Redis',
      DevOps: 'Docker',
    },
  },
  spring_pg: {
    id: 'spring_pg',
    name: 'Spring Boot + PostgreSQL',
    description: 'Angular · Spring Boot · PostgreSQL · Redis — enterprise Java stack',
    tags: ['Java', 'Relational', 'Enterprise', 'High-security'],
    technologies: {
      Frontend: 'Angular',
      Backend: 'Spring Boot',
      Database: 'PostgreSQL',
      Cache: 'Redis',
      DevOps: 'Kubernetes',
    },
  },
  django_pg: {
    id: 'django_pg',
    name: 'Django + PostgreSQL',
    description: 'React · Django · PostgreSQL — Python batteries-included stack',
    tags: ['Python', 'Relational', 'Rapid development', 'ML-friendly'],
    technologies: {
      Frontend: 'React',
      Backend: 'Django',
      Database: 'PostgreSQL',
      Cache: 'Redis',
      DevOps: 'Docker',
    },
  },
  nextjs_pg: {
    id: 'nextjs_pg',
    name: 'Next.js Full-Stack',
    description: 'Next.js · Node.js · PostgreSQL — SEO-optimised SSR stack',
    tags: ['JavaScript', 'SSR', 'SEO-optimised', 'Full-stack JS'],
    technologies: {
      Frontend: 'Next.js',
      Backend: 'Node.js',
      Database: 'PostgreSQL',
      Cache: 'Redis',
      DevOps: 'Docker',
    },
  },
  fastapi_mongo: {
    id: 'fastapi_mongo',
    name: 'FastAPI + MongoDB',
    description: 'Vue · FastAPI · MongoDB — high-performance Python + flexible schema',
    tags: ['Python', 'NoSQL', 'High-performance', 'ML-ready'],
    technologies: {
      Frontend: 'Vue',
      Backend: 'FastAPI',
      Database: 'MongoDB',
      Cache: 'Redis',
      DevOps: 'Docker',
    },
  },
  mean: {
    id: 'mean',
    name: 'MEAN Stack',
    description: 'Angular · Node.js · Express.js · MongoDB — full Angular JS stack',
    tags: ['JavaScript', 'NoSQL', 'Angular', 'Full-stack JS'],
    technologies: {
      Frontend: 'Angular',
      Backend: 'Node.js',
      Database: 'MongoDB',
      Cache: 'Redis',
      DevOps: 'Docker',
    },
  },
};

// ─── Criteria Definitions ──────────────────────────────────────────────────
// Maps each comparison criterion to a scoring formula over tech scores.
const CRITERIA = [
  'Performance',
  'Scalability',
  'Security',
  'Cost',
  'Complexity',       // inverted: lower is better → higher score
  'Maintainability',
  'DevelopmentSpeed',
  'Compatibility',
];

// ─── Score a single preset against normalizedRequirements ─────────────────
const scorePreset = (preset, techMap, norm) => {
  // Use DB doc if available, fall back to hardcoded scores, then default object
  const techs = Object.values(preset.technologies).map((name) => {
    return techMap[name] || FALLBACK_SCORES[name] || {
      scalabilityScore: 5, performanceScore: 5, costScore: 5,
      complexityScore: 5, securityScore: 5, popularityScore: 5,
      strengths: [], weaknesses: [],
    };
  });

  if (techs.length === 0) return null;


  const avg = (getter) => {
    const vals = techs.map(getter).filter((v) => v != null);
    return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 5;
  };

  const traffic = norm?.trafficLevel || 'LOW';
  const security = norm?.securityLevel || 'STANDARD';
  const budgetTier = norm?.budgetTier || 'STARTUP';

  // Raw dimension averages
  const rawPerf = avg((t) => t.performanceScore);
  const rawScale = avg((t) => t.scalabilityScore);
  const rawSec = avg((t) => t.securityScore);
  const rawCost = avg((t) => t.costScore);
  const rawComplexity = avg((t) => t.complexityScore);
  const rawPop = avg((t) => t.popularityScore);

  // Inverted complexity (lower complexity → higher score)
  const invertedComplexity = +(11 - rawComplexity).toFixed(2);

  // Maintainability = average of popularity (community support) + inverted complexity
  const maintainability = +((rawPop + invertedComplexity) / 2).toFixed(2);

  // Development speed = inverted complexity + cost efficiency (cheaper = faster to adopt)
  const devSpeed = +((invertedComplexity * 0.6 + rawCost * 0.4)).toFixed(2);

  // Requirement compatibility bonus
  let compatBonus = 0;
  if (norm?.scalabilityRequired && rawScale >= 8) compatBonus += 0.5;
  if ((security === 'HIGH' || security === 'CRITICAL') && rawSec >= 8) compatBonus += 0.5;
  if (norm?.realtimeRequired && preset.tags.includes('JavaScript')) compatBonus += 0.3;
  if (budgetTier === 'STARTUP' && rawCost >= 8) compatBonus += 0.4;
  if (budgetTier === 'ENTERPRISE' && rawScale >= 8 && rawSec >= 8) compatBonus += 0.4;
  if ((traffic === 'HIGH' || traffic === 'VERY_HIGH') && rawScale >= 8) compatBonus += 0.4;
  if (norm?.recommendedDbType === 'RELATIONAL' && ['PostgreSQL', 'MySQL'].some((db) => Object.values(preset.technologies).includes(db))) compatBonus += 0.6;
  if (norm?.recommendedDbType === 'NOSQL_PRIMARY' && Object.values(preset.technologies).includes('MongoDB')) compatBonus += 0.6;

  const compatibility = Math.min(10, +(5 + compatBonus * 2).toFixed(2));

  const criteria = {
    Performance: Math.min(10, rawPerf),
    Scalability: Math.min(10, rawScale),
    Security: Math.min(10, rawSec),
    Cost: Math.min(10, rawCost),
    Complexity: Math.min(10, invertedComplexity),
    Maintainability: Math.min(10, maintainability),
    DevelopmentSpeed: Math.min(10, devSpeed),
    Compatibility: Math.min(10, compatibility),
  };

  // Apply requirement-based weights for overall score
  const weights = {
    Performance:      (traffic === 'HIGH' || traffic === 'VERY_HIGH') ? 0.18 : 0.12,
    Scalability:      norm?.scalabilityRequired ? 0.18 : 0.12,
    Security:         (security === 'HIGH' || security === 'CRITICAL') ? 0.18 : 0.10,
    Cost:             budgetTier === 'STARTUP' ? 0.16 : 0.08,
    Complexity:       0.10,
    Maintainability:  0.10,
    DevelopmentSpeed: budgetTier === 'STARTUP' ? 0.10 : 0.08,
    Compatibility:    0.14,
  };

  // Normalize weights
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach((k) => (weights[k] = weights[k] / totalWeight));

  const overall = +Object.entries(criteria)
    .reduce((sum, [key, val]) => sum + val * weights[key], 0)
    .toFixed(2);

  // Strongest and weakest criterion
  const sorted = Object.entries(criteria).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];

  // Advantages & disadvantages (top 3 from constituent tech strengths/weaknesses)
  const allStrengths = techs.flatMap((t) => (t.strengths || []).slice(0, 2));
  const allWeaknesses = techs.flatMap((t) => (t.weaknesses || []).slice(0, 2));

  // Trade-offs based on criteria extremes
  const tradeoffs = [];
  if (criteria.Performance >= 8 && criteria.Cost <= 6)
    tradeoffs.push('High performance comes at higher infrastructure cost.');
  if (criteria.Scalability >= 8 && criteria.Complexity <= 6)
    tradeoffs.push('Strong scalability requires higher operational complexity.');
  if (criteria.Security >= 8 && criteria.DevelopmentSpeed <= 6)
    tradeoffs.push('High security standards slow development velocity.');
  if (criteria.Cost >= 8 && criteria.Performance <= 6)
    tradeoffs.push('Cost efficiency may constrain peak performance headroom.');
  if (tradeoffs.length === 0)
    tradeoffs.push('Balanced profile — no extreme trade-offs detected for this stack.');

  return {
    presetId: preset.id,
    name: preset.name,
    description: preset.description,
    tags: preset.tags,
    technologies: preset.technologies,
    criteria,
    overall,
    strongest,
    weakest,
    advantages: [...new Set(allStrengths)].slice(0, 4),
    disadvantages: [...new Set(allWeaknesses)].slice(0, 4),
    tradeoffs,
    appliedWeights: Object.fromEntries(
      Object.entries(weights).map(([k, v]) => [k, +(v * 100).toFixed(1)])
    ),
  };
};

// ─── Main Export ──────────────────────────────────────────────────────────
/**
 * compareArchitectures
 *
 * @param {string[]}  presetIds               IDs from ARCHITECTURE_PRESETS
 * @param {Object}    normalizedRequirements   Output of requirementAnalyzer
 * @returns {Object}  Comparison report
 */
export const compareArchitectures = async (presetIds, normalizedRequirements) => {
  // Validate preset IDs
  const validIds = presetIds.filter((id) => ARCHITECTURE_PRESETS[id]);
  if (validIds.length < 2) {
    throw new Error('Please select at least 2 valid architecture presets to compare.');
  }

  // Collect all unique technology names needed
  const neededNames = new Set();
  validIds.forEach((id) => {
    Object.values(ARCHITECTURE_PRESETS[id].technologies).forEach((name) => neededNames.add(name));
  });

  // Fetch from DB (case-insensitive)
  const techDocs = await Technology.find({ name: { $in: [...neededNames] } });
  const techMap = Object.fromEntries(techDocs.map((t) => [t.name, t]));

  // Score each preset
  const results = validIds
    .map((id) => scorePreset(ARCHITECTURE_PRESETS[id], techMap, normalizedRequirements))
    .filter(Boolean)
    .sort((a, b) => b.overall - a.overall);

  // Determine winner per criterion
  const criteriaWinners = {};
  CRITERIA.forEach((criterion) => {
    const best = results.reduce((top, r) =>
      (r.criteria[criterion] || 0) > (top.criteria[criterion] || 0) ? r : top
    );
    criteriaWinners[criterion] = best.presetId;
  });

  // Overall winner (highest overall score)
  const winner = results[0];

  // Important disclaimer metadata
  const disclaimer =
    'The highest overall score does not universally indicate the best architecture. ' +
    'The result depends on your specific requirements and the weights applied. ' +
    'Review per-criterion scores and trade-offs carefully before deciding.';

  return {
    presetIds: validIds,
    results,
    criteriaWinners,
    winner: { presetId: winner.presetId, name: winner.name, overall: winner.overall },
    criteria: CRITERIA,
    disclaimer,
    comparedAt: new Date().toISOString(),
  };
};
