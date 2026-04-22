// src/routes/contactRoutes.js
// Importing express framework
const express = require("express");
// Initializing router
const router = express.Router();
// Importing form validation library
const { body } = require("express-validator");
// Importing authentication middleware
const { authenticate, authorize } = require("../middleware/auth");
// Importing contact controller functions
const {
  sendContactMessage,
  getAllContactMessages,
  getContactMessage,
  updateContactMessage,
} = require("../controllers/contactController");

// Validating contact message input
const messageValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

// Defining public contact message endpoint
router.post("/message", messageValidation, sendContactMessage);

// Defining admin contact message management routes
router.get(
  "/messages",
  authenticate,
  authorize("admin"),
  getAllContactMessages,
);
router.get(
  "/messages/:id",
  authenticate,
  authorize("admin"),
  getContactMessage,
);
router.patch(
  "/messages/:id",
  authenticate,
  authorize("admin"),
  updateContactMessage,
);

// Exporting contact routes
module.exports = router;
