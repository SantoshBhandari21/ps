// Importing database query functions for room data access
const { runQuery, getOne, getAll } = require("../config/database");
// Importing notification service for notifying admins
const { createNotification } = require("./notificationController");

// Parsing amenities from JSON string or array format
const parseAmenities = (amenities) => {
  if (!amenities) return [];
  try {
    return typeof amenities === "string" ? JSON.parse(amenities) : amenities;
  } catch {
    return [];
  }
};

// Converting amenities array to JSON string for database storage
const stringifyAmenities = (amenities) => {
  if (!amenities) return null;
  try {
    const parsed =
      typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    return JSON.stringify(parsed);
  } catch {
    return JSON.stringify([]);
  }
};

// Fetching all images associated with a room from database
const fetchRoomImages = async (roomId) => {
  try {
    return await getAll(
      "SELECT image_url FROM room_images WHERE room_id = ? ORDER BY id",
      [roomId],
    );
  } catch (error) {
    console.error("Error fetching room images:", error);
    return [];
  }
};

// Attaching parsed amenities and images data to room object
const attachRoomDetails = async (room) => {
  if (!room) return null;
  return {
    ...room,
    amenities: parseAmenities(room.amenities),
    images: await fetchRoomImages(room.id),
  };
};

// Attaching amenities and images to multiple room objects in parallel
const attachRoomDetailsToMany = async (rooms) => {
  return Promise.all(rooms.map((room) => attachRoomDetails(room)));
};

// Creating new property listing with image upload and admin notification
const createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      location,
      roomType,
      price,
      bedrooms,
      bathrooms,
      area,
      amenities,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      title,
      address,
      location,
      price,
      bedrooms,
      bathrooms,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key],
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Get main image - use first uploaded image if available
    const mainImage =
      req.files && req.files.length > 0
        ? `/uploads/${req.files[0].filename}`
        : null;

    // Insert room
    const result = await runQuery(
      `INSERT INTO rooms 
       (owner_id, title, description, address, location, room_type, price, 
        bedrooms, bathrooms, area, amenities, main_image, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        description || null,
        address,
        location,
        roomType || "Single",
        parseFloat(price),
        parseInt(bedrooms),
        parseInt(bathrooms),
        area ? parseFloat(area) : 0,
        stringifyAmenities(amenities),
        mainImage,
        0,
      ],
    );

    // Insert all uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await runQuery(
          "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)",
          [result.id, `/uploads/${file.filename}`],
        );
      }
    }

    const room = await getOne("SELECT * FROM rooms WHERE id = ?", [result.id]);
    const roomWithDetails = await attachRoomDetails(room);

    // Notify all admins about new room listing that needs verification
    try {
      const admins = await getAll(
        "SELECT id FROM users WHERE role = 'admin' AND is_active = 1",
        [],
      );
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "room_verification",
          "New Room Listing",
          `New room listing "${title}" from ${req.user.full_name} needs verification`,
        );
      }
    } catch (notifErr) {
      console.error("Failed to notify admins:", notifErr);
    }

    return res
      .status(201)
      .json({ message: "Room created successfully", room: roomWithDetails });
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Retrieving rooms with dynamic filtering, pagination, and availability status
const getRooms = async (req, res) => {
  try {
    const {
      location,
      roomType,
      minPrice,
      maxPrice,
      bedrooms,
      search,
      sortBy = "created_at",
      order = "DESC",
      page = 1,
      limit = 12,
    } = req.query;

    // First, mark rooms as available if their move-out date has passed
    const today = new Date().toISOString().split("T")[0];
    await runQuery(
      `UPDATE rooms SET is_available = 1 
       WHERE id IN (
         SELECT DISTINCT r.id FROM rooms r
         LEFT JOIN bookings b ON r.id = b.room_id AND b.status = 'approved' AND b.move_out_date > ?
         WHERE r.is_available = 0 AND b.id IS NULL
       )`,
      [today],
    );

    // Build dynamic query
    let query = `
      SELECT r.*, u.full_name as owner_name,
             (SELECT AVG(rating) FROM reviews WHERE room_id = r.id) as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE room_id = r.id) as review_count
      FROM rooms r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.is_verified = 1 AND u.is_active = 1
      AND (r.is_available = 1 OR r.id NOT IN (
        SELECT DISTINCT room_id FROM bookings WHERE status = 'approved' AND move_out_date > ?
      ))
    `;

    const params = [today];

    const filterConditions = [
      {
        condition: location,
        text: "AND r.location LIKE ?",
        value: `%${location}%`,
      },
      { condition: roomType, text: "AND r.room_type = ?", value: roomType },
      {
        condition: minPrice,
        text: "AND r.price >= ?",
        value: parseFloat(minPrice),
      },
      {
        condition: maxPrice,
        text: "AND r.price <= ?",
        value: parseFloat(maxPrice),
      },
      {
        condition: bedrooms,
        text: "AND r.bedrooms = ?",
        value: parseInt(bedrooms),
      },
    ];

    filterConditions.forEach(({ condition, text, value }) => {
      if (condition) {
        query += ` ${text}`;
        params.push(value);
      }
    });

    if (search) {
      query +=
        " AND (r.title LIKE ? OR r.description LIKE ? OR r.address LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Validate sort field
    const validSortFields = ["price", "created_at", "bedrooms", "area"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY r.${sortField} ${sortOrder}`;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);

    const rooms = await getAll(query, params);

    // Get total count with same filters
    let countQuery = `SELECT COUNT(*) as total FROM rooms r LEFT JOIN users u ON r.owner_id = u.id 
       WHERE r.is_verified = 1 AND u.is_active = 1
       AND (r.is_available = 1 OR r.id NOT IN (
         SELECT DISTINCT room_id FROM bookings WHERE status = 'approved' AND move_out_date > ?
       ))`;
    const countParams = [today];

    filterConditions.forEach(({ condition, text, value }) => {
      if (condition) {
        countQuery += text.replace("AND r.", " AND ");
        countParams.push(value);
      }
    });

    if (search) {
      countQuery +=
        " AND (title LIKE ? OR description LIKE ? OR address LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const { total } = await getOne(countQuery, countParams);
    const roomsWithDetails = await attachRoomDetailsToMany(rooms);

    return res.json({
      rooms: roomsWithDetails,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRooms: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Retrieving single room with details, reviews, and ratings information
const getRoomById = async (req, res) => {
  try {
    const room = await getOne(
      `SELECT r.*, u.full_name as owner_name, u.email as owner_email,
              (SELECT AVG(rating) FROM reviews WHERE room_id = r.id) as avg_rating,
              (SELECT COUNT(*) FROM reviews WHERE room_id = r.id) as review_count
       FROM rooms r
       LEFT JOIN users u ON r.owner_id = u.id
       WHERE r.id = ? AND u.is_active = 1`,
      [req.params.id],
    );

    if (!room) return res.status(404).json({ message: "Room not found" });

    const reviews = await getAll(
      `SELECT rev.*, u.full_name as client_name
       FROM reviews rev
       LEFT JOIN users u ON rev.tenant_id = u.id
       WHERE rev.room_id = ?
       ORDER BY rev.created_at DESC`,
      [req.params.id],
    );

    const roomWithDetails = await attachRoomDetails(room);
    roomWithDetails.reviews = reviews;

    return res.json({ room: roomWithDetails });
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Retrieving all properties owned by current logged-in owner
const getMyRooms = async (req, res) => {
  try {
    const rooms = await getAll(
      `SELECT r.*,
              (SELECT AVG(rating) FROM reviews WHERE room_id = r.id) as avg_rating,
              (SELECT COUNT(*) FROM reviews WHERE room_id = r.id) as review_count,
              (SELECT COUNT(*) FROM bookings WHERE room_id = r.id AND status = 'approved') as total_bookings
       FROM rooms r
       WHERE r.owner_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id],
    );

    const roomsWithDetails = await attachRoomDetailsToMany(rooms);
    return res.json({ rooms: roomsWithDetails });
  } catch (error) {
    console.error("Get my rooms error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Updating room details with image management and validation
const updateRoom = async (req, res) => {
  try {
    const room = await getOne(
      "SELECT * FROM rooms WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found or you do not have permission to update it",
      });
    }

    const {
      title,
      description,
      address,
      location,
      roomType,
      price,
      bedrooms,
      bathrooms,
      area,
      amenities,
      isAvailable,
      keepImageIds,
    } = req.body;

    const updates = [];
    const values = [];

    // Build dynamic update query
    if (title) {
      updates.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (address) {
      updates.push("address = ?");
      values.push(address);
    }
    if (location) {
      updates.push("location = ?");
      values.push(location);
    }
    if (roomType) {
      updates.push("room_type = ?");
      values.push(roomType);
    }
    if (price) {
      updates.push("price = ?");
      values.push(parseFloat(price));
    }
    if (bedrooms) {
      updates.push("bedrooms = ?");
      values.push(parseInt(bedrooms));
    }
    if (bathrooms) {
      updates.push("bathrooms = ?");
      values.push(parseInt(bathrooms));
    }
    if (area) {
      updates.push("area = ?");
      values.push(parseFloat(area));
    }
    if (amenities) {
      updates.push("amenities = ?");
      values.push(stringifyAmenities(amenities));
    }
    if (isAvailable !== undefined) {
      updates.push("is_available = ?");
      values.push(isAvailable ? 1 : 0);
    }

    // Handle image deletion - delete images not in keepImageIds list
    if (keepImageIds) {
      try {
        const keepIds = JSON.parse(keepImageIds);
        if (Array.isArray(keepIds) && keepIds.length > 0) {
          // Delete all images for this room that are NOT in the keep list
          const placeholders = keepIds.map(() => "?").join(",");
          await runQuery(
            `DELETE FROM room_images WHERE room_id = ? AND id NOT IN (${placeholders})`,
            [req.params.id, ...keepIds],
          );
        } else {
          // If keepImageIds is empty array, delete all images
          await runQuery("DELETE FROM room_images WHERE room_id = ?", [
            req.params.id,
          ]);
        }
      } catch (error) {
        console.error("Error parsing keepImageIds:", error);
        // Continue even if parsing fails
      }
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      updates.push("main_image = ?");
      values.push(`/uploads/${req.files[0].filename}`);

      for (const file of req.files) {
        await runQuery(
          "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)",
          [req.params.id, `/uploads/${file.filename}`],
        );
      }
    }

    if (updates.length === 0)
      return res.status(400).json({ message: "No fields to update" });

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(req.params.id);

    await runQuery(
      `UPDATE rooms SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updatedRoom = await getOne("SELECT * FROM rooms WHERE id = ?", [
      req.params.id,
    ]);
    const roomWithDetails = await attachRoomDetails(updatedRoom);

    return res.json({
      message: "Room updated successfully",
      room: roomWithDetails,
    });
  } catch (error) {
    console.error("Update room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Deleting room with validation to prevent deletion of rooms with active bookings
const deleteRoom = async (req, res) => {
  try {
    const room = await getOne(
      "SELECT * FROM rooms WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found or you do not have permission to delete it",
      });
    }

    const activeBooking = await getOne(
      `SELECT id FROM bookings 
       WHERE room_id = ? AND status IN ('pending', 'approved')`,
      [req.params.id],
    );

    if (activeBooking) {
      return res
        .status(400)
        .json({ message: "Cannot delete room with active bookings" });
    }

    await runQuery("DELETE FROM rooms WHERE id = ?", [req.params.id]);
    return res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  getMyRooms,
  updateRoom,
  deleteRoom,
};
