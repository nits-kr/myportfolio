import express from "express";
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  deleteStatus,
  likeBlog,
  addComment,
  getComments,
  likeComment,
} from "../controllers/blogController.js";

import {
  authorize,
  protect,
  optionalProtect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getBlogs).post(protect, authorize("admin", "sub-admin"), createBlog);

router.route("/comments/:commentId/like").post(optionalProtect, likeComment);

router
  .route("/:id")
  .get(getBlog)
  .put(protect, authorize("admin", "sub-admin"), updateBlog)
  .delete(protect, authorize("admin", "sub-admin"), deleteBlog);

router.route("/:id/like").post(optionalProtect, likeBlog);

router
  .route("/:id/comments")
  .get(getComments)
  .post(optionalProtect, addComment);

router
  .route("/delete-status/:id")
  .put(protect, authorize("admin", "sub-admin"), deleteStatus);

export default router;

