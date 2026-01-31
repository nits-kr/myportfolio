import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    minLength: [3, "Title must be at least 3 characters"],
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  status: {
    type: String,
    enum: ["In Progress", "Completed", "Review"],
    default: "In Progress",
  },
  body: {
    type: String,
    required: [true, "Please add a description"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deleteStatus: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Project", projectSchema);
