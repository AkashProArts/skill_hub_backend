// Load environment variables
require("dotenv").config();

// Core dependencies
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const http = require('http')



// Middlewares
const { authenticate, isMentor } = require("./src/middleware/auth-middleware");
const errorHandler = require("./src/middleware/mongoose-error-handler");

// Routes
const userRoute = require("./src/routes/user-routes");
const lessonRoute = require("./src/routes/lesson-route");
const chatRoute = require("./src/routes/chat.route");

// App initialization
const app = express();
const server = http.createServer(app);


// Environment variables
const PORT = process.env.PORT || 8080; // Default fallback for Cloud Run
const MONGO_URL = process.env.MONGO_URL;

// Global middlewares
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoute);
app.use("/api/lesson", authenticate, lessonRoute);
app.use("/api/chat", authenticate, chatRoute)


// app.get("/", authenticate, (req, res) => {
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "WELCOME to SKILL HUB backend center",
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// socket initialization

const io = require("socket.io")(server, {
  cors: {origin: "*"}
})
const chatSocket = require("./src/socket/chat.socket.js");
chatSocket(io);

// Database connection & server start
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Database connected successfully!");
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`⚡ Socket.IO running on same server`);

    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    // process.exit(1); // Exit if DB connection fails
  });
