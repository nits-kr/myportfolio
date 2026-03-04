import express from "express";
import {
  createSession,
  getSessions,
  getSession,
  sendMessage,
  getMessages,
  getFeedback,
  endSession,
  getAnalytics,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Specific rate limiter for interview actions
const interviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins for interview endpoints
  message: {
    success: false,
    error: "Too many interview requests, please try again after 15 minutes",
  },
});

// All routes require authentication
router.use(protect);
router.use(interviewLimiter);

// Session management
router.post("/sessions", createSession);
router.get("/sessions", getSessions);
router.get("/sessions/:id", getSession);
router.patch("/sessions/:id/end", endSession);

// Chat & messages
router.post("/sessions/:id/messages", sendMessage);
router.get("/sessions/:id/messages", getMessages);

// Feedback
router.post("/sessions/:id/feedback", getFeedback);

// Analytics
router.get("/analytics", getAnalytics);

export default router;
