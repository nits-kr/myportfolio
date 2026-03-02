import express from "express";
import {
  createOrder,
  getRecentPaymentsAdmin,
  getSubscription,
  handlePaymentCallback,
  handlePaymentFailedRedirect,
  verifyPayment,
} from "../controllers/paymentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const requirePrimaryUser = (req, res, next) => {
  const user = req.user;
  if (!user) {
    // protect middleware should handle unauthenticated access (401),
    // but keep a defensive check here.
    return res.status(401).json({
      success: false,
      error: "Not authorized",
    });
  }

  // Prefer explicit role flag established at auth time over model discrimination
  const isPrimary = user?.role === "primary" || user?.isPrimary === true;

  if (!isPrimary) {
    // Deny with 403 for authenticated but not primary users
    return res.status(403).json({
      success: false,
      error: "Only primary users can manage subscriptions",
    });
  }

  return next();
};

router.post("/callback", express.urlencoded({ extended: false }), handlePaymentCallback);
router.get("/callback-failed", handlePaymentFailedRedirect);
router.post("/create-order", protect, requirePrimaryUser, createOrder);
router.post("/verify", protect, requirePrimaryUser, verifyPayment);
router.get("/subscription", protect, requirePrimaryUser, getSubscription);
router.get(
  "/admin/recent",
  protect,
  requirePrimaryUser,
  authorize("admin"),
  getRecentPaymentsAdmin,
);

export default router;
