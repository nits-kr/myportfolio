import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  sendOTP,
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);
router.post("/auth/send-otp", sendOTP);
router.post("/auth/verify-otp", verifyOTP);
router.post("/auth/reset-password", resetPassword);

export default router;
