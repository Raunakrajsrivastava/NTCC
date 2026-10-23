/**
 * Capacity Planning and Infrastructure Cost Estimation Service — Module 7+
 *
 * Deterministic mathematical models for:
 *   1. System Throughput & Capacity Planning (Little's Law, peak multipliers, bandwidth, memory)
 *   2. Infrastructure Cost Projection across Low, Expected, and High utilization tiers.
 */

/**
 * Calculates system capacity projections based on project requirements.
 *
 * @param {Object} requirements - Normalized project requirements
 * @returns {Object} Capacity estimation report with transparent formulas and assumptions
 */
export const calculateCapacity = (requirements = {}) => {
  const norm = requirements.normalizedRequirements || {};
  const rawUsers = requirements.expectedUsers || 10000;
  const rawRequests = requirements.dailyRequests || Math.max(10000, rawUsers * 25);
  const trafficLevel = norm.trafficLevel || 'MEDIUM';
  const performanceReq = requirements.performanceReq || 'Standard';
  const hasFiles = !!requirements.hasFileUploads;
  const hasRealtime = !!requirements.hasRealtime;

  // 1. Throughput calculations
  const dailyRequests = Number(rawRequests);
  const avgQPS = +(dailyRequests / 86400).toFixed(2);

  // Peak multiplier varies by workload burstiness
  const peakMultiplier = trafficLevel === 'VERY_HIGH' ? 4.0 : trafficLevel === 'HIGH' ? 3.0 : 2.5;
  const peakQPS = +(avgQPS * peakMultiplier).toFixed(2);

  // Target service latency SLA in seconds
  const targetLatencySec = performanceReq === 'Ultra Low Latency' ? 0.05 : performanceReq === 'High Performance' ? 0.15 : 0.30;

  // Little's Law: Concurrent active in-flight requests (L = λ × W)
  const concurrentInFlightRequests = Math.max(5, Math.ceil(peakQPS * targetLatencySec));

  // WebSocket concurrency if real-time enabled
  const estimatedConcurrentSockets = hasRealtime ? Math.ceil(rawUsers * 0.05) : 0;

  // 2. Storage & Bandwidth estimation
  // Average HTTP payload size (KB)
  const avgPayloadKB = hasFiles ? 45 : 12;
  const monthlyDataTransferGB = +(
    (dailyRequests * avgPayloadKB * 30) /
    (1024 * 1024)
  ).toFixed(2);

  // Storage growth per month (GB)
  let monthlyStorageGrowthGB = 0;
  if (hasFiles) {
    // Assume 3% of requests upload files averaging 500KB
    monthlyStorageGrowthGB += (dailyRequests * 0.03 * 500 * 30) / (1024 * 1024);
  }
  // Database record inserts (assume 1KB per audit/transaction record, 15% write ratio)
  monthlyStorageGrowthGB += (dailyRequests * 0.15 * 1.5 * 30) / (1024 * 1024);
  monthlyStorageGrowthGB = +Math.max(1.0, monthlyStorageGrowthGB).toFixed(2);

  // 3. Cache sizing (Pareto principle: 20% hot working set cached)
  const workingSetGB = monthlyStorageGrowthGB * 0.20;
  const recommendedCacheRAM_GB = Math.max(2, Math.ceil(workingSetGB / 2) * 2);

  // 4. Compute node capacity
  // Safe throughput capacity per backend application node (e.g. 2 vCPU / 4GB RAM Node/Go container)
  const safeQpsPerContainer = performanceReq === 'Ultra Low Latency' ? 300 : 200;
  const recommendedComputeInstances = Math.max(2, Math.ceil(peakQPS / safeQpsPerContainer));

  // 5. Database IOPS projection
  const estimatedDbReadWriteIOPS = Math.max(100, Math.ceil(peakQPS * 1.2));

  return {
    trafficLevel,
    metrics: {
      dailyRequests,
      avgQPS,
      peakMultiplier,
      peakQPS,
      targetLatencySec,
      concurrentInFlightRequests,
      estimatedConcurrentSockets,
      avgPayloadKB,
      monthlyDataTransferGB,
      monthlyStorageGrowthGB,
      recommendedCacheRAM_GB,
      recommendedComputeInstances,
      estimatedDbReadWriteIOPS,
    },
    formulas: {
      avgQPS: 'DailyRequests ÷ 86,400 seconds',
      peakQPS: 'AvgQPS × PeakBurstMultiplier (2.5x - 4.0x)',
      concurrentRequests: "Little's Law: L = PeakQPS × TargetServiceLatency(s)",
      storageGrowth: 'Sum(File Upload Vol + DB Ingestion Vol) over 30 days',
      cacheSizing: '20% Hot-Tier Working Set (Pareto Principle, min 2GB)',
      computeNodes: 'PeakQPS ÷ SafeContainerCapacity (min 2 for High Availability)',
    },
    bottleneckWatchlist: [
      peakQPS > 1000 ? 'Database connection pool saturation under burst traffic — connection pooling (PgBouncer) essential.' : null,
      hasFiles ? 'Direct file streaming to application memory — use direct-to-S3 pre-signed upload URLs.' : null,
      hasRealtime ? 'Node.js event-loop contention with high concurrent WebSockets — cluster mode or Go WebSocket gateway recommended.' : null,
      'Cold starts if serverless compute is selected for high-traffic write paths.',
    ].filter(Boolean),
  };
};

/**
 * Calculates estimated infrastructure costs across Low, Expected, and High utilization scenarios.
 *
 * @param {Object} capacityReport - Output of calculateCapacity
 * @param {Object} recommendations - Project recommendations
 * @returns {Object} Infrastructure cost estimation breakdown
 */
export const calculateCostEstimate = (capacityReport, recommendations = {}) => {
  const metrics = capacityReport?.metrics || {};
  const instances = metrics.recommendedComputeInstances || 2;
  const cacheGB = metrics.recommendedCacheRAM_GB || 2;
  const storageGB = metrics.monthlyStorageGrowthGB || 10;
  const egressGB = metrics.monthlyDataTransferGB || 50;

  // Illustrative unit costs based on AWS/GCP standard cloud pricing benchmarks
  // Compute: ~$35/mo per 2vCPU/4GB instance
  // Managed DB: Small ~$40/mo, Medium ~$110/mo, Large ~$280/mo
  // Redis: ~$25/mo per 2GB managed cluster
  // S3: ~$0.023/GB/mo
  // Egress: ~$0.08/GB after 100GB free tier
  // Monitoring + APM: ~$30/mo base
  // Load Balancer: ~$22/mo

  const calculateTier = (multiplier, label) => {
    const computeInstances = Math.max(2, Math.round(instances * multiplier));
    const computeCost = computeInstances * 35;
    const dbCost = Math.round(75 * multiplier);
    const cacheCost = Math.max(25, Math.round((cacheGB / 2) * 25 * multiplier));
    const storageCost = Math.max(5, Math.round(storageGB * 12 * 0.023 * multiplier));
    const billableEgress = Math.max(0, egressGB * multiplier - 100);
    const egressCost = Math.round(billableEgress * 0.08);
    const networkingCost = 25; // ALB + DNS
    const observabilityCost = Math.round(30 * multiplier);

    const monthlyTotal = computeCost + dbCost + cacheCost + storageCost + egressCost + networkingCost + observabilityCost;
    const annualTotal = monthlyTotal * 12;

    return {
      tier: label,
      monthlyTotal,
      annualTotal,
      breakdown: {
        compute: { label: `${computeInstances}x Application Containers (2 vCPU / 4GB)`, cost: computeCost },
        database: { label: 'Managed Primary + Replica DB Cluster', cost: dbCost },
        cache: { label: `Managed In-Memory Cache (${cacheGB}GB)`, cost: cacheCost },
        objectStorage: { label: 'S3-compatible Blob Storage & Backups', cost: storageCost },
        bandwidth: { label: `Egress Data Transfer (~${Math.round(egressGB * multiplier)}GB/mo)`, cost: egressCost },
        loadBalancing: { label: 'Application Load Balancer & Edge SSL', cost: networkingCost },
        observability: { label: 'Centralized Logging, Metrics & Sentry APM', cost: observabilityCost },
      },
    };
  };

  const lowScenario = calculateTier(0.7, 'Low (Cost-Optimized)');
  const expectedScenario = calculateTier(1.0, 'Expected (Standard Production)');
  const highScenario = calculateTier(1.8, 'High (Peak Burst & Redundancy)');

  return {
    pricingSource: 'AWS / Cloudflare 2026 Reference Benchmarks (Illustrative Estimations)',
    currency: 'USD',
    scenarios: {
      low: lowScenario,
      expected: expectedScenario,
      high: highScenario,
    },
    costDrivers: [
      'Application compute instances to absorb peak traffic without request queuing',
      'High-availability database replica cluster and automated snapshots',
      'In-memory cache footprint sized for 20% hot-data working set',
      'Outbound egress bandwidth for media or heavy JSON payload delivery',
    ],
    generatedAt: new Date().toISOString(),
  };
};
