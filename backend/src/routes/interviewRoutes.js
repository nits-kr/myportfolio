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

const router = express.Router();

// All routes require authentication
router.use(protect);

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
