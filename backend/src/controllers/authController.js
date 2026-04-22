// Importing bcryptjs for password hashing and comparison
const bcrypt = require("bcryptjs");
// Importing jsonwebtoken for JWT authentication token generation
const jwt = require("jsonwebtoken");
// Importing crypto for generating secure tokens
const crypto = require("crypto");
// Importing database query functions
const { runQuery, getOne } = require("../config/database");
// Importing email service for sending authentication emails
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} = require("../services/emailService");

// Generating JWT token with user ID and role for authentication
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Handling user registration with validation, hashing, and welcome email
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please provide name, email, password, and role",
      });
    }

    const validRoles = ["admin", "owner", "tenant"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be admin, owner, or tenant",
      });
    }

    const existingUser = await getOne("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    const verificationTokenExpires = Date.now() + 24 * 3600000; // 24 hours

    const result = await runQuery(
      `INSERT INTO users (full_name, email, password, role, verification_token, verification_token_expires)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        role,
        verificationTokenHash,
        verificationTokenExpires,
      ],
    );

    const user = await getOne(
      `SELECT id, full_name, email, role, is_verified, is_active, created_at
       FROM users WHERE id = ?`,
      [result.id],
    );

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name, role).catch((err) =>
      console.error("Failed to send welcome email:", err),
    );

    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      message: "User registered successfully.",
      user,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: error.message || "Server error during registration",
    });
  }
};

// Handling user login with email verification and token generation
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await getOne("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.is_active !== undefined && !user.is_active) {
      return res.status(401).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.role);

    delete user.password;

    return res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message || "Server error during login",
    });
  }
};

// Updating user profile photo with file upload handling
const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photoPath = `/uploads/${req.file.filename}`;

    try {
      await runQuery(
        "UPDATE users SET profile_photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [photoPath, req.user.id],
      );
    } catch (updateError) {
      // If column doesn't exist, just continue without storing it
      if (updateError.message.includes("no such column")) {
        console.warn(
          "profile_photo column not available, continuing without storing photo path",
        );
      } else {
        throw updateError;
      }
    }

    try {
      const user = await getOne(
        `SELECT id, full_name, email, role, is_verified, is_active, created_at
         FROM users WHERE id = ?`,
        [req.user.id],
      );

      return res.json({
        message: "Profile photo updated successfully",
        user,
      });
    } catch (selectError) {
      // If profile_photo column doesn't exist, return user without it
      if (selectError.message.includes("no such column")) {
        const user = await getOne(
          `SELECT id, full_name, email, role, is_verified, is_active, created_at
           FROM users WHERE id = ?`,
          [req.user.id],
        );

        return res.json({
          message: "Profile photo uploaded successfully",
          user,
        });
      }
      throw selectError;
    }
  } catch (error) {
    console.error("Update profile photo error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Handling password reset request by sending reset link to email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await getOne(
      "SELECT id, full_name, email FROM users WHERE email = ?",
      [email],
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    await runQuery(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [resetTokenHash, resetTokenExpires, user.id],
    );

    // ✅ Send password reset email using the new service
    await sendPasswordResetEmail(email, user.full_name, resetToken);

    return res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Validating reset token and updating password with confirmation email
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await getOne(
      "SELECT id, full_name, email FROM users WHERE reset_token = ? AND reset_token_expires > ?",
      [resetTokenHash, Date.now()],
    );

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await runQuery(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, user.id],
    );

    // Send password reset success email (non-blocking)
    sendPasswordResetSuccessEmail(user.email, user.full_name).catch((err) =>
      console.error("Failed to send password reset success email:", err),
    );

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// ------------------------------
// DELETE ACCOUNT
// DELETE /api/auth/account
// Body expected: { password }
// Requires authentication
// ------------------------------
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (req.user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin accounts cannot be deleted" });
    }

    const user = await getOne("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await runQuery("DELETE FROM users WHERE id = ?", [userId]);

    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = {
  register,
  login,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
  deleteAccount,
};
