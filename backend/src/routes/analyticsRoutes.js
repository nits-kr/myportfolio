import express from "express";
import {
  trackPageView,
  heartbeat,
  getAnalyticsStats,
  getAnalyticsSessions,
} from "../controllers/analyticsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public tracking endpoints
router.post("/track", trackPageView);
router.post("/heartbeat", heartbeat);

// Admin analytics endpoints
router.get("/stats", protect, authorize("admin"), getAnalyticsStats);
router.get("/sessions", protect, authorize("admin"), getAnalyticsSessions);

export default router;
