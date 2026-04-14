// src/controllers/roomController.js
const { runQuery, getOne, getAll } = require("../config/database");

// @desc    Create new room/property
// @route   POST /api/rooms
// @access  Private (Owner only)
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
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!address) missingFields.push("address");
    if (!location) missingFields.push("location");
    if (!price) missingFields.push("price");
    if (!bedrooms) missingFields.push("bedrooms");
    if (!bathrooms) missingFields.push("bathrooms");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Parse amenities — could arrive as a JSON string or already an array
    let amenitiesJson = null;
    if (amenities) {
      try {
        const parsed =
          typeof amenities === "string" ? JSON.parse(amenities) : amenities;
        amenitiesJson = JSON.stringify(parsed);
      } catch {
        amenitiesJson = JSON.stringify([]);
      }
    }

    // Get main image - use first uploaded image if available, otherwise null
    const mainImage =
      req.files && req.files.length > 0
        ? `/uploads/${req.files[0].filename}`
        : null;

    // Use sensible defaults for optional numeric fields
    const finalRoomType = roomType || "Single";
    const finalArea = area ? parseFloat(area) : 0;

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
        finalRoomType,
        parseFloat(price),
        parseInt(bedrooms),
        parseInt(bathrooms),
        finalArea,
        amenitiesJson,
        mainImage,
        0,
      ],
    );

    // Insert all uploaded images into room_images table
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = `/uploads/${file.filename}`;
        await runQuery(
          "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)",
          [result.id, imageUrl],
        );
      }
    }

    const room = await getOne("SELECT * FROM rooms WHERE id = ?", [result.id]);

    // Parse amenities back before returning
    if (room && room.amenities) {
      room.amenities = JSON.parse(room.amenities);
    }

    // Fetch all images for the new room
    const images = await getAll("SELECT * FROM room_images WHERE room_id = ?", [
      result.id,
    ]);
    room.images = images;

    return res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Get all rooms with filters
// @route   GET /api/rooms
// @access  Public
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

    let query = `
      SELECT r.*, u.full_name as owner_name,
             (SELECT AVG(rating) FROM reviews WHERE room_id = r.id) as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE room_id = r.id) as review_count
      FROM rooms r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.is_available = 1 AND r.is_verified = 1
    `;

    const params = [];

    if (location) {
      query += " AND r.location LIKE ?";
      params.push(`%${location}%`);
    }
    if (roomType) {
      query += " AND r.room_type = ?";
      params.push(roomType);
    }
    if (minPrice) {
      query += " AND r.price >= ?";
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += " AND r.price <= ?";
      params.push(parseFloat(maxPrice));
    }
    if (bedrooms) {
      query += " AND r.bedrooms = ?";
      params.push(parseInt(bedrooms));
    }
    if (search) {
      query +=
        " AND (r.title LIKE ? OR r.description LIKE ? OR r.address LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const validSortFields = ["price", "created_at", "bedrooms", "area"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY r.${sortField} ${sortOrder}`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const rooms = await getAll(query, params);

    let countQuery =
      "SELECT COUNT(*) as total FROM rooms WHERE is_available = 1 AND is_verified = 1";
    const countParams = [];

    if (location) {
      countQuery += " AND location LIKE ?";
      countParams.push(`%${location}%`);
    }
    if (roomType) {
      countQuery += " AND room_type = ?";
      countParams.push(roomType);
    }
    if (minPrice) {
      countQuery += " AND price >= ?";
      countParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      countQuery += " AND price <= ?";
      countParams.push(parseFloat(maxPrice));
    }
    if (bedrooms) {
      countQuery += " AND bedrooms = ?";
      countParams.push(parseInt(bedrooms));
    }
    if (search) {
      countQuery +=
        " AND (title LIKE ? OR description LIKE ? OR address LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const { total } = await getOne(countQuery, countParams);

    // Fetch images for each room
    const roomsWithParsedData = await Promise.all(
      rooms.map(async (room) => {
        const images = await getAll(
          "SELECT * FROM room_images WHERE room_id = ?",
          [room.id],
        );
        return {
          ...room,
          amenities: room.amenities ? JSON.parse(room.amenities) : [],
          images: images || [],
        };
      }),
    );

    return res.json({
      rooms: roomsWithParsedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRooms: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await getOne(
      `SELECT r.*, u.full_name as owner_name, u.email as owner_email,
              (SELECT AVG(rating) FROM reviews WHERE room_id = r.id) as avg_rating,
              (SELECT COUNT(*) FROM reviews WHERE room_id = r.id) as review_count
       FROM rooms r
       LEFT JOIN users u ON r.owner_id = u.id
       WHERE r.id = ?`,
      [req.params.id],
    );

    if (!room) return res.status(404).json({ message: "Room not found" });

    const images = await getAll("SELECT * FROM room_images WHERE room_id = ?", [
      req.params.id,
    ]);

    const reviews = await getAll(
      `SELECT rev.*, u.full_name as client_name
       FROM reviews rev
       LEFT JOIN users u ON rev.tenant_id = u.id
       WHERE rev.room_id = ?
       ORDER BY rev.created_at DESC`,
      [req.params.id],
    );

    room.amenities = room.amenities ? JSON.parse(room.amenities) : [];
    room.images = images;
    room.reviews = reviews;

    return res.json({ room });
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get rooms by owner
// @route   GET /api/rooms/owner/my-rooms
// @access  Private (Owner only)
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

    // Fetch images for each room
    const roomsWithParsedData = await Promise.all(
      rooms.map(async (room) => {
        const images = await getAll(
          "SELECT * FROM room_images WHERE room_id = ?",
          [room.id],
        );
        return {
          ...room,
          amenities: room.amenities ? JSON.parse(room.amenities) : [],
          images: images || [],
        };
      }),
    );

    return res.json({ rooms: roomsWithParsedData });
  } catch (error) {
    console.error("Get my rooms error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Owner only - own rooms)
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
    } = req.body;

    const updates = [];
    const values = [];

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
      // Handle amenities whether it arrives as string or array
      let amenitiesArray;
      try {
        amenitiesArray =
          typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      } catch {
        amenitiesArray = [];
      }
      updates.push("amenities = ?");
      values.push(JSON.stringify(amenitiesArray));
    }
    if (isAvailable !== undefined) {
      updates.push("is_available = ?");
      values.push(isAvailable ? 1 : 0);
    }

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      // Update main_image to the first uploaded file
      updates.push("main_image = ?");
      values.push(`/uploads/${req.files[0].filename}`);

      // Insert new images into room_images table
      for (const file of req.files) {
        const imageUrl = `/uploads/${file.filename}`;
        await runQuery(
          "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)",
          [req.params.id, imageUrl],
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
    updatedRoom.amenities = updatedRoom.amenities
      ? JSON.parse(updatedRoom.amenities)
      : [];

    // Fetch all images for the updated room
    const images = await getAll("SELECT * FROM room_images WHERE room_id = ?", [
      req.params.id,
    ]);
    updatedRoom.images = images;

    return res.json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Update room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Owner only - own rooms)
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

// @desc    Add room to favorites
// @route   POST /api/rooms/:id/favorite
// @access  Private (Client only)
const addToFavorites = async (req, res) => {
  try {
    const room = await getOne("SELECT id FROM rooms WHERE id = ?", [
      req.params.id,
    ]);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const existing = await getOne(
      "SELECT id FROM favorites WHERE tenant_id = ? AND room_id = ?",
      [req.user.id, req.params.id],
    );

    if (existing)
      return res.status(400).json({ message: "Room already in favorites" });

    await runQuery("INSERT INTO favorites (tenant_id, room_id) VALUES (?, ?)", [
      req.user.id,
      req.params.id,
    ]);

    return res.json({ message: "Room added to favorites" });
  } catch (error) {
    console.error("Add to favorites error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove room from favorites
// @route   DELETE /api/rooms/:id/favorite
// @access  Private (Client only)
const removeFromFavorites = async (req, res) => {
  try {
    await runQuery(
      "DELETE FROM favorites WHERE tenant_id = ? AND room_id = ?",
      [req.user.id, req.params.id],
    );
    return res.json({ message: "Room removed from favorites" });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get client's favorite rooms
// @route   GET /api/rooms/user/favorites
// @access  Private (Client only)
const getFavorites = async (req, res) => {
  try {
    const favorites = await getAll(
      `SELECT r.*, u.full_name as owner_name,
              (SELECT AVG(rating) FROM reviews WHERE room_id = r.id) as avg_rating,
              (SELECT COUNT(*) FROM reviews WHERE room_id = r.id) as review_count
       FROM favorites f
       JOIN rooms r ON f.room_id = r.id
       JOIN users u ON r.owner_id = u.id
       WHERE f.tenant_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id],
    );

    const favoritesWithParsedData = await Promise.all(
      favorites.map(async (room) => {
        const images = await getAll(
          "SELECT * FROM room_images WHERE room_id = ?",
          [room.id],
        );
        return {
          ...room,
          amenities: room.amenities ? JSON.parse(room.amenities) : [],
          images: images || [],
        };
      }),
    );

    return res.json({ favorites: favoritesWithParsedData });
  } catch (error) {
    console.error("Get favorites error:", error);
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
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};
