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
    return res.status(403).json({
      success: false,
      error: "Only primary users can manage subscriptions",
    });
  }

  // Use a definitive discriminator rather than presence of fields
  const modelName = user?.constructor?.modelName;
  const isPrimary = modelName === "User";
  const isSub = modelName === "SubUser";

  if (!isPrimary || isSub) {
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
  authorize("admin"),
  requirePrimaryUser,
  getRecentPaymentsAdmin,
);

export default router;
