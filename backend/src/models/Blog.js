import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    minLength: [3, "Title must be at least 3 characters"],
    maxlength: [150, "Title cannot be more than 150 characters"],
  },
  subheading: {
    type: String,
    trim: true,
    maxlength: [300, "Subheading cannot be more than 300 characters"],
  },
  slug: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft",
  },
  body: {
    type: String,
    required: [true, "Please add content"],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: false, // Optional for now, can be enforced later
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
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
  image: {
    type: String, // URL of the image
    required: false,
  },
});

blogSchema.pre("save", async function () {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  this.updatedAt = Date.now();
});

export default mongoose.model("Blog", blogSchema);
