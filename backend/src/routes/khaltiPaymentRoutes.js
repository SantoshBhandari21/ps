// src/routes/khaltiPaymentRoutes.js
// Importing express framework
const express = require("express");
// Initializing router
const router = express.Router();

// Importing Khalti payment controller
const khaltiPaymentController = require("../controllers/khaltiPaymentController");
// Importing authentication middleware
const authMiddleware = require("../middleware/auth");

// Handling Khalti payment initiation for tenants
router.post(
  "/initiate",
  authMiddleware.authenticate,
  authMiddleware.authorize("tenant"),
  khaltiPaymentController.initiatePayment,
);

// Handling Khalti payment callback verification
router.get("/verify", khaltiPaymentController.verifyPayment);

// Retrieving tenant payment history
router.get(
  "/my-payments",
  authMiddleware.authenticate,
  authMiddleware.authorize("tenant"),
  khaltiPaymentController.getMyPayments,
);

// Fetching payment status by transaction ID
router.get(
  "/status/:pidx",
  authMiddleware.authenticate,
  khaltiPaymentController.getPaymentStatus,
);

// Retrieving payment details by booking reference
router.get(
  "/booking/:bookingId",
  authMiddleware.authenticate,
  khaltiPaymentController.getPaymentByBooking,
);

// Exporting payment routes
module.exports = router;
