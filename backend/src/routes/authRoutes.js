// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { authenticate } = require("../middleware/auth");
const {
  register,
  login,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require("../controllers/authController");

// Import upload middleware
const { uploadImage } = require("../middleware/upload");

// Register validation (matches frontend)
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

// Login validation (matches frontend)
const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/profile-photo", authenticate, uploadImage, updateProfilePhoto);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.delete("/account", authenticate, deleteAccount);

module.exports = router;
