import mongoose from 'mongoose';
const requirementsSchema = new mongoose.Schema(
  {
     applicationType: {
      type: String,
      enum: ['Web App', 'Mobile App', 'API Service', 'Microservices', 'Monolith', 'Desktop App', 'Other'],
      default: null,
    },
    projectDescription: { type: String, default: '' },
    targetUsers: { type: String, default: '' },

    expectedUsers: { type: Number, default: null },
    dailyRequests: { type: Number, default: null },
    trafficLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
      default: null,
    },
    geographicScope: {
      type: String,
      enum: ['Local', 'National', 'Global'],
      default: null,
    },

    hasAuth: { type: Boolean, default: false },
    hasPayments: { type: Boolean, default: false },
    hasSearch: { type: Boolean, default: false },
    hasFileUploads: { type: Boolean, default: false },
    hasNotifications: { type: Boolean, default: false },
    hasRealtime: { type: Boolean, default: false },
    hasAdminPanel: { type: Boolean, default: false },
    hasAnalytics: { type: Boolean, default: false },

    performanceReq: {
      type: String,
      enum: ['Standard', 'High Performance', 'Ultra Low Latency'],
      default: 'Standard',
    },
    availabilityReq: {
      type: String,
      enum: ['99%', '99.9%', '99.99%', '99.999%'],
      default: '99%',
    },
    securityReq: {
      type: String,
      enum: ['Standard', 'High', 'Critical'],
      default: 'Standard',
    },
    scalabilityReq: {
      type: String,
      enum: ['Fixed', 'Horizontal', 'Auto-scaling'],
      default: 'Fixed',
    },

    budget: {
      type: String,
      enum: ['< $5k', '$5k–$25k', '$25k–$100k', '$100k+'],
      default: null,
    },
    teamSize: { type: Number, default: null },
    timeline: {
      type: String,
      enum: ['< 1 month', '1–3 months', '3–6 months', '6–12 months', '12+ months'],
      default: null,
    },

    normalizedRequirements: { type: mongoose.Schema.Types.Mixed, default: null },
},{ _id: false }
);

// --- Main Project Schema ---
const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    applicationType: {
      type: String,
      enum: ['Web App', 'Mobile App', 'API Service', 'Microservices', 'Monolith', 'Desktop App', 'Other'],
      default: 'Web App',
    },
    budget: {
      type: String,
      enum: ['< $5k', '$5k–$25k', '$25k–$100k', '$100k+', ''],
      default: '',
    },
    expectedUsers: { type: Number, default: null },
    expectedTraffic: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', ''],
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Draft', 'Requirements Collected', 'Analysis Complete', 'Architecture Generated'],
      default: 'Draft',
    },
    requirements: { type: requirementsSchema, default: null },
    recommendations: { type: mongoose.Schema.Types.Mixed, default: null },
    comparison: { type: mongoose.Schema.Types.Mixed, default: null },
    aiExplanation: { type: mongoose.Schema.Types.Mixed, default: null },
    hld: { type: mongoose.Schema.Types.Mixed, default: null },
    lld: { type: mongoose.Schema.Types.Mixed, default: null },
    diagrams: { type: mongoose.Schema.Types.Mixed, default: null },
    report: { type: mongoose.Schema.Types.Mixed, default: null },
    validation: { type: mongoose.Schema.Types.Mixed, default: null },
    scenarios: { type: [mongoose.Schema.Types.Mixed], default: [] },
    capacity: { type: mongoose.Schema.Types.Mixed, default: null },
    costEstimate: { type: mongoose.Schema.Types.Mixed, default: null },
    traceability: { type: mongoose.Schema.Types.Mixed, default: null },
    adrs: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.projectId = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Performance Indexes ───────────────────────────────────────────────────────
// Compound index: speeds up "get all projects for user, sorted by date" queries
projectSchema.index({ userId: 1, createdAt: -1 });
// Text index: enables full-text search on project names
projectSchema.index({ projectName: 'text' });

const Project = mongoose.model('Project', projectSchema);

export default Project;
