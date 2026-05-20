// Migration script to align existing room rows with the new default availability
// Usage: node migrations/set_room_initial_availability_to_unavailable.js

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.resolve(__dirname, "../rental.db");

if (!fs.existsSync(DB_PATH)) {
  console.error("Database file not found at:", DB_PATH);
  process.exit(1);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    process.exit(1);
  }
  console.log("Connected to database");
});

db.run("PRAGMA foreign_keys = ON");

db.run(
  "UPDATE rooms SET is_available = 0 WHERE is_verified = 0 AND is_available <> 0",
  (err) => {
    if (err) {
      console.error("Error updating room availability:", err.message);
      db.close();
      process.exit(1);
    }

    console.log("✓ Updated unverified rooms to unavailable");
    console.log("✓ Migration completed successfully");

    db.close();
    process.exit(0);
  },
);
