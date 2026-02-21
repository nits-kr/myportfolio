import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  sendOTP,
  verifyOTP,
  resetPassword,
  updateProfile,
  getPublicProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  resetPasswordSchema,
} from "../validation/auth.schema.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", protect, getMe);
router.get("/logout", logout);
router.post("/send-otp", validateRequest(sendOTPSchema), sendOTP);
router.post("/verify-otp", validateRequest(verifyOTPSchema), verifyOTP);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword,
);

router.put("/profile", protect, updateProfile);
router.get("/profile/public", getPublicProfile);

export default router;
