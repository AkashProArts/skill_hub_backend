// Load environment variables
require("dotenv").config();

// Core dependencies
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// Middlewares
const { authenticate, isMentor } = require("./middleware/auth-middleware");
const errorHandler = require("./middleware/mongoose-error-handler");

// Routes
const userRoute = require("./routes/user-routes");
const lessonRoute = require("./routes/lesson-route");

// App initialization
const app = express();

// Environment variables
const PORT = process.env.PORT || 8080; // Default fallback for Cloud Run
const MONGO_URL = process.env.MONGO_URL;

// Global middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoute);
app.use("/api/lesson", authenticate, lessonRoute);

// app.get("/", authenticate, (req, res) => {
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "WELCOME to SKILL HUB backend center",
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Database connection & server start
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Database connected successfully!");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    // process.exit(1); // Exit if DB connection fails
  });
