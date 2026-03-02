import express from "express";
import {
  createOrder,
  getRecentPaymentsAdmin,
  getSubscription,
  verifyPayment,
} from "../controllers/paymentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/subscription", protect, getSubscription);
router.get("/admin/recent", protect, authorize("admin"), getRecentPaymentsAdmin);

export default router;
