import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import SubUser from "../models/subUser.modal.js";
import sendEmail from "../utils/sendEmail.js";
import { refreshSubscriptionState } from "../services/subscriptionService.js";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;

const normalizeSameSite = (value) => {
  const v = String(value || "").toLowerCase();
  if (v === "none") return "none";
  if (v === "strict") return "strict";
  return "lax";
};

const getAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  const sameSite = normalizeSameSite(
    process.env.COOKIE_SAMESITE || (isProd ? "none" : "lax"),
  );
  const secure = isProd || sameSite === "none";

  const opts = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };

  if (process.env.COOKIE_DOMAIN) opts.domain = process.env.COOKIE_DOMAIN;
  return opts;
};

const signAuthToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const sendTokenResponse = (user, statusCode, res, sendOptions = {}) => {
  const token = signAuthToken(user);
  const isSubUser = sendOptions.isSubUser ?? Boolean(user?.parentUser);

  res
    .status(statusCode)
    .cookie("token", token, getAuthCookieOptions())
    .json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSubUser,
        parentUser: isSubUser ? user.parentUser : undefined,
        profileImage: user.profileImage || "",
        title: user.title || "",
        bio: user.bio || "",
        subscription: user.subscription || "free",
        subscriptionStatus: user.subscriptionStatus || "inactive",
        subscriptionExpiresAt: user.subscriptionExpiresAt || null,
      },
    });
};

const generateOtp = () => crypto.randomInt(0, 1000000).toString().padStart(6, "0");

const otpEmailTemplate = ({ otp, purpose }) => {
  const title =
    purpose === "password_reset" ? "Password Reset Code" : "Email Verification Code";

  return {
    subject: `${title} (valid for 5 minutes)`,
    text: `Your ${title.toLowerCase()} is: ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4;">
        <h2 style="margin: 0 0 12px 0;">${title}</h2>
        <p style="margin: 0 0 12px 0;">Use the code below to continue. It expires in 5 minutes.</p>
        <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; padding: 12px 16px; background: #f5f5f5; display: inline-block; border-radius: 8px;">
          ${otp}
        </div>
        <p style="margin: 16px 0 0 0; color: #666;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  };
};

const ensureOtpUsable = (user, purpose) => {
  if (!user) return { ok: false, status: 400, message: "Invalid OTP" };

  if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
    const secondsLeft = Math.ceil((user.otpLockUntil - Date.now()) / 1000);
    return {
      ok: false,
      status: 423,
      message: `Too many attempts. Try again in ${secondsLeft}s.`,
    };
  }

  if (!user.otp || !user.otpExpires || user.otpExpires <= new Date()) {
    return { ok: false, status: 400, message: "OTP expired or invalid" };
  }

  if (user.otpPurpose !== purpose) {
    return { ok: false, status: 400, message: "OTP expired or invalid" };
  }

  return { ok: true };
};

const registerOtpFailure = async (user) => {
  user.otpAttempts = (user.otpAttempts || 0) + 1;

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    user.otpFailCycles = (user.otpFailCycles || 0) + 1;
    user.otpAttempts = 0;
    user.clearOTP();

    if (user.otpFailCycles >= 2) {
      user.lockOTPAccount();
    }
  }

  await user.save();
};

// @desc    Register user (start) + email OTP
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email }).select("_id isEmailVerified");
    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.isEmailVerified
          ? "User already exists"
          : "Account exists but email is not verified. Please verify your email.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
      isEmailVerified: false,
      emailVerifiedAt: null,
    });

    const otp = generateOtp();
    await user.setOTP(otp, { purpose: "email_verification", ttlMs: OTP_TTL_MS });
    await user.save();

    const tpl = otpEmailTemplate({ otp, purpose: "email_verification" });
    await sendEmail({
      email: user.email,
      subject: tpl.subject,
      message: tpl.text,
      html: tpl.html,
    });

    return res.status(201).json({
      success: true,
      message: "Verification code sent to your email",
      data: { email: user.email },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// @desc    Resend email verification OTP
// @route   POST /api/auth/email-verification/send-otp
// @access  Public
export const sendEmailVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select(
      "+otpResendAfter +otpLockUntil +isEmailVerified",
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a verification code will be sent.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. Please login.",
      });
    }

    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const secondsLeft = Math.ceil((user.otpLockUntil - Date.now()) / 1000);
      return res.status(423).json({
        success: false,
        message: `Too many attempts. Try again in ${secondsLeft}s.`,
      });
    }

    if (user.otpResendAfter && user.otpResendAfter > Date.now()) {
      const secondsLeft = Math.ceil((user.otpResendAfter - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft}s before requesting another code.`,
      });
    }

    const otp = generateOtp();
    await user.setOTP(otp, { purpose: "email_verification", ttlMs: OTP_TTL_MS });
    await user.save();

    const tpl = otpEmailTemplate({ otp, purpose: "email_verification" });
    await sendEmail({
      email: user.email,
      subject: tpl.subject,
      message: tpl.text,
      html: tpl.html,
    });

    return res.status(200).json({
      success: true,
      message: "Verification code sent",
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("sendEmailVerificationOTP error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Verify email verification OTP + login (JWT cookie)
// @route   POST /api/auth/email-verification/verify-otp
// @access  Public
export const verifyEmailVerificationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select(
      "+otp +otpPurpose +otpExpires +otpAttempts +otpFailCycles +otpLockUntil +isEmailVerified",
    );

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. Please login.",
      });
    }

    const usable = ensureOtpUsable(user, "email_verification");
    if (!usable.ok) {
      return res.status(usable.status).json({ success: false, message: usable.message });
    }

    const isMatch = await user.matchOTP(otp);
    if (!isMatch) {
      await registerOtpFailure(user);
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    user.clearOTP();
    user.otpFailCycles = 0;
    user.otpLockUntil = undefined;
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("verifyEmailVerificationOTP error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");
    let isSubUser = false;

    if (!user) {
      user = await SubUser.findOne({ email }).select("+password");
      isSubUser = Boolean(user);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    if (!isSubUser && user.isEmailVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email to continue.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    if (isSubUser && user.status === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact admin.",
      });
    }

    if (isSubUser && user?.parentUser) {
      let owner = await User.findById(user.parentUser).select(
        "subscription subscriptionStatus subscriptionExpiresAt pendingSubscription pendingSubscriptionValidityDays",
      );
      if (owner) owner = await refreshSubscriptionState(owner);

      if (owner) {
        user.subscription = owner.subscription;
        user.subscriptionStatus = owner.subscriptionStatus;
        user.subscriptionExpiresAt = owner.subscriptionExpiresAt;
      }
    }

    return sendTokenResponse(user, 200, res, { isSubUser });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Send password reset OTP (email)
// @route   POST /api/auth/password-reset/send-otp
// @access  Public
export const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select(
      "+otpResendAfter +otpLockUntil +isEmailVerified",
    );

    // Avoid user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a verification code will be sent.",
      });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email first.",
      });
    }

    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const secondsLeft = Math.ceil((user.otpLockUntil - Date.now()) / 1000);
      return res.status(423).json({
        success: false,
        message: `Too many attempts. Try again in ${secondsLeft}s.`,
      });
    }

    if (user.otpResendAfter && user.otpResendAfter > Date.now()) {
      const secondsLeft = Math.ceil((user.otpResendAfter - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft}s before requesting another code.`,
      });
    }

    const otp = generateOtp();
    await user.setOTP(otp, { purpose: "password_reset", ttlMs: OTP_TTL_MS });
    await user.save();

    const tpl = otpEmailTemplate({ otp, purpose: "password_reset" });
    await sendEmail({
      email: user.email,
      subject: tpl.subject,
      message: tpl.text,
      html: tpl.html,
    });

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("sendPasswordResetOTP error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Verify password reset OTP and mint reset token
// @route   POST /api/auth/password-reset/verify-otp
// @access  Public
export const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select(
      "+otp +otpPurpose +otpExpires +otpAttempts +otpFailCycles +otpLockUntil +isEmailVerified",
    );

    const usable = ensureOtpUsable(user, "password_reset");
    if (!usable.ok) {
      return res.status(usable.status).json({ success: false, message: usable.message });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email first.",
      });
    }

    const isMatch = await user.matchOTP(otp);
    if (!isMatch) {
      await registerOtpFailure(user);
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    user.clearOTP();
    user.otpFailCycles = 0;
    user.otpLockUntil = undefined;
    await user.save();

    const resetSecret = process.env.JWT_PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
    const resetToken = jwt.sign({ id: user._id, type: "password_reset" }, resetSecret, {
      expiresIn: "15m",
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      data: { resetToken },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("verifyPasswordResetOTP error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/password-reset/reset
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    const resetSecret = process.env.JWT_PASSWORD_RESET_SECRET || process.env.JWT_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(resetToken, resetSecret);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired reset token" });
    }

    if (!decoded || decoded.type !== "password_reset" || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid or expired reset token" });
    }

    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await SubUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  const clearOptions = { ...getAuthCookieOptions(), expires: new Date(0) };
  res.cookie("token", "none", clearOptions);
  return res.status(200).json({ success: true, data: {} });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, title, bio, profileImage } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (title !== undefined) fieldsToUpdate.title = title;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (profileImage !== undefined) fieldsToUpdate.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get public profile (admin user)
// @route   GET /api/auth/profile/public
// @access  Public
export const getPublicProfile = async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: "admin" }).select(
      "name title bio profileImage email",
    );

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Portfolio owner profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Public profile fetched successfully",
      data: adminUser,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
