// src/routes/roomRoutes.js
// Importing express framework
const express = require("express");
// Initializing router
const router = express.Router();
// Importing authentication middleware
const { authenticate, authorize } = require("../middleware/auth");
// Importing image upload middleware
const { uploadImages } = require("../middleware/upload");
// Importing room controller functions
const {
  createRoom,
  getRooms,
  getRoomById,
  getMyRooms,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

// Defining owner room listing retrieval endpoint
router.get("/owner/my-rooms", authenticate, authorize("owner"), getMyRooms);
// Handling new room creation with image uploads
router.post("/", authenticate, authorize("owner"), uploadImages, createRoom);

// Retrieving all available rooms for browsing
router.get("/", getRooms);

// Retrieving room details by ID
router.get("/:id", getRoomById);
// Updating room information and images
router.put("/:id", authenticate, authorize("owner"), uploadImages, updateRoom);
router.delete("/:id", authenticate, authorize("owner"), deleteRoom);

// Exporting room routes
module.exports = router;
