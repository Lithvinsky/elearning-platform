import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { corsOptions } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(__dirname, "..", "uploads");

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(
    cors({
      origin: [
        "https://elearning-platform-orpin-zeta.vercel.app",
        "http://localhost:5173",
      ],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "3mb" }));
  app.use(cookieParser());

  app.use("/uploads", express.static(uploadsPath));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/enrollments", enrollmentRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/messages", messageRoutes);

  app.use(errorHandler);
  return app;
}
