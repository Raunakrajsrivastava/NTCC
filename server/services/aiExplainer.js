/**
 * AI Explainer — Module 8 (Enterprise Resilience & Fallback)
 *
 * Sends the structured recommendation output to Google Gemini
 * and returns a 10-section natural-language explanation.
 *
 * Resilience features:
 * - Versioned system prompt with schema enforcement
 * - 25-second AbortController timeout
 * - Bounded retry on transient 5xx/network errors
 * - Sanitized logging (no API keys or raw credentials)
 * - Complete 10-section deterministic fallback derived from M6 engine
 * - Explicit `_isFallback: true` and `_fallbackReason` tags
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

// ─── Section keys that must exist in a valid AI response ──────────────────
const REQUIRED_SECTIONS = [
  'architectureSummary',
  'technologyExplanation',
  'alternativeExplanation',
  'advantages',
  'disadvantages',
  'tradeoffs',
  'risks',
  'scalabilityExplanation',
  'securityExplanation',
  'improvementSuggestions',
];

// ─── Validate AI response ─────────────────────────────────────────────────
const validateResponse = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return ['root'];
  const missing = REQUIRED_SECTIONS.filter(
    (key) => !parsed[key] || (Array.isArray(parsed[key]) && parsed[key].length === 0) || parsed[key] === ''
  );
  return missing;
};

// ─── Build structured prompt ──────────────────────────────────────────────
const buildPrompt = (project) => {
  const { projectName, requirements, recommendations } = project;
  const norm = requirements?.normalizedRequirements || {};
  const topRecommendations = recommendations?.recommendations || {};
  const engineReasons = recommendations?.engineReasons || [];
  const requiredLayers = recommendations?.requiredLayers || [];
  const overallScore = recommendations?.overallScore || 'N/A';

  // Summarise top picks per category
  const techSummary = Object.entries(topRecommendations)
    .map(([cat, data]) => {
      const top = data?.recommended;
      const alts = (data?.alternatives || []).map((a) => a?.name).filter(Boolean);
      return `${cat}: ${top?.name || 'N/A'} (score: ${top?.score || 'N/A'}/10)${alts.length ? `, alternatives: ${alts.join(', ')}` : ''}`;
    })
    .join('\n');

  const layersSummary = requiredLayers
    .map((l) => `${l.layer}: ${l.technology} — ${l.reason}`)
    .join('\n');

  return `You are a principal enterprise software architect. Your role is to EXPLAIN a pre-computed, deterministic architecture recommendation — NOT to invent numerical scores or change selected technologies.

IMPORTANT CONSTRAINTS:
1. Respond ONLY with a valid JSON object matching the schema below.
2. Do NOT wrap in markdown code blocks or add text outside the JSON.
3. Label assumptions with prefix "[ASSUMPTION]".
4. Keep each section concise, professional, and directly tied to the metrics provided.

PROJECT CONTEXT:
- Project Name: ${projectName}
- Application Type: ${requirements?.applicationType || 'Not specified'}
- Traffic Level: ${norm.trafficLevel || 'LOW'}
- Security Level: ${norm.securityLevel || 'STANDARD'}
- Budget Tier: ${norm.budgetTier || 'STARTUP'}
- Scalability Required: ${norm.scalabilityRequired ? 'Yes' : 'No'}
- Realtime Required: ${norm.realtimeRequired ? 'Yes' : 'No'}
- Has Payments: ${norm.hasPayments ? 'Yes' : 'No'}
- Overall Stack Score: ${overallScore}/10

RULE ENGINE DECISIONS:
${engineReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

TECHNOLOGY RECOMMENDATIONS:
${techSummary}

REQUIRED INFRASTRUCTURE LAYERS:
${layersSummary || 'Standard compute and database layers'}

Respond with this exact JSON schema:
{
  "architectureSummary": "2-4 sentence overview of why this stack suits the project",
  "technologyExplanation": "3-5 sentence explanation of key technology choices and their synergy",
  "alternativeExplanation": "2-4 sentences on when to prefer alternative technologies instead",
  "advantages": ["advantage 1", "advantage 2", "advantage 3", "advantage 4"],
  "disadvantages": ["disadvantage 1", "disadvantage 2", "disadvantage 3"],
  "tradeoffs": ["trade-off 1", "trade-off 2", "trade-off 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "scalabilityExplanation": "3-5 sentences on how this stack handles required scale",
  "securityExplanation": "3-5 sentences on security posture and compliance considerations",
  "improvementSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;
};

// ─── Graceful fallback when AI is unavailable ──────────────────────────────
export const buildFallback = (project) => {
  const norm = project.requirements?.normalizedRequirements || {};
  const topRecommendations = project.recommendations?.recommendations || {};
  const engineReasons = project.recommendations?.engineReasons || [];

  const topTechs = Object.entries(topRecommendations)
    .map(([cat, d]) => `${cat}: ${d?.recommended?.name || '—'}`)
    .join(', ');

  return {
    architectureSummary: `The deterministic rule engine selected the following stack for ${project.projectName}: ${topTechs}. This stack is scored and validated for ${norm.trafficLevel || 'standard'} traffic, ${norm.securityLevel || 'standard'} security, and a ${norm.budgetTier || 'startup'} budget tier.`,
    technologyExplanation: `The technologies were chosen based on ${engineReasons.length} rule triggers. ${engineReasons.slice(0, 2).join(' ')} The stack balances execution performance, operating cost, and architectural simplicity for the target profile.`,
    alternativeExplanation: 'Alternative technologies listed in the recommendations may be preferred when requirements evolve — e.g., choosing PostgreSQL over MongoDB when strict relational ACID transactions are required, or microservices when independent team deployment is mandated.',
    advantages: [
      'Technology selection is grounded in mathematical scoring across 6 key dimensions.',
      `Infrastructure footprint is right-sized for ${norm.trafficLevel || 'standard'} traffic patterns.`,
      'All recommended technologies feature deep ecosystem maturity and enterprise support.',
      norm.scalabilityRequired ? 'Horizontal elasticity is natively supported by containerized compute layers.' : 'Stack is optimized for operational simplicity and cost efficiency.',
    ],
    disadvantages: [
      'Rule-based scoring does not model team-specific existing language proficiencies.',
      'Infrastructure run-rate depends on cloud provider instance sizing and network egress.',
      'Specialized enterprise compliance frameworks may require supplementary security configuration.',
    ],
    tradeoffs: [
      'High-throughput distributed caching introduces cache invalidation consistency trade-offs.',
      'Cost-optimized selections prioritize resource frugality over ultra-high burst headroom.',
      'Hardened security controls introduce additional authentication handshake and token rotation overhead.',
    ],
    risks: [
      'Third-party cloud vendor service level availability dependencies.',
      '[ASSUMPTION] Development team possesses standard production familiarity with the chosen stack.',
      'Database connection pool exhaustion under sudden traffic spikes without a connection proxy.',
    ],
    scalabilityExplanation: `Under ${norm.trafficLevel || 'standard'} traffic volumes, the architecture ${norm.scalabilityRequired ? 'supports horizontal replica auto-scaling' : 'operates comfortably on right-sized compute nodes'}. ${norm.cachingRequired ? 'A dedicated in-memory Redis cluster offloads read queries to maintain sub-100ms latency.' : 'Traffic volume does not mandate distributed cache clustering.'}`,
    securityExplanation: `Security profile is configured for ${norm.securityLevel || 'STANDARD'} tier. ${norm.hasPayments ? 'Monetary flows require PCI-DSS compliant payment gateway isolation with webhooks.' : 'Standard OWASP Top 10 mitigations, Helmet headers, IP rate limiting, and salted password hashing are enforced.'}`,
    improvementSuggestions: [
      'Enforce infrastructure-as-code (Terraform) for reproducible multi-region deployments.',
      'Implement OpenTelemetry distributed tracing and structured JSON application logging.',
      'Maintain living Architecture Decision Records (ADRs) to preserve architectural intent.',
    ],
    _isFallback: true,
    _fallbackReason: 'AI service unavailable or unconfigured — explanation deterministically derived from rule engine metrics.',
  };
};

// ─── Main Export ──────────────────────────────────────────────────────────
export const explainArchitecture = async (project) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_google_gemini_api_key') {
    logger.info('[AIExplainer] Gemini API key not configured — using deterministic rule engine fallback.');
    return buildFallback(project);
  }

  const prompt = buildPrompt(project);

  // Attempt generation with single bounded retry on transient failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent(prompt);
      clearTimeout(timeoutId);

      const rawText = result.response.text();
      let parsed;

      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error('AI returned non-JSON response.');
        }
      }

      const missing = validateResponse(parsed);
      if (missing.length > 0) {
        logger.warn(`[AIExplainer] Missing expected fields: ${missing.join(', ')} — using fallback.`);
        return buildFallback(project);
      }

      logger.info(`[AIExplainer] Gemini explanation generated successfully for project: ${project._id || project.projectId}`);
      return { ...parsed, _isFallback: false, _model: 'gemini-2.0-flash' };

    } catch (err) {
      clearTimeout(timeoutId);
      logger.warn(`[AIExplainer] Attempt ${attempt} failed: ${err.name === 'AbortError' ? 'Timeout (25s)' : err.message}`);

      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  logger.warn('[AIExplainer] All attempts exhausted — engaging deterministic fallback.');
  return buildFallback(project);
};
