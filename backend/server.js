// server.js
// Loading environment variables from .env file
require("dotenv").config();
// Importing configured Express application
const app = require("./src/app");
// Importing database initialization function
const { initDatabase } = require("./src/config/database");
// Importing rental period notification controller
const {
  checkAndNotifyRentalPeriodEnded,
} = require("./src/controllers/rentalController");

// Defining server configuration constants
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Initializing SQLite database and tables
try {
  initDatabase();
  console.log("# Database initialized");
} catch (error) {
  console.error("# Database initialization failed:", error.message);
  process.exit(1);
}

// Starting Express server on configured port
const server = app.listen(PORT, () => {
  console.log(`# Server running on port ${PORT}`);
  console.log(`# Environment: ${NODE_ENV}`);
});

// Scheduling periodic rental period ended notification check
setInterval(
  () => {
    console.log("Checking for rental periods that have ended...");
    checkAndNotifyRentalPeriodEnded();
  },
  60 * 60 * 1000,
); // Running every 1 hour

// Triggering rental period check immediately on server startup
checkAndNotifyRentalPeriodEnded();

// Handling SIGTERM signal for graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

// Handling SIGINT signal for graceful shutdown
process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
