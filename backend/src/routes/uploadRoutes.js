import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage (memory storage for faster processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  protect,
  authorize("admin", "sub-admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Please upload a file" });
      }

      // Convert buffer to base64
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: "portfolio_blogs",
      });

      res.status(200).json({
        success: true,
        url: result.secure_url,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({
        success: false,
        message: "Server Error during upload",
        error: error.message,
      });
    }
  },
);

export default router;

