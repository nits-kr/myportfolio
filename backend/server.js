import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./src/config/db.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
import authRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import subUserRoutes from "./src/routes/subUser.routes.js"; // Import SubUser routes

const app = express();

// ...

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sub-users", subUserRoutes); // Mount SubUser routes

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
