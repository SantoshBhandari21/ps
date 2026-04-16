// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ============ CONSTANTS ============
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "https://fyp.santoshbhandari.info.np",
];

const ROUTES = {
  ADMIN: require("./routes/adminRoutes"),
  AUTH: require("./routes/authRoutes"),
  USERS: require("./routes/userRoutes"),
  ROOMS: require("./routes/roomRoutes"),
  RENTALS: require("./routes/rentalRoutes"),
  NOTIFICATIONS: require("./routes/notificationRoutes"),
  PAYMENTS: require("./routes/khaltiPaymentRoutes"),
};

const API_ROUTES = {
  ADMIN: "/api/admin",
  AUTH: "/api/auth",
  USERS: "/api/users",
  ROOMS: "/api/rooms",
  RENTALS: "/api/rentals",
  NOTIFICATIONS: "/api/notifications",
  PAYMENTS: "/api/payments",
};

const ERROR_MESSAGES = {
  ROUTE_NOT_FOUND: "Route not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  HEALTH_CHECK: "Server is running",
  SERVER_RUNNING: "Server is running successfully",
};

// ============ CORS & MIDDLEWARE ============
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============ ROUTES ============
app.use(API_ROUTES.ADMIN, ROUTES.ADMIN);
app.use(API_ROUTES.AUTH, ROUTES.AUTH);
app.use(API_ROUTES.USERS, ROUTES.USERS);
app.use(API_ROUTES.ROOMS, ROUTES.ROOMS);
app.use(API_ROUTES.RENTALS, ROUTES.RENTALS);
app.use(API_ROUTES.NOTIFICATIONS, ROUTES.NOTIFICATIONS);
app.use(API_ROUTES.PAYMENTS, ROUTES.PAYMENTS);

// ============ SYSTEM ROUTES ============
/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: ERROR_MESSAGES.HEALTH_CHECK });
});

/**
 * Root endpoint
 */
app.get("/", (req, res) => {
  res.json({ message: ERROR_MESSAGES.SERVER_RUNNING });
});

// ============ ERROR HANDLING ============
/**
 * 404 Not Found handler
 */
app.use((req, res) => {
  res.status(404).json({ message: ERROR_MESSAGES.ROUTE_NOT_FOUND });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
});

module.exports = app;
