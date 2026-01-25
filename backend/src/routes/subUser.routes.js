const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createSubUser,
  getAllSubUsers,
  updateSubUser,
  deleteSubUser,
  getSubUserById,
  changeSubUserStatus,
  subuserDeleteStatus,
} = require("../controllers/subUser.controller");

router.post("/", protect, authorize("admin"), createSubUser);
router.get("/", protect, authorize("admin"), getAllSubUsers);
router.put("/:id", protect, authorize("admin"), updateSubUser);
router.delete("/:id", protect, authorize("admin"), deleteSubUser);
router.get("/:id", protect, authorize("admin"), getSubUserById);
router.put("/:id", protect, authorize("admin"), changeSubUserStatus);
router.put("/:id", protect, authorize("admin"), subuserDeleteStatus);

module.exports = router;
