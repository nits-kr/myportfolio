import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["frontend", "backend", "hr", "custom"], // Added "custom" to enum, or remove enum validation if dynamic roles are stored directly as strings.
    // If 'role' stores the custom title directly, remove enum.
    // Let's keep 'role' as the identifier and store the display title in customData or a separate field.
    // However, the controller currently saves custom title into 'role'.
    // To be safe and flexible, let's remove strict enum validation or allow any string.
    required: true,
  },
  customData: {
    title: String,
    jobDescription: String,
    focusAreas: String,
  },
  difficulty: {
    type: String,
    enum: ["junior", "mid", "senior"],
    default: "mid",
  },
  status: {
    type: String,
    enum: ["active", "completed", "abandoned"],
    default: "active",
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
  },
  metrics: {
    technicalDepth: {
      type: Number,
      min: 0,
      max: 10,
    },
    clarity: {
      type: Number,
      min: 0,
      max: 10,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
interviewSessionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ status: 1 });

export default mongoose.model("InterviewSession", interviewSessionSchema);
