// Importing database query functions for notification data access
const { runQuery, getOne, getAll } = require("../config/database");

// Retrieving user notifications with optional unread filter and booking details
const getNotifications = async (req, res) => {
  try {
    const { status } = req.query; // unread or all
    let query = `
      SELECT n.*, 
             b.status as booking_status,
             r.title as room_title
      FROM notifications n
      LEFT JOIN bookings b ON n.booking_id = b.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE n.user_id = ?
    `;

    const params = [req.user.id];

    if (status === "unread") {
      query += " AND n.is_read = 0";
    }

    query += " ORDER BY n.created_at DESC LIMIT 50";

    const notifications = await getAll(query, params);
    const unreadCount = await getOne(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id],
    );

    return res.json({
      notifications,
      unreadCount: unreadCount?.count || 0,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Marking single notification as read by user
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await getOne(
      "SELECT * FROM notifications WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await runQuery("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);

    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Marking all user notifications as read at once
const markAllAsRead = async (req, res) => {
  try {
    await runQuery(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [req.user.id],
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Deleting notification from user's notification list
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await getOne(
      "SELECT * FROM notifications WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await runQuery("DELETE FROM notifications WHERE id = ?", [id]);

    return res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Creating notification records for users with type, title, and message
const createNotification = async (
  userId,
  type,
  title,
  message,
  bookingId = null,
) => {
  try {
    await runQuery(
      `INSERT INTO notifications (user_id, type, title, message, booking_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, bookingId],
    );
  } catch (error) {
    console.error("Create notification error:", error);
  }
};

// Exporting notification handler functions for use in routes
module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
