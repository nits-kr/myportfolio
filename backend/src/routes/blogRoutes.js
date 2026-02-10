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

import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getBlogs).post(protect, authorize("admin"), createBlog);

router.route("/comments/:commentId/like").post(likeComment);

router
  .route("/:id")
  .get(getBlog)
  .put(protect, authorize("admin"), updateBlog)
  .delete(protect, authorize("admin"), deleteBlog);

router.route("/:id/like").post(likeBlog);
router.route("/:id/comments").get(getComments);

// Optional: Admin might need special route or optional protection
// For now, let's allow optional protection on addComment to detect if admin is logged in
router.route("/:id/comments").post((req, res, next) => {
  // Try to authenticate but don't fail if not logged in (subscriber mode)
  protect(req, res, () => {
    addComment(req, res, next);
  });
});

router
  .route("/delete-status/:id")
  .put(protect, authorize("admin"), deleteStatus);

export default router;
