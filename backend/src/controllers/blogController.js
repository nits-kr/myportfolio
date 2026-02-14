import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

// @desc    Get all blogs (Public view - only published)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res, next) => {
  try {
    let query = { deleteStatus: { $ne: true } };

    // If query param 'mode' is 'admin' (and verified by middleware potentially, but here we trust the filter logic for now), we might show drafts.
    // For public API, we usually only show Published.
    // However, to keep it simple and reusable for admin dashboard without complex logic here:
    // We will return all for now, and frontend can filter, OR we verify role.
    // Let's stick to: Public API gets Published. Admin API (protected) gets all.
    // But since this is a shared endpoint potentially, let's look at req.user (populated by middleware if token present)

    // UPDATE: To mirror projectController, it returns everything and Frontend filters?
    // projectController: const projects = await Project.find({ deleteStatus: { $ne: true } })
    // It returns ALL projects regardless of status "In Progress" etc.
    // So we will do the same here.

    const blogs = await Blog.find({ deleteStatus: { $ne: true } })
      .select("-body") // Exclude heavy body from list view
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      count: blogs.length,
      data: blogs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: "Server Error",
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
export const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || (blog.deleteStatus && req.user?.role !== "admin")) {
      // Simple check, or just standard 404
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        error: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: "Server Error",
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res, next) => {
  try {
    // Add user to req.body
    if (req.user) {
      req.body.author = req.user.id;
    }

    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (err) {
    console.error("Create Blog Error:", err); // Log the actual error
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: messages,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: err.message, // Send actual error message to client for debugging
      });
    }
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        error: "Blog not found",
      });
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: messages,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: "Server Error",
      });
    }
  }
};

// @desc    Delete blog (Hard Delete - optional usage)
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: "Server Error",
    });
  }
};

// @desc    Soft delete blog
// @route   PUT /api/blogs/delete-status/:id
// @access  Private/Admin
export const deleteStatus = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        error: "Blog not found",
      });
    }

    blog.deleteStatus = true;
    blog.deletedAt = Date.now();
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog soft-deleted successfully",
      data: blog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: "Server Error",
    });
  }
};

// @desc    Toggle like for a blog
// @route   POST /api/blogs/:id/like
// @access  Public (Subscriber email required)
export const likeBlog = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const index = blog.likes.indexOf(email);
    if (index === -1) {
      blog.likes.push(email);
    } else {
      blog.likes.splice(index, 1);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      data: blog.likes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add a comment to a blog
// @route   POST /api/blogs/:id/comments
// @access  Public (Subscriber required or Admin)
export const addComment = async (req, res, next) => {
  try {
    const { name, email, body, parentId } = req.body;
    const blogId = req.params.id;

    // Check if it's an admin reply (protect/authorize middleware might have set req.user)
    const isAdminReply = req.user && req.user.role === "admin";

    if (!isAdminReply && (!name || !email)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name and email are required (from BlogController)",
        });
    }

    if (!body) {
      return res
        .status(400)
        .json({ success: false, message: "Comment body is required" });
    }

    const comment = await Comment.create({
      blogId,
      name: isAdminReply ? req.user.name : name,
      email: isAdminReply ? req.user.email : email,
      body,
      parentId: parentId || null,
      isAdminReply,
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Toggle like for a comment
// @route   POST /api/blogs/comments/:commentId/like
// @access  Public (Subscriber email required)
export const likeComment = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const index = comment.likes.indexOf(email);
    if (index === -1) {
      comment.likes.push(email);
    } else {
      comment.likes.splice(index, 1);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      data: comment.likes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get comments for a blog
// @route   GET /api/blogs/:id/comments
// @access  Public
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ blogId: req.params.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
