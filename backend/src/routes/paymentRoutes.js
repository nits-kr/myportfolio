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
  if (!req.user || typeof req.user.subscription !== "string") {
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
