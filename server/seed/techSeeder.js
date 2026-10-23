/**
 * Technology Knowledge Base Seeder — Module 5
 * Run: node seed/techSeeder.js
 *
 * Drops the technologies collection and re-seeds with fresh data.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import Technology from '../models/Technology.js';

const technologies = [
  // ─── FRONTEND ───────────────────────────────────────────────────────────
  {
    name: 'React',
    category: 'Frontend',
    description: 'A declarative, component-based JavaScript library for building user interfaces, maintained by Meta.',
    strengths: ['Huge ecosystem', 'Virtual DOM for performance', 'Reusable components', 'Strong community', 'React Native for mobile'],
    weaknesses: ['Library only — needs additional tools (router, state)', 'JSX learning curve', 'Frequent updates'],
    useCases: ['SPAs', 'Dashboards', 'Social platforms', 'E-commerce UIs'],
    limitations: ['Not a full framework — opinionated tooling choices needed', 'SEO requires SSR setup (Next.js)'],
    scalabilityScore: 8, performanceScore: 8, costScore: 9, complexityScore: 5, securityScore: 7, popularityScore: 10,
    compatibility: ['Node.js', 'GraphQL', 'REST APIs', 'TypeScript'],
    recommendedFor: ['SPAs', 'Startups', 'Teams familiar with JS'],
    notRecommendedFor: ['Server-rendered SEO-heavy sites (use Next.js instead)'],
  },
  {
    name: 'Next.js',
    category: 'Frontend',
    description: 'A React framework that enables server-side rendering, static site generation, and API routes out of the box.',
    strengths: ['SSR & SSG built-in', 'Excellent SEO', 'File-based routing', 'API routes', 'Image optimization', 'Edge runtime'],
    weaknesses: ['Opinionated', 'More complex than plain React', 'Cold start times on serverless'],
    useCases: ['SEO-critical apps', 'E-commerce', 'Marketing sites', 'Full-stack apps'],
    limitations: ['Vercel-optimized (some features work best on Vercel)', 'Large bundle size without optimization'],
    scalabilityScore: 9, performanceScore: 9, costScore: 8, complexityScore: 6, securityScore: 8, popularityScore: 9,
    compatibility: ['React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'MongoDB'],
    recommendedFor: ['SEO-sensitive applications', 'Full-stack React projects'],
    notRecommendedFor: ['Simple SPAs without SEO needs'],
  },
  {
    name: 'Angular',
    category: 'Frontend',
    description: 'A full-featured TypeScript-based MVC framework by Google, ideal for large-scale enterprise applications.',
    strengths: ['Full framework (no tooling decisions)', 'TypeScript first', 'Dependency injection', 'Excellent for large teams', 'Strong conventions'],
    weaknesses: ['Steep learning curve', 'Verbose boilerplate', 'Heavy bundle size', 'Slower development speed'],
    useCases: ['Enterprise dashboards', 'B2B SaaS', 'Banking portals', 'Large team projects'],
    limitations: ['Overkill for small projects', 'Complex upgrade cycles'],
    scalabilityScore: 9, performanceScore: 7, costScore: 7, complexityScore: 8, securityScore: 9, popularityScore: 7,
    compatibility: ['TypeScript', 'RxJS', 'NgRx', 'Spring Boot', '.NET'],
    recommendedFor: ['Enterprise apps', 'Large teams', 'Long-lived projects'],
    notRecommendedFor: ['Startups', 'Small projects', 'Teams without TypeScript experience'],
  },
  {
    name: 'Vue',
    category: 'Frontend',
    description: 'A progressive JavaScript framework with an approachable learning curve and flexible architecture.',
    strengths: ['Easy to learn', 'Two-way data binding', 'Progressive adoption', 'Excellent documentation', 'Small bundle'],
    weaknesses: ['Smaller ecosystem than React', 'Fewer job opportunities', 'Community smaller'],
    useCases: ['Small-to-medium apps', 'Prototypes', 'Teams transitioning from jQuery', 'Admin panels'],
    limitations: ['Less popular than React for enterprise', 'Plugin ecosystem not as large'],
    scalabilityScore: 7, performanceScore: 8, costScore: 9, complexityScore: 4, securityScore: 7, popularityScore: 7,
    compatibility: ['Vite', 'Pinia', 'Vue Router', 'TypeScript'],
    recommendedFor: ['Small teams', 'Rapid prototyping', 'Beginner-friendly projects'],
    notRecommendedFor: ['Large enterprise teams seeking standardization'],
  },

  // ─── BACKEND ─────────────────────────────────────────────────────────────
  {
    name: 'Node.js',
    category: 'Backend',
    description: 'A JavaScript runtime built on Chrome\'s V8 engine, enabling server-side JavaScript execution.',
    strengths: ['Non-blocking I/O', 'Same language as frontend', 'Massive npm ecosystem', 'Great for real-time apps', 'Microservices-friendly'],
    weaknesses: ['Single-threaded (CPU-bound tasks)', 'Callback hell (mitigated by async/await)', 'Not ideal for heavy computation'],
    useCases: ['REST APIs', 'Real-time apps (Socket.io)', 'Streaming', 'Microservices'],
    limitations: ['Poor for CPU-intensive operations like ML inference'],
    scalabilityScore: 8, performanceScore: 8, costScore: 9, complexityScore: 5, securityScore: 7, popularityScore: 10,
    compatibility: ['Express.js', 'MongoDB', 'PostgreSQL', 'Redis', 'React'],
    recommendedFor: ['I/O-heavy apps', 'Real-time features', 'Full-stack JavaScript teams'],
    notRecommendedFor: ['CPU-intensive computation', 'ML workloads'],
  },
  {
    name: 'Express.js',
    category: 'Backend',
    description: 'A minimal, unopinionated web framework for Node.js — the de facto standard for Node.js REST APIs.',
    strengths: ['Minimal and flexible', 'Huge middleware ecosystem', 'Easy to start', 'Full control over structure'],
    weaknesses: ['Unopinionated (too much freedom can be bad)', 'No built-in security features', 'Manual structure required'],
    useCases: ['REST APIs', 'Middleware pipelines', 'Microservices', 'BFF (Backend for Frontend)'],
    limitations: ['No ORM, no auth — must be added manually'],
    scalabilityScore: 7, performanceScore: 8, costScore: 9, complexityScore: 4, securityScore: 6, popularityScore: 10,
    compatibility: ['Node.js', 'MongoDB', 'Mongoose', 'JWT', 'PostgreSQL'],
    recommendedFor: ['Lightweight APIs', 'Prototypes', 'Microservices'],
    notRecommendedFor: ['Large structured projects without conventions'],
  },
  {
    name: 'Spring Boot',
    category: 'Backend',
    description: 'An opinionated Java framework that simplifies the development of production-grade Spring applications.',
    strengths: ['Enterprise-grade', 'Robust dependency injection', 'Strong security', 'Excellent database integration', 'Type safety'],
    weaknesses: ['Verbose', 'Slow startup time', 'High memory consumption', 'Java learning curve'],
    useCases: ['Enterprise backends', 'Banking systems', 'High-throughput APIs', 'Microservices with Java'],
    limitations: ['Not suitable for serverless (cold starts)', 'Resource-heavy'],
    scalabilityScore: 9, performanceScore: 8, costScore: 5, complexityScore: 8, securityScore: 10, popularityScore: 8,
    compatibility: ['PostgreSQL', 'MySQL', 'Redis', 'Kafka', 'Angular'],
    recommendedFor: ['Enterprise Java teams', 'High-security applications', 'Large-scale systems'],
    notRecommendedFor: ['Startups', 'Serverless', 'Small teams'],
  },
  {
    name: '.NET',
    category: 'Backend',
    description: 'Microsoft\'s cross-platform framework for building modern applications, including web APIs with ASP.NET Core.',
    strengths: ['High performance', 'Cross-platform', 'Strong typing', 'Azure integration', 'Comprehensive tooling'],
    weaknesses: ['Microsoft ecosystem dependency', 'Heavier than Node.js', 'Licensing considerations'],
    useCases: ['Enterprise APIs', 'Windows applications', 'Azure-native apps', 'Game backends (Unity)'],
    limitations: ['Best suited for Microsoft ecosystem'],
    scalabilityScore: 9, performanceScore: 9, costScore: 5, complexityScore: 7, securityScore: 9, popularityScore: 7,
    compatibility: ['SQL Server', 'Azure', 'React', 'Angular'],
    recommendedFor: ['Microsoft ecosystem', 'Enterprise teams', 'Azure deployments'],
    notRecommendedFor: ['Startups avoiding vendor lock-in'],
  },
  {
    name: 'Django',
    category: 'Backend',
    description: 'A high-level Python web framework that encourages rapid development with its "batteries included" philosophy.',
    strengths: ['Batteries included (ORM, auth, admin)', 'Rapid development', 'Strong security defaults', 'Python ecosystem', 'Excellent for ML integration'],
    weaknesses: ['Monolithic by design', 'Not ideal for real-time', 'ORM can be limiting for complex queries'],
    useCases: ['Content platforms', 'ML-backed APIs', 'Rapid prototypes', 'Admin-heavy apps'],
    limitations: ['Poor performance for real-time features', 'Not ideal for microservices'],
    scalabilityScore: 7, performanceScore: 6, costScore: 8, complexityScore: 5, securityScore: 9, popularityScore: 8,
    compatibility: ['PostgreSQL', 'Redis', 'Celery', 'React', 'Vue'],
    recommendedFor: ['Data science teams', 'Rapid MVPs', 'Content management'],
    notRecommendedFor: ['Real-time applications', 'High-throughput microservices'],
  },
  {
    name: 'FastAPI',
    category: 'Backend',
    description: 'A modern, high-performance Python web framework for building APIs, based on Python type hints.',
    strengths: ['Extremely fast (Starlette + Pydantic)', 'Auto-generated docs (Swagger)', 'Type safety', 'Async support', 'Great for ML APIs'],
    weaknesses: ['Smaller ecosystem than Django', 'Less opinionated (more decisions required)', 'Relatively newer'],
    useCases: ['ML inference APIs', 'Data-heavy REST APIs', 'Microservices', 'High-performance Python APIs'],
    limitations: ['No built-in ORM', 'Async code complexity'],
    scalabilityScore: 8, performanceScore: 9, costScore: 9, complexityScore: 5, securityScore: 7, popularityScore: 8,
    compatibility: ['PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes'],
    recommendedFor: ['ML teams', 'High-performance Python APIs', 'Microservices'],
    notRecommendedFor: ['Teams needing a full-featured framework like Django'],
  },

  // ─── DATABASE ────────────────────────────────────────────────────────────
  {
    name: 'PostgreSQL',
    category: 'Database',
    description: 'A powerful, open-source object-relational database system with a strong reputation for reliability and SQL compliance.',
    strengths: ['ACID compliant', 'Complex queries & joins', 'JSON support', 'Extensions (PostGIS, etc.)', 'Strong consistency'],
    weaknesses: ['Scaling requires expertise (read replicas, sharding)', 'More complex ops than NoSQL'],
    useCases: ['Transactional systems', 'Financial apps', 'SaaS with complex data', 'Geospatial data'],
    limitations: ['Horizontal scaling more complex than NoSQL'],
    scalabilityScore: 8, performanceScore: 8, costScore: 9, complexityScore: 6, securityScore: 9, popularityScore: 9,
    compatibility: ['Prisma', 'TypeORM', 'Django ORM', 'Spring JPA', 'Node.js'],
    recommendedFor: ['Complex relational data', 'Financial systems', 'Apps needing ACID'],
    notRecommendedFor: ['Unstructured data', 'Extreme horizontal scaling without expertise'],
  },
  {
    name: 'MySQL',
    category: 'Database',
    description: 'The world\'s most popular open-source relational database, widely used in web applications.',
    strengths: ['Widely known', 'Good performance for reads', 'Mature ecosystem', 'Easy hosting options'],
    weaknesses: ['Less advanced than PostgreSQL', 'Limited JSON support', 'MyISAM issues'],
    useCases: ['Web apps', 'CMS (WordPress)', 'E-commerce', 'Traditional LAMP stack'],
    limitations: ['Less feature-rich than PostgreSQL', 'Replication complexity'],
    scalabilityScore: 7, performanceScore: 7, costScore: 9, complexityScore: 5, securityScore: 7, popularityScore: 8,
    compatibility: ['PHP', 'Laravel', 'Django', 'Spring Boot', 'Node.js'],
    recommendedFor: ['Traditional web apps', 'Teams familiar with SQL', 'LAMP stack'],
    notRecommendedFor: ['Complex analytics', 'Document storage'],
  },
  {
    name: 'MongoDB',
    category: 'Database',
    description: 'A leading NoSQL document database that stores data in flexible, JSON-like BSON documents.',
    strengths: ['Flexible schema', 'Horizontal scaling (sharding)', 'Fast for reads/writes', 'Good for unstructured data', 'Atlas cloud offering'],
    weaknesses: ['No joins (requires denormalization)', 'Not ACID by default (pre 4.0)', 'Can lead to data inconsistency'],
    useCases: ['Catalogs', 'CMS', 'Real-time analytics', 'User profiles', 'IoT data'],
    limitations: ['Not ideal for highly relational data', 'Aggregation pipelines complex'],
    scalabilityScore: 9, performanceScore: 8, costScore: 8, complexityScore: 5, securityScore: 7, popularityScore: 9,
    compatibility: ['Node.js', 'Mongoose', 'Express', 'Spring Boot', 'FastAPI'],
    recommendedFor: ['Flexible data', 'Rapid prototyping', 'Document storage', 'MERN stack'],
    notRecommendedFor: ['Complex transactional systems', 'Highly relational data'],
  },

  // ─── CACHE ───────────────────────────────────────────────────────────────
  {
    name: 'Redis',
    category: 'Cache',
    description: 'An in-memory data structure store used as a database, cache, and message broker with sub-millisecond latency.',
    strengths: ['Sub-millisecond latency', 'Versatile data structures', 'Pub/Sub messaging', 'Session storage', 'Rate limiting'],
    weaknesses: ['Data fits in RAM (memory-limited)', 'Persistence requires configuration', 'Not a primary database'],
    useCases: ['Session caching', 'Rate limiting', 'Real-time leaderboards', 'Queue management', 'API response caching'],
    limitations: ['Memory-bound', 'Persistence is secondary'],
    scalabilityScore: 9, performanceScore: 10, costScore: 7, complexityScore: 4, securityScore: 7, popularityScore: 9,
    compatibility: ['Node.js', 'Spring Boot', 'Django', 'FastAPI', 'Kafka'],
    recommendedFor: ['High-traffic apps', 'Real-time features', 'Session management'],
    notRecommendedFor: ['Primary data storage', 'Budget-constrained startups with large datasets'],
  },

  // ─── CLOUD ───────────────────────────────────────────────────────────────
  {
    name: 'AWS',
    category: 'Cloud',
    description: 'Amazon Web Services — the world\'s most comprehensive cloud platform with 200+ fully featured services.',
    strengths: ['Market leader', 'Broadest service catalog', 'Global infrastructure', 'Mature ecosystem', 'Enterprise support'],
    weaknesses: ['Complex pricing', 'Steep learning curve', 'Vendor lock-in risk', 'Cost management difficult'],
    useCases: ['Any scale application', 'Enterprise workloads', 'ML/AI workloads', 'Global CDN'],
    limitations: ['Pricing can be unpredictable', 'Complexity at scale'],
    scalabilityScore: 10, performanceScore: 9, costScore: 5, complexityScore: 9, securityScore: 9, popularityScore: 10,
    compatibility: ['All major frameworks', 'Kubernetes', 'Terraform', 'Docker'],
    recommendedFor: ['Enterprise', 'Teams needing broadest service choice', 'Global applications'],
    notRecommendedFor: ['Teams without cloud expertise', 'Budget-sensitive startups'],
  },
  {
    name: 'Azure',
    category: 'Cloud',
    description: 'Microsoft\'s cloud computing platform, deeply integrated with Microsoft enterprise tools and services.',
    strengths: ['Best Microsoft ecosystem integration', 'Enterprise agreements', 'Active Directory integration', 'Strong compliance'],
    weaknesses: ['Complex UI', 'Some services lag behind AWS', 'Pricing complexity'],
    useCases: ['Microsoft-stack enterprises', 'Hybrid cloud', 'Enterprise AI with Azure OpenAI', '.NET workloads'],
    limitations: ['Best suited for Microsoft ecosystem'],
    scalabilityScore: 9, performanceScore: 8, costScore: 5, complexityScore: 8, securityScore: 9, popularityScore: 8,
    compatibility: ['.NET', 'SQL Server', 'Active Directory', 'Teams', 'Power BI'],
    recommendedFor: ['Microsoft shops', 'Enterprise compliance', 'Hybrid cloud'],
    notRecommendedFor: ['Teams avoiding Microsoft ecosystem'],
  },
  {
    name: 'Google Cloud',
    category: 'Cloud',
    description: 'Google Cloud Platform — known for big data, machine learning, and Kubernetes (GKE) capabilities.',
    strengths: ['Best-in-class data/ML services', 'GKE (Kubernetes leader)', 'BigQuery for analytics', 'Networking performance', 'Firebase integration'],
    weaknesses: ['Smaller market share', 'Fewer managed services than AWS', 'Product sunset history'],
    useCases: ['ML/AI workloads', 'Big data analytics', 'Kubernetes-native apps', 'Media processing'],
    limitations: ['Less breadth than AWS', 'Some history of product discontinuation'],
    scalabilityScore: 9, performanceScore: 9, costScore: 7, complexityScore: 7, securityScore: 9, popularityScore: 7,
    compatibility: ['Kubernetes', 'TensorFlow', 'BigQuery', 'Firebase', 'All major frameworks'],
    recommendedFor: ['ML/AI workloads', 'Kubernetes-first teams', 'Data analytics'],
    notRecommendedFor: ['Teams needing broadest managed service catalog (use AWS)'],
  },

  // ─── DEVOPS ──────────────────────────────────────────────────────────────
  {
    name: 'Docker',
    category: 'DevOps',
    description: 'A platform for developing, shipping, and running applications in isolated containers.',
    strengths: ['Environment consistency', 'Portability', 'Isolation', 'Fast startup', 'Large image registry (Docker Hub)'],
    weaknesses: ['Security considerations (container escape)', 'Not ideal for stateful apps without volumes', 'Image size management'],
    useCases: ['Application packaging', 'Development environments', 'CI/CD pipelines', 'Microservices'],
    limitations: ['Not a full orchestration solution alone (needs K8s for production)'],
    scalabilityScore: 8, performanceScore: 8, costScore: 9, complexityScore: 4, securityScore: 7, popularityScore: 10,
    compatibility: ['Kubernetes', 'AWS ECS', 'GitHub Actions', 'Jenkins', 'All backends'],
    recommendedFor: ['Any modern application', 'Microservices', 'CI/CD pipelines'],
    notRecommendedFor: ['Stateful databases (use managed services)'],
  },
  {
    name: 'Kubernetes',
    category: 'DevOps',
    description: 'An open-source container orchestration system for automating deployment, scaling, and management of containerized applications.',
    strengths: ['Auto-scaling', 'Self-healing', 'Service discovery', 'Rolling updates', 'Multi-cloud portability'],
    weaknesses: ['Very high complexity', 'Significant operational overhead', 'Requires dedicated DevOps expertise'],
    useCases: ['Large-scale microservices', 'Multi-cloud deployments', 'High-availability systems'],
    limitations: ['Overkill for small teams', 'Steep learning curve'],
    scalabilityScore: 10, performanceScore: 9, costScore: 4, complexityScore: 10, securityScore: 8, popularityScore: 9,
    compatibility: ['Docker', 'Helm', 'Prometheus', 'Istio', 'AWS EKS', 'GKE'],
    recommendedFor: ['Large-scale systems', 'Enterprise microservices', 'Teams with DevOps resources'],
    notRecommendedFor: ['Startups', 'Small teams', 'Simple applications'],
  },

  // ─── STORAGE ─────────────────────────────────────────────────────────────
  {
    name: 'S3-Compatible Object Storage',
    category: 'Storage',
    description: 'Object storage services (AWS S3, Cloudflare R2, MinIO) for storing unstructured data like files, images, and backups at massive scale.',
    strengths: ['Virtually unlimited storage', 'High durability (11 nines)', 'CDN integration', 'Cost-effective for large files', 'S3 API standard'],
    weaknesses: ['Latency higher than block storage', 'Not suitable for database files', 'Egress costs (especially AWS S3)'],
    useCases: ['User file uploads', 'Image/video storage', 'Static asset hosting', 'Backup & archival', 'Data lakes'],
    limitations: ['Not a file system replacement', 'Object immutability considerations'],
    scalabilityScore: 10, performanceScore: 7, costScore: 8, complexityScore: 3, securityScore: 8, popularityScore: 9,
    compatibility: ['AWS SDK', 'Node.js', 'Python', 'Spring Boot', 'CDN'],
    recommendedFor: ['Any app with file uploads', 'Media platforms', 'Static asset hosting'],
    notRecommendedFor: ['Low-latency transactional storage', 'Database storage'],
  },
];

const seedTechnologies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/architecture_advisor', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seeder] Connected to MongoDB');

    // Drop existing data
    await Technology.deleteMany({});
    console.log('[Seeder] Cleared technologies collection');

    // Insert fresh data
    const inserted = await Technology.insertMany(technologies);
    console.log(`[Seeder] Successfully seeded ${inserted.length} technologies`);

    // Print summary by category
    const categories = {};
    inserted.forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });
    console.log('[Seeder] Summary by category:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} technologies`);
    });

    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Error:', err.message);
    process.exit(1);
  }
};

seedTechnologies();
