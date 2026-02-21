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
    minlength: [6, "Password must be at least 6 characters"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  otp: {
    type: String,
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
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.setOTP = async function (otp) {
  const salt = await bcrypt.genSalt(10);

  this.otp = await bcrypt.hash(otp.toString(), salt);
  this.otpExpires = Date.now() + 2 * 60 * 1000; // 2 min
  this.otpResendAfter = Date.now() + 60 * 1000; // ⏱ 60 sec cooldown
  this.otpAttempts = 0; // reset attempts
};

UserSchema.methods.matchOTP = async function (enteredOTP) {
  return bcrypt.compare(enteredOTP.toString(), this.otp);
};

UserSchema.methods.lockOTPAccount = function () {
  this.otpLockUntil = Date.now() + 15 * 60 * 1000; // 🔒 15 minutes
  this.otpAttempts = 0;
  this.otp = undefined;
  this.otpExpires = undefined;
};

export default mongoose.model("User", UserSchema);
