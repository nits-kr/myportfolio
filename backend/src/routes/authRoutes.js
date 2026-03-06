import express from "express";
import rateLimit from "express-rate-limit";
import {
  getMe,
  getPublicProfile,
  login,
  logout,
  register,
  resetPassword,
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  updateProfile,
  verifyEmailVerificationOTP,
  verifyPasswordResetOTP,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sendEmailVerificationOTPSchema,
  sendPasswordResetOTPSchema,
  verifyEmailVerificationOTPSchema,
  verifyPasswordResetOTPSchema,
} from "../validation/auth.schema.js";

const router = express.Router();

const jsonLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    ...options,
    handler: (req, res) =>
      res.status(options.statusCode || 429).json({
        success: false,
        message:
          options.message || "Too many requests, please try again later.",
      }),
  });

const keyByIpAndEmail = (req) => {
  const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
  const email = rawEmail.trim().toLowerCase();
  return `${req.ip}:${email}`;
};

const registerLimiter = jsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: keyByIpAndEmail,
  message: "Too many registration attempts. Please try again later.",
});

const loginLimiter = jsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: keyByIpAndEmail,
  skipSuccessfulRequests: true,
  message: "Too many login attempts. Please try again later.",
});

const otpSendLimiter = jsonLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  keyGenerator: keyByIpAndEmail,
  message: "Too many OTP requests. Please try again later.",
});

const otpVerifyLimiter = jsonLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  keyGenerator: keyByIpAndEmail,
  message: "Too many OTP verification attempts. Please try again later.",
});

router.post(
  "/register",
  registerLimiter,
  validateRequest(registerSchema),
  register,
);
router.post("/login", loginLimiter, validateRequest(loginSchema), login);
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);

router.post(
  "/email-verification/send-otp",
  otpSendLimiter,
  validateRequest(sendEmailVerificationOTPSchema),
  sendEmailVerificationOTP,
);
router.post(
  "/email-verification/verify-otp",
  otpVerifyLimiter,
  validateRequest(verifyEmailVerificationOTPSchema),
  verifyEmailVerificationOTP,
);

router.post(
  "/password-reset/send-otp",
  otpSendLimiter,
  validateRequest(sendPasswordResetOTPSchema),
  sendPasswordResetOTP,
);
router.post(
  "/password-reset/verify-otp",
  otpVerifyLimiter,
  validateRequest(verifyPasswordResetOTPSchema),
  verifyPasswordResetOTP,
);
router.post(
  "/password-reset/reset",
  otpVerifyLimiter,
  validateRequest(resetPasswordSchema),
  resetPassword,
);

router.put("/profile", protect, updateProfile);
router.get("/profile/public", getPublicProfile);

export default router;
