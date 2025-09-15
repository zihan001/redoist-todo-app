// server/src/index.ts
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swagger.js";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// --- Mongo connection ---
const MONGO_URI = process.env.MONGO_URI!;
mongoose.connect(MONGO_URI).then(() => console.log("Mongo connected"));

// --- Models ---
import "./models/User.js";
import "./models/Project.js";
import "./models/Task.js";

// --- Swagger setup ---
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// --- Static client ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.join(__dirname, "..", "..", "client");

app.get("/health", (_req,res) => res.json({ ok: true }));

app.use(express.static(clientBuildPath));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server on :${PORT}`));
