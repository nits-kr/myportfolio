import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this user."],
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email address for this user."],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide a password for this user."],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isEmailVerified: {
    type: Boolean,
    default: true,
  },
  emailVerifiedAt: {
    type: Date,
    default: null,
  },
  otp: {
    type: String,
    select: false,
    default: undefined,
  },
  otpPurpose: {
    type: String,
    enum: ["email_verification", "password_reset"],
    select: false,
    default: undefined,
  },
  otpExpires: {
    type: Date,
    select: false,
    default: undefined,
  },
  otpResendAfter: {
    type: Date,
    select: false,
    default: undefined,
  },
  otpAttempts: {
    type: Number,
    select: false,
    default: 0,
    min: 0,
  },
  otpFailCycles: {
    type: Number,
    select: false,
    default: 0,
    min: 0,
  },
  otpLockUntil: {
    type: Date,
    select: false,
    default: undefined,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileImage: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  subscription: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
  subscriptionStatus: {
    type: String,
    enum: ["inactive", "active", "cancelled"],
    default: "inactive",
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null,
  },
  pendingSubscription: {
    type: String,
    enum: ["pro", "enterprise"],
    default: null,
  },
  pendingSubscriptionValidityDays: {
    type: Number,
    default: null,
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.setOTP = async function (otp, options = {}) {
  const ttlMs = options.ttlMs ?? 5 * 60 * 1000; // 5 minutes
  const resendCooldownMs = options.resendCooldownMs ?? 60 * 1000; // 60 seconds
  const purpose = options.purpose;

  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(String(otp), salt);
  this.otpPurpose = purpose;
  this.otpExpires = new Date(Date.now() + ttlMs);
  this.otpResendAfter = new Date(Date.now() + resendCooldownMs);
  this.otpAttempts = 0;
};

UserSchema.methods.matchOTP = async function (enteredOTP) {
  return bcrypt.compare(String(enteredOTP), this.otp);
};

UserSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpPurpose = undefined;
  this.otpExpires = undefined;
  this.otpResendAfter = undefined;
  this.otpAttempts = 0;
};

UserSchema.methods.lockOTPAccount = function () {
  this.otpLockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  this.otpFailCycles = 0;
  this.clearOTP();
};

export default mongoose.model("User", UserSchema);
