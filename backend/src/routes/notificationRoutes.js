// src/routes/notificationRoutes.js
// Importing express framework
const express = require("express");
// Initializing router
const router = express.Router();
// Importing authentication middleware
const { authenticate } = require("../middleware/auth");
// Importing notification controller functions
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// Protecting all notification routes with authentication
router.use(authenticate);

// Retrieving all notifications for authenticated user
router.get("/", getNotifications);

// Marking all notifications as read
router.put("/all/read-all", markAllAsRead);

// Marking individual notification as read
router.put("/:id/read", markAsRead);

// Deleting notification by ID
router.delete("/:id", deleteNotification);

// Exporting notification routes
module.exports = router;
