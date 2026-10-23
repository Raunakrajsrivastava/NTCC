/**
 * Diagram Generator Service — Module 10
 *
 * Dynamically generates valid Mermaid.js diagram definition strings
 * tailored to the actual project's requirements and recommended tech stack.
 */

export const generateDiagrams = (project) => {
  const { projectName, requirements, recommendations } = project;
  const norm = requirements?.normalizedRequirements || {};
  const recs = recommendations?.recommendations || {};

  const frontendTech = recs.Frontend?.recommended?.name || 'React App';
  const backendTech = recs.Backend?.recommended?.name || 'Node.js Express API';
  const databaseTech = recs.Database?.recommended?.name || 'PostgreSQL';
  const cacheTech = recs.Cache?.recommended?.name || 'Redis Cache';
  const storageTech = recs.Storage?.recommended?.name || 'S3 Storage';

  // ── 1. System Architecture Diagram (Flowchart) ───────────────────────────
  const systemArchitectureDiagram = `
flowchart TD
    classDef client fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    classDef frontend fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff
    classDef gateway fill:#4338ca,stroke:#a5b4fc,stroke-width:2px,color:#fff
    classDef backend fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef db fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff
    classDef cache fill:#78350f,stroke:#fbbf24,stroke-width:2px,color:#fff
    classDef storage fill:#701a75,stroke:#f0abfc,stroke-width:2px,color:#fff

    User["👤 Client (Browser / Mobile)"]:::client
    CDN["⚡ CDN Asset Delivery"]:::frontend
    Frontend["🖥 ${frontendTech}"]:::frontend
    Gateway["🛡 API Gateway / Reverse Proxy"]:::gateway
    AuthService["🔐 Auth Service"]:::backend
    CoreBackend["⚙️ ${backendTech}"]:::backend
    Database[("🗄 Primary Database: ${databaseTech}")]:::db
    Cache[("⚡ In-Memory Cache: ${cacheTech}")]:::cache
    Storage[("📦 Object Storage: ${storageTech}")]:::storage

    User --> CDN
    CDN --> Frontend
    Frontend --> Gateway
    Gateway --> AuthService
    Gateway --> CoreBackend
    CoreBackend --> Database
    CoreBackend --> Cache
    CoreBackend --> Storage
`;

  // ── 2. Data Flow Diagram (DFD Level 1) ──────────────────────────────────
  const dfdDiagram = `
flowchart LR
    classDef entity fill:#1e293b,stroke:#64748b,color:#fff
    classDef process fill:#312e81,stroke:#6366f1,color:#fff
    classDef store fill:#064e3b,stroke:#10b981,color:#fff

    User["👤 Developer / User"]:::entity
    P1["1.0 Authenticate User"]:::process
    P2["2.0 Collect & Normalize Requirements"]:::process
    P3["3.0 Evaluate Rule Engine"]:::process
    P4["4.0 Score & Rank Technologies"]:::process
    P5["5.0 Generate HLD / LLD & Diagrams"]:::process
    P6["6.0 Generate AI Report"]:::process

    D1[("D1: Users Store")]:::store
    D2[("D2: Projects & Requirements")]:::store
    D3[("D3: Technology KB")]:::store
    D4[("D4: Architecture Recommendations")]:::store

    User -->|Credentials| P1
    P1 -->|Session Token| User
    P1 <-->|Verify Credentials| D1

    User -->|Raw Form Data| P2
    P2 -->|Normalized Flags| D2

    D2 -->|Normalized Flags| P3
    D3 -->|Tech Scores & Limits| P3
    P3 -->|Calculated Metrics| P4
    P4 -->|Saved Blueprint| D4

    D4 -->|Structured Recommendations| P5
    P5 -->|HLD, LLD, Diagrams| User

    D4 -->|Context Prompt| P6
    P6 -->|AI Explanation Report| User
`;

  // ── 3. Entity Relationship (ER) Diagram ─────────────────────────────────
  const erDiagram = `
erDiagram
    USER ||--o{ PROJECT : owns
    PROJECT ||--o| REQUIREMENT : contains
    PROJECT ||--o| RECOMMENDATION : has
    PROJECT ||--o| COMPARISON : evaluates
    PROJECT ||--o| EXPLANATION : generates
    RECOMMENDATION }|--|{ TECHNOLOGY : references

    USER {
        string userId PK
        string name
        string email
        string password
        datetime createdAt
    }

    PROJECT {
        string projectId PK
        string userId FK
        string projectName
        string applicationType
        string status
        datetime createdAt
    }

    REQUIREMENT {
        string trafficLevel
        string securityLevel
        boolean scalabilityRequired
        boolean realtimeRequired
        string budgetTier
    }

    TECHNOLOGY {
        string techId PK
        string name
        string category
        int scalabilityScore
        int performanceScore
        int costScore
    }

    RECOMMENDATION {
        float overallScore
        json appliedWeights
        json requiredLayers
        datetime generatedAt
    }

    COMPARISON {
        json presetIds
        string winnerPresetId
        datetime comparedAt
    }

    EXPLANATION {
        string architectureSummary
        string scalabilityExplanation
        string securityExplanation
        boolean isFallback
    }
`;

  // ── 4. Activity Diagram ──────────────────────────────────────────────────
  const activityDiagram = `
flowchart TD
    classDef start fill:#065f46,stroke:#34d399,color:#fff
    classDef step fill:#1e293b,stroke:#6366f1,color:#fff
    classDef decision fill:#78350f,stroke:#fbbf24,color:#fff

    Start(["▶ Start"]):::start
    RegisterOrLogin["1. Register or Log In"]:::step
    CreateProject["2. Create New Project Specification"]:::step
    FillWizard["3. Fill 6-Step Requirement Wizard"]:::step
    ValidateInput{"Valid Requirements?"}:::decision
    RunAnalyzer["4. Execute Requirement Analyzer"]:::step
    EvaluateRules["5. Run Rule Engine & Calculate Weights"]:::step
    RankTech["6. Score & Rank Technologies"]:::step
    GenerateBlueprint["7. Generate HLD, LLD & Diagrams"]:::step
    GenerateAI["8. Generate AI Explanation Report"]:::step
    ExportPDF["9. Export Architecture Report / PDF"]:::step
    Finish(["🏁 Complete Architecture Document"]):::start

    Start --> RegisterOrLogin
    RegisterOrLogin --> CreateProject
    CreateProject --> FillWizard
    FillWizard --> ValidateInput
    ValidateInput -- No --> FillWizard
    ValidateInput -- Yes --> RunAnalyzer
    RunAnalyzer --> EvaluateRules
    EvaluateRules --> RankTech
    RankTech --> GenerateBlueprint
    GenerateBlueprint --> GenerateAI
    GenerateAI --> ExportPDF
    ExportPDF --> Finish
`;

  return {
    projectName,
    systemArchitecture: systemArchitectureDiagram.trim(),
    dataFlow: dfdDiagram.trim(),
    entityRelationship: erDiagram.trim(),
    activity: activityDiagram.trim(),
    generatedAt: new Date().toISOString(),
  };
};
