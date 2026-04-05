// src/controllers/adminController.js
const { runQuery, getOne, getAll } = require("../config/database");
const bcrypt = require("bcryptjs");

/**
 * GET /api/admin/users?role=&search=&page=&limit=
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    let query =
      "SELECT id, full_name, email, role, is_verified, is_active, created_at FROM users WHERE 1=1";
    const params = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    if (search) {
      query += " AND (full_name LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);

    const users = await getAll(query, params);

    let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const countParams = [];

    if (role) {
      countQuery += " AND role = ?";
      countParams.push(role);
    }
    if (search) {
      countQuery += " AND (full_name LIKE ? OR email LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countRow = await getOne(countQuery, countParams);
    const total = countRow?.total ?? 0;

    return res.json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await getOne(
      "SELECT id, full_name, email, role, is_verified, is_active, created_at FROM users WHERE id = ?",
      [req.params.id],
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    let stats = {};

    if (user.role === "owner") {
      const roomStats = await getOne(
        "SELECT COUNT(*) as total_rooms FROM rooms WHERE owner_id = ?",
        [user.id],
      );

      const bookingStats = await getOne(
        "SELECT COUNT(*) as total_bookings FROM bookings WHERE owner_id = ?",
        [user.id],
      );

      stats = { ...(roomStats || {}), ...(bookingStats || {}) };
    } else if (user.role === "tenant") {
      const bookingStats = await getOne(
        "SELECT COUNT(*) as total_bookings FROM bookings WHERE tenant_id = ?",
        [user.id],
      );

      const favoriteStats = await getOne(
        "SELECT COUNT(*) as total_favorites FROM favorites WHERE tenant_id = ?",
        [user.id],
      );

      stats = { ...(bookingStats || {}), ...(favoriteStats || {}) };
    }

    return res.json({ user, stats });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/admin/users
 */
const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "fullName, email, password, role are required",
      });
    }

    const validRoles = ["admin", "owner", "tenant"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await getOne("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (exists)
      return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await runQuery(
      "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
      [fullName, email, hashed, role],
    );

    const newId = result?.id ?? result?.insertId;

    const user = await getOne(
      "SELECT id, full_name, email, role, is_verified, is_active, created_at FROM users WHERE id = ?",
      [newId],
    );

    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { fullName, email, role, isVerified, isActive } = req.body;

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
    if (role) {
      const validRoles = ["admin", "owner", "tenant"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      updates.push("role = ?");
      values.push(role);
    }
    if (isVerified !== undefined) {
      updates.push("is_verified = ?");
      values.push(isVerified ? 1 : 0);
    }
    if (isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(req.params.id);

    await runQuery(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const updatedUser = await getOne(
      "SELECT id, full_name, email, role, is_verified, is_active, created_at FROM users WHERE id = ?",
      [req.params.id],
    );

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const user = await getOne("SELECT id, role FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    if (user.role === "owner") {
      const activeBookings = await getOne(
        "SELECT COUNT(*) as count FROM bookings WHERE owner_id = ? AND status IN (?, ?)",
        [user.id, "pending", "approved"],
      );
      if ((activeBookings?.count ?? 0) > 0) {
        return res
          .status(400)
          .json({ message: "Cannot delete owner with active bookings" });
      }
    }

    await runQuery("DELETE FROM users WHERE id = ?", [user.id]);
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/users/:id/toggle-status
 */
const toggleUserStatus = async (req, res) => {
  try {
    const user = await getOne("SELECT id, is_active FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newStatus = user.is_active ? 0 : 1;

    await runQuery(
      "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newStatus, user.id],
    );

    return res.json({
      message: `User ${newStatus ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/admin/stats/dashboard
 */
const getAdminStats = async (req, res) => {
  try {
    const rowUsers = await getOne("SELECT COUNT(*) as total_users FROM users");
    const rowAdmins = await getOne(
      "SELECT COUNT(*) as total_admins FROM users WHERE role = ?",
      ["admin"],
    );
    const rowOwners = await getOne(
      "SELECT COUNT(*) as total_owners FROM users WHERE role = ?",
      ["owner"],
    );
    const rowTenants = await getOne(
      "SELECT COUNT(*) as total_tenants FROM users WHERE role = ?",
      ["tenant"],
    );

    const rowRooms = await getOne("SELECT COUNT(*) as total_rooms FROM rooms");
    const rowAvailRooms = await getOne(
      "SELECT COUNT(*) as available_rooms FROM rooms WHERE is_available = 1",
    );

    const rowBookings = await getOne(
      "SELECT COUNT(*) as total_bookings FROM bookings",
    );
    const rowPending = await getOne(
      "SELECT COUNT(*) as pending_bookings FROM bookings WHERE status = ?",
      ["pending"],
    );
    const rowApproved = await getOne(
      "SELECT COUNT(*) as approved_bookings FROM bookings WHERE status = ?",
      ["approved"],
    );

    const rowReviews = await getOne(
      "SELECT COUNT(*) as total_reviews FROM reviews",
    );

    // Room price statistics
    const rowAvgPrice = await getOne(
      "SELECT AVG(price) as avg_price FROM rooms WHERE price IS NOT NULL AND price > 0",
    );
    const rowMinPrice = await getOne(
      "SELECT MIN(price) as min_price FROM rooms WHERE price IS NOT NULL AND price > 0",
    );
    const rowMaxPrice = await getOne(
      "SELECT MAX(price) as max_price FROM rooms WHERE price IS NOT NULL AND price > 0",
    );

    // Price range distribution
    const priceBudget = await getOne(
      "SELECT COUNT(*) as count FROM rooms WHERE price >= 0 AND price <= 5000",
    );
    const priceMid = await getOne(
      "SELECT COUNT(*) as count FROM rooms WHERE price > 5000 AND price <= 15000",
    );
    const priceHigh = await getOne(
      "SELECT COUNT(*) as count FROM rooms WHERE price > 15000 AND price <= 30000",
    );
    const pricePremium = await getOne(
      "SELECT COUNT(*) as count FROM rooms WHERE price > 30000",
    );

    const recentUsers = await getAll(
      "SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5",
    );

    return res.json({
      stats: {
        users: {
          total: rowUsers?.total_users ?? 0,
          admins: rowAdmins?.total_admins ?? 0,
          owners: rowOwners?.total_owners ?? 0,
          tenants: rowTenants?.total_tenants ?? 0,
        },
        rooms: {
          total: rowRooms?.total_rooms ?? 0,
          available: rowAvailRooms?.available_rooms ?? 0,
          avgPrice: Math.round(rowAvgPrice?.avg_price ?? 0),
          minPrice: Math.round(rowMinPrice?.min_price ?? 0),
          maxPrice: Math.round(rowMaxPrice?.max_price ?? 0),
        },
        priceRanges: {
          budget: priceBudget?.count ?? 0,
          mid: priceMid?.count ?? 0,
          high: priceHigh?.count ?? 0,
          premium: pricePremium?.count ?? 0,
        },
        bookings: {
          total: rowBookings?.total_bookings ?? 0,
          pending: rowPending?.pending_bookings ?? 0,
          approved: rowApproved?.approved_bookings ?? 0,
        },
        reviews: {
          total: rowReviews?.total_reviews ?? 0,
        },
      },
      recentUsers,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/admin/revenue?fromDate=&toDate=
 * Fetch total revenue from completed payments with optional date filtering
 */
const getRevenue = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    let query = `
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_payments
      FROM khalti_payments 
      WHERE status = 'completed'
    `;
    const params = [];

    // Add date filtering if provided
    if (fromDate) {
      query += ` AND DATE(created_at) >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      query += ` AND DATE(created_at) <= ?`;
      params.push(toDate);
    }

    const result = await getOne(query, params);

    return res.json({
      totalRevenue: result?.total_revenue ?? 0,
      totalPayments: result?.total_payments ?? 0,
      fromDate: fromDate || null,
      toDate: toDate || null,
    });
  } catch (error) {
    console.error("Get revenue error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/admin/rooms/all?search=&page=&limit=
 */
const getAllRooms = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    // ✅ Join rooms with users to include owner information
    let query = `
      SELECT 
        r.*, 
        u.full_name as owner_name,
        u.email as owner_email
      FROM rooms r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query +=
        " AND (r.title LIKE ? OR r.address LIKE ? OR r.location LIKE ? OR u.full_name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY r.created_at DESC";

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);

    const rooms = await getAll(query, params);

    let countQuery =
      "SELECT COUNT(*) as total FROM rooms r LEFT JOIN users u ON r.owner_id = u.id WHERE 1=1";
    const countParams = [];
    if (search) {
      countQuery +=
        " AND (r.title LIKE ? OR r.address LIKE ? OR r.location LIKE ? OR u.full_name LIKE ?)";
      countParams.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      );
    }
    const countRow = await getOne(countQuery, countParams);
    const total = countRow?.total ?? 0;

    return res.json({
      rooms,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRooms: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get all rooms error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/admin/bookings/all?status=&page=&limit=
 */
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = "SELECT * FROM bookings WHERE 1=1";
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

    const bookings = await getAll(query, params);

    let countQuery = "SELECT COUNT(*) as total FROM bookings WHERE 1=1";
    const countParams = [];
    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }
    const countRow = await getOne(countQuery, countParams);
    const total = countRow?.total ?? 0;

    return res.json({
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalBookings: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getAdminStats,
  getRevenue,
  getAllRooms,
  getAllBookings,
};
