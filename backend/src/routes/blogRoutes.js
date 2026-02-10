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

router.route("/").get(getBlogs).post(protect, authorize("admin"), createBlog);

router.route("/comments/:commentId/like").post(likeComment);

router
  .route("/:id")
  .get(getBlog)
  .put(protect, authorize("admin"), updateBlog)
  .delete(protect, authorize("admin"), deleteBlog);

router.route("/:id/like").post(likeBlog);

router
  .route("/:id/comments")
  .get(getComments)
  .post(optionalProtect, addComment);

router
  .route("/delete-status/:id")
  .put(protect, authorize("admin"), deleteStatus);

export default router;
