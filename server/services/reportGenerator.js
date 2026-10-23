/**
 * Report Generator Service — Module 11 (Enhanced Architecture Decision Platform)
 *
 * Compiles a comprehensive 23-section Software Architecture Report document
 * synthesizing requirements, recommendations, HLD, LLD, diagrams, validation,
 * capacity planning, cost estimation, traceability matrix, and ADRs.
 */

import { generateHLD } from './hldGenerator.js';
import { generateLLD } from './lldGenerator.js';
import { generateDiagrams } from './diagramGenerator.js';
import { calculateCapacity, calculateCostEstimate } from './capacityCostService.js';
import { validateArchitecture } from './architectureValidator.js';
import { extractRequirementsWithIDs, buildTraceabilityMatrix, generateDefaultADRs } from './traceabilityService.js';

export const generateFinalReport = (project) => {
  const { projectName, description, applicationType, budget, expectedTraffic, expectedUsers, priority, status } = project;
  const reqs = project.requirements || {};
  const norm = reqs.normalizedRequirements || {};
  const recs = project.recommendations || {};
  const ai = project.aiExplanation || {};

  // Auto-generate design & diagrams if not present
  const hld = project.hld || generateHLD(project);
  const lld = project.lld || generateLLD(project);
  const diagrams = project.diagrams || generateDiagrams(project);

  // Compute capacity and costs
  const capacity = project.capacity || calculateCapacity(reqs);
  const costEstimate = project.costEstimate || calculateCostEstimate(capacity, recs);

  // Traceability & ADRs
  const { functional, nonFunctional } = extractRequirementsWithIDs(project);
  const traceabilityMatrix = project.traceability?.matrix || buildTraceabilityMatrix(project, { functional, nonFunctional });
  const adrs = project.adrs?.length ? project.adrs : generateDefaultADRs(project, { functional, nonFunctional });

  // Validation
  const validation = project.validation || validateArchitecture({
    ...project.toObject?.() || project,
    hld,
    lld,
    diagrams,
  });

  const topTechs = recs.recommendations || {};

  return {
    meta: {
      projectName,
      generatedAt: new Date().toISOString(),
      reportVersion: '2.0-Enterprise',
      totalSections: 23,
      validationStatus: validation.validationStatus,
      complianceScore: validation.complianceScore,
    },
    sections: {
      1: {
        id: 1,
        title: '1. Project Overview & Executive Summary',
        content: {
          projectName,
          description: description || 'No description provided.',
          applicationType: applicationType || 'Web App',
          priority: priority || 'Medium',
          status: status || 'Draft',
          complianceScore: `${validation.complianceScore}/100`,
          validationStatus: validation.validationStatus,
        },
      },
      2: {
        id: 2,
        title: '2. Raw Requirements & Scope',
        content: {
          applicationType: reqs.applicationType || applicationType,
          targetUsers: reqs.targetUsers || 'Not specified',
          expectedUsers: reqs.expectedUsers || expectedUsers || 'Not specified',
          dailyRequests: reqs.dailyRequests || 'Not specified',
          geographicScope: reqs.geographicScope || 'National',
          features: {
            authentication: Boolean(reqs.hasAuth),
            payments: Boolean(reqs.hasPayments),
            search: Boolean(reqs.hasSearch),
            fileUploads: Boolean(reqs.hasFileUploads),
            notifications: Boolean(reqs.hasNotifications),
            realtime: Boolean(reqs.hasRealtime),
            adminPanel: Boolean(reqs.hasAdminPanel),
            analytics: Boolean(reqs.hasAnalytics),
          },
        },
      },
      3: {
        id: 3,
        title: '3. Requirement Analysis & Formal Identifiers (FR / NFR)',
        content: {
          normalizedFlags: norm,
          functionalRequirements: functional,
          nonFunctionalRequirements: nonFunctional,
        },
      },
      4: {
        id: 4,
        title: '4. Recommended Technology Stack',
        content: Object.entries(topTechs).map(([category, data]) => ({
          category,
          recommended: data?.recommended?.name || '—',
          score: data?.recommended?.score || '—',
          description: data?.recommended?.description || '',
          advantages: data?.recommended?.advantages || [],
          disadvantages: data?.recommended?.disadvantages || [],
        })),
      },
      5: {
        id: 5,
        title: '5. Recommendation Scores & Applied Weights',
        content: {
          overallScore: recs.overallScore || 'N/A',
          scoringFormula: recs.scoringFormula || 'Score = Σ(CriterionScore × Weight) + CompatibilityBonus',
          appliedWeights: recs.appliedWeights || {},
          configuredWeights: recs.configuredWeights || {},
          engineReasons: recs.engineReasons || [],
        },
      },
      6: {
        id: 6,
        title: '6. AI Architecture Explanation',
        content: {
          summary: ai.architectureSummary || 'AI explanation generated based on deterministic rule engine.',
          technologyExplanation: ai.technologyExplanation || '',
          tradeoffs: ai.tradeoffs || [],
          isFallback: ai._isFallback || false,
        },
      },
      7: {
        id: 7,
        title: '7. Technology Alternatives & Trade-Offs',
        content: Object.entries(topTechs).map(([category, data]) => ({
          category,
          recommended: data?.recommended?.name,
          alternatives: (data?.alternatives || []).map((a) => ({
            name: a?.name,
            score: a?.score,
            justification: a?.comparisonJustification || `Scored lower than ${data?.recommended?.name}`,
          })),
        })),
      },
      8: {
        id: 8,
        title: '8. High-Level Design (HLD)',
        content: hld,
      },
      9: {
        id: 9,
        title: '9. Low-Level Design (LLD)',
        content: lld,
      },
      10: {
        id: 10,
        title: '10. System Architecture Diagram',
        content: { mermaidCode: diagrams.systemArchitecture },
      },
      11: {
        id: 11,
        title: '11. Data Flow Diagram (DFD)',
        content: { mermaidCode: diagrams.dataFlow },
      },
      12: {
        id: 12,
        title: '12. Entity Relationship (ER) Diagram',
        content: { mermaidCode: diagrams.entityRelationship },
      },
      13: {
        id: 13,
        title: '13. Activity & Component Diagram',
        content: { mermaidCode: diagrams.activity || diagrams.componentDiagram },
      },
      14: {
        id: 14,
        title: '14. Database Design & Schemas',
        content: {
          primaryDatabase: topTechs.Database?.recommended?.name || 'PostgreSQL',
          entities: lld.databaseEntities || [],
          relationships: lld.entityRelationships || [],
        },
      },
      15: {
        id: 15,
        title: '15. API Design & Endpoint Contracts',
        content: lld.apiEndpoints || [],
      },
      16: {
        id: 16,
        title: '16. Authentication & Session Management',
        content: {
          strategy: 'JSON Web Token (JWT) with HTTP Bearer Authorization',
          flow: lld.authenticationSequence || [],
        },
      },
      17: {
        id: 17,
        title: '17. Security Posture & Architecture Validation (VAL)',
        content: {
          securityLevel: norm.securityLevel || 'STANDARD',
          validationStatus: validation.validationStatus,
          complianceScore: validation.complianceScore,
          criticalFindingsCount: validation.summary.criticalCount,
          findings: validation.findings.map((f) => ({
            id: f.findingId,
            category: f.category,
            severity: f.severity,
            status: f.status,
            description: f.description,
            remediation: f.remediation,
          })),
        },
      },
      18: {
        id: 18,
        title: '18. Scalability, High Availability & Disaster Recovery',
        content: {
          trafficLevel: norm.trafficLevel || 'LOW',
          scalabilityRequired: norm.scalabilityRequired || false,
          cachingStrategy: norm.cachingRequired ? 'Redis cluster for hot data caching' : 'Local memory caching',
          cdnStrategy: norm.cdnRequired ? 'Global Cloudflare CDN for static assets' : 'Single region web server',
          disasterRecovery: {
            rpo: '15 minutes (automated continuous WAL / binary log archiving)',
            rto: '30 minutes (multi-AZ automated container recreation & DB failover)',
          },
        },
      },
      19: {
        id: 19,
        title: '19. Deployment Architecture & Orchestration',
        content: hld.deploymentArchitecture || {},
      },
      20: {
        id: 20,
        title: '20. Capacity Planning & Infrastructure Cost Estimation',
        content: {
          capacityMetrics: capacity.metrics,
          formulas: capacity.formulas,
          costTiers: costEstimate.scenarios,
          costDrivers: costEstimate.costDrivers,
        },
      },
      21: {
        id: 21,
        title: '21. Architecture Traceability Matrix',
        content: {
          matrix: traceabilityMatrix,
          adrs: adrs.map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status,
            decisionRationale: a.decisionRationale,
            requirementReferences: a.requirementReferences,
          })),
        },
      },
      22: {
        id: 22,
        title: '22. System Limitations & Risks',
        content: ai.risks || [
          'Initial setup complexity requires DevOps automation.',
          'Database read replica sync delay under heavy burst loads.',
          'Cache invalidation consistency across horizontally autoscaled nodes.',
        ],
      },
      23: {
        id: 23,
        title: '23. Future Improvements & Roadmap',
        content: ai.improvementSuggestions || [
          'Introduce GraphQL federation gateway for client query optimization.',
          'Implement automated blue/green deployment pipeline with canary verification.',
          'Integrate OpenTelemetry distributed tracing across microservices.',
        ],
      },
    },
  };
};

/**
 * Generates a clean, well-formatted Markdown document from the 23-section report.
 */
export const generateReportMarkdown = (report) => {
  const { meta, sections } = report;
  let md = `# Software Architecture Specification: ${meta.projectName}\n\n`;
  md += `> **Generated**: ${new Date(meta.generatedAt).toLocaleString()} | **Version**: ${meta.reportVersion} | **Compliance Score**: ${meta.complianceScore}/100\n\n---\n\n`;

  for (let i = 1; i <= 23; i++) {
    const section = sections[i];
    if (!section) continue;
    md += `## ${section.title}\n\n`;
    if (typeof section.content === 'string') {
      md += `${section.content}\n\n`;
    } else {
      md += '```json\n' + JSON.stringify(section.content, null, 2) + '\n```\n\n';
    }
  }

  return md;
};
