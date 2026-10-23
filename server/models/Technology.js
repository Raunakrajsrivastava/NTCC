import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Frontend', 'Backend', 'Database', 'Cache', 'Authentication', 'Cloud', 'Storage', 'Messaging', 'DevOps', 'Monitoring'],
      index: true,
    },
    description: { type: String, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    useCases: [{ type: String }],
    limitations: [{ type: String }],

    // Scoring (1–10 scale)
    scalabilityScore: { type: Number, min: 1, max: 10, default: 5 },
    performanceScore: { type: Number, min: 1, max: 10, default: 5 },
    costScore: { type: Number, min: 1, max: 10, default: 5 },       // higher = cheaper
    complexityScore: { type: Number, min: 1, max: 10, default: 5 },  // higher = more complex
    securityScore: { type: Number, min: 1, max: 10, default: 5 },
    popularityScore: { type: Number, min: 1, max: 10, default: 5 },

    compatibility: [{ type: String }],
    recommendedFor: [{ type: String }],
    notRecommendedFor: [{ type: String }],

    logoUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.techId = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Text index for search
technologySchema.index({ name: 'text', description: 'text', category: 'text' });

const Technology = mongoose.model('Technology', technologySchema);

export default Technology;
