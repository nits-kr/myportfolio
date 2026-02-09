import express from "express";
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  deleteStatus,
} from "../controllers/blogController.js";

import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getBlogs).post(protect, authorize("admin"), createBlog);

router
  .route("/:id")
  .get(getBlog)
  .put(protect, authorize("admin"), updateBlog)
  .delete(protect, authorize("admin"), deleteBlog);

router
  .route("/delete-status/:id")
  .put(protect, authorize("admin"), deleteStatus);

export default router;
