import express from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  deleteStatus,
} from "../controllers/projectController.js";

import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getProjects)
  .post(protect, authorize("admin"), createProject);

router
  .route("/:id")
  .get(getProject)
  .put(protect, authorize("admin"), updateProject)
  .delete(protect, authorize("admin"), deleteProject);

router
  .route("/delete-status/:id")
  .put(protect, authorize("admin"), deleteStatus);

export default router;
