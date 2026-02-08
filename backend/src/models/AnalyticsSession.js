import mongoose from "mongoose";

const analyticsSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    referrer: {
      type: String,
      default: "",
    },
    lastPath: {
      type: String,
      default: "",
      index: true,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    totalTimeSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AnalyticsSession", analyticsSessionSchema);
