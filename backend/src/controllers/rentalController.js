// src/controllers/rentalController.js
const { runQuery, getOne, getAll } = require("../config/database");

// Helper function to calculate move-out date
const calculateMoveOutDate = (months) => {
  const moveOut = new Date();
  moveOut.setMonth(moveOut.getMonth() + months);
  return moveOut.toISOString().split("T")[0];
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Create a new rental request
exports.createRental = async (req, res) => {
  try {
    const { roomId, months, totalPrice } = req.body;
    const clientId = req.user.id;

    // Validation
    if (!roomId || !months || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (months < 1) {
      return res
        .status(400)
        .json({ message: "Minimum rental period is 1 month" });
    }

    // Get room details
    const room = await getOne("SELECT * FROM rooms WHERE id = ?", [roomId]);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.is_available) {
      return res
        .status(400)
        .json({ message: "Room is not available for rent" });
    }

    const moveInDate = getTodayDate();
    const moveOutDate = calculateMoveOutDate(months);

    // Create booking
    const result = await runQuery(
      `INSERT INTO bookings 
       (room_id, tenant_id, owner_id, booking_date, move_in_date, move_out_date, status, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roomId,
        clientId,
        room.owner_id,
        moveInDate,
        moveInDate,
        moveOutDate,
        "pending_payment",
        totalPrice,
      ],
    );

    return res.status(201).json({
      message: "Rental created successfully. Please complete payment.",
      booking: {
        id: result.id,
        roomId,
        clientId,
        ownerId: room.owner_id,
        status: "pending_payment",
        moveInDate,
        moveOutDate,
        totalPrice,
        months,
      },
    });
  } catch (err) {
    console.error("Error creating rental:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get my rentals (as tenant)
exports.getMyRentals = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { status } = req.query;

    let sql = `
      SELECT b.*, r.title, r.price, r.main_image, r.location, u.full_name as owner_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.owner_id = u.id
      WHERE b.tenant_id = ?
      ORDER BY b.created_at DESC
    `;

    const params = [clientId];
    if (status) {
      sql += " AND b.status = ?";
      params.push(status);
    }

    const rentals = await getAll(sql, params);
    res.json({ rentals: rentals || [] });
  } catch (err) {
    console.error("Error fetching rentals:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get rental requests (as room owner)
exports.getRentalRequests = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { status } = req.query;

    let sql = `
      SELECT b.*, r.title, r.price, r.main_image, r.location, u.full_name as client_name, u.email as client_email
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.tenant_id = u.id
      WHERE b.owner_id = ?
      ORDER BY b.created_at DESC
    `;

    const params = [ownerId];
    if (status) {
      sql += " AND b.status = ?";
      params.push(status);
    }

    const requests = await getAll(sql, params);
    res.json({ requests: requests || [] });
  } catch (err) {
    console.error("Error fetching rental requests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get rental details
exports.getRentalById = async (req, res) => {
  try {
    const rentalId = req.params.id;

    const rental = await getOne(
      `SELECT b.*, r.title, r.description, r.price, r.bedrooms, r.bathrooms, r.main_image, r.location, 
              u.full_name as owner_name, u.email as owner_email
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN users u ON b.owner_id = u.id
       WHERE b.id = ?`,
      [rentalId],
    );

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    res.json({ rental });
  } catch (err) {
    console.error("Error fetching rental:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Stop/cancel a rental
exports.stopRent = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const userId = req.user.id;

    const rental = await getOne(
      "SELECT id, tenant_id, room_id, status FROM bookings WHERE id = ?",
      [rentalId],
    );

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (rental.tenant_id !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this rental" });
    }

    if (rental.status === "cancelled") {
      return res.status(400).json({ message: "Rental is already cancelled" });
    }

    await runQuery(
      "UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ["cancelled", rentalId],
    );

    res.json({ message: "Rental cancelled successfully" });
  } catch (err) {
    console.error("Error stopping rental:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
