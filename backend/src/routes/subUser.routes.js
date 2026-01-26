import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createSubUser,
  getAllSubUsers,
  updateSubUser,
  deleteSubUser,
  getSubUserById,
  changeSubUserStatus,
  subuserDeleteStatus,
} from "../controllers/subUser.controller.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createSubUser);
router.get("/", protect, authorize("admin"), getAllSubUsers);
router.put("/:id", protect, authorize("admin"), updateSubUser);
router.delete("/:id", protect, authorize("admin"), deleteSubUser);
router.get("/:id", protect, authorize("admin"), getSubUserById);
router.patch("/:id/status", protect, authorize("admin"), changeSubUserStatus);
router.patch(
  "/:id/delete-status",
  protect,
  authorize("admin"),
  subuserDeleteStatus,
);

export default router;
