// src/routes/adminRoutes.js
const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const admin = require("../controllers/adminController");

// Admin protection
router.use(authenticate, authorize("admin"));

// Users
router.get("/users", admin.getAllUsers);
router.get("/users/:id", admin.getUserById);
router.post("/users", admin.createUser);
router.put("/users/:id", admin.updateUser);
router.delete("/users/:id", admin.deleteUser);
router.put("/users/:id/toggle-status", admin.toggleUserStatus);

// Dashboard stats
router.get("/stats/dashboard", admin.getAdminStats);
router.get("/revenue", admin.getRevenue);

// Rooms & bookings (admin)
router.get("/rooms/all", admin.getAllRooms);
router.patch("/rooms/:id/verify", admin.updateRoomVerification);
router.get("/payments/all", admin.getAllPayments);
router.get("/bookings/all", admin.getAllBookings);

module.exports = router;
