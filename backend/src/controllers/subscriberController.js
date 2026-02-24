import crypto from "crypto";
import Subscriber from "../models/Subscriber.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Register a new subscriber
// @route   POST /api/subscribers
// @access  Public
export const subscribe = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is strictly required" });
    }

    let subscriber = await Subscriber.findOne({ email });

    if (subscriber && subscriber.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Already subscribed",
        data: subscriber,
      });
    }

    // If subscriber exists but not verified, update it. Otherwise create new.
    if (!subscriber) {
      subscriber = new Subscriber({ name, email });
    }

    // Get verification token
    const verificationToken = subscriber.getVerificationToken();

    await subscriber.save();

    // Create verification URL
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    const message = `You are receiving this email because you subscribed to MyPortfolio. Please verify your email by clicking the link below: \n\n ${verifyUrl}`;

    try {
      await sendEmail({
        email: subscriber.email,
        subject: "Email Verification for MyPortfolio",
        message,
        html: `<p>You are receiving this email because you subscribed to MyPortfolio. Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
      });

      res.status(201).json({
        success: true,
        message: "Subscription successful.",
        // message: "Verification email sent. Please check your inbox.",
      });
    } catch (err) {
      console.log(err);
      subscriber.verificationToken = undefined;
      subscriber.verificationTokenExpire = undefined;
      await subscriber.save();

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
        error: err.message,
      });
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Verify email
// @route   GET /api/subscribers/verify/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    // Hash token from url
    const verificationToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const subscriber = await Subscriber.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!subscriber) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Set verified to true
    subscriber.isVerified = true;
    subscriber.verificationToken = undefined;
    subscriber.verificationTokenExpire = undefined;

    await subscriber.save();

    // Redirect to frontend or send success message
    // For now, redirect to a success page or just JSON
    res.status(200).json({
      success: true,
      message: "Email verified successfully. You are now subscribed!",
      data: {
        email: subscriber.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Resend verification email
// @route   POST /api/subscribers/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    if (subscriber.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token (works even if old token expired)

    // Generate new verification token
    const verificationToken = subscriber.getVerificationToken();
    await subscriber.save();

    // Create verification URL
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    const message = `You requested a new verification email. Please verify your email by clicking the link below: \n\n ${verifyUrl}\n\nThis link will expire in 48 hours.`;

    try {
      await sendEmail({
        email: subscriber.email,
        subject: "Email Verification for MyPortfolio - New Link",
        message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">Email Verification</h2>
            <p>You requested a new verification email for MyPortfolio.</p>
            <p>Please verify your email by clicking the button below:</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>${verifyUrl}</p>
            <p style="color: #e74c3c; font-weight: bold;">This link will expire in 48 hours.</p>
            <p style="color: #999; font-size: 11px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Verification email resent successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
        error: err.message,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
