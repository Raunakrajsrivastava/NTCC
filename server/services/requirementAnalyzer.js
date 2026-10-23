/**
 * Requirement Analyzer Service — Module 4
 *
 * Takes raw requirement form data and produces normalized,
 * structured flags used by the architecture recommendation engine.
 */

/**
 * Determine traffic level from user count and daily requests
 */
const deriveTrafficLevel = (expectedUsers, dailyRequests, rawTrafficLevel) => {
  if (rawTrafficLevel) return rawTrafficLevel;
  if (!expectedUsers && !dailyRequests) return 'LOW';

  const users = expectedUsers || 0;
  const requests = dailyRequests || 0;

  if (users >= 1_000_000 || requests >= 10_000_000) return 'VERY_HIGH';
  if (users >= 100_000 || requests >= 1_000_000) return 'HIGH';
  if (users >= 10_000 || requests >= 100_000) return 'MEDIUM';
  return 'LOW';
};

/**
 * Determine budget tier from budget string
 */
const deriveBudgetTier = (budget) => {
  if (!budget) return 'STARTUP';
  if (budget === '$100k+') return 'ENTERPRISE';
  if (budget === '$25k–$100k') return 'GROWTH';
  return 'STARTUP';
};

/**
 * Main analyzer — converts raw form data into normalized recommendation flags
 *
 * @param {Object} raw - Raw requirements form data
 * @returns {Object} normalizedRequirements
 */
export const analyzeRequirements = (raw) => {
  const {
    expectedUsers,
    dailyRequests,
    trafficLevel,
    hasRealtime,
    hasPayments,
    hasFileUploads,
    hasSearch,
    hasNotifications,
    hasAnalytics,
    hasAuth,
    hasAdminPanel,
    performanceReq,
    availabilityReq,
    securityReq,
    scalabilityReq,
    budget,
    teamSize,
    timeline,
    geographicScope,
    applicationType,
  } = raw;

  const derivedTrafficLevel = deriveTrafficLevel(expectedUsers, dailyRequests, trafficLevel);
  const budgetTier = deriveBudgetTier(budget);

  // Scalability
  const scalabilityRequired =
    scalabilityReq === 'Auto-scaling' ||
    scalabilityReq === 'Horizontal' ||
    derivedTrafficLevel === 'HIGH' ||
    derivedTrafficLevel === 'VERY_HIGH';

  // High availability
  const highAvailabilityRequired =
    availabilityReq === '99.99%' ||
    availabilityReq === '99.999%' ||
    derivedTrafficLevel === 'VERY_HIGH';

  // Security level
  let securityLevel = 'STANDARD';
  if (hasPayments || securityReq === 'Critical') securityLevel = 'CRITICAL';
  else if (securityReq === 'High' || hasAuth) securityLevel = 'HIGH';

  // Realtime infrastructure needed
  const realtimeRequired = Boolean(hasRealtime || hasNotifications);

  // Database type recommendation
  let recommendedDbType = 'RELATIONAL';
  if (applicationType === 'Microservices') recommendedDbType = 'POLYGLOT';
  else if (hasAnalytics || derivedTrafficLevel === 'VERY_HIGH') recommendedDbType = 'NOSQL_PRIMARY';

  // Caching recommended
  const cachingRequired =
    derivedTrafficLevel === 'HIGH' ||
    derivedTrafficLevel === 'VERY_HIGH' ||
    performanceReq === 'High Performance' ||
    performanceReq === 'Ultra Low Latency';

  // CDN recommended
  const cdnRequired =
    geographicScope === 'Global' ||
    hasFileUploads ||
    derivedTrafficLevel === 'VERY_HIGH';

  // Message queue recommended
  const messageQueueRequired =
    realtimeRequired ||
    derivedTrafficLevel === 'HIGH' ||
    derivedTrafficLevel === 'VERY_HIGH' ||
    applicationType === 'Microservices';

  // Team capacity factor
  const teamCapacity =
    !teamSize ? 'UNKNOWN'
    : teamSize <= 2 ? 'SOLO'
    : teamSize <= 5 ? 'SMALL'
    : teamSize <= 15 ? 'MEDIUM'
    : 'LARGE';

  return {
    trafficLevel: derivedTrafficLevel,
    scalabilityRequired,
    highAvailabilityRequired,
    securityLevel,
    realtimeRequired,
    cachingRequired,
    cdnRequired,
    messageQueueRequired,
    recommendedDbType,
    budgetTier,
    teamCapacity,
    hasPayments: Boolean(hasPayments),
    hasFileStorage: Boolean(hasFileUploads),
    hasSearch: Boolean(hasSearch),
    hasAnalytics: Boolean(hasAnalytics),
    analysisVersion: '1.0',
    analyzedAt: new Date().toISOString(),
  };
};
