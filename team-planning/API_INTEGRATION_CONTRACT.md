# API Integration Contract

This document serves as the binding technical contract between **Person 1 (Frontend)** and **Person 2 (Backend)**, verified by **Person 3 (Testing & Documentation)**. It defines exact HTTP methods, routes, headers, request bodies, response payloads, error models, and backend controllers.

---

## 1. Global Standards & Conventions

### Base URL
* Development: `http://localhost:5000/api`
* Configured in frontend via `VITE_API_BASE_URL` in [client/.env](file:///c:/Users/ACER/Desktop/NTCC/client/.env).

### Authentication Header
All protected endpoints require the HTTP `Authorization` header containing the user's JWT:
```http
Authorization: Bearer <jwt_token>
```

### Standard Success Response Envelope
All endpoints return responses in this standardized envelope:
```json
{
  "success": true,
  "data": { ... } // or named root objects like "project", "projects", "recommendations"
}
```

### Standard Error Response Envelope
Handled centrally by [server/middleware/errorHandler.js](file:///c:/Users/ACER/Desktop/NTCC/server/middleware/errorHandler.js):
```json
{
  "success": false,
  "error": {
    "message": "Human-readable explanation of error",
    "status": 400,
    "details": null
  }
}
```

---

## 2. Endpoint Specifications

### 2.1 System & Health

#### `GET /api/health`
* **Status**: **Existing**
* **Auth**: Public (Exempt from rate limits)
* **Backend Controller**: [healthController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/healthController.js)
* **Frontend Consumer**: [Navbar.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/components/layout/Navbar.jsx) (polled every 30s)
* **Collections**: None
* **Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-01T12:00:00.000Z",
  "uptime": 1420.5,
  "database": "connected"
}
```

---

### 2.2 Authentication & User Lifecycle

#### `POST /api/auth/register`
* **Status**: **Existing**
* **Auth**: Public (Rate-limited: 20 req / 15 min)
* **Backend**: [authController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/authController.js) $\rightarrow$ `User.js`
* **Frontend Consumer**: [RegisterPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/RegisterPage.jsx)
* **Collections**: `users`
* **Request Body**:
```json
{
  "name": "Ravi Sharma",
  "email": "ravi@example.com",
  "password": "Password123!"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65e01234567890abcdef1001",
    "name": "Ravi Sharma",
    "email": "ravi@example.com",
    "role": "user"
  }
}
```

#### `POST /api/auth/login`
* **Status**: **Existing**
* **Auth**: Public (Rate-limited: 20 req / 15 min)
* **Backend**: [authController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/authController.js)
* **Frontend Consumer**: [LoginPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/LoginPage.jsx)
* **Collections**: `users`
* **Request Body**:
```json
{
  "email": "ravi@example.com",
  "password": "Password123!"
}
```
* **Response (200 OK)**: Same structure as register response.

#### `GET /api/auth/me`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [authController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/authController.js)
* **Frontend Consumer**: [AuthContext.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/context/AuthContext.jsx) (on app launch)
* **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "65e01234567890abcdef1001",
    "name": "Ravi Sharma",
    "email": "ravi@example.com",
    "role": "user"
  }
}
```

---

### 2.3 Technology Knowledge Base

#### `GET /api/technologies`
* **Status**: **Existing**
* **Auth**: Public
* **Backend**: [technologyController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/technologyController.js) $\rightarrow$ `Technology.js`
* **Frontend Consumer**: [TechnologiesPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/TechnologiesPage.jsx)
* **Collections**: `technologies`
* **Query Parameters (Optional)**: `?category=Database&search=postgres`
* **Response (200 OK)**:
```json
{
  "success": true,
  "count": 22,
  "technologies": [
    {
      "_id": "65e01234567890abcdef2001",
      "name": "PostgreSQL",
      "category": "Database",
      "description": "Powerful open-source object-relational database with strong ACID compliance.",
      "strengths": ["ACID compliance", "Complex queries"],
      "weaknesses": ["Horizontal scaling requires effort"],
      "scalabilityScore": 8,
      "performanceScore": 9,
      "costScore": 9,
      "complexityScore": 6,
      "securityScore": 9,
      "popularityScore": 10,
      "compatibility": ["Node.js", "Java", "Python"]
    }
  ]
}
```

---

### 2.4 Project Management

#### `GET /api/projects`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [projectController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/projectController.js)
* **Frontend Consumer**: [DashboardPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/DashboardPage.jsx), [ProjectsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ProjectsPage.jsx)
* **Collections**: `projects`
* **Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "projects": [
    {
      "projectId": "65e01234567890abcdef3001",
      "projectName": "Online Code Judge Platform",
      "description": "High-throughput online judge and competitive programming platform.",
      "applicationType": "Web App",
      "status": "Architecture Generated",
      "createdAt": "2026-03-01T12:00:00.000Z"
    }
  ]
}
```

#### `POST /api/projects`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [projectController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/projectController.js)
* **Frontend Consumer**: [CreateProjectPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/CreateProjectPage.jsx)
* **Collections**: `projects`
* **Request Body**:
```json
{
  "projectName": "Realtime Logistics Fleet",
  "description": "IoT vehicle tracking and dynamic dispatch system.",
  "applicationType": "Web App",
  "priority": "High"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "project": {
    "projectId": "65e01234567890abcdef3002",
    "projectName": "Realtime Logistics Fleet",
    "status": "Draft"
  }
}
```

#### `GET /api/projects/:id`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [projectController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/projectController.js)
* **Frontend Consumer**: [ProjectDetailPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ProjectDetailPage.jsx)
* **Response (200 OK)**: Returns full aggregate `project` document.

---

### 2.5 Requirements & Recommendation Engine

#### `POST /api/projects/:projectId/requirements`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [requirementController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/requirementController.js) $\rightarrow$ [requirementAnalyzer.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/requirementAnalyzer.js)
* **Frontend Consumer**: [RequirementsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/RequirementsPage.jsx)
* **Request Body**:
```json
{
  "applicationType": "Web App",
  "projectDescription": "Competitive programming platform with sandboxed execution.",
  "targetUsers": "Engineers and Students",
  "expectedUsers": 500000,
  "dailyRequests": 3500000,
  "trafficLevel": "HIGH",
  "geographicScope": "Global",
  "hasAuth": true,
  "hasPayments": true,
  "hasRealtime": true,
  "performanceReq": "Ultra Low Latency",
  "availabilityReq": "99.99%",
  "securityReq": "Critical",
  "scalabilityReq": "Auto-scaling",
  "budget": "$25k–$100k",
  "teamSize": 8
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "requirements": { ... },
  "normalizedRequirements": {
    "trafficTier": "HIGH",
    "requireCache": true,
    "requireMessageQueue": true
  }
}
```

#### `POST /api/projects/:projectId/recommendations/recalculate`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [recommendationController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/recommendationController.js) $\rightarrow$ [recommendationEngine.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/recommendationEngine.js)
* **Frontend Consumer**: [RecommendationsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/RecommendationsPage.jsx)
* **Request Body (Custom Weights)**:
```json
{
  "customWeights": {
    "scalability": 0.35,
    "performance": 0.25,
    "cost": 0.10,
    "complexity": 0.10,
    "security": 0.15,
    "popularity": 0.05
  }
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "recommendations": {
    "overallScore": 8.9,
    "recommendations": {
      "Frontend": {
        "recommended": { "name": "React", "score": 8.7 },
        "alternatives": [{ "name": "Next.js", "score": 8.5 }]
      },
      "Backend": {
        "recommended": { "name": "Node.js", "score": 9.1 },
        "alternatives": [{ "name": "Go", "score": 8.9 }]
      },
      "Database": {
        "recommended": { "name": "PostgreSQL", "score": 9.0 },
        "alternatives": [{ "name": "MongoDB", "score": 8.2 }]
      },
      "Cache": {
        "recommended": { "name": "Redis", "score": 9.6 }
      }
    },
    "engineReasons": [
      "Ultra Low Latency SLA triggered mandatory in-memory Redis caching."
    ]
  }
}
```

---

### 2.6 Architecture Comparison & AI Explanation

#### `POST /api/projects/:projectId/compare`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [comparisonController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/comparisonController.js)
* **Frontend Consumer**: [ComparisonPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ComparisonPage.jsx)
* **Request Body**:
```json
{
  "presets": ["mern", "spring_pg", "django_pg"]
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "comparison": {
    "stacks": [
      { "id": "recommended", "name": "Recommended Architecture", "overallScore": 8.9 },
      { "id": "mern", "name": "MERN Stack", "overallScore": 7.8 }
    ],
    "criteriaWinners": {
      "Performance": "Recommended Architecture",
      "Cost": "MERN Stack"
    }
  }
}
```

#### `POST /api/projects/:projectId/explain`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required (Rate-limited: 5 req / min)
* **Backend**: [aiController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/aiController.js) $\rightarrow$ [aiExplainer.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/aiExplainer.js)
* **Frontend Consumer**: [ExplanationPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ExplanationPage.jsx)
* **Response (200 OK)**:
```json
{
  "success": true,
  "_isFallback": false,
  "explanation": {
    "architectureSummary": "A cloud-native multi-tier event-driven architecture...",
    "technologyExplanation": "Node.js was selected for non-blocking I/O...",
    "alternativeExplanation": "Spring Boot was evaluated but rejected due to higher memory footprint...",
    "advantages": ["Sub-millisecond read latency", "Horizontal scalability"],
    "disadvantages": ["Eventual consistency complexity"],
    "tradeoffs": ["Sacrificed immediate consistency for throughput"],
    "risks": ["Redis cluster failover overhead"],
    "scalabilityExplanation": "Stateless backend containers scale horizontally on Kubernetes...",
    "securityExplanation": "Zero-trust network model with mTLS...",
    "improvementSuggestions": ["Implement database read-replicas in secondary regions"]
  }
}
```

---

### 2.7 Design Specifications & Diagrams

#### `POST /api/projects/:projectId/design/hld` & `.../lld`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [designController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/designController.js)
* **Frontend Consumer**: [HLDPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/HLDPage.jsx), [LLDPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/LLDPage.jsx)
* **Response (200 OK)**: Returns structured HLD context and LLD API/schema specs.

#### `POST /api/projects/:projectId/diagrams`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [diagramController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/diagramController.js) $\rightarrow$ [diagramGenerator.js](file:///c:/Users/ACER/Desktop/NTCC/server/services/diagramGenerator.js)
* **Frontend Consumer**: [DiagramsPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/DiagramsPage.jsx)
* **Response (200 OK)**:
```json
{
  "success": true,
  "diagrams": {
    "systemArchitecture": "graph TD\n  Client --> CDN\n  CDN --> ALB\n  ALB --> API\n  API --> Redis\n  API --> DB",
    "dataFlow": "graph LR\n  User -->|HTTPS POST| IngestionProcess\n  IngestionProcess --> MessageQueue",
    "entityRelationship": "erDiagram\n  USER ||--o{ SUBMISSION : creates\n  PROBLEM ||--o{ SUBMISSION : tests",
    "activity": "stateDiagram-v2\n  [*] --> SubmitCode\n  SubmitCode --> RunSandbox\n  RunSandbox --> CheckOutput"
  }
}
```

---

### 2.8 Validation, Simulation, Capacity & Costs

#### `POST /api/projects/:projectId/validate`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [validationController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/validationController.js)
* **Frontend Consumer**: [ValidationPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ValidationPage.jsx)
* **Response (200 OK)**:
```json
{
  "success": true,
  "validation": {
    "status": "PASSED_WITH_WARNINGS",
    "score": 92,
    "issues": [
      {
        "id": "SEC-002",
        "category": "Security",
        "severity": "MEDIUM",
        "title": "Database at Rest Encryption",
        "description": "Sensitive customer data requires AES-256 volume encryption.",
        "remediation": "Enable KMS-managed encryption on PostgreSQL storage volumes."
      }
    ]
  }
}
```

#### `GET /api/projects/:projectId/capacity-cost`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [capacityCostController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/capacityCostController.js)
* **Frontend Consumer**: [CapacityCostPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/CapacityCostPage.jsx)
* **Response (200 OK)**:
```json
{
  "success": true,
  "capacity": {
    "metrics": {
      "peakQps": 125,
      "recommendedVcpu": 8,
      "recommendedRamGb": 32,
      "storageGrowthGbPerMonth": 45
    }
  },
  "costEstimate": {
    "scenarios": {
      "minimum": { "totalMonthlyUsd": 240 },
      "expected": { "totalMonthlyUsd": 480 },
      "peak": { "totalMonthlyUsd": 890 }
    }
  }
}
```

---

### 2.9 Final Architecture Reports

#### `GET /api/projects/:projectId/report`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Backend**: [reportController.js](file:///c:/Users/ACER/Desktop/NTCC/server/controllers/reportController.js)
* **Frontend Consumer**: [ReportViewPage.jsx](file:///c:/Users/ACER/Desktop/NTCC/client/src/pages/ReportViewPage.jsx)
* **Response (200 OK)**: Consolidated 23-section architecture specification document.

#### `GET /api/projects/:projectId/report/export/markdown`
* **Status**: **Existing**
* **Auth**: Bearer JWT Required
* **Response Headers**: `Content-Type: text/markdown; charset=utf-8`, `Content-Disposition: attachment; filename=Architecture-Report-<id>.md`
* **Response Body**: Raw Markdown string.

---

## 3. Mock Data Strategy for Person 1
Person 1 can intercept requests or toggle mock fixtures in [client/src/services/api.js](file:///c:/Users/ACER/Desktop/NTCC/client/src/services/api.js) by returning static JSON promises that match the exact JSON schemas documented above. This guarantees that when Person 2 connects the live database endpoints, zero frontend code changes will be required.
