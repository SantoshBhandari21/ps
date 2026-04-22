// backend/src/migrations/add_phone_to_messages.js
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
    process.exit(1);
  } else {
    console.log("Connected to SQLite database for migration");
  }
});

// Executing migration for phone column addition
db.serialize(() => {
  // Checking if phone column already exists
  db.all("PRAGMA table_info(messages)", (err, columns) => {
    if (err) {
      console.error("Error checking table structure:", err);
      process.exit(1);
    }

    const columnNames = columns.map((col) => col.name);

    // Adding phone column if missing
    if (!columnNames.includes("phone")) {
      db.run("ALTER TABLE messages ADD COLUMN phone TEXT", (err) => {
        if (err) {
          console.error("Error adding phone column:", err);
          process.exit(1);
        } else {
          console.log("Successfully added phone column to messages table");
        }
      });
    } else {
      console.log("phone column already exists in messages table");
    }
  });
});

// Closing database connection after migration completes
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
      process.exit(1);
    } else {
      console.log("Migration completed. Database connection closed.");
      process.exit(0);
    }
  });
}, 1000);
