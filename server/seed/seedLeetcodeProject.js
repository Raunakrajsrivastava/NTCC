import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Technology from '../models/Technology.js';
import { analyzeRequirements } from '../services/requirementAnalyzer.js';
import { generateRecommendations } from '../services/recommendationEngine.js';
import { compareArchitectures } from '../services/architectureComparer.js';
import { explainArchitecture } from '../services/aiExplainer.js';
import { generateHLD } from '../services/hldGenerator.js';
import { generateLLD } from '../services/lldGenerator.js';
import { generateDiagrams } from '../services/diagramGenerator.js';
import { generateFinalReport } from '../services/reportGenerator.js';
import { logger } from '../utils/logger.js';

dotenv.config();

async function seedLeetCodeProject() {
  await connectDB();

  const user = await User.findOne({ email: 'ravi@example.com' });
  if (!user) {
    console.error('User ravi@example.com not found!');
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user._id})`);

  // Remove existing LeetCode demo projects if already seeded to allow re-runs
  await Project.deleteMany({
    userId: user._id,
    projectName: { $regex: /LeetCode/i },
  });

  const rawRequirements = {
    applicationType: 'Web App',
    projectDescription: 'High-throughput competitive programming, online judge, and automated code execution platform supporting live coding, contest leaderboards, isolated multi-language sandboxed runtime (C++, Python, Java, Go, Rust), and detailed submission analytics.',
    targetUsers: 'Software Engineers, Competitive Programmers, Engineering Students, and Enterprise Technical Recruiters',
    expectedUsers: 500000,
    dailyRequests: 3500000,
    trafficLevel: 'HIGH',
    geographicScope: 'Global',
    hasAuth: true,
    hasPayments: true,
    hasSearch: true,
    hasFileUploads: true,
    hasNotifications: true,
    hasRealtime: true,
    hasAdminPanel: true,
    hasAnalytics: true,
    performanceReq: 'Ultra Low Latency',
    availabilityReq: '99.99%',
    securityReq: 'Critical',
    scalabilityReq: 'Auto-scaling',
    budget: '$25k–$100k',
    teamSize: 10,
    timeline: '3–6 months',
  };

  console.log('1. Normalizing requirements...');
  const normalizedRequirements = analyzeRequirements(rawRequirements);

  console.log('2. Loading technology knowledge base...');
  const technologies = await Technology.find({});
  if (!technologies.length) {
    console.error('No technologies in DB. Run techSeeder first.');
    process.exit(1);
  }

  console.log('3. Running recommendation engine...');
  const recommendations = generateRecommendations(normalizedRequirements, technologies);

  console.log('4. Running architecture comparison...');
  const comparison = await compareArchitectures(
    ['mern', 'spring_pg', 'nextjs_pg'],
    normalizedRequirements
  );

  // Build draft project instance for downstream generators
  const projectData = {
    userId: user._id,
    projectName: 'LeetCode — Online Judge & Code Execution Platform',
    description: 'A high-concurrency competitive programming, interview preparation, and automated code judging platform capable of safely running user-submitted code in sandboxed containers (C++, Python, Java, Go, Rust), real-time contest leaderboards, and detailed algorithmic analytics.',
    applicationType: 'Web App',
    budget: '$25k–$100k',
    expectedUsers: 500000,
    expectedTraffic: 'HIGH',
    priority: 'Critical',
    status: 'Architecture Generated',
    requirements: {
      ...rawRequirements,
      normalizedRequirements,
    },
    recommendations,
    comparison,
  };

  console.log('5. Generating AI Explanation...');
  const aiExplanation = await explainArchitecture(projectData);
  projectData.aiExplanation = aiExplanation;

  console.log('6. Generating High-Level Design (HLD)...');
  const hld = generateHLD(projectData);
  // Enhance HLD with LeetCode-specific details
  hld.overview.architecturalPattern = 'Microservices & Event-Driven Asynchronous Judge Pipeline';
  hld.clientTier.supportedClients.push('Monaco Editor Web IDE (In-browser code editor with IntelliSense)');
  hld.backendTier.keyModules.push(
    'Sandboxed Code Execution Worker (Docker / gVisor isolate pods)',
    'Contest Leaderboard Real-time Rank Aggregator (Redis Sorted Sets)',
    'Test Case Validation & Runtime Profiler'
  );
  projectData.hld = hld;

  console.log('7. Generating Low-Level Design (LLD)...');
  const lld = generateLLD(projectData);
  // Inject domain-accurate LeetCode entities
  lld.entities = [
    {
      name: 'User',
      tableName: 'users',
      attributes: [
        { field: 'id', type: 'UUID', constraint: 'PK' },
        { field: 'username', type: 'VARCHAR(64)', constraint: 'UNIQUE, NOT NULL' },
        { field: 'email', type: 'VARCHAR(255)', constraint: 'UNIQUE, NOT NULL' },
        { field: 'ranking', type: 'INTEGER', constraint: 'DEFAULT 0' },
        { field: 'rating', type: 'DECIMAL(6,2)', constraint: 'DEFAULT 1500.00' },
        { field: 'created_at', type: 'TIMESTAMP', constraint: 'NOT NULL' },
      ],
    },
    {
      name: 'Problem',
      tableName: 'problems',
      attributes: [
        { field: 'id', type: 'UUID', constraint: 'PK' },
        { field: 'title', type: 'VARCHAR(255)', constraint: 'NOT NULL' },
        { field: 'slug', type: 'VARCHAR(255)', constraint: 'UNIQUE, NOT NULL' },
        { field: 'difficulty', type: 'ENUM', constraint: 'EASY, MEDIUM, HARD' },
        { field: 'description', type: 'TEXT', constraint: 'NOT NULL' },
        { field: 'time_limit_ms', type: 'INTEGER', constraint: 'DEFAULT 1000' },
        { field: 'memory_limit_mb', type: 'INTEGER', constraint: 'DEFAULT 256' },
        { field: 'acceptance_rate', type: 'DECIMAL(5,2)', constraint: 'DEFAULT 0.00' },
      ],
    },
    {
      name: 'Submission',
      tableName: 'submissions',
      attributes: [
        { field: 'id', type: 'UUID', constraint: 'PK' },
        { field: 'user_id', type: 'UUID', constraint: 'FK -> users.id' },
        { field: 'problem_id', type: 'UUID', constraint: 'FK -> problems.id' },
        { field: 'language', type: 'VARCHAR(32)', constraint: 'cpp, python, java, go, rust' },
        { field: 'code', type: 'TEXT', constraint: 'NOT NULL' },
        { field: 'verdict', type: 'ENUM', constraint: 'ACCEPTED, WRONG_ANSWER, TLE, MLE, COMPILATION_ERROR' },
        { field: 'runtime_ms', type: 'INTEGER', constraint: 'NULLABLE' },
        { field: 'memory_kb', type: 'INTEGER', constraint: 'NULLABLE' },
        { field: 'submitted_at', type: 'TIMESTAMP', constraint: 'DEFAULT NOW()' },
      ],
    },
    {
      name: 'TestCase',
      tableName: 'test_cases',
      attributes: [
        { field: 'id', type: 'UUID', constraint: 'PK' },
        { field: 'problem_id', type: 'UUID', constraint: 'FK -> problems.id' },
        { field: 'input_data', type: 'TEXT', constraint: 'NOT NULL' },
        { field: 'expected_output', type: 'TEXT', constraint: 'NOT NULL' },
        { field: 'is_sample', type: 'BOOLEAN', constraint: 'DEFAULT FALSE' },
      ],
    },
    {
      name: 'Contest',
      tableName: 'contests',
      attributes: [
        { field: 'id', type: 'UUID', constraint: 'PK' },
        { field: 'title', type: 'VARCHAR(255)', constraint: 'NOT NULL' },
        { field: 'start_time', type: 'TIMESTAMP', constraint: 'NOT NULL' },
        { field: 'duration_minutes', type: 'INTEGER', constraint: 'DEFAULT 90' },
      ],
    },
  ];

  lld.relationships = [
    { source: 'User', target: 'Submission', relationship: '1:N', description: 'A user makes multiple problem code submissions over time.' },
    { source: 'Problem', target: 'Submission', relationship: '1:N', description: 'A problem receives submissions from thousands of concurrent users.' },
    { source: 'Problem', target: 'TestCase', relationship: '1:N', description: 'Each problem contains sample and hidden test cases for judge verification.' },
    { source: 'Contest', target: 'Problem', relationship: 'N:M', description: 'Contests feature 4 curated algorithmic problems of varying difficulty.' },
  ];

  lld.apiEndpoints = [
    { method: 'GET', path: '/api/v1/problems', description: 'List problems with difficulty, tags, and acceptance rate', access: 'Public' },
    { method: 'GET', path: '/api/v1/problems/:slug', description: 'Retrieve problem statement, constraints, and starter boilerplate', access: 'Public' },
    { method: 'POST', path: '/api/v1/submissions', description: 'Submit code snippet for asynchronous sandboxed judge evaluation', access: 'Authenticated User' },
    { method: 'GET', path: '/api/v1/submissions/:id/status', description: 'Polling / WebSocket feed for live compilation & test pass verdict', access: 'Authenticated User' },
    { method: 'GET', path: '/api/v1/contests/:id/leaderboard', description: 'Retrieve real-time sorted contest standings from Redis cache', access: 'Public' },
    { method: 'POST', path: '/api/v1/admin/problems', description: 'Create problem statement and upload hidden test case bundles', access: 'Admin' },
  ];

  lld.controllerInterfaces = [
    { name: 'SubmissionController', duties: 'Receives user code, validates syntax/language constraints, pushes judge job to Kafka queue, streams status.' },
    { name: 'ProblemController', duties: 'Fetches cached problem statements, starter templates, tags, and solution editorial content.' },
    { name: 'JudgeWorkerService', duties: 'Consumes queue jobs, spawns isolated Docker/gVisor sandboxes, runs tests with cgroups CPU/memory limits, grades verdict.' },
    { name: 'LeaderboardController', duties: 'Calculates user penalty times, solves count, and updates Redis ZSET scoreboards in O(log N).' },
  ];

  projectData.lld = lld;

  console.log('8. Generating Diagrams...');
  const diagrams = generateDiagrams(projectData);
  // Customize System Architecture Diagram for LeetCode
  diagrams.systemArchitecture = `flowchart TD
    classDef client fill:#171B1E,stroke:#35D0BA,stroke-width:2px,color:#E8ECEF
    classDef edge fill:#1C2226,stroke:#6FA8C9,stroke-width:2px,color:#E8ECEF
    classDef backend fill:#111416,stroke:#35D0BA,stroke-width:2px,color:#E8ECEF
    classDef queue fill:#2A3237,stroke:#F59E0B,stroke-width:2px,color:#E8ECEF
    classDef worker fill:#171B1E,stroke:#10B981,stroke-width:2px,color:#E8ECEF
    classDef data fill:#0B0D0F,stroke:#6FA8C9,stroke-width:2px,color:#E8ECEF

    User["👤 Developer / Candidate (Web IDE)"]:::client
    EdgeCDN["⚡ Cloudflare CDN & DDoS Shield"]:::edge
    APIGateway["🛡 Reverse Proxy & API Gateway (Nginx)"]:::edge
    
    SubService["⚙️ Submission & API Service (Node.js/Go)"]:::backend
    AuthService["🔐 Auth & Session Service (JWT)"]:::backend
    ContestService["🏆 Contest & Leaderboard Service"]:::backend

    KafkaQueue["📨 Asynchronous Submission Queue (Kafka / Redis Stream)"]:::queue
    JudgeCluster["🐳 Sandboxed Judge Worker Pool (gVisor / Docker Pods)"]:::worker

    PrimaryDB[("🗄 Primary Database (PostgreSQL - Users & Problems)")]:::data
    RedisCache[("⚡ In-Memory Cache (Redis - Leaderboards & Sessions)")]:::data
    S3Storage[("📦 Object Storage (S3 - Large Test Cases & Assets)")]:::data

    User --> EdgeCDN
    EdgeCDN --> APIGateway
    APIGateway --> AuthService
    APIGateway --> SubService
    APIGateway --> ContestService

    SubService --> KafkaQueue
    KafkaQueue --> JudgeCluster
    JudgeCluster --> S3Storage
    JudgeCluster --> SubService

    SubService --> PrimaryDB
    SubService --> RedisCache
    ContestService --> RedisCache
`;

  diagrams.dataFlow = `flowchart LR
    classDef user fill:#171B1E,stroke:#6FA8C9,color:#fff
    classDef process fill:#111416,stroke:#35D0BA,color:#fff
    classDef queue fill:#2A3237,stroke:#F59E0B,color:#fff
    classDef store fill:#0B0D0F,stroke:#10B981,color:#fff

    User["👤 Candidate"]:::user
    P1["1.0 Submit Code"]:::process
    P2["2.0 Queue Evaluation"]:::queue
    P3["3.0 Sandboxed Execution (cgroups)"]:::process
    P4["4.0 Compute Verdict & Metrics"]:::process
    P5["5.0 Update Leaderboard (ZSET)"]:::process
    DB[("🗄 PostgreSQL")]:::store
    Redis[("⚡ Redis Cache")]:::store

    User --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> DB
    P4 --> P5
    P5 --> Redis
    P4 -.->|WebSocket Result| User
`;

  projectData.diagrams = diagrams;

  console.log('9. Generating Master 23-Section Report...');
  const report = generateFinalReport(projectData);
  projectData.report = report;

  console.log('10. Saving to MongoDB...');
  const newProject = new Project(projectData);
  await newProject.save();

  console.log(`\n SUCCESS: LeetCode project created successfully!`);
  console.log(`Project ID: ${newProject._id}`);
  console.log(`Project Name: ${newProject.projectName}`);
  console.log(`Total Report Sections: ${Object.keys(report.sections).length}`);
  console.log(`You can now log in as ${user.email} and view the project!`);

  process.exit(0);
}

seedLeetCodeProject().catch((err) => {
  console.error('Error seeding project:', err);
  process.exit(1);
});
