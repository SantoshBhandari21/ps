// src/routes/roomRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { uploadImages } = require("../middleware/upload");
const {
  createRoom,
  getRooms,
  getRoomById,
  getMyRooms,
  updateRoom,
  deleteRoom,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} = require("../controllers/roomController");

// Owner routes - MUST come before :id routes
router.get("/owner/my-rooms", authenticate, authorize("owner"), getMyRooms);
router.post("/", authenticate, authorize("owner"), uploadImages, createRoom);

// Tenant routes - Favorites - MUST come before :id routes
router.get("/user/favorites", authenticate, authorize("tenant"), getFavorites);

// Public routes
router.get("/", getRooms);

// ID-based routes - MUST come after specific routes
router.get("/:id", getRoomById);
router.put("/:id", authenticate, authorize("owner"), uploadImages, updateRoom);
router.delete("/:id", authenticate, authorize("owner"), deleteRoom);
router.post("/:id/favorite", authenticate, authorize("tenant"), addToFavorites);
router.delete(
  "/:id/favorite",
  authenticate,
  authorize("tenant"),
  removeFromFavorites,
);

module.exports = router;
