/**
 * Architecture Traceability & ADR Service — Module 8+
 *
 * Provides:
 *   1. Stable Identifiers (FR-xxx, NFR-xxx, ADR-xxx)
 *   2. End-to-End Requirement-to-Architecture Traceability Matrix
 *   3. Architecture Decision Records (ADRs) Generator & Life-Cycle Management
 */

/**
 * Extracts and tags all requirements with formal identifiers.
 */
export const extractRequirementsWithIDs = (project) => {
  const reqs = project.requirements || {};
  const norm = reqs.normalizedRequirements || {};

  const functional = [];
  const nonFunctional = [];

  // ── Functional Requirements (FR-xxx) ──────────────────────────────────────
  let frIdx = 1;
  const addFR = (title, description, isRequired) => {
    functional.push({
      id: `FR-${String(frIdx++).padStart(3, '0')}`,
      title,
      description,
      isRequired,
      status: isRequired ? 'ACTIVE' : 'NOT_REQUIRED',
    });
  };

  addFR('User Authentication & Identity Management', 'Secure registration, login, JWT token issuance, and password hashing.', reqs.hasAuth ?? true);
  addFR('Payment Processing & Financial Ledger', 'Transactional order handling, PCI isolation, and payment gateway webhooks.', !!reqs.hasPayments);
  addFR('Digital Asset Upload & Object Storage', 'Secure ingestion, pre-signed upload URLs, and immutable blob persistence.', !!reqs.hasFileUploads);
  addFR('Full-Text Search & Catalog Discovery', 'Sub-second fuzzy querying, facet filtering, and inverted indexing.', !!reqs.hasSearch);
  addFR('Real-Time Bidirectional Event Streaming', 'Low-latency duplex communication, live status pushes, and socket room routing.', !!reqs.hasRealtime);
  addFR('Administrative Operations & RBAC', 'Privileged management portal, audit logging, and role-based permissions.', !!reqs.hasAdminPanel);
  addFR('Operational Analytics & Event Telemetry', 'User behavioral tracking, ingestion pipelines, and aggregation dashboards.', !!reqs.hasAnalytics);
  addFR('Multi-Channel Notification Dispatch', 'Transactional emails, SMS alerts, and web push notifications.', !!reqs.hasNotifications);

  // ── Non-Functional Requirements (NFR-xxx) ─────────────────────────────────
  let nfrIdx = 1;
  const addNFR = (title, target, category, description) => {
    nonFunctional.push({
      id: `NFR-${String(nfrIdx++).padStart(3, '0')}`,
      title,
      target,
      category,
      description,
    });
  };

  addNFR('System Throughput Capacity', `${norm.trafficLevel || 'MEDIUM'} traffic (${reqs.expectedUsers || '10,000+'} target users)`, 'Scalability', 'System must sustain peak request volume without degrading.');
  addNFR('Service Latency SLA', reqs.performanceReq || 'Standard (< 250ms p95)', 'Performance', 'End-to-end API response time under concurrent operational load.');
  addNFR('Availability & Uptime Guarantee', reqs.availabilityReq || '99.9%', 'Reliability', 'High availability target with automated failover and minimal downtime.');
  addNFR('Information Security & Compliance', reqs.securityReq || 'Standard', 'Security', 'Protection against OWASP Top 10, data encryption, and least-privilege RBAC.');
  addNFR('Compute Scalability Strategy', reqs.scalabilityReq || 'Horizontal', 'Scalability', 'Infrastructure elasticity mechanism for scaling compute instances.');
  addNFR('Operational Budget Target', reqs.budget || '$5k–$25k', 'Cost', 'Monthly infrastructure run-rate target ceiling.');
  addNFR('Geographic Delivery Scope', reqs.geographicScope || 'National', 'Networking', 'Edge content distribution and CDN latency optimization requirement.');

  return { functional, nonFunctional };
};

/**
 * Builds a bi-directional Traceability Matrix connecting requirements to architecture artifacts.
 */
export const buildTraceabilityMatrix = (project, { functional, nonFunctional }) => {
  const recs = project.recommendations?.recommendations || {};
  const reqLayers = project.recommendations?.requiredLayers || [];
  const matrix = [];

  const frontendTech = recs.Frontend?.recommended?.name || 'React';
  const backendTech = recs.Backend?.recommended?.name || 'Node.js';
  const dbTech = recs.Database?.recommended?.name || 'PostgreSQL';
  const cacheTech = recs.Cache?.recommended?.name || 'Redis';
  const cloudTech = recs.Cloud?.recommended?.name || 'AWS';

  // Map each active FR
  functional.filter((f) => f.isRequired).forEach((fr) => {
    let satisfyingTech = [];
    let layer = '';
    let evidence = '';

    if (fr.id === 'FR-001') {
      satisfyingTech = [backendTech, 'JWT', 'bcryptjs'];
      layer = 'Backend / API Gateway';
      evidence = 'JWT bearer token validation middleware with salted password hashing.';
    } else if (fr.id === 'FR-002') {
      satisfyingTech = [dbTech, backendTech];
      layer = 'Database / Transactions';
      evidence = `${dbTech} ACID transaction isolation and dedicated payment gateway adapter.`;
    } else if (fr.id === 'FR-003') {
      satisfyingTech = ['AWS S3 / Cloudflare R2', backendTech];
      layer = 'Object Storage';
      evidence = 'Pre-signed URL direct browser-to-bucket upload pipeline.';
    } else if (fr.id === 'FR-004') {
      satisfyingTech = [dbTech, 'Elasticsearch'];
      layer = 'Data Tier / Search';
      evidence = `${dbTech} indexing or dedicated search cluster integration.`;
    } else if (fr.id === 'FR-005') {
      satisfyingTech = ['Socket.io / WebSockets', cacheTech];
      layer = 'Real-time Transport';
      evidence = 'WebSocket duplex channel with Redis pub/sub multi-node sync.';
    } else if (fr.id === 'FR-006') {
      satisfyingTech = [frontendTech, backendTech];
      layer = 'Frontend / Authorization';
      evidence = 'Role-based route guards and administration controller endpoints.';
    } else {
      satisfyingTech = [backendTech, dbTech];
      layer = 'Application Core';
      evidence = 'Core service endpoints and relational schema tracking.';
    }

    matrix.push({
      requirementId: fr.id,
      title: fr.title,
      type: 'Functional',
      satisfyingTechnologies: satisfyingTech,
      architecturalLayer: layer,
      satisfactionStatus: 'SATISFIED',
      verificationEvidence: evidence,
    });
  });

  // Map each NFR
  nonFunctional.forEach((nfr) => {
    let satisfyingTech = [];
    let layer = '';
    let evidence = '';

    if (nfr.id === 'NFR-001') {
      satisfyingTech = [cloudTech, 'Load Balancer', cacheTech];
      layer = 'Infrastructure';
      evidence = `Multi-instance clustering and ${cacheTech} caching layer absorb peak request loads.`;
    } else if (nfr.id === 'NFR-002') {
      satisfyingTech = [cacheTech, 'CDN'];
      layer = 'Cache & Edge';
      evidence = 'Edge CDN caching and in-memory key-value lookups maintain low latency.';
    } else if (nfr.id === 'NFR-003') {
      satisfyingTech = [cloudTech, dbTech];
      layer = 'High Availability';
      evidence = 'Multi-AZ active/standby failover database cluster and health check probes.';
    } else if (nfr.id === 'NFR-004') {
      satisfyingTech = ['Helmet', 'Rate-Limiter', 'TLS 1.3'];
      layer = 'Security Middleware';
      evidence = 'HTTP security headers, strict IP rate limiters, and AES-256 volume encryption.';
    } else if (nfr.id === 'NFR-005') {
      satisfyingTech = ['Docker / Kubernetes / ECS'];
      layer = 'DevOps / Orchestration';
      evidence = 'Containerized micro-services with metric-driven auto-scaling policies.';
    } else {
      satisfyingTech = [cloudTech];
      layer = 'Operations';
      evidence = 'Right-sized resource allocation compliant with projected budget tier.';
    }

    matrix.push({
      requirementId: nfr.id,
      title: nfr.title,
      type: 'Non-Functional',
      satisfyingTechnologies: satisfyingTech,
      architecturalLayer: layer,
      satisfactionStatus: 'SATISFIED',
      verificationEvidence: evidence,
    });
  });

  return matrix;
};

/**
 * Deterministically generates standard Architecture Decision Records (ADRs).
 */
export const generateDefaultADRs = (project, { functional, nonFunctional }) => {
  const recs = project.recommendations?.recommendations || {};
  const dbTech = recs.Database?.recommended?.name || 'PostgreSQL';
  const backendTech = recs.Backend?.recommended?.name || 'Node.js';
  const cacheTech = recs.Cache?.recommended?.name || 'Redis';
  const frontendTech = recs.Frontend?.recommended?.name || 'React';

  const adrs = [
    {
      id: 'ADR-001',
      title: `Adoption of ${dbTech} as Primary Persistence Layer`,
      status: 'Accepted',
      context: 'The system requires persistent data storage that aligns with the specified data relationships, transaction integrity, and query patterns.',
      requirementReferences: ['NFR-001', 'NFR-003', 'FR-001'],
      alternativesConsidered: ['PostgreSQL', 'MongoDB', 'MySQL'],
      decisionRationale: `Selected ${dbTech} based on superior scoring for data integrity, active developer tooling, and compliance with the project's data schema requirements.`,
      positiveConsequences: ['Proven data consistency', 'Strong community support', 'Rich ecosystem of ORMs/ODMs'],
      negativeConsequences: ['Requires dedicated connection pool management under high concurrency bursts'],
      risksAndMitigations: 'Risk: Database connection exhaustion. Mitigation: Implement connection pooler (e.g. PgBouncer) and read replicas.',
      relatedComponents: ['Database Tier', 'Data Access Layer'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ADR-002',
      title: `Selection of ${backendTech} for Application API Services`,
      status: 'Accepted',
      context: 'The application requires a performant, maintainable server runtime capable of asynchronous I/O and RESTful / event-driven communications.',
      requirementReferences: ['NFR-001', 'NFR-002', 'FR-001'],
      alternativesConsidered: ['Node.js (Express)', 'Go (Gin)', 'Python (FastAPI)'],
      decisionRationale: `Selected ${backendTech} for rapid API delivery, extensive package ecosystem, and high developer velocity.`,
      positiveConsequences: ['Fast development iterations', 'Unified JavaScript/TypeScript language stack', 'Vast middleware ecosystem'],
      negativeConsequences: ['Single-threaded event loop requires careful avoidance of CPU-intensive synchronous blocks'],
      risksAndMitigations: 'Risk: Event loop blocking. Mitigation: Offload heavy data processing to background queue workers.',
      relatedComponents: ['Backend API', 'Controllers', 'Middleware Pipeline'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ADR-003',
      title: `Distributed In-Memory Caching Strategy using ${cacheTech}`,
      status: 'Accepted',
      context: 'To achieve target service latency SLA and avoid repeated database lookups for hot records, an in-memory cache layer is required.',
      requirementReferences: ['NFR-002', 'NFR-001'],
      alternativesConsidered: ['Redis', 'Memcached', 'In-Process Local Memory Cache'],
      decisionRationale: `${cacheTech} provides distributed key-value storage with atomic data structures, TTL eviction, and Pub/Sub capabilities.`,
      positiveConsequences: ['Sub-millisecond read access', 'Protection of primary database from read spikes', 'Session store capability'],
      negativeConsequences: ['Cache invalidation complexity', 'Additional infrastructure cost'],
      risksAndMitigations: 'Risk: Stale cache reads. Mitigation: Implement write-through caching and explicit TTL expirations.',
      relatedComponents: ['Cache Tier', 'Service Layer'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ADR-004',
      title: 'Stateless JWT Authentication and Role-Based Authorization',
      status: 'Accepted',
      context: 'The system must authenticate user sessions without maintaining server-side session state across horizontal instances.',
      requirementReferences: ['FR-001', 'NFR-004'],
      alternativesConsidered: ['Stateful Server Sessions (Redis/DB)', 'Stateless JWT Bearer Tokens', 'Session Cookies'],
      decisionRationale: 'Signed JWTs enable horizontal scaling of API nodes without shared session lookups on every request.',
      positiveConsequences: ['Seamless horizontal auto-scaling', 'Standard bearer token format for mobile and web clients'],
      negativeConsequences: ['Token revocation before expiration requires token blacklist or short TTL with refresh tokens'],
      risksAndMitigations: 'Risk: Stolen token replay. Mitigation: 15-minute access token lifespan with secure HttpOnly refresh token rotation.',
      relatedComponents: ['Auth Middleware', 'User Controller', 'Security Layer'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return adrs;
};
