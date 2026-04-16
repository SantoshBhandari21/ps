// server.js
require("dotenv").config();
const app = require("./src/app");
const { initDatabase } = require("./src/config/database");

// ============ CONSTANTS ============
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============ DATABASE INITIALIZATION ============
try {
  initDatabase();
  console.log("# Database initialized");
} catch (error) {
  console.error("# Database initialization failed:", error.message);
  process.exit(1);
}

// ============ SERVER STARTUP ============
const server = app.listen(PORT, () => {
  console.log(`# Server running on port ${PORT}`);
  console.log(`# Environment: ${NODE_ENV}`);
});

// ============ GRACEFUL SHUTDOWN ============
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
