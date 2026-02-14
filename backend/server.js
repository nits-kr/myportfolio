import "dotenv/config"; // Reload: 2026-02-14T11:20:00
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import logger from "./src/utils/logger.js";

// Connect to database
connectDB();

// Route files
import authRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js"; // Import Blog routes
import uploadRoutes from "./src/routes/uploadRoutes.js"; // Import Upload routes
import subUserRoutes from "./src/routes/subUser.routes.js"; // Import SubUser routes
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import subscriberRoutes from "./src/routes/subscriberRoutes.js"; // Import Subscriber routes
import { scheduleReminderJob } from "./src/utils/reminderScheduler.js"; // Import Reminder Scheduler
import errorHandler from "./src/middleware/errorMiddleware.js"; // Import Error Handler

const app = express();

// Security Headers
app.use(helmet());

// Prevent Parameter Pollution
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000, // Limit each IP to 1000 requests per 10 mins
  message: "Too many requests from this IP, please try again after 10 minutes",
});
app.use(limiter);

// Logging
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  }),
);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) =>
      origin.trim().replace(/\/$/, ""),
    )
  : ["http://localhost:3000"];

// Add localhost:3000 explicitly if not present (for failsafe dev)
if (!allowedOrigins.includes("http://localhost:3000")) {
  allowedOrigins.push("http://localhost:3000");
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  }),
);

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes); // Mount Blog routes
app.use("/api/upload", uploadRoutes); // Mount Upload routes
app.use("/api/sub-users", subUserRoutes); // Mount SubUser routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/subscribers", subscriberRoutes); // Mount Subscriber routes

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Initialize verification reminder scheduler
  scheduleReminderJob();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
