import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swagger.js";
import { fileURLToPath } from "url";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// connect if not already connected (tests connect in setup)
const uri = process.env.MONGO_URI;
if (uri && mongoose.connection.readyState === 0) {
  mongoose.connect(uri).then(() => console.log("Mongo connected"));
}

// models (ensure they’re registered)
import "./models/User.js";
import "./models/Project.js";
import "./models/Task.js";

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.join(__dirname, "..", "..", "client");

app.get("/health", (_req,res) => res.json({ ok: true }));

app.use(express.static(clientBuildPath));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

export default app;
