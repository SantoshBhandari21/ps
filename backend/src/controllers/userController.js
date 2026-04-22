// Importing database query functions for user data access
const { runQuery, getOne } = require("../config/database");
// Importing bcryptjs for password hashing and validation
const bcrypt = require("bcryptjs");

// Retrieving current logged-in user's profile information
const getMyProfile = async (req, res) => {
  try {
    const user = await getOne(
      "SELECT id, full_name, email, role, is_verified, is_active, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (error) {
    console.error("Get my profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Updating current user's profile with name and email modifications
const updateMyProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const updates = [];
    const values = [];

    if (fullName) {
      updates.push("full_name = ?");
      values.push(fullName);
    }

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(req.user.id);

    await runQuery(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const user = await getOne(
      "SELECT id, full_name, email, role, is_verified, is_active, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    return res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update my profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Validating current password and updating to new password with hashing
const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    const user = await getOne("SELECT id, password FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await runQuery(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashed, req.user.id],
    );

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change my password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
};
