import express from "express";
import {
  trackClick,
  trackConversion,
  getStats,
  createLink,
  getLinks,
} from "../controllers/affiliateController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/track/click", trackClick);
router.post("/track/conversion", trackConversion);

// Protected routes (admin only)
router.get("/stats", protect, adminOnly, getStats);
router.post("/", protect, adminOnly, createLink);
router.get("/", protect, adminOnly, getLinks);

export default router;
