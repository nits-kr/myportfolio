import express from "express";
import {
  subscribe,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/subscriberController.js";

const router = express.Router();

router.post("/", subscribe);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

export default router;
