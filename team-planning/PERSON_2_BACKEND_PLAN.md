# Person 2: Backend Developer Workstream Plan

## 1. Role & Scope
* **Primary Owner**: Person 2 (Backend Developer)
* **Core Responsibilities**:
  * Own and maintain the entire Node.js/Express application under `/server`.
  * Maintain all 15 Express route files, 15 controllers, and 12 core algorithmic services.
  * Implement authentication, authorization, input validation, and security rate limiters.
  * Implement deterministic recommendation scoring, architecture validation, capacity modeling, and diagram generation algorithms.
  * Maintain the Google Gemini AI integration with timeouts, retries, and deterministic fallbacks.
  * Manage database access via Mongoose models (`User`, `Technology`, `Project`).
  * Coordinate with Person 3 on collection structures, field types, and seed records.

---

## 2. Comprehensive Module-by-Module Breakdown

### 2.1 Core Server & Middleware Infrastructure

#### [server/server.js](file:///c:/Users/ACER/Desktop/NTCC/server/server.js)
1. **Purpose & Business Logic**: Server bootstrap, environment loading, middleware registration, tiered rate limiting, route mounting, and MongoDB connection invocation.
2. **Components Involved**: Express app, `connectDB`, Helmet, CORS, Rate Limiters, logger, error handlers.
3. **Inputs/Outputs**: Listens on `PORT` (default 5000). Serves root API info at `GET /`.
4. **Dependencies**: [config/db.js](file:///c:/Users/ACER/Desktop/NTCC/server/config/db.js), [utils/logger.js](file:///c:/Users/ACER/Desktop/NTCC/server/utils/logger.js), and all route files.
5. **MongoDB Collections**: None directly; delegates to database connector.
6. **Frontend Communication**: Responds to HTTP requests from the frontend client.
7. **How to Test Independently**: Run `npm run dev` in `server/`. Query `GET http://localhost:5000/` and verify JSON response: `{ name, version, status: 'online' }`.
8. **Definition of Done**: Server starts cleanly, connects to MongoDB, logs incoming requests, and handles graceful shutdown.

---

#### [server/config/db.js](file:///c:/Users/ACER/Desktop/NTCC/server/config/db.js)
1. **Purpose & Business Logic**: Establishes connection to MongoDB Atlas or local MongoDB using Mongoose with connection pooling and error listeners.
2. **Components Involved**: Mongoose `connect` and connection events.
3. **Inputs/Outputs**: Reads `MONGODB_URI` from `.env`.
4. **Dependencies**: `mongoose`, `logger`.
5. **MongoDB Collections**: Connection management across all collections.
6. **How to Test Independently**: Run `node -e "import('./config/db.js').then(m => m.connectDB())"` and verify terminal logs "MongoDB Connected".
7. **Definition of Done**: Auto-reconnects on temporary network drops and logs informative errors on invalid credentials without crashing silently.

---

#### Middleware: [authMiddleware.js](file:///c:/Users/ACER/Desktop/NTCC/server/middleware/authMiddleware.js), [validateMiddleware.js](file:///c:/Users/ACER/Desktop/NTCC/server/middleware/validateMiddleware.js), [errorHandler.js](file:///c:/Users/ACER/Desktop/NTCC/server/middleware/errorHandler.js), [notFoundHandler.js](file:///c:/Users/ACER/Desktop/NTCC/server/middleware/notFoundHandler.js)
1. **Purpose & Business Logic**:
   * `authMiddleware.js`: Verifies `Bearer <JWT>` in HTTP `Authorization` header, decodes user payload, attaches `req.user`, and rejects expired/tampered tokens with `401 Unauthorized`.
   * `validateMiddleware.js`: Sanitizes and validates request bodies (Registration, Login, Project Creation) before hitting controllers.
   * `errorHandler.js`: Intercepts unhandled errors, formats a uniform JSON error payload `{ success: false, error: { message, status } }`, and prevents stack trace leakage in production.
   * `notFoundHandler.js`: Emits a standard `404 Not Found` payload for unknown endpoints.
2. **Dependencies**: `jsonwebtoken`, `logger`.
3. **How to Test Independently**: Send requests without tokens to protected routes (expect 401); send malformed JSON (expect 400); request non-existent routes (expect 404).
4. **Definition of Done**: 100% of error cases return structured JSON error payloads without crashing the Express process.

---

### 2.2 Domain Models (`/server/models`)

#### [server/models/User.js](file:///c:/Users/ACER/Desktop/NTCC/server/models/User.js)
1. **Purpose**: Schema and methods for application users.
2. **Business Logic**: Hashes passwords using `bcryptjs` in a `pre('save')` hook; exposes instance method `matchPassword(enteredPassword)`.
3. **Fields**: `name`, `email` (unique, lowercase), `password` (select: false), `role` (`user` | `admin`), timestamps.
4. **Collections**: `users`.
5. **Definition of Done**: Passwords are never saved in plaintext; duplicate email registration throws a duplicate key error (code 11000).

---

#### [server/models/Technology.js](file:///c:/Users/ACER/Desktop/NTCC/server/models/Technology.js)
1. **Purpose**: Catalog of available technologies used by the recommendation engine.
2. **Business Logic**: Encapsulates 6 scoring criteria (Scalability, Performance, Cost, Complexity, Security, Popularity), strengths, weaknesses, compatibility lists, and recommended use cases.
3. **Fields**: `name`, `category` (Frontend, Backend, Database, Cache, DevOps, Cloud, Messaging, Monitoring), `scores`, `compatibility`.
4. **Collections**: `technologies`.
5. **Definition of Done**: Seeded with at least 20+ technologies via `server/seed/techSeeder.js`.

---

#### [server/models/Project.js](file:///c:/Users/ACER/Desktop/NTCC/server/models/Project.js)
1. **Purpose**: Central aggregate document schema containing the complete state of an architecture evaluation project.
2. **Business Logic**: Contains sub-schemas and embedded mixed fields for requirements, recommendations, comparisons, AI rationale, HLD, LLD, diagrams, validation reports, scenarios, capacity, costs, and ADRs.
3. **Indexes**: Compound index `{ userId: 1, createdAt: -1 }` and full-text index on `projectName`.
4. **Collections**: `projects`.
5. **Definition of Done**: Supports incremental updates to individual sub-documents without wiping out previously generated stages.

---

### 2.3 Controllers & Algorithmic Services

#### Module 1: Auth & Users ([authController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/authController.js) & [authRoutes.js](file:///c:/Users/ACER/Desktop/NTCC/server/routes/authRoutes.js))
1. **Purpose**: User registration, login, token minting, and profile lookup.
2. **API Handlers**: `register`, `login`, `logout`, `getMe`.
3. **Input/Output**: Expects `{ email, password, name }`; returns `{ success: true, token, user }`.
4. **Test**: `curl -X POST http://localhost:5000/api/auth/register -d '{"name":"Architect","email":"test@arc.com","password":"password123"}' -H "Content-Type: application/json"`.

---

#### Module 2: Project Management ([projectController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/projectController.js) & [projectRoutes.js](file:///c:/Users/ACER/Desktop/NTCC/server/routes/projectRoutes.js))
1. **Purpose**: Full CRUD for projects scoped to the logged-in user (`req.user.id`).
2. **API Handlers**: `createProject`, `getProjects`, `getProjectById`, `updateProject`, `deleteProject`.
3. **Security**: Verifies `userId === req.user.id` to prevent cross-tenant data leaks.
4. **Test**: Create project, verify retrieval by ID, verify listing only returns projects belonging to current user.

---

#### Module 3: Requirement Collection & Analysis ([requirementController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/requirementController.js) & [requirementAnalyzer.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/requirementAnalyzer.js))
1. **Purpose**: Normalizes user requirements into categorical flags, operational constraints, and complexity scores.
2. **Business Logic**: Computes `trafficTier` from `dailyRequests`, evaluates if real-time protocols or caching layers are required, and generates `normalizedRequirements`.
3. **Collections**: Embedded within `Project.requirements`.
4. **Test**: Submit requirements with `dailyRequests: 2000000`, verify `trafficTier` is normalized to `HIGH` and `requireCache` is flagged as `true`.

---

#### Module 4: Recommendation Engine ([recommendationController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/recommendationController.js) & [recommendationEngine.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/recommendationEngine.js))
1. **Purpose**: Multi-criteria weighted decision algorithm selecting top technologies and alternatives per layer.
2. **Business Logic**:
   * Evaluates user criteria weights: Scalability (25%), Performance (20%), Cost (15%), Complexity (15%), Security (15%), Popularity (10%).
   * Calculates compatibility affinity between layers (e.g., React + Node.js or Angular + Spring Boot).
   * Disqualifies unsuitable technologies (e.g., disqualifies low-scalability datastores when traffic is ultra-high).
3. **Input/Output**: Inputs normalized requirements and custom weights; outputs ranked recommendations per layer with score breakdowns.
4. **Test**: Call `POST /api/projects/:id/recommendations/recalculate` with custom weights; verify returned ranking matches adjusted priorities.

---

#### Module 5: Architecture Comparison ([comparisonController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/comparisonController.js) & [architectureComparer.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/architectureComparer.js))
1. **Purpose**: Side-by-side trade-off analysis comparing recommended stack against industry presets (e.g., MERN, Spring Boot + PostgreSQL, Django + PostgreSQL, Go Microservices).
2. **Business Logic**: Compares stacks on Throughput, Latency, Operational Cost, Developer Ramp-up Time, and crowns winners for each metric.
3. **Collections**: Embedded in `Project.comparison`.
4. **Test**: Query `GET /api/projects/:id/compare` and verify returned comparative metrics and crown winner tags.

---

#### Module 6: AI Explanation Service ([aiController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/aiController.js) & [aiExplainer.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/aiExplainer.js))
1. **Purpose**: Generates a 10-section natural-language rationale explaining architecture decisions.
2. **Resilience & Fallback Logic**:
   * Calls Google Gemini model (`gemini-1.5-flash` or configured model).
   * Enforces a 25-second `AbortController` timeout to prevent hung requests.
   * If Gemini call fails, times out, or `GEMINI_API_KEY` is missing, executes a **100% deterministic fallback** derived directly from the M6 Recommendation Engine findings.
   * Tags response with `_isFallback: true` and `_fallbackReason`.
3. **Test**: Run with invalid or unset `GEMINI_API_KEY`; verify endpoint still responds with HTTP 200 containing complete 10-section explanation tagged as fallback.

---

#### Module 7: HLD & LLD Generation ([designController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/designController.js), [hldGenerator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/hldGenerator.js), [lldGenerator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/lldGenerator.js))
1. **Purpose**: Generates structured High-Level and Low-Level architecture specifications.
2. **Business Logic**:
   * `hldGenerator.js`: Defines system context, multi-tier layout (Presentation, Gateway, App, Persistence, Cache), networking zones, and security controls.
   * `lldGenerator.js`: Decomposes services, specifies REST endpoints (routes, methods, payloads), database schemas, indexing recommendations, and error handling protocols.
3. **Collections**: Embedded in `Project.hld` and `Project.lld`.
4. **Test**: Trigger generation via `POST /api/projects/:id/design/hld` and verify structured JSON output.

---

#### Module 8: Mermaid Diagram Generator ([diagramController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/diagramController.js) & [diagramGenerator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/diagramGenerator.js))
1. **Purpose**: Synthesizes clean Mermaid.js diagram definitions.
2. **Business Logic**: Builds valid syntax strings for:
   1. `systemArchitecture`: Multi-tier component layout with subgraphs.
   2. `dataFlow`: Level-1 DFD detailing read/write data flows.
   3. `entityRelationship`: ER diagram with entity attributes and keys.
   4. `activity`: End-to-end request lifecycle flow.
3. **Collections**: Embedded in `Project.diagrams`.
4. **Test**: Validate that generated Mermaid strings parse cleanly in Mermaid CLI or live viewer without syntax errors.

---

#### Module 9: Architecture Validator ([validationController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/validationController.js) & [architectureValidator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/architectureValidator.js))
1. **Purpose**: Architecture linting engine detecting anti-patterns, single points of failure, missing caches, and compliance gaps.
2. **Business Logic**: Checks 12+ architectural rules (e.g., "High availability required but no load balancer configured", "Ultra low latency required but cache layer missing"). Emits severity ratings (`CRITICAL`, `HIGH`, `MEDIUM`, `INFO`) and actionable remediations.
3. **Collections**: Embedded in `Project.validation`.
4. **Test**: Run validation against a high-traffic project without caching; verify engine flags critical missing cache warning.

---

#### Module 10: Scenario Simulator ([scenarioController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/scenarioController.js) & [scenarioSimulator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/scenarioSimulator.js))
1. **Purpose**: Evaluates system resilience under stress and failure conditions.
2. **Business Logic**: Models stress overrides (e.g., 5x traffic surge, region failure), recalculates latency/throughput curves, and determines whether the current architecture will hold or saturate.
3. **Collections**: Embedded array in `Project.scenarios`.
4. **Test**: Submit a scenario override via `POST /api/projects/:id/scenarios` and verify returned stress projections.

---

#### Module 11: Capacity & Cloud Cost Modeler ([capacityCostController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/capacityCostController.js) & [capacityCostService.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/capacityCostService.js))
1. **Purpose**: Mathematical modeling of hardware requirements and cloud operational expenditures (OpEx).
2. **Business Logic**:
   * Capacity: Calculates peak QPS, storage accumulation (GB/month), network egress (Mbps), recommended CPU cores, and RAM footprint.
   * Costs: Estimates monthly hosting costs for Compute, Managed DB, Cache, Storage, and Bandwidth across Minimum, Expected, and Peak tiers.
3. **Collections**: Embedded in `Project.capacity` and `Project.costEstimate`.
4. **Test**: Verify calculated costs align proportionally with inputted daily requests and storage requirements.

---

#### Module 12: Traceability & ADR Manager ([traceabilityController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/traceabilityController.js) & [traceabilityService.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/traceabilityService.js))
1. **Purpose**: Requirements-to-Architecture Traceability Matrix (RTM) and Architecture Decision Records (ADRs).
2. **Business Logic**:
   * Traceability: Builds bidirectional links from business requirement $\rightarrow$ architectural decision $\rightarrow$ selected component.
   * ADRs: Maintains structured ADR entries (`ADR-001`, `ADR-002`, status, context, decision, consequences).
3. **Collections**: Embedded in `Project.traceability` and `Project.adrs`.
4. **Test**: Verify default ADRs are generated automatically upon recommendation generation.

---

#### Module 13: Report Generator & Exporter ([reportController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/reportController.js) & [reportGenerator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/reportGenerator.js))
1. **Purpose**: Aggregates all project sections into a unified 23-section Architecture Specification Document.
2. **Business Logic**:
   * Compiles JSON summary document.
   * Transforms document into formatted GitHub Flavored Markdown for download.
3. **Collections**: Embedded in `Project.report`.
4. **Test**: Query `GET /api/projects/:id/report/export/markdown`; verify response headers include `Content-Disposition: attachment; filename=*.md`.
