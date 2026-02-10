import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.ObjectId,
    ref: "Blog",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  body: {
    type: String,
    required: [true, "Please add a comment body"],
  },
  parentId: {
    type: mongoose.Schema.ObjectId,
    ref: "Comment",
    default: null,
  },
  likes: {
    type: [String], // Array of subscriber emails
    default: [],
  },
  isAdminReply: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Comment", commentSchema);
