# Database Schema Plan & Data Dictionary

## 1. Architectural Strategy: Embedding vs. Referencing
In MongoDB document modeling, collections should be organized around **access patterns** and **data lifecycles**.

After analyzing the application access patterns in [server/models/Project.js](file:///c:/Users/ACER/Desktop/NTCC/server/models/Project.js):
* **When to Reference**: When data entities exist independently, have high cardinality, or are accessed across multiple parent entities (e.g., `User` accounts and the global `Technology` catalog).
* **When to Embed**: When data entities have a strict 1-to-1 or 1-to-few relationship, share the same lifecycle as the parent document, and are frequently read together as a consolidated dossier (e.g., a project's requirements, recommendations, diagrams, ADRs, and capacity estimates).

### Summary of Top-Level Collections vs. Embedded Schemas:
* **Top-Level Collections (3)**:
  1. `users` (Referenced)
  2. `technologies` (Referenced catalog)
  3. `projects` (Aggregate Root)
* **Embedded Sub-Documents within `projects` (8)**:
  1. `requirements`
  2. `recommendations`
  3. `comparison`
  4. `aiExplanation`
  5. `hld` & `lld`
  6. `diagrams`
  7. `validation`
  8. `capacity` & `costEstimate`
* **Embedded Arrays within `projects` (2)**:
  1. `adrs` (Architecture Decision Records)
  2. `scenarios` (What-if stress tests)

---

## 2. In-Depth Evaluation of the 10 Potential Collections

### Collection 1: `users`
1. **Why It Is Needed**: Secures user accounts, enables multi-tenancy, and protects project ownership.
2. **Fields & BSON Types**:
   * `_id`: `ObjectId` (Required, System Primary Key)
   * `name`: `String` (Required, 2–50 chars)
   * `email`: `String` (Required, Unique, Lowercase, Regex validated)
   * `password`: `String` (Required, Bcrypt hash, excluded by default)
   * `role`: `String` (Required, Enum: `user` | `admin`, Default: `user`)
   * `createdAt`: `Date` (Auto-generated timestamp)
   * `updatedAt`: `Date` (Auto-generated timestamp)
3. **Required Fields**: `name`, `email`, `password`.
4. **Sample Document**:
```json
{
  "_id": { "$oid": "65e01234567890abcdef1001" },
  "name": "Ravi Sharma",
  "email": "ravi@example.com",
  "password": "$2a$10$wN9aJv15k9hO1oZ7.Vd3c.pYk0E8iO3hN9rT7xQ1b8a5d3c2e1f",
  "role": "user",
  "createdAt": { "$date": "2026-03-01T10:00:00.000Z" },
  "updatedAt": { "$date": "2026-03-01T10:00:00.000Z" }
}
```
5. **References**: Has many `projects`.
6. **Validation Rules**: `email` must match standard email RFC regex; `name` trimmed.
7. **Indexes**: Unique index `{ email: 1 }`.
8. **Strategy**: **Separate Collection (Referenced)**. Users exist independently of projects.
9. **Backend Module**: `User.js`, `authController.js`, `authMiddleware.js`.
10. **Compass Verification**: Open `users` collection; click **Indexes** tab and confirm unique index on `email` exists.

---

### Collection 2: `technologies`
1. **Why It Is Needed**: Master catalog of tech stacks used as inputs by the recommendation engine.
2. **Fields & BSON Types**:
   * `_id`: `ObjectId` (Required)
   * `name`: `String` (Required, Unique)
   * `category`: `String` (Required, Enum: `['Frontend', 'Backend', 'Database', 'Cache', 'Cloud', 'DevOps', 'Storage', 'Authentication', 'Messaging', 'Monitoring']`)
   * `description`: `String` (Required)
   * `strengths`: `Array of String`
   * `weaknesses`: `Array of String`
   * `useCases`: `Array of String`
   * `limitations`: `Array of String`
   * `scalabilityScore`: `Int32` (1–10)
   * `performanceScore`: `Int32` (1–10)
   * `costScore`: `Int32` (1–10)
   * `complexityScore`: `Int32` (1–10)
   * `securityScore`: `Int32` (1–10)
   * `popularityScore`: `Int32` (1–10)
   * `compatibility`: `Array of String`
3. **Required Fields**: `name`, `category`, `description`, and all 6 score integers.
4. **Sample Document**:
```json
{
  "_id": { "$oid": "65e01234567890abcdef2001" },
  "name": "Redis",
  "category": "Cache",
  "description": "In-memory data structure store used as a database, cache, and message broker.",
  "strengths": ["Sub-millisecond latency", "Rich data types", "Pub/Sub support"],
  "weaknesses": ["Data size limited by RAM", "Single-threaded command execution"],
  "scalabilityScore": 9,
  "performanceScore": 10,
  "costScore": 8,
  "complexityScore": 5,
  "securityScore": 8,
  "popularityScore": 10,
  "compatibility": ["Node.js", "Java", "Python", "Go"]
}
```
5. **References**: Referenced by name in `project.recommendations`.
6. **Validation Rules**: All scores must be integers between 1 and 10.
7. **Indexes**: Unique index `{ name: 1 }`, Category index `{ category: 1 }`.
8. **Strategy**: **Separate Collection (Referenced Catalog)**. Shared globally across all users.
9. **Backend Module**: `Technology.js`, `technologyController.js`, `techSeeder.js`.
10. **Compass Verification**: Open `technologies`; check that total document count is $\ge 20$.

---

### Collection 3: `projects`
1. **Why It Is Needed**: Aggregate root entity that stores project metadata and hosts all downstream architectural artifacts.
2. **Fields & BSON Types**:
   * `_id`: `ObjectId` (Required)
   * `userId`: `ObjectId` (Required, Reference to `User._id`)
   * `projectName`: `String` (Required, 3–100 chars)
   * `description`: `String` (Optional, max 1000 chars)
   * `applicationType`: `String` (Enum: `['Web App', 'Mobile App', 'API Service', 'Microservices', 'Monolith', 'Desktop App', 'Other']`)
   * `priority`: `String` (Enum: `['Low', 'Medium', 'High', 'Critical']`, Default: `'Medium'`)
   * `status`: `String` (Enum: `['Draft', 'Requirements Collected', 'Analysis Complete', 'Architecture Generated']`)
   * Sub-documents for `requirements`, `recommendations`, `comparison`, `aiExplanation`, `hld`, `lld`, `diagrams`, `report`, `validation`, `scenarios`, `capacity`, `costEstimate`, `traceability`, `adrs`.
3. **Required Fields**: `userId`, `projectName`.
4. **Sample Document**:
```json
{
  "_id": { "$oid": "65e01234567890abcdef3001" },
  "userId": { "$oid": "65e01234567890abcdef1001" },
  "projectName": "FinTech Payment Gateway",
  "applicationType": "API Service",
  "priority": "Critical",
  "status": "Architecture Generated",
  "createdAt": { "$date": "2026-03-01T12:00:00.000Z" }
}
```
5. **References**: `userId` references `users._id`.
6. **Validation Rules**: `projectName` minimum 3 characters.
7. **Indexes**: Compound index `{ userId: 1, createdAt: -1 }`, text index `{ projectName: "text" }`.
8. **Strategy**: **Core Top-Level Aggregate Collection**.
9. **Backend Module**: `Project.js`, `projectController.js`.
10. **Compass Verification**: Query `{ userId: ObjectId("...") }` and verify projects load instantly using the compound index.

---

### Candidate 4: `requirements`
* **Status**: **Embedded in `projects.requirements`**
* **Rationale**: Requirements are 1-to-1 with a project. Separating them into a foreign table would require an unnecessary `$lookup` join on every project page load.
* **Fields**: `expectedUsers` (`Int32`), `dailyRequests` (`Int32`), `trafficLevel` (`String`), `geographicScope` (`String`), `hasAuth` (`Boolean`), `hasPayments` (`Boolean`), `hasRealtime` (`Boolean`), `performanceReq` (`String`), `availabilityReq` (`String`), `securityReq` (`String`), `scalabilityReq` (`String`), `budget` (`String`), `teamSize` (`Int32`), `normalizedRequirements` (`Object`).
* **Verification in Compass**: Expand `requirements` inside a document in the `projects` collection.

---

### Candidate 5: `recommendations`
* **Status**: **Embedded in `projects.recommendations`**
* **Rationale**: Preserves the exact calculation snapshot for that project, even if global technology scores change later.
* **Fields**: `overallScore` (`Double`), `recommendations` (`Object` of categories containing recommended tech and alternatives), `engineReasons` (`Array of String`), `requiredLayers` (`Array of String`).
* **Verification in Compass**: Locate a project; check `recommendations.overallScore` has a numeric value like `8.7`.

---

### Candidate 6: `architectureDocuments` (HLD & LLD)
* **Status**: **Embedded in `projects.hld` and `projects.lld`**
* **Rationale**: Total payload is small (~30KB–50KB). Embedding allows reading the entire architecture specification in a single query.
* **Fields**:
  * `hld`: `systemContext`, `multiTierLayout`, `networkBoundaries`, `communicationProtocols`, `securityControls`.
  * `lld`: `serviceDecomposition`, `apiEndpoints`, `databaseSchemas`, `indexingStrategies`, `cachingPolicies`.
* **Verification in Compass**: Verify `project.hld.systemContext` contains text descriptions.

---

### Candidate 7: `architectureDecisions` (ADRs)
* **Status**: **Embedded Array in `projects.adrs`**
* **Rationale**: A project has a bounded number of ADRs (typically 5 to 25). Storing them in an embedded array avoids foreign collection overhead and supports atomic `$push` and `$set` updates.
* **Fields (per ADR item)**: `id` (`String`, e.g., "ADR-001"), `title` (`String`), `status` (`String`, e.g., "Accepted"), `context` (`String`), `decision` (`String`), `consequences` (`String`).
* **Verification in Compass**: Confirm `project.adrs` is an array of objects.

---

### Candidate 8: `scenarios`
* **Status**: **Embedded Array in `projects.scenarios`**
* **Rationale**: What-if stress simulations are customized variations tied strictly to one project.
* **Fields (per scenario item)**: `scenarioId` (`String`), `name` (`String`), `overrides` (`Object`), `simulatedMetrics` (`Object` containing stressed latency, throughput, and saturated bottlenecks).
* **Verification in Compass**: Confirm `project.scenarios` array updates when running simulations.

---

### Candidates 9 & 10: `capacityEstimates` and `costEstimates`
* **Status**: **Embedded in `projects.capacity` and `projects.costEstimate`**
* **Rationale**: Throughput calculations and cloud hosting run-rates are generated together and displayed side-by-side on the Capacity & Cost view.
* **Fields**:
  * `capacity`: `metrics` (`peakQps`, `storageGrowthGbPerMonth`, `recommendedVcpu`, `recommendedRamGb`), `formulas` (`Object`).
  * `costEstimate`: `scenarios` (`minimum`, `expected`, `peak` breakdowns for Compute, Database, Cache, Bandwidth).
* **Verification in Compass**: Verify `project.costEstimate.scenarios.expected.totalMonthlyUsd` contains estimated numeric cost.

---

## 3. MongoDB Compass Field-Level Inspection Checklist

| Step | Target Collection | Field / Attribute | Expected Data Type | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `users` | `email` | `String` | Lowercase, unique, no duplicates allowed |
| **2** | `users` | `password` | `String` | Starts with `$2a$` or `$2b$`; length $\ge 50$ chars (hashed) |
| **3** | `technologies` | `count` | `Integer` | At least 20 records exist in collection |
| **4** | `technologies` | `scalabilityScore` | `Int32` | Value between 1 and 10 |
| **5** | `projects` | `userId` | `ObjectId` | Matches a valid `_id` in the `users` collection |
| **6** | `projects` | `projectName` | `String` | Length between 3 and 100 characters |
| **7** | `projects` | `requirements.dailyRequests` | `Int32` | Numeric integer $\ge 0$ |
| **8** | `projects` | `recommendations.overallScore` | `Double` | Numeric score between 1.0 and 10.0 |
| **9** | `projects` | `diagrams.systemArchitecture` | `String` | Valid Mermaid code string starting with `graph ` |
| **10** | `projects` | `adrs` | `Array` | Contains at least 1 ADR object with `id` and `title` |
