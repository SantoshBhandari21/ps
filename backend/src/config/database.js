// src/config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = path.resolve(__dirname, "../../rental.db");

// ============ DATABASE CONNECTION ============
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Initialize database tables
const initDatabase = () => {
  db.serialize(() => {
    // USERS table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profile_photo TEXT,
      role TEXT NOT NULL CHECK(role IN ('admin', 'owner', 'tenant')),
      is_verified INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Rooms/Properties table
    db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      location TEXT NOT NULL,
      room_type TEXT NOT NULL,
      price REAL NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      area REAL NOT NULL,
      amenities TEXT,
      main_image TEXT,
      is_available INTEGER DEFAULT 1,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Room images table
    db.run(`
    CREATE TABLE IF NOT EXISTS room_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

    // Bookings table
    db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      move_in_date DATE NOT NULL,
      move_out_date DATE,
      status TEXT DEFAULT 'pending_payment' CHECK(status IN ('pending_payment', 'pending', 'approved', 'rejected', 'cancelled', 'completed')),
      total_price REAL NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Reviews/Ratings table
    db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Favorites table
    db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      UNIQUE(tenant_id, room_id)
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Notifications table
    db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('booking_request', 'booking_approved', 'booking_rejected')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      booking_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `);

    // Khalti Payments table
    db.run(`
    CREATE TABLE IF NOT EXISTS khalti_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'khalti',
      purchase_order_id TEXT UNIQUE NOT NULL,
      pidx TEXT UNIQUE,
      status TEXT DEFAULT 'initiated' CHECK(status IN ('completed', 'failed')),
      transaction_id TEXT,
      payment_url TEXT,
      khalti_response TEXT,
      khalti_lookup_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  });

  console.log("Database tables initialized successfully");
};

/**
 * Execute INSERT/UPDATE/DELETE query and return inserted ID
 * @param {string} sql - SQL query string
 * @param {array} params - Query parameters
 * @returns {Promise<{id: number, changes: number}>}
 */
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Get a single row from database
 * @param {string} sql - SQL query string
 * @param {array} params - Query parameters
 * @returns {Promise<object|undefined>}
 */
const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

/**
 * Get multiple rows from database
 * @param {string} sql - SQL query string
 * @param {array} params - Query parameters
 * @returns {Promise<array>}
 */
const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports = {
  db,
  initDatabase,
  runQuery,
  getOne,
  getAll,
};
