import User from "../models/User.js";
import SubUser from "../models/subUser.modal.js";
import jwt from "jsonwebtoken";

// Helper to create token and send cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token, // Optional: send token in body too for non-cookie clients
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || "",
        title: user.title || "",
        bio: user.bio || "",
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    // Check for user
    let user = await User.findOne({ email }).select("+password");

    // If no main User, check SubUser
    if (!user) {
      user = await SubUser.findOne({ email }).select("+password");
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Send OTP with cooldown & lock protection
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ================= ACCOUNT LOCK CHECK ================= */
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.otpLockUntil - Date.now()) / 60000);

      return res.status(423).json({
        success: false,
        message: `Account locked due to OTP abuse. Try again in ${minutesLeft} minutes.`,
      });
    }

    /* ================= COOLDOWN CHECK ================= */
    if (user.otpResendAfter && user.otpResendAfter > Date.now()) {
      const secondsLeft = Math.ceil((user.otpResendAfter - Date.now()) / 1000);

      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft}s before requesting another OTP`,
      });
    }

    /* ================= GENERATE OTP ================= */
    const otp = Math.floor(100000 + Math.random() * 900000);

    await user.setOTP(otp);
    await user.save();

    /* ================= SEND OTP ================= */
    // TODO: integrate email / SMS provider here
    // await sendEmail(user.email, `Your OTP is ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      OTP: otp,
    });
  } catch (error) {
    console.error("sendOTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: "Account locked due to OTP abuse",
      });
    }

    // ⏱ Expiry check
    if (!user.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid",
      });
    }

    const isMatch = await user.matchOTP(otp);

    // ❌ INVALID OTP
    if (!isMatch) {
      user.otpAttempts += 1;

      if (user.otpAttempts >= 5) {
        user.otpFailCycles += 1;
        user.otpAttempts = 0;
        user.otp = undefined;
        user.otpExpires = undefined;

        if (user.otpFailCycles >= 2) {
          user.lockOTPAccount();
        }
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ OTP VERIFIED SUCCESSFULLY (⬅️ THIS BLOCK)
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpFailCycles = 0;
    user.otpLockUntil = undefined;
    user.otpResendAfter = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: true, success: false, message: "User not found" });
    } else {
      user.password = password;
      await user.save();
      return res.status(200).json({
        error: false,
        success: true,
        message: "Password reset successfully",
        data: user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      user = await SubUser.findById(req.user.id);
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
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

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
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

    res.status(200).json({
      success: true,
      message: "Public profile fetched successfully",
      data: adminUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
