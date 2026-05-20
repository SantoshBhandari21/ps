// Migration script to add whatsapp_number column to rooms table
// Usage: node migrations/add_whatsapp_number.js

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.resolve(__dirname, "../rental.db");

// Check if database exists
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

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Check if column already exists
db.all("PRAGMA table_info(rooms)", [], (err, columns) => {
  if (err) {
    console.error("Error checking table structure:", err.message);
    db.close();
    process.exit(1);
  }

  const hasWhatsappNumber = columns.some(
    (col) => col.name === "whatsapp_number",
  );

  if (hasWhatsappNumber) {
    console.log("✓ Column 'whatsapp_number' already exists in rooms table");
    db.close();
    process.exit(0);
  }

  // Add the column if it doesn't exist
  db.run("ALTER TABLE rooms ADD COLUMN whatsapp_number TEXT;", (err) => {
    if (err) {
      console.error("Error adding column:", err.message);
      db.close();
      process.exit(1);
    }

    console.log("✓ Successfully added 'whatsapp_number' column to rooms table");
    console.log("✓ Migration completed successfully");

    db.close();
    process.exit(0);
  });
});
