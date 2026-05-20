// Importing SQLite3 database driver with verbose mode for debugging
const sqlite3 = require("sqlite3").verbose();
// Importing path module for resolving database file location
const path = require("path");
// Importing bcryptjs for password hashing (for seed data)
const bcrypt = require("bcryptjs");

// Resolving database file path relative to project root
const DB_PATH = path.resolve(__dirname, "../../rental.db");

// Initializing SQLite database connection with error handling
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Enabling foreign key constraints for referential integrity
db.run("PRAGMA foreign_keys = ON");

// Initializing database tables with serialized execution to ensure sequential creation
const initDatabase = () => {
  db.serialize(() => {
    // Creating users table for storing user accounts with roles and verification status
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

    // Creating rooms table for storing property listings with owner references
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
      map_embed_url TEXT,
      whatsapp_number TEXT,
      is_available INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // Creating room_images table for storing multiple images per property
    db.run(`
    CREATE TABLE IF NOT EXISTS room_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

    // Creating bookings table for managing rental reservations with status tracking
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

    // Creating reviews table for storing property ratings and feedback from tenants
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

    // Creating favorites table for storing tenant's favorite properties
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

    // Creating messages table for storing contact form submissions
    db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Creating notifications table for storing system notifications to users
    db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('booking_request', 'booking_approved', 'booking_rejected', 'room_verification', 'room_approval', 'payment_success', 'rental_cancelled', 'rental_period_ended', 'contact_message')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      booking_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `);

    // Creating khalti_payments table for storing payment transaction records
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

  console.log("# Database tables initialized successfully");
};

// Executing INSERT/UPDATE/DELETE queries and returning inserted ID and changes count
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Retrieving single row from database with parameterized query execution
const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Retrieving multiple rows from database with parameterized query execution
const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Exporting database connection and query utility functions for use in controllers
module.exports = {
  db,
  initDatabase,
  runQuery,
  getOne,
  getAll,
};
