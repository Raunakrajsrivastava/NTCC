# Milestones & Acceptance Criteria

This document defines the 10 sequential delivery milestones for the **AI-Powered Software Architecture Advisor** project. Each milestone specifies ownership, prerequisites, concrete deliverables, strict acceptance criteria, and required testing evidence.

---

## Milestone 1: Repository Audit & Task Allocation
* **Owner**: Whole Team (Lead: Project Lead / Architect)
* **Prerequisites**: Access to the Git repository.
* **Deliverables**:
  1. Verified code audit of `/client` and `/server`.
  2. The 10 planning documents created in `team-planning/`.
  3. Initial team kickoff meeting and role confirmation.
* **Acceptance Criteria**:
  * All existing files, models, routes, and components cataloged without assumptions.
  * Person 1, Person 2, and Person 3 acknowledge their assigned workstreams.
* **Testing Evidence**:
  * Signed-off `team-planning/MODULE_RESPONSIBILITY_MATRIX.md`.

---

## Milestone 2: Frontend/Backend API Contract Agreement
* **Owner**: Person 1 & Person 2 (Verified by Person 3)
* **Prerequisites**: Milestone 1 complete.
* **Deliverables**:
  1. Finalized `API_INTEGRATION_CONTRACT.md`.
  2. Mock JSON fixtures placed in `client/src/mocks/` for offline frontend styling.
* **Acceptance Criteria**:
  * All 15 controller routes, request bodies, and response envelopes agreed upon.
  * Standard error payload schema `{ success: false, error: { message, status } }` ratified.
* **Testing Evidence**:
  * Person 1 validates that mock responses load properly in frontend views without errors.

---

## Milestone 3: Database Schema Approval & Compass Setup
* **Owner**: Person 3 (Supported by Person 2)
* **Prerequisites**: Milestone 1 complete.
* **Deliverables**:
  1. `DATABASE_SCHEMA_PLAN.md` with complete BSON data dictionary.
  2. Working MongoDB Compass connection to local MongoDB or MongoDB Atlas.
  3. Technology catalog verified in `server/seed/techSeeder.js`.
* **Acceptance Criteria**:
  * Decision on the 3 top-level collections (`users`, `technologies`, `projects`) approved.
  * Validation rules, required fields, and index specifications documented.
* **Testing Evidence**:
  * Screenshot or log showing MongoDB Compass connected to the active database.

---

## Milestone 4: Authentication & Project Management Integration
* **Owner**: Person 2 (Backend) & Person 1 (Frontend) (Verified by Person 3)
* **Prerequisites**: Milestones 2 & 3 complete.
* **Deliverables**:
  1. Working User Registration and Login flow (`/api/auth/register`, `/api/auth/login`).
  2. JWT token storage and authenticated request headers via Axios.
  3. Project creation, listing, updating, and deletion (`/api/projects`).
* **Acceptance Criteria**:
  * Passwords stored with bcrypt hashing (never plaintext).
  * Unauthenticated requests to `/api/projects` return HTTP 401.
  * Projects are strictly scoped to the authenticated user.
* **Testing Evidence**:
  * Compass inspection showing hashed user passwords.
  * Frontend demo creating a project and viewing it on the Dashboard.

---

## Milestone 5: Requirements Analysis & Recommendation Engine
* **Owner**: Person 2 (Backend) & Person 1 (Frontend)
* **Prerequisites**: Milestone 4 complete.
* **Deliverables**:
  1. 5-tab requirements collection form on frontend (`RequirementsPage.jsx`).
  2. Backend `requirementAnalyzer.js` normalizing traffic tiers and constraint flags.
  3. Backend `recommendationEngine.js` calculating weighted scores across 6 criteria.
  4. Interactive weight sliders and recalculation on `RecommendationsPage.jsx`.
* **Acceptance Criteria**:
  * Modifying criteria weights dynamically recalculates technology scores.
  * High-traffic inputs automatically flag cache and message queue requirements.
* **Testing Evidence**:
  * Unit test log or cURL trace of `POST /api/projects/:id/recommendations/recalculate`.

---

## Milestone 6: AI Explanation Engine with Deterministic Fallback
* **Owner**: Person 2 (Backend) & Person 1 (Frontend)
* **Prerequisites**: Milestone 5 complete.
* **Deliverables**:
  1. Backend `aiExplainer.js` integration with Google Gemini API.
  2. 25-second `AbortController` timeout and retry logic.
  3. 10-section deterministic fallback when API key is missing or offline.
  4. Accordion display on `ExplanationPage.jsx` with fallback indicator tag.
* **Acceptance Criteria**:
  * System produces a complete 10-section architecture rationale.
  * If `GEMINI_API_KEY` is invalid or unset, HTTP 200 is still returned with `_isFallback: true`.
* **Testing Evidence**:
  * Successful API response test with valid Gemini key AND with invalid key.

---

## Milestone 7: Diagram Generation & Architecture Validation
* **Owner**: Person 2 (Backend) & Person 1 (Frontend)
* **Prerequisites**: Milestone 5 complete.
* **Deliverables**:
  1. Backend `diagramGenerator.js` synthesizing 4 Mermaid diagrams (System Arch, DFD, ERD, Activity).
  2. Frontend `MermaidViewer.jsx` rendering SVG diagrams with pan/zoom and PNG/SVG export.
  3. Backend `architectureValidator.js` checking 12+ anti-pattern rules.
  4. Frontend `ValidationPage.jsx` displaying categorized severity badges and remediations.
* **Acceptance Criteria**:
  * Generated Mermaid strings render cleanly without syntax errors.
  * Architecture validation correctly flags missing caches or SPOFs when required.
* **Testing Evidence**:
  * Rendered diagrams verified in browser; validation report passes rule check.

---

## Milestone 8: Stress Simulation & Capacity/Cost Modeling
* **Owner**: Person 2 (Backend) & Person 1 (Frontend)
* **Prerequisites**: Milestone 5 complete.
* **Deliverables**:
  1. Backend `scenarioSimulator.js` evaluating 10x traffic surges and component outages.
  2. Frontend `ScenarioPage.jsx` allowing custom scenario creation and impact comparison.
  3. Backend `capacityCostService.js` modeling QPS, storage, vCPU, RAM, and OpEx costs.
  4. Frontend `CapacityCostPage.jsx` with Minimum, Expected, and Peak cost toggles.
* **Acceptance Criteria**:
  * Mathematical cost and capacity formulas reflect inputted daily requests and data volume.
  * Stress scenarios calculate realistic resource utilization spikes.
* **Testing Evidence**:
  * Compass document inspection confirming `capacity` and `costEstimate` sub-documents.

---

## Milestone 9: Traceability Matrix, ADRs & Full Database Persistence
* **Owner**: Person 3 (Lead Tester) with Person 2 & Person 1
* **Prerequisites**: Milestones 4 through 8 complete.
* **Deliverables**:
  1. Traceability service linking requirements $\rightarrow$ decisions $\rightarrow$ components.
  2. ADR generator and interactive editor on `TraceabilityPage.jsx`.
  3. Complete state persistence: all stages saved atomically within `Project` document.
  4. Seed benchmark execution via `server/seed/seedLeetcodeProject.js`.
* **Acceptance Criteria**:
  * Opening an existing project reloads all previously generated recommendations, diagrams, and designs without data loss.
  * Benchmark demo project seeds cleanly and loads in the UI.
* **Testing Evidence**:
  * Complete project document in MongoDB Compass showing all 11 sub-documents populated.

---

## Milestone 10: End-to-End System Integration & Final Dossier Export
* **Owner**: Whole Team
* **Prerequisites**: Milestones 1 through 9 complete.
* **Deliverables**:
  1. Final consolidated 23-section architecture report viewer (`ReportViewPage.jsx`).
  2. Markdown (`.md`) and JSON (`.json`) export download buttons.
  3. Full cross-browser responsive testing (Desktop, Tablet, Mobile).
  4. System user manual and project submission package.
* **Acceptance Criteria**:
  * Complete end-to-end user journey works smoothly: Register $\rightarrow$ Create Project $\rightarrow$ Fill Requirements $\rightarrow$ Recommendations $\rightarrow$ Compare $\rightarrow$ Explain $\rightarrow$ Design $\rightarrow$ Diagrams $\rightarrow$ Validation $\rightarrow$ Scenarios $\rightarrow$ Capacity/Cost $\rightarrow$ Traceability $\rightarrow$ Export Report.
  * Exported Markdown document contains complete formatted tables and Mermaid diagrams.
  * Zero uncaught JavaScript errors in browser console or unhandled Express crashes.
* **Testing Evidence**:
  * Successfully downloaded Markdown architecture specification dossier.
  * Verified production build: `npm run build` passes in `client/` and server starts in production mode.
