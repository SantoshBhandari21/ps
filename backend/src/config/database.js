// src/config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

// Database file path
const DB_PATH = path.resolve(__dirname, "../../rental.db");

// Create database connection
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
  // Clean up any incomplete migrations first
  db.serialize(() => {
    // Drop users_old table if it exists (from incomplete migrations)
    db.run("DROP TABLE IF EXISTS users_old", (err) => {
      if (err) {
        console.log("No users_old table to clean up");
      } else {
        console.log("Cleaned up incomplete migration table");
      }
    });

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

    // Migration: Add is_verified column if it doesn't exist
    db.run(
      "ALTER TABLE rooms ADD COLUMN is_verified INTEGER DEFAULT 1",
      (err) => {
        if (err && !err.message.includes("duplicate column")) {
          console.log("is_verified column already exists");
        } else {
          // Migrate existing rooms to verified (1)
          db.run("UPDATE rooms SET is_verified = 1", (err) => {
            if (err) {
              console.error("Error migrating rooms to verified:", err);
            } else {
              console.log("Migrated existing rooms to verified");
            }
          });
        }
      },
    );

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
      status TEXT DEFAULT 'initiated' CHECK(status IN ('initiated', 'pending', 'completed', 'failed', 'cancelled')),
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

    // Add missing columns if they don't exist (for existing databases)
    db.run(
      `
    PRAGMA table_info(users)
  `,
      (err, rows) => {
        if (err) {
          console.error("Error checking users table:", err);
          return;
        }

        // Check if profile_photo column exists
        db.all("PRAGMA table_info(users)", (err, columns) => {
          if (err) {
            console.error("Error getting table info:", err);
            return;
          }

          const hasProfilePhoto = columns.some(
            (col) => col.name === "profile_photo",
          );

          if (!hasProfilePhoto) {
            db.run("ALTER TABLE users ADD COLUMN profile_photo TEXT", (err) => {
              if (err) {
                console.error("Error adding profile_photo column:", err);
              } else {
                console.log("Added profile_photo column to users table");
              }
            });
          }
        });
      },
    );
  });

  console.log("Database tables initialized successfully");
};

// Seed default test users
const seedDatabase = () => {
  const testUsers = [
    {
      full_name: "Admin User",
      email: "admin@gmail.com",
      password: "qwerty",
      role: "admin",
    },
    {
      full_name: "Owner User",
      email: "owner@gmail.com",
      password: "qwerty",
      role: "owner",
    },
    {
      full_name: "Tenant User",
      email: "tenant@gmail.com",
      password: "qwerty",
      role: "tenant",
    },
  ];

  // Check if admin already exists
  db.get(
    "SELECT id FROM users WHERE email = ?",
    ["admin@gmail.com"],
    (err, row) => {
      if (err) {
        console.error("Error checking for existing users:", err);
        return;
      }

      // If admin already exists, skip seeding
      if (row) {
        console.log("Seed users already exist, skipping seeding");
        return;
      }

      // Create seed users
      console.log("Creating seed test users...");
      testUsers.forEach((user) => {
        // Hash password
        bcrypt.hash(user.password, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
            return;
          }

          const sql = `
            INSERT INTO users (full_name, email, password, role, is_verified, is_active)
            VALUES (?, ?, ?, ?, 1, 1)
          `;

          db.run(
            sql,
            [user.full_name, user.email, hashedPassword, user.role],
            function (err) {
              if (err) {
                console.error(`Error creating ${user.role} user:`, err);
              } else {
                console.log(
                  `Created ${user.role} user: ${user.email} (password: ${user.password})`,
                );
              }
            },
          );
        });
      });
    },
  );
};

// Helper function to run queries with promises
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Helper function to get single row
const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Helper function to get all rows
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
  seedDatabase,
  runQuery,
  getOne,
  getAll,
};
