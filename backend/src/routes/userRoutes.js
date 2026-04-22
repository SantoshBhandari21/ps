// src/routes/userRoutes.js
// Importing express router
const router = require("express").Router();
// Importing authentication middleware
const { authenticate } = require("../middleware/auth");
// Importing user controller functions
const user = require("../controllers/userController");

// Defining user profile management endpoints
router.get("/me", authenticate, user.getMyProfile);
router.put("/me", authenticate, user.updateMyProfile);
router.put("/me/password", authenticate, user.changeMyPassword);

// Exporting user routes
module.exports = router;
