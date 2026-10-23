/**
 * High-Level Design (HLD) Generator — Module 9
 *
 * Generates structured High-Level System Architecture Design based on
 * project requirements and recommended technology choices.
 */

export const generateHLD = (project) => {
  const { projectName, applicationType, requirements, recommendations } = project;
  const norm = requirements?.normalizedRequirements || {};
  const recs = recommendations?.recommendations || {};

  const frontendTech = recs.Frontend?.recommended?.name || 'React';
  const backendTech = recs.Backend?.recommended?.name || 'Node.js / Express';
  const databaseTech = recs.Database?.recommended?.name || 'PostgreSQL';
  const cacheTech = recs.Cache?.recommended?.name || 'Redis';
  const storageTech = recs.Storage?.recommended?.name || 'S3-Compatible Object Storage';
  const cloudTech = recs.Cloud?.recommended?.name || 'AWS';
  const devopsTech = recs.DevOps?.recommended?.name || 'Docker & Kubernetes';

  return {
    overview: {
      projectName,
      applicationType: applicationType || 'Web App',
      architecturalPattern: norm.trafficLevel === 'VERY_HIGH' ? 'Microservices & Event-Driven' : 'Modular Monolith with Tiered Services',
      targetScale: `${norm.trafficLevel || 'LOW'} traffic level, ${norm.scalabilityRequired ? 'Auto-scaling enabled' : 'Fixed instance pool'}`,
      securityPosture: `${norm.securityLevel || 'STANDARD'} Security Tier`,
    },
    clientTier: {
      type: 'Multi-device Client Layer',
      supportedClients: [
        'Desktop Web Browsers (Chrome, Firefox, Safari, Edge)',
        'Mobile Responsive Web Browsers',
        ...(applicationType === 'Mobile App' ? ['iOS Native & Android Native Applications'] : []),
      ],
      communicationProtocol: norm.realtimeRequired ? 'HTTPS (REST) + WebSockets (WSS)' : 'HTTPS (REST APIs)',
    },
    frontendTier: {
      technology: frontendTech,
      renderingStrategy: frontendTech === 'Next.js' ? 'Server-Side Rendering (SSR) & Static Site Generation (SSG)' : 'Single Page Application (SPA) with Client-Side Rendering',
      stateManagement: 'Context API / Redux Toolkit with local persistent storage',
      cdnDistribution: norm.cdnRequired ? 'Global Content Delivery Network (Cloudflare / CloudFront) for static assets' : 'Standard Web Server Asset Delivery',
    },
    apiGatewayLayer: {
      technology: 'API Gateway / Reverse Proxy (Nginx / Cloudflare)',
      responsibilities: [
        'SSL/TLS Termination',
        'Request Routing & Load Balancing',
        'Rate Limiting & DDoS Mitigation',
        'CORS and Security Header Management',
        'Authentication Token Forwarding',
      ],
    },
    backendTier: {
      technology: backendTech,
      architecturePattern: norm.trafficLevel === 'VERY_HIGH' ? 'Decoupled Microservices' : 'Layered MVC / Service-Repository Pattern',
      keyModules: [
        'Authentication & Access Control Module',
        'Core Business Domain Processing Engine',
        'Notification & Event Dispatcher',
        'Audit Logging & Telemetry Collector',
      ],
      concurrencyModel: backendTech.includes('Node') ? 'Asynchronous Non-blocking Event Loop' : 'Multithreaded Worker Pool',
    },
    databaseLayer: {
      technology: databaseTech,
      databaseType: norm.recommendedDbType || 'RELATIONAL',
      replicationStrategy: norm.highAvailabilityRequired ? 'Primary-Replica Read Scaling with Auto-Failover' : 'Single Instance with Automated Backups',
      backupPolicy: 'Daily Automated Snapshots with Point-In-Time Recovery (PITR)',
    },
    cachingLayer: {
      technology: cacheTech,
      enabled: Boolean(norm.cachingRequired || norm.trafficLevel === 'HIGH' || norm.trafficLevel === 'VERY_HIGH'),
      useCases: [
        'Session State & JWT Revocation List',
        'Hot Database Query Response Caching',
        'API Rate Limit Counters',
        'Real-time Temporary State Storage',
      ],
    },
    storageLayer: {
      technology: storageTech,
      enabled: Boolean(norm.hasFileStorage),
      type: 'Distributed Object Storage',
      useCases: ['User Uploaded Media & Documents', 'Exported Reports & PDF Downloads', 'System Logs & Backups'],
    },
    externalServices: [
      ...(norm.hasPayments ? [{ name: 'Stripe / PayPal API', purpose: 'Payment Processing & Subscription Billing' }] : []),
      ...(norm.realtimeRequired ? [{ name: 'Socket.io Signal Server / Pusher', purpose: 'Real-time Event Broadcasting' }] : []),
      { name: 'SMTP / SendGrid', purpose: 'Transactional Email Delivery' },
    ],
    deploymentArchitecture: {
      cloudProvider: cloudTech,
      containerization: devopsTech,
      ciCdPipeline: 'GitHub Actions / GitLab CI with automated unit tests & container push',
      monitoring: 'Prometheus & Grafana for infrastructure metrics, Sentry for error tracking',
    },
    generatedAt: new Date().toISOString(),
  };
};
