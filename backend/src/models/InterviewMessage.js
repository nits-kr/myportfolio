import mongoose from "mongoose";

const interviewMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
  },
  role: {
    type: String,
    enum: ["interviewer", "candidate"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  codeSnippet: {
    language: String,
    code: String,
  },
  feedback: {
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
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
    suggestions: [String],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
interviewMessageSchema.index({ sessionId: 1, timestamp: 1 });

export default mongoose.model("InterviewMessage", interviewMessageSchema);
