// Importing database query functions for contact message storage
const { runQuery, getOne, getAll } = require("../config/database");
// Importing notification service for notifying admins
const { createNotification } = require("./notificationController");

// Saving contact message and notifying all active admins
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Please provide name, email, and message",
      });
    }

    // Save message to database
    const result = await runQuery(
      `INSERT INTO messages (name, email, phone, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'unread')`,
      [name || "", email, phone || "", subject || "general", message],
    );

    // Notify all admins about the new contact message
    try {
      const admins = await getAll(
        "SELECT id FROM users WHERE role = 'admin' AND is_active = 1",
        [],
      );

      for (const admin of admins) {
        await createNotification(
          admin.id,
          "contact_message",
          "New Contact Message",
          `New message from ${name} (${email}): ${message.substring(0, 100)}...`,
        );
      }
    } catch (notifErr) {
      console.error("Failed to notify admins about contact message:", notifErr);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: "Message sent successfully! We'll get back to you soon.",
      messageId: result.id,
    });
  } catch (err) {
    console.error("Error sending contact message:", err);
    res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
  }
};

// Retrieving all contact messages with status filtering and pagination
const getAllContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = "SELECT * FROM messages WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);

    const messages = await getAll(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM messages WHERE 1=1";
    const countParams = [];

    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    const countResult = await getOne(countQuery, countParams);

    res.json({
      messages: messages || [],
      total: countResult?.total || 0,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil((countResult?.total || 0) / limitNum),
    });
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Retrieving single contact message by ID
const getContactMessage = async (req, res) => {
  try {
    const message = await getOne("SELECT * FROM messages WHERE id = ?", [
      req.params.id,
    ]);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message });
  } catch (err) {
    console.error("Error fetching contact message:", err);
    res.status(500).json({ message: "Failed to fetch message" });
  }
};

// Updating contact message status with validation
const updateContactMessage = async (req, res) => {
  try {
    const { status } = req.body;
    const messageId = req.params.id;

    if (!status || !["unread", "read", "replied"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be unread, read, or replied",
      });
    }

    const message = await getOne("SELECT * FROM messages WHERE id = ?", [
      messageId,
    ]);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await runQuery("UPDATE messages SET status = ? WHERE id = ?", [
      status,
      messageId,
    ]);

    res.json({
      message: "Message status updated successfully",
      status,
    });
  } catch (err) {
    console.error("Error updating contact message:", err);
    res.status(500).json({ message: "Failed to update message" });
  }
};

module.exports = {
  sendContactMessage,
  getAllContactMessages,
  getContactMessage,
  updateContactMessage,
};
