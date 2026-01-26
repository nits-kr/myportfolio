import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const subUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: false,
    index: true,
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name must be at most 50 characters long"],
    message: (props) => `${props.value} is not a valid name!`,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          v,
        );
      },
      message: (props) =>
        `${props.value} is not a valid password! Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.`,
    },
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default: "user",
    message: (props) => `${props.value} is not a valid role!`,
  },
  permissions: {
    type: Array,
    default: [],
    message: (props) => `${props.value} is not a valid permissions!`,
  },
  parentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    message: (props) => `${props.value} is not a valid parent user!`,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
    message: (props) => `${props.value} is not a valid timestamp!`,
  },
  status: {
    type: Boolean,
    default: true,
    message: (props) => `${props.value} is not a valid status!`,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    message: (props) => `${props.value} is not a valid created at!`,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    message: (props) => `${props.value} is not a valid updated at!`,
  },
});

subUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("SubUser", subUserSchema);
