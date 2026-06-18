import express from "express";
import { apiRoutes } from "./routes/index.js";
import { applySecurityMiddleware } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export const app = express();

applySecurityMiddleware(app);

// Friendly landing response so the bare URL isn't a scary 404. This is an API;
// the web app lives on a separate domain (Vercel).
app.get("/", (_req, res) => {
  res.json({ success: true, message: "FitManager API. See /health or /api/v1." });
});

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "FitManager API is healthy" });
});

app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
