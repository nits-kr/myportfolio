import mongoose from "mongoose";

const affiliateLinkSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  affiliateUrl: {
    type: String,
    required: true,
    trim: true,
  },
  shortCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ["hosting", "tools", "courses", "books", "software", "other"],
    default: "other",
  },
  clicks: {
    type: Number,
    default: 0,
  },
  conversions: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  commission: {
    type: Number,
    default: 0, // Percentage
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastClickedAt: {
    type: Date,
  },
});

// Index for faster queries
affiliateLinkSchema.index({ shortCode: 1 });
affiliateLinkSchema.index({ createdAt: -1 });

export default mongoose.model("AffiliateLink", affiliateLinkSchema);
