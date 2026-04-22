// src/routes/rentalRoutes.js
// Importing express framework
const express = require("express");
// Initializing router
const router = express.Router();
// Importing authentication middleware
const { authenticate, authorize } = require("../middleware/auth");
// Importing rental controller functions
const {
  createRental,
  getMyRentals,
  getRentalById,
  stopRent,
} = require("../controllers/rentalController");

// Defining tenant rental creation endpoint
router.post("/", authenticate, authorize("tenant"), createRental);
// Retrieving tenant rental history
router.get("/my-rentals", authenticate, authorize("tenant"), getMyRentals);

// Handling rental cancellation for tenants
router.put("/:id/stop", authenticate, authorize("tenant"), stopRent);

// Retrieving rental details by ID
router.get("/:id", authenticate, getRentalById);

// Exporting rental routes
module.exports = router;
