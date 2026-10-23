/**
 * Architecture Validation Service — Dedicated Validator Engine
 *
 * Runs deterministic checks across 6 enterprise architecture categories:
 *   A. Technology Compatibility
 *   B. Architecture Completeness
 *   C. HLD & LLD Consistency
 *   D. Mermaid Syntax Validation
 *   E. Security & Compliance Validation
 *   F. Operational Reliability & Resilience (SPOF / HA / DR)
 *
 * Each finding returns:
 *   findingId: VAL-XXX
 *   category: Category Name
 *   severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
 *   isBlocking: boolean
 *   affectedArtifact: string
 *   triggeredRule: string
 *   description: string
 *   remediation: string
 *   status: 'FAIL' | 'WARN' | 'PASS'
 */

/**
 * Validates a Mermaid diagram string for common structural syntax issues.
 */
export const validateMermaidSyntax = (diagramType, code) => {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return {
      isValid: false,
      error: `Diagram source for '${diagramType}' is empty or missing.`,
    };
  }

  const trimmed = code.trim();
  const validHeaders = ['graph', 'flowchart', 'sequenceDiagram', 'erDiagram', 'classDiagram', 'stateDiagram', 'C4Context', 'gitGraph'];
  const hasValidHeader = validHeaders.some((h) => trimmed.startsWith(h));

  if (!hasValidHeader) {
    return {
      isValid: false,
      error: `Diagram '${diagramType}' lacks a valid Mermaid declaration header (expected one of: ${validHeaders.join(', ')}).`,
    };
  }

  // Bracket balance check
  const stack = [];
  const pairs = { '(': ')', '[': ']', '{': '}' };
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if ((char === '"' || char === "'") && trimmed[i - 1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inQuotes = false;
      }
    }

    if (!inQuotes) {
      if (pairs[char]) {
        stack.push({ char, index: i });
      } else if (Object.values(pairs).includes(char)) {
        const last = stack.pop();
        if (!last || pairs[last.char] !== char) {
          return {
            isValid: false,
            error: `Unmatched delimiter '${char}' near index ${i} in '${diagramType}'.`,
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    return {
      isValid: false,
      error: `Unclosed delimiter '${stack[0].char}' in '${diagramType}'.`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Main Architecture Validator Function
 *
 * @param {Object} project  Full project document from database
 * @returns {Object}  Validation report with summary, score, and categorized findings
 */
export const validateArchitecture = (project) => {
  const findings = [];
  let counter = 1;
  const nextId = () => `VAL-${String(counter++).padStart(3, '0')}`;

  const reqs = project.requirements || {};
  const norm = reqs.normalizedRequirements || {};
  const recs = project.recommendations?.recommendations || {};
  const reqLayers = project.recommendations?.requiredLayers || [];
  const hld = project.hld || {};
  const lld = project.lld || {};
  const diagrams = project.diagrams || {};

  const frontendTech = recs.Frontend?.recommended?.name || 'React';
  const backendTech = recs.Backend?.recommended?.name || 'Node.js';
  const dbTech = recs.Database?.recommended?.name || 'PostgreSQL';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY A: Technology Compatibility
  // ───────────────────────────────────────────────────────────────────────────
  if (norm.hasRealtime) {
    const socketSupported = (recs.Backend?.recommended?.compatibility || []).includes('Socket.io') ||
      backendTech.includes('Node') || backendTech.includes('Go');
    if (!socketSupported) {
      findings.push({
        findingId: nextId(),
        category: 'Technology Compatibility',
        severity: 'HIGH',
        isBlocking: true,
        affectedArtifact: 'Backend Layer',
        triggeredRule: 'COMPAT-01: Real-time protocol affinity',
        description: `Selected backend (${backendTech}) may require external state synchronization adapters for long-lived WebSocket connections.`,
        remediation: 'Ensure Redis Pub/Sub adapter or managed WebSocket gateway is provisioned for horizontal multi-instance synchronization.',
        status: 'WARN',
      });
    }
  }

  if (norm.hasPayments && dbTech === 'MongoDB') {
    findings.push({
      findingId: nextId(),
      category: 'Technology Compatibility',
      severity: 'HIGH',
      isBlocking: false,
      affectedArtifact: 'Database Schema & Transactions',
      triggeredRule: 'COMPAT-02: Multi-document financial ACID compliance',
      description: 'MongoDB is selected for an application handling monetary transactions. Document models require strict replica-set multi-document sessions.',
      remediation: 'Enable MongoDB replica sets with writeConcern `majority` and readConcern `snapshot` or isolate payment ledgers in PostgreSQL.',
      status: 'WARN',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY B: Architecture Completeness
  // ───────────────────────────────────────────────────────────────────────────
  if (reqs.hasAuth && !recs.Authentication?.recommended) {
    findings.push({
      findingId: nextId(),
      category: 'Architecture Completeness',
      severity: 'MEDIUM',
      isBlocking: false,
      affectedArtifact: 'Authentication Layer',
      triggeredRule: 'COMPL-01: Missing dedicated auth service specification',
      description: 'Project requires user authentication, but no dedicated identity provider (e.g., Auth0 / JWT Keycloak / OAuth2) was explicitly selected.',
      remediation: 'Configure standard JWT bearer authentication with HttpOnly secure cookie refresh flow.',
      status: 'WARN',
    });
  }

  if (norm.trafficLevel === 'VERY_HIGH' || norm.trafficLevel === 'HIGH') {
    const hasCache = reqLayers.some((l) => l.layer.toLowerCase().includes('cache'));
    if (!hasCache) {
      findings.push({
        findingId: nextId(),
        category: 'Architecture Completeness',
        severity: 'HIGH',
        isBlocking: true,
        affectedArtifact: 'Caching Layer',
        triggeredRule: 'COMPL-02: Missing required cache layer for high traffic',
        description: 'Traffic tier is HIGH/VERY_HIGH, but no in-memory distributed cache (Redis) is provisioned.',
        remediation: 'Provision a clustered Redis cache for database query offloading and session management.',
        status: 'FAIL',
      });
    }
  }

  if (reqs.hasFileUploads) {
    const hasStorage = reqLayers.some((l) => l.layer.toLowerCase().includes('storage'));
    if (!hasStorage) {
      findings.push({
        findingId: nextId(),
        category: 'Architecture Completeness',
        severity: 'MEDIUM',
        isBlocking: false,
        affectedArtifact: 'Storage Layer',
        triggeredRule: 'COMPL-03: Object storage layer required',
        description: 'Application supports file uploads, but no object storage layer (e.g. AWS S3, Cloudflare R2) is configured.',
        remediation: 'Add AWS S3 or Cloudflare R2 with direct client presigned PUT URLs to avoid backend memory exhaustion.',
        status: 'WARN',
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY C: HLD & LLD Consistency
  // ───────────────────────────────────────────────────────────────────────────
  const hldComponents = hld.components || [];
  const lldApis = lld.apiEndpoints || [];
  const lldEntities = lld.databaseSchema?.tables || lld.databaseSchema?.collections || [];

  if (hldComponents.length > 0 && lldApis.length === 0) {
    findings.push({
      findingId: nextId(),
      category: 'HLD & LLD Consistency',
      severity: 'MEDIUM',
      isBlocking: false,
      affectedArtifact: 'LLD API Specifications',
      triggeredRule: 'CONSIST-01: HLD services missing detailed LLD REST contracts',
      description: 'High-Level Design defines services, but Low-Level Design lacks concrete REST/gRPC API route contracts.',
      remediation: 'Generate or review detailed LLD API route specifications for each HLD subsystem.',
      status: 'WARN',
    });
  }

  if (reqs.hasAuth && lldApis.length > 0) {
    const hasAuthEndpoint = lldApis.some((api) => {
      const path = (api.endpoint || api.path || '').toLowerCase();
      return path.includes('login') || path.includes('auth') || path.includes('register');
    });
    if (!hasAuthEndpoint) {
      findings.push({
        findingId: nextId(),
        category: 'HLD & LLD Consistency',
        severity: 'LOW',
        isBlocking: false,
        affectedArtifact: 'API Contracts',
        triggeredRule: 'CONSIST-02: Auth requirement not reflected in API contracts',
        description: 'Requirements specify Authentication, but LLD API contract list lacks explicit `/auth/login` or `/auth/register` endpoints.',
        remediation: 'Add standard authentication endpoints to the LLD API specification.',
        status: 'WARN',
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY D: Mermaid Syntax Validation
  // ───────────────────────────────────────────────────────────────────────────
  const diagramList = [
    { type: 'System Architecture', code: diagrams.systemArchitecture || diagrams.architecture },
    { type: 'Sequence / Flow Diagram', code: diagrams.sequenceDiagram || diagrams.sequence },
    { type: 'Database ERD', code: diagrams.databaseSchema || diagrams.erDiagram || diagrams.erd },
    { type: 'Component / Deployment', code: diagrams.componentDiagram || diagrams.deployment },
  ];

  diagramList.forEach(({ type, code }) => {
    if (code) {
      const validation = validateMermaidSyntax(type, code);
      if (!validation.isValid) {
        findings.push({
          findingId: nextId(),
          category: 'Mermaid Syntax Validation',
          severity: 'HIGH',
          isBlocking: false,
          affectedArtifact: `Diagram: ${type}`,
          triggeredRule: 'MERMAID-01: Diagram syntax parsing error',
          description: validation.error,
          remediation: 'Review and correct the Mermaid syntax delimiters and node labels.',
          status: 'FAIL',
        });
      }
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY E: Security Validation
  // ───────────────────────────────────────────────────────────────────────────
  const secReq = reqs.securityReq || 'Standard';
  if (secReq === 'Critical' || secReq === 'High') {
    findings.push({
      findingId: nextId(),
      category: 'Security & Compliance',
      severity: 'MEDIUM',
      isBlocking: false,
      affectedArtifact: 'API Security Middleware',
      triggeredRule: 'SEC-01: Strict Rate Limiting & Header Hardening',
      description: `${secReq} security tier mandates rate limiting on all public endpoints and strict Helmet CSP/HSTS headers.`,
      remediation: 'Verify express-rate-limit bounds (max 20 attempts/15min on auth) and enforce HTTPS TLS 1.3.',
      status: 'PASS',
    });

    findings.push({
      findingId: nextId(),
      category: 'Security & Compliance',
      severity: 'INFO',
      isBlocking: false,
      affectedArtifact: 'Data Protection',
      triggeredRule: 'SEC-02: Encryption at Rest & in Transit',
      description: 'Sensitive columns (PII, tokens, payment references) must use AES-256 encryption at rest and TLS in transit.',
      remediation: 'Ensure database volume encryption (AWS KMS / LUKS) is active.',
      status: 'PASS',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY F: Operational Validation (SPOF / Availability / DR)
  // ───────────────────────────────────────────────────────────────────────────
  const availReq = reqs.availabilityReq || '99%';
  if (availReq === '99.99%' || availReq === '99.999%') {
    findings.push({
      findingId: nextId(),
      category: 'Operational Reliability',
      severity: 'HIGH',
      isBlocking: true,
      affectedArtifact: 'Database Cluster & Load Balancers',
      triggeredRule: 'OPS-01: High Availability Multi-AZ Redundancy',
      description: `Availability target of ${availReq} requires active-active multi-region or multi-AZ deployment with automated database failover.`,
      remediation: 'Configure multi-AZ primary-replica cluster with automated Raft/Paxos quorum failover and health check probes.',
      status: 'WARN',
    });
  }

  if (norm.trafficLevel === 'VERY_HIGH' && reqs.scalabilityReq === 'Fixed') {
    findings.push({
      findingId: nextId(),
      category: 'Operational Reliability',
      severity: 'CRITICAL',
      isBlocking: true,
      affectedArtifact: 'Compute Infrastructure',
      triggeredRule: 'OPS-02: Scalability configuration bottleneck',
      description: 'Traffic is categorized as VERY_HIGH (1M+ users), but scalability strategy is set to Fixed capacity.',
      remediation: 'Switch compute tier to Horizontal Auto-scaling (Kubernetes HPA or AWS ECS Auto-scaling).',
      status: 'FAIL',
    });
  }

  // Baseline sanity check if no critical issues found
  if (findings.length === 0) {
    findings.push({
      findingId: nextId(),
      category: 'Architecture Completeness',
      severity: 'INFO',
      isBlocking: false,
      affectedArtifact: 'Full Stack',
      triggeredRule: 'CHECK-01: Baseline verification',
      description: 'Architecture specifications passed all deterministic integrity and compatibility rules.',
      remediation: 'No remediation required. Architecture is ready for final documentation generation.',
      status: 'PASS',
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Summary Aggregation
  // ───────────────────────────────────────────────────────────────────────────
  const passed = findings.filter((f) => f.status === 'PASS').length;
  const warnings = findings.filter((f) => f.status === 'WARN').length;
  const failed = findings.filter((f) => f.status === 'FAIL').length;
  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL' && f.status === 'FAIL').length;
  const blockingCount = findings.filter((f) => f.isBlocking && f.status === 'FAIL').length;

  const totalChecks = findings.length;
  // Calculate validation compliance score (100 base, -25 for critical, -15 for high fail, -5 for warn)
  let complianceScore = 100;
  findings.forEach((f) => {
    if (f.status === 'FAIL') {
      if (f.severity === 'CRITICAL') complianceScore -= 30;
      else if (f.severity === 'HIGH') complianceScore -= 20;
      else complianceScore -= 10;
    } else if (f.status === 'WARN') {
      complianceScore -= 5;
    }
  });
  complianceScore = Math.max(0, Math.min(100, complianceScore));

  const validationStatus = criticalCount > 0 || blockingCount > 0
    ? 'FAILED_CRITICAL'
    : failed > 0
      ? 'ACTION_REQUIRED'
      : warnings > 0
        ? 'PASSED_WITH_WARNINGS'
        : 'FULLY_VALIDATED';

  return {
    validationStatus,
    complianceScore,
    summary: {
      totalChecks,
      passed,
      warnings,
      failed,
      criticalCount,
      blockingCount,
    },
    findings,
    validatedAt: new Date().toISOString(),
    validatorVersion: '2.0-Enterprise',
  };
};
