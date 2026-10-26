# Person 1: Frontend Developer Workstream Plan

## 1. Role & Scope
* **Primary Owner**: Person 1 (Frontend Developer)
* **Core Responsibilities**:
  * Review, maintain, and expand the entire React 19 single-page application under `client/`.
  * Manage UI components, routing, application state, themes, and form validations.
  * Connect all pages to the backend REST APIs using Axios.
  * Implement interactive charts, Mermaid.js diagram visualizations, radar bars, trade-off comparisons, and downloadable reports.
  * Handle edge cases: loading spinners, skeletons, network failures, empty states, and responsive design across desktop/tablet/mobile.
  * Work independently using mock JSON fixtures until Person 2's backend endpoints are connected.

---

## 2. Comprehensive Module-by-Module Breakdown

### 2.1 Core Infrastructure & Contexts

#### [client/src/App.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/App.jsx)
1. **Purpose**: Root application component defining the client-side routing tree, context providers, and layout wrapping.
2. **Functionality Owned**: Declares all public and protected routes using `react-router-dom` v7; wraps the app with `ThemeProvider` and `AuthProvider`.
3. **Data Received**: None directly; propagates context state down the React component tree.
4. **API Endpoints Needed**: None directly.
5. **Backend Provider**: N/A.
6. **Dependencies**: `ThemeProvider`, `AuthProvider`, `Layout`, `ProtectedRoute`, and all 23 page components.
7. **How to Test Independently**: Run `npm run dev` in `client/` and verify navigation to every URL path (`/`, `/login`, `/dashboard`, `/projects/123/hld`, etc.). Verify wildcard `*` route redirects gracefully.
8. **Definition of Done**: All 23 routes render their respective view components without React runtime errors or blank screens.

---

#### [client/src/context/AuthContext.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/context/AuthContext.jsx) & [client/src/hooks/useAuth.js](file:///c:/Users/ACER/Desktop/NTCC/client/src/hooks/useAuth.js)
1. **Purpose**: Global user authentication and session management.
2. **Functionality Owned**: Login, registration, token persistence in `localStorage`, logout, session validation via `/api/auth/me`, and providing user state via custom hook `useAuth()`.
3. **Data Received**: Auth tokens, user profiles (`{ id, name, email, role }`).
4. **API Endpoints Needed**:
   * `POST /api/auth/login`
   * `POST /api/auth/register`
   * `POST /api/auth/logout`
   * `GET /api/auth/me`
5. **Backend Provider**: [authController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/authController.js) / [authRoutes.js](file:///c:/Users/ACER/Desktop/NTCC/server/routes/authRoutes.js).
6. **Dependencies**: [api.js](file:///c:/Users/ACER/Desktop/NTCC/client/src/services/api.js).
7. **How to Test Independently**: Test with mock responses: verify login sets token in `localStorage`, updates `user` state, and redirects to `/dashboard`. Verify logout clears token and redirects to `/login`.
8. **Definition of Done**: Refreshing the browser preserves the logged-in user state; expired tokens cleanly trigger logout without throwing exceptions.

---

#### [client/src/context/ThemeContext.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/context/ThemeContext.jsx)
1. **Purpose**: Global theme toggling (Dark Mode / Light Mode).
2. **Functionality Owned**: Toggles the `dark` class on the root HTML document and saves preference to `localStorage`.
3. **Data Received**: Current theme string (`'dark'` or `'light'`).
4. **API Endpoints Needed**: None (client-side only).
5. **Backend Provider**: N/A.
6. **Dependencies**: React `createContext`, `useContext`, `useEffect`.
7. **How to Test Independently**: Toggle the theme button in the Navbar and verify background/text colors update immediately and persist on page reload.
8. **Definition of Done**: Clean switching between dark and light modes with zero flickering.

---

#### [client/src/services/api.js](file:///c:/Users/ACER/Desktop/NTCC/client/src/services/api.js)
1. **Purpose**: Configured Axios client for all HTTP communication with the backend.
2. **Functionality Owned**: Base URL management (`VITE_API_BASE_URL`), automatic Bearer token injection on requests, and global 401 redirect interception.
3. **Data Received**: Outgoing request configurations and incoming HTTP responses.
4. **API Endpoints Needed**: All backend endpoints.
5. **Backend Provider**: All Express routes.
6. **Dependencies**: `axios`.
7. **How to Test Independently**: Send requests to mock endpoints; inspect browser DevTools Network tab to confirm `Authorization: Bearer <token>` header is present.
8. **Definition of Done**: Centralized error responses are unwrapped cleanly so UI components receive standard `{ message, status }` objects.

---

### 2.2 Layout & Common UI Components

#### [client/src/components/layout/Navbar.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/layout/Navbar.jsx), [Sidebar.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/layout/Sidebar.jsx), [Layout.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/layout/Layout.jsx)
1. **Purpose**: Master application frame, sidebar navigation, user profile menu, and live backend health heartbeat indicator.
2. **Functionality Owned**: Provides responsive navigation, route links, collapse state, theme toggle, and 30-second polling to `/api/health`.
3. **Data Received**: User profile from `AuthContext`, backend health status (`{ status: 'healthy', uptime }`).
4. **API Endpoints Needed**: `GET /api/health`.
5. **Backend Provider**: [healthController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/healthController.js).
6. **Dependencies**: `lucide-react`, `useAuth`, `ThemeContext`.
7. **How to Test Independently**: Verify that when the server is stopped, the Navbar indicator changes to "API Offline", and when started, switches to "API Online".
8. **Definition of Done**: Layout remains responsive on mobile with a functional hamburger menu, and routes highlight properly in the sidebar.

---

#### [client/src/components/common/WorkflowNav.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/WorkflowNav.jsx)
1. **Purpose**: Step-by-step progress stepper embedded at the top of all project architecture pages.
2. **Functionality Owned**: Displays stages (Requirements $\rightarrow$ Recommendations $\rightarrow$ Compare $\rightarrow$ Explain $\rightarrow$ Design/Diagrams $\rightarrow$ Validation $\rightarrow$ Report) with status badges and quick jumping.
3. **Data Received**: `projectId`, `projectName`, `activeStage`, `completedStages` map.
4. **API Endpoints Needed**: None (receives state via props).
5. **Backend Provider**: N/A.
6. **Dependencies**: `lucide-react`, `react-router-dom`.
7. **How to Test Independently**: Mount with mock project IDs and stages 1 through 7; ensure clicking steps routes to the appropriate URLs.
8. **Definition of Done**: Visual indicator clearly shows current stage and unlocked previous stages.

---

#### [client/src/components/common/MermaidViewer.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/MermaidViewer.jsx)
1. **Purpose**: Renders dynamic system architecture diagrams from Mermaid syntax strings.
2. **Functionality Owned**: Parses Mermaid markup, handles SVG pan/zoom, fullscreen modal preview, copy-to-clipboard, and SVG/PNG download.
3. **Data Received**: `chart` (Mermaid string), `title`, `id`.
4. **API Endpoints Needed**: None directly (consumed by DiagramsPage and ReportViewPage).
5. **Backend Provider**: [diagramGenerator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/diagramGenerator.js).
6. **Dependencies**: `mermaid`, `lucide-react`.
7. **How to Test Independently**: Pass sample strings (e.g., `graph TD; A-->B;`) and test zoom in/out, reset, pan, and download buttons.
8. **Definition of Done**: Renders valid diagrams smoothly with no console syntax errors; gracefully displays error message for malformed charts.

---

#### Common Reusable Components: [Button.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/Button.jsx), [Card.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/Card.jsx), [Input.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/Input.jsx), [Modal.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/Modal.jsx), [Loading.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/Loading.jsx), [Error.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/Error.jsx)
1. **Purpose**: Standard design system components ensuring visual consistency across all pages.
2. **Functionality Owned**: Reusable input fields, primary/secondary buttons with loading spinners, cards with headers/content, modals with backdrop dismiss, and skeleton loaders.
3. **How to Test Independently**: Render each component with different variants and states (disabled, loading, active, error).
4. **Definition of Done**: Fully accessible, typed props, consistent styling according to design tokens.

---

### 2.3 Authentication & Discovery Pages

#### [client/src/pages/LandingPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/LandingPage.jsx)
1. **Purpose**: Public marketing and landing page highlighting features, capabilities, and call-to-actions.
2. **Functionality Owned**: Hero section, architecture workflow showcase, feature highlights, and navigation to Register/Login.
3. **Data Received**: Static copy and live stats if available.
4. **API Endpoints Needed**: None.
5. **Definition of Done**: Visually engaging, responsive hero design with working CTA links.

---

#### [client/src/pages/LoginPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/LoginPage.jsx) & [RegisterPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/RegisterPage.jsx)
1. **Purpose**: User onboarding and authentication views.
2. **Functionality Owned**: Form validation (email format, password length), submission to `AuthContext`, handling error banners for invalid credentials.
3. **Data Received**: User input credentials.
4. **API Endpoints Needed**: `POST /api/auth/login`, `POST /api/auth/register`.
5. **Backend Provider**: [authController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/authController.js).
6. **Definition of Done**: Forms display inline validation errors and redirect authenticated users directly to `/dashboard`.

---

#### [client/src/pages/TechnologiesPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/TechnologiesPage.jsx)
1. **Purpose**: Interactive directory of the 20+ technologies in the architecture catalog.
2. **Functionality Owned**: Search bar, category filters (Frontend, Backend, Database, Cache, DevOps, Messaging), and detailed modal view showing score bars, strengths, weaknesses, and compatibility.
3. **Data Received**: Array of technology records.
4. **API Endpoints Needed**: `GET /api/technologies`.
5. **Backend Provider**: [technologyController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/technologyController.js).
6. **Definition of Done**: Filter and search respond in real time with zero latency; card clicks open the detailed modal.

---

### 2.4 Project Management Pages

#### [client/src/pages/DashboardPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/DashboardPage.jsx) & [ProjectsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ProjectsPage.jsx)
1. **Purpose**: User dashboard displaying summary metrics, recent projects, workflow status, and quick links.
2. **Functionality Owned**: Fetches user's project list, displays count cards (Active Projects, Generated Architectures, Validated Systems), and renders project cards.
3. **Data Received**: `{ projects: [...] }`.
4. **API Endpoints Needed**: `GET /api/projects`.
5. **Backend Provider**: [projectController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/projectController.js).
6. **Definition of Done**: Displays project cards with status badges; shows clean empty state when no projects exist with a "Create Project" button.

---

#### [client/src/pages/CreateProjectPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/CreateProjectPage.jsx), [EditProjectPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/EditProjectPage.jsx), [ProjectDetailPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ProjectDetailPage.jsx)
1. **Purpose**: Project lifecycle management (Creation, Overview, Configuration).
2. **Functionality Owned**: Name, description, priority, and application type forms; deletion confirmation modal; navigation hub to all sub-engines.
3. **Data Received**: Single project document (`{ project: {...} }`).
4. **API Endpoints Needed**:
   * `POST /api/projects`
   * `GET /api/projects/:id`
   * `PUT /api/projects/:id`
   * `DELETE /api/projects/:id`
5. **Backend Provider**: [projectController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/projectController.js).
6. **Definition of Done**: Creates new project and routes user directly to `/projects/:id/requirements`. Deletion cleans up and redirects to `/projects`.

---

### 2.5 Architecture Decision Suite Pages

#### [client/src/pages/RequirementsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/RequirementsPage.jsx)
1. **Purpose**: Structured questionnaire capturing system specifications across 5 tabs: Scale & Volume, Architecture Type, Functional Features, Quality Attributes (SLAs), and Budget/Team Constraints.
2. **Functionality Owned**: Form state management, slider controls, checkbox matrices, save & calculate trigger, and routing to Recommendations.
3. **Data Received**: Existing project requirements object.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/requirements`
   * `POST /api/projects/:id/requirements`
   * `POST /api/projects/:id/recommendations/generate`
5. **Backend Provider**: [requirementController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/requirementController.js) and [recommendationController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/recommendationController.js).
6. **Definition of Done**: Submitting the form validates inputs, persists requirements, triggers recommendation generation, and transitions to `/projects/:id/recommendations`.

---

#### [client/src/pages/RecommendationsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/RecommendationsPage.jsx)
1. **Purpose**: Displays ranked technology stack suggestions across all required architecture layers.
2. **Functionality Owned**:
   * Renders overall architecture suitability score (e.g., `8.4 / 10`).
   * Renders category cards (Frontend, Backend, Database, Cache, Messaging, Cloud) showing recommended tech vs alternatives.
   * Interactive weight adjustment sliders (Scalability, Performance, Cost, Complexity, Security) with instant recalculation button.
   * Disqualification reason tags and engine explanations.
3. **Data Received**: Recommendations payload with `overallScore`, `recommendations`, `engineReasons`, and `ruleFlags`.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/recommendations`
   * `POST /api/projects/:id/recommendations/recalculate`
5. **Backend Provider**: [recommendationController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/recommendationController.js) / [recommendationEngine.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/recommendationEngine.js).
6. **Definition of Done**: Changing weights and clicking recalculate updates score bars and ranking in real-time.

---

#### [client/src/pages/ComparisonPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ComparisonPage.jsx)
1. **Purpose**: Multi-architecture trade-off and scoring matrix.
2. **Functionality Owned**: Compares user's recommended stack against predefined industry presets (e.g., MERN vs Spring Boot + PostgreSQL vs Django + PostgreSQL) across criteria like Latency, Throughput, TCO, and Dev Velocity.
3. **Data Received**: Comparison matrix object with winner badges, score bars, and trade-off highlights.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/compare`
   * `POST /api/projects/:id/compare`
5. **Backend Provider**: [comparisonController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/comparisonController.js).
6. **Definition of Done**: Dynamic selection of preset stacks updates the side-by-side comparison matrix and crowns the category winners.

---

#### [client/src/pages/ExplanationPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ExplanationPage.jsx)
1. **Purpose**: AI-powered natural language explanation of the generated architecture.
2. **Functionality Owned**: Displays 10 structured accordion sections (Architecture Summary, Technology Rationale, Trade-offs, Scalability, Security, Risks, Improvements). Includes an AI status badge (`Gemini Generated` vs `Deterministic Fallback`).
3. **Data Received**: 10-section explanation object and `_isFallback` flag.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/explain`
   * `POST /api/projects/:id/explain`
5. **Backend Provider**: [aiController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/aiController.js) / [aiExplainer.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/aiExplainer.js).
6. **Definition of Done**: Displays accordion list; clicking "Regenerate Analysis" triggers loading state and renders refreshed rationale without UI freezing.

---

#### [client/src/pages/HLDPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/HLDPage.jsx) & [LLDPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/LLDPage.jsx)
1. **Purpose**: High-Level and Low-Level architecture specifications.
2. **Functionality Owned**:
   * HLD: System context, multi-tier layout, communication protocols, network boundaries, and security models.
   * LLD: Service decomposition, REST API endpoint specs (URI, Method, Request/Response schema), database schemas, indexing strategies, and caching policies.
3. **Data Received**: Structured HLD and LLD JSON specifications.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/design/hld`
   * `POST /api/projects/:id/design/hld`
   * `GET /api/projects/:id/design/lld`
   * `POST /api/projects/:id/design/lld`
5. **Backend Provider**: [designController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/designController.js).
6. **Definition of Done**: Structured cards display API contracts, schema models, and networking tiers clearly with syntax-highlighted code/JSON blocks.

---

#### [client/src/pages/DiagramsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/DiagramsPage.jsx)
1. **Purpose**: Visual architecture diagramming studio.
2. **Functionality Owned**: Tabbed viewer displaying 4 diagram types:
   1. Multi-tier System Architecture
   2. Level-1 Data Flow Diagram (DFD)
   3. Entity Relationship (ER) Diagram
   4. Activity / Sequence Process Flow
3. **Data Received**: `{ diagrams: { systemArchitecture, dataFlow, entityRelationship, activity } }`.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/diagrams`
   * `POST /api/projects/:id/diagrams`
5. **Backend Provider**: [diagramController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/diagramController.js).
6. **Dependencies**: [MermaidViewer.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/common/MermaidViewer.jsx).
7. **Definition of Done**: Switching tabs renders each diagram seamlessly with full pan, zoom, and SVG export capabilities.

---

#### [client/src/pages/ValidationPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ValidationPage.jsx)
1. **Purpose**: Automated architecture linting and anti-pattern detection.
2. **Functionality Owned**: Evaluates architecture against best practices. Displays overall health score (`Passed`, `Warning`, `Critical`), categorized checklists (Scalability, Security, High Availability, Cost), and remediation recommendations.
3. **Data Received**: Validation report containing rules checked, pass/fail status, severity tags, and remediation suggestions.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/validate`
   * `POST /api/projects/:id/validate`
5. **Backend Provider**: [validationController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/validationController.js).
6. **Definition of Done**: Color-coded severity chips (Critical, High, Medium, Info) and category filtering render accurately.

---

#### [client/src/pages/ScenarioPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ScenarioPage.jsx)
1. **Purpose**: What-if failure and traffic surge simulation.
2. **Functionality Owned**: Allows user to create hypothetical stress scenarios (e.g., "10x Black Friday Traffic Surge", "Primary Database Outage", "Network Regional Partition"). Simulates system response and shows impact on latency, CPU, and availability.
3. **Data Received**: List of simulated scenarios with baseline vs stressed comparisons.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/scenarios`
   * `POST /api/projects/:id/scenarios`
   * `DELETE /api/projects/:id/scenarios/:scenarioId`
5. **Backend Provider**: [scenarioController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/scenarioController.js).
6. **Definition of Done**: Users can run new simulations, view side-by-side stress metrics, and delete custom scenarios.

---

#### [client/src/pages/CapacityCostPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/CapacityCostPage.jsx)
1. **Purpose**: Infrastructure capacity planning and cloud cost estimation.
2. **Functionality Owned**:
   * Capacity Metrics: Estimated QPS, storage growth per month, network egress bandwidth, recommended vCPU cores, and RAM.
   * Cost Estimator: Monthly cost projection breakdown (Compute, Database, Cache, Storage, Bandwidth) across three tiers (Minimum, Expected, Peak Surge).
3. **Data Received**: Capacity metrics and tiered cost breakdown objects.
4. **API Endpoints Needed**: `GET /api/projects/:id/capacity-cost`.
5. **Backend Provider**: [capacityCostController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/capacityCostController.js).
6. **Definition of Done**: Tier selector toggles between Minimum, Expected, and Peak estimates with accurate cost totals.

---

#### [client/src/pages/TraceabilityPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/TraceabilityPage.jsx)
1. **Purpose**: Requirements Traceability Matrix (RTM) and Architecture Decision Records (ADRs).
2. **Functionality Owned**:
   * Traceability tab: Shows mapping from business requirement $\rightarrow$ technical design choice $\rightarrow$ technology component $\rightarrow$ verification test.
   * ADR tab: Displays industry-standard ADRs (Title, Status, Context, Decision, Consequences) with modal to add custom ADRs.
3. **Data Received**: Traceability matrix rows and ADR list.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/traceability`
   * `POST /api/projects/:id/traceability/adrs`
   * `PUT /api/projects/:id/traceability/adrs/:adrId`
5. **Backend Provider**: [traceabilityController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/traceabilityController.js).
6. **Definition of Done**: Matrix table displays full traceability chains; users can add and edit ADRs with instant state updates.

---

#### [client/src/pages/ReportViewPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ReportViewPage.jsx) & [ReportsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ReportsPage.jsx)
1. **Purpose**: Final comprehensive 23-section Architecture Specification Dossier.
2. **Functionality Owned**:
   * Renders executive summary, requirements, architecture decisions, HLD, LLD, embedded diagrams, risk matrices, capacity plans, and ADRs.
   * Table of Contents with smooth scroll navigation.
   * Export buttons: Download as Markdown (`.md`) and Download as JSON (`.json`).
3. **Data Received**: Full consolidated report document.
4. **API Endpoints Needed**:
   * `GET /api/projects/:id/report`
   * `POST /api/projects/:id/report`
   * `GET /api/projects/:id/report/export/markdown`
   * `GET /api/projects/:id/report/export/json`
5. **Backend Provider**: [reportController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/reportController.js).
6. **Definition of Done**: Renders all 23 sections seamlessly; export buttons trigger browser file downloads with accurate markdown/JSON formatting.

---

## 3. Mock Data Strategy for Parallel Development
Person 1 does not need to wait for backend completion to build or refine frontend pages. 

Person 1 can maintain a mock fixtures directory at `client/src/mocks/` with sample JSON files corresponding to each API endpoint:
* `client/src/mocks/mockProject.json`
* `client/src/mocks/mockRecommendations.json`
* `client/src/mocks/mockExplanation.json`
* `client/src/mocks/mockDiagrams.json`
* `client/src/mocks/mockReport.json`

In service files (e.g. `client/src/services/recommendationService.js`), Person 1 can use a toggle flag:
```javascript
const USE_MOCKS = false; // Set to true when backend is offline
```
This enables Person 1 to style and test complex visualizations (like Mermaid diagrams and radar charts) independently of backend availability.
