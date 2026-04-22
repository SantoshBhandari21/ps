// src/routes/adminRoutes.js
// Importing express router
const router = require("express").Router();
// Importing authentication middleware
const { authenticate, authorize } = require("../middleware/auth");
// Importing admin controller
const admin = require("../controllers/adminController");
// Importing rental management functions
const {
  checkAndNotifyRentalPeriodEnded,
} = require("../controllers/rentalController");

// Protecting all admin routes with authentication and authorization
router.use(authenticate, authorize("admin"));

// Defining user management routes
// router.get("/users", admin.getAllUsers);
router.get("/users/:id", admin.getUserById);
router.post("/users", admin.createUser);
router.put("/users/:id", admin.updateUser);
router.delete("/users/:id", admin.deleteUser);

// Defining admin dashboard and revenue routes
// router.get("/stats/dashboard", admin.getAdminStats);
router.get("/revenue", admin.getRevenue);

// Defining room and booking management routes
// router.get("/rooms/all", admin.getAllRooms);
router.patch("/rooms/:id/verify", admin.updateRoomVerification);
router.get("/payments/all", admin.getAllPayments);
router.get("/bookings/all", admin.getAllBookings);

// Handling manual trigger for rental period check
router.post("/check-rental-periods", async (req, res) => {
  try {
    await checkAndNotifyRentalPeriodEnded();
    res.json({ message: "Rental period check completed" });
  } catch (error) {
    console.error("Error checking rental periods:", error);
    res.status(500).json({ message: "Error checking rental periods" });
  }
});

// Exporting admin routes
module.exports = router;
