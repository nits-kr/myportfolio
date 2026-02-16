import express from "express";
import { validateEmail } from "../utils/emailValidator.js";

const router = express.Router();

// Email Validation Route
router.post("/validate-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const validationResult = await validateEmail(email);
    res.json({ success: true, validation: validationResult });
  } catch (error) {
    console.error("Email validation error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error during validation",
      });
  }
});

export default router;
