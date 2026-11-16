import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Express Application API",
    version: "1.0.0",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Sample API resource routes
app.get("/api/v1/info", (req, res) => {
  res.status(200).json({
    app: "express-app",
    environment: process.env.NODE_ENV || "development",
    endpoints: [
      { method: "GET", path: "/" },
      { method: "GET", path: "/api/health" },
      { method: "GET", path: "/api/v1/info" },
    ],
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
