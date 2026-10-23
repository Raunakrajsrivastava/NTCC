/**
 * Low-Level Design (LLD) Generator — Module 9
 *
 * Generates detailed Low-Level Software Design specifying API endpoints,
 * database models, entity relationships, authentication sequence, and controller interfaces.
 */

export const generateLLD = (project) => {
  const { projectName, requirements, recommendations } = project;
  const norm = requirements?.normalizedRequirements || {};

  return {
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'User registration with password hashing', access: 'Public' },
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate user & issue JWT bearer token', access: 'Public' },
      { method: 'GET', path: '/api/auth/me', description: 'Fetch currently authenticated user profile', access: 'Protected' },
      { method: 'POST', path: '/api/projects', description: 'Create a new architecture project', access: 'Protected' },
      { method: 'GET', path: '/api/projects', description: 'List user projects with pagination', access: 'Protected' },
      { method: 'GET', path: '/api/projects/:id', description: 'Fetch detailed project specification', access: 'Protected' },
      { method: 'POST', path: '/api/projects/:id/requirements', description: 'Store & normalize project requirements', access: 'Protected' },
      { method: 'POST', path: '/api/projects/:id/recommendations/generate', description: 'Run rule-based recommendation engine', access: 'Protected' },
      { method: 'POST', path: '/api/projects/:id/compare', description: 'Execute side-by-side architecture comparison', access: 'Protected' },
      { method: 'POST', path: '/api/projects/:id/explain', description: 'Generate AI explanation report', access: 'Protected' },
      { method: 'GET', path: '/api/technologies', description: 'Query technology knowledge base with category filter', access: 'Public' },
    ],
    databaseEntities: [
      {
        name: 'User',
        tableName: 'users',
        attributes: [
          { field: '_id / userId', type: 'ObjectId / UUID', constraint: 'Primary Key, Unique' },
          { field: 'name', type: 'String', constraint: 'Required, trim (2-50 chars)' },
          { field: 'email', type: 'String', constraint: 'Required, Unique, Lowercase, Indexed' },
          { field: 'password', type: 'String', constraint: 'Required, Bcrypt Hashed, Excluded by default' },
          { field: 'createdAt', type: 'Timestamp', constraint: 'Auto-managed' },
        ],
      },
      {
        name: 'Project',
        tableName: 'projects',
        attributes: [
          { field: '_id / projectId', type: 'ObjectId / UUID', constraint: 'Primary Key, Unique' },
          { field: 'userId', type: 'ObjectId', constraint: 'Foreign Key (users._id), Indexed' },
          { field: 'projectName', type: 'String', constraint: 'Required, Trim (3-100 chars)' },
          { field: 'description', type: 'String', constraint: 'Optional (max 1000 chars)' },
          { field: 'applicationType', type: 'Enum', constraint: 'Web App | Mobile App | API | Microservices' },
          { field: 'status', type: 'Enum', constraint: 'Draft | Requirements Collected | Analysis Complete | Architecture Generated' },
          { field: 'requirements', type: 'Subdocument', constraint: 'Embedded Module 4 Requirements' },
          { field: 'recommendations', type: 'Object', constraint: 'Embedded Module 6 Scoring Output' },
          { field: 'comparison', type: 'Object', constraint: 'Embedded Module 7 Preset Evaluation' },
          { field: 'aiExplanation', type: 'Object', constraint: 'Embedded Module 8 AI Report' },
        ],
      },
      {
        name: 'Technology',
        tableName: 'technologies',
        attributes: [
          { field: '_id / techId', type: 'ObjectId / UUID', constraint: 'Primary Key, Unique' },
          { field: 'name', type: 'String', constraint: 'Required, Unique, Text Indexed' },
          { field: 'category', type: 'Enum', constraint: 'Frontend | Backend | Database | Cache | Cloud | DevOps | Storage' },
          { field: 'scalabilityScore', type: 'Number (1-10)', constraint: 'Default 5' },
          { field: 'performanceScore', type: 'Number (1-10)', constraint: 'Default 5' },
          { field: 'costScore', type: 'Number (1-10)', constraint: 'Default 5' },
          { field: 'securityScore', type: 'Number (1-10)', constraint: 'Default 5' },
        ],
      },
    ],
    entityRelationships: [
      { source: 'User', target: 'Project', relationship: 'One-to-Many (1:N)', description: 'A User can own multiple Projects. Each Project belongs to exactly one User.' },
      { source: 'Project', target: 'Requirements', relationship: 'One-to-One (1:1 Embedded)', description: 'Embedded subdocument storing requirement parameters and normalized flags.' },
      { source: 'Project', target: 'Technology', relationship: 'Many-to-Many (N:M Reference)', description: 'Projects reference multiple Technologies recommended by the scoring engine.' },
    ],
    authenticationSequence: [
      '1. Client submits credentials (email & password) via HTTPS POST to /api/auth/login.',
      '2. AuthController queries User database model (selecting password hash).',
      '3. Bcrypt compares plaintext password against stored hash.',
      '4. On success, server signs a JWT containing { id: user._id } with configured expiry (7 days).',
      '5. Server responds with HTTP 200 OK + JWT bearer token.',
      '6. Client stores JWT in localStorage and attaches "Authorization: Bearer <token>" to subsequent requests.',
      '7. AuthMiddleware verifies token signature on protected routes and attaches req.user.',
    ],
    controllerInterfaces: [
      { name: 'AuthController', duties: 'Handles user registration, login, token generation, and current profile query.' },
      { name: 'ProjectController', duties: 'Enforces project ownership, handles CRUD operations on user projects.' },
      { name: 'RequirementController', duties: 'Receives raw wizard inputs, invokes RequirementAnalyzer, updates project.' },
      { name: 'RecommendationController', duties: 'Runs rule-based RecommendationEngine against normalized flags, persists scores.' },
      { name: 'ComparisonController', duties: 'Runs ArchitectureComparer across preset stacks, outputs side-by-side table.' },
      { name: 'AIController', duties: 'Invokes AIExplainer service (Gemini 2.0 Flash) with timeout guard and offline fallback.' },
    ],
    generatedAt: new Date().toISOString(),
  };
};
