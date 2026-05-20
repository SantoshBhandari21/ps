// src/routes/authRoutes.js
// Importing express framework
const express = require("express");
// Initializing router
const router = express.Router();
// Importing form validation library
const { body } = require("express-validator");

// Importing authentication middleware
const { authenticate } = require("../middleware/auth");
// Importing authentication controller functions
const {
  register,
  login,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require("../controllers/authController");

// Importing file upload middleware
const { uploadImage } = require("../middleware/upload");

// Validating user registration input
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["admin", "owner", "tenant"])
    .withMessage("Role must be admin, owner, or tenant"),
];

// Validating user login input
const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Defining authentication routes for register, login, and password management
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/profile-photo", authenticate, uploadImage, updateProfilePhoto);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.delete("/account", authenticate, deleteAccount);

// Exporting authentication routes
module.exports = router;
