import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Subscriber", subscriberSchema);
