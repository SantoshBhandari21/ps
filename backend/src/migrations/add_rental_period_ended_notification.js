// backend/src/migrations/add_rental_period_ended_notification.js
// Importing sqlite3 database module
const sqlite3 = require("sqlite3").verbose();
// Importing path utilities
const path = require("path");

// Defining database path location
const DB_PATH = path.resolve(__dirname, "../../rental.db");

// Connecting to SQLite database for migration
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database for migration");
  }
});

// Executing migration for notification tracking column
db.serialize(() => {
  // Checking existing bookings table structure
  db.all("PRAGMA table_info(bookings)", (err, columns) => {
    if (err) {
      console.error("Error checking table structure:", err);
      return;
    }

    const columnNames = columns.map((col) => col.name);

    // Adding notification tracking column if missing
    if (!columnNames.includes("notified_period_ended")) {
      db.run(
        "ALTER TABLE bookings ADD COLUMN notified_period_ended INTEGER DEFAULT 0",
        (err) => {
          if (err) {
            console.error("Error adding notified_period_ended:", err);
          } else {
            console.log("Added notified_period_ended column to bookings table");
          }
        },
      );
    } else {
      console.log("notified_period_ended column already exists");
    }
  });
});

// Closing database connection after migration completes
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
    } else {
      console.log("Migration completed. Database connection closed.");
    }
  });
}, 1000);
