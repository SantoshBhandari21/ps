// Importing database query functions for rental data access
const { runQuery, getOne, getAll } = require("../config/database");
// Importing notification service for notifying users and admins
const { createNotification } = require("./notificationController");

// Calculating move-out date based on rental period in months
const calculateMoveOutDate = (moveInDate, months) => {
  const moveOut = new Date(`${moveInDate}T00:00:00`);
  moveOut.setMonth(moveOut.getMonth() + months);
  const year = moveOut.getFullYear();
  const month = String(moveOut.getMonth() + 1).padStart(2, "0");
  const day = String(moveOut.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Retrieving current date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDaysToDate = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Creating new rental booking with validation and payment initialization
exports.createRental = async (req, res) => {
  try {
    const { roomId, months, totalPrice, moveInDate } = req.body;
    const clientId = req.user.id;
    const today = getTodayDate();
    const latestMoveInDate = addDaysToDate(today, 10);
    const rentalMonths = parseInt(months, 10);
    const bookingTotalPrice = Number(totalPrice);

    // Validation
    if (!roomId || !months || !totalPrice || !moveInDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (Number.isNaN(rentalMonths) || rentalMonths < 1) {
      return res
        .status(400)
        .json({ message: "Minimum rental period is 1 month" });
    }

    if (Number.isNaN(bookingTotalPrice) || bookingTotalPrice <= 0) {
      return res.status(400).json({ message: "Invalid rental amount" });
    }

    if (moveInDate < today) {
      return res
        .status(400)
        .json({ message: "Move-in date cannot be in the past" });
    }

    if (moveInDate > latestMoveInDate) {
      return res.status(400).json({
        message: "Move-in date must be within the next 10 days",
      });
    }

    const parsedMoveInDate = new Date(`${moveInDate}T00:00:00`);
    if (Number.isNaN(parsedMoveInDate.getTime())) {
      return res.status(400).json({ message: "Invalid move-in date" });
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

    // Get tenant name
    const tenant = await getOne("SELECT full_name FROM users WHERE id = ?", [
      clientId,
    ]);

    const moveOutDate = calculateMoveOutDate(moveInDate, rentalMonths);

    // Create booking
    const result = await runQuery(
      `INSERT INTO bookings 
       (room_id, tenant_id, owner_id, booking_date, move_in_date, move_out_date, status, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roomId,
        clientId,
        room.owner_id,
        today,
        moveInDate,
        moveOutDate,
        "pending_payment",
        bookingTotalPrice,
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
        totalPrice: bookingTotalPrice,
        months: rentalMonths,
      },
    });
  } catch (err) {
    console.error("Error creating rental:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieving all rental bookings for logged-in tenant with optional status filter
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
    `;

    const params = [clientId];
    if (status && status !== "all") {
      sql += " AND b.status = ?";
      params.push(status);
    } else {
      sql += " AND b.status = 'approved'";
    }

    sql += " ORDER BY b.created_at DESC";

    const rentals = await getAll(sql, params);
    res.json({ rentals: rentals || [] });
  } catch (err) {
    console.error("Error fetching rentals:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieving single rental booking details with room and owner information
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

// Cancelling rental booking and marking room as available with admin notification
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

    // Get tenant and room details for notification
    const tenantInfo = await getOne(
      "SELECT full_name FROM users WHERE id = ?",
      [userId],
    );
    const roomInfo = await getOne("SELECT title FROM rooms WHERE id = ?", [
      rental.room_id,
    ]);

    // Update booking status to cancelled
    await runQuery(
      "UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ["cancelled", rentalId],
    );

    // Mark room as available again
    await runQuery(
      "UPDATE rooms SET is_available = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [rental.room_id],
    );

    // Notify all admins about the rental cancellation
    try {
      const admins = await getAll(
        "SELECT id FROM users WHERE role = 'admin' AND is_active = 1",
        [],
      );
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "rental_cancelled",
          "Rental Cancelled",
          `Tenant ${tenantInfo?.full_name || "Unknown"} has cancelled rental for room "${roomInfo?.title || "Unknown"}"`,
          rentalId,
        );
      }
    } catch (adminNotifErr) {
      console.error(
        "Failed to notify admins about rental cancellation:",
        adminNotifErr,
      );
    }

    res.json({
      message: "Rental cancelled successfully. Room is now available for rent.",
    });
  } catch (err) {
    console.error("Error stopping rental:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Checking for expired rentals and notifying admins about completed rental periods
const checkAndNotifyRentalPeriodEnded = async () => {
  try {
    const today = getTodayDate();

    // Find rentals that have reached their move-out date
    const expiredRentals = await getAll(
      `SELECT b.id, b.tenant_id, b.room_id, b.move_out_date, 
              u.full_name as tenant_name, r.title as room_title
       FROM bookings b
       JOIN users u ON b.tenant_id = u.id
       JOIN rooms r ON b.room_id = r.id
       WHERE b.status = 'approved' 
       AND b.move_out_date <= ?
       AND b.notified_period_ended = 0`,
      [today],
    );

    // Create notification for each expired rental
    for (const rental of expiredRentals) {
      try {
        // Get all admins
        const admins = await getAll(
          "SELECT id FROM users WHERE role = 'admin' AND is_active = 1",
          [],
        );

        // Notify each admin
        for (const admin of admins) {
          await createNotification(
            admin.id,
            "rental_period_ended",
            "Rental Period Ended",
            `Tenant ${rental.tenant_name} rental period for room "${rental.room_title}" has ended (Move-out date: ${rental.move_out_date})`,
          );
        }

        // Mark as notified to avoid duplicate notifications
        await runQuery(
          "UPDATE bookings SET notified_period_ended = 1 WHERE id = ?",
          [rental.id],
        );
      } catch (notifErr) {
        console.error(`Failed to notify about rental ${rental.id}:`, notifErr);
      }
    }
  } catch (err) {
    console.error("Error checking rental periods:", err);
  }
};

// Exporting helper function for periodic rental period checks
exports.checkAndNotifyRentalPeriodEnded = checkAndNotifyRentalPeriodEnded;
