// backend/src/migrations/add_email_verification.js
// Run this migration to add email verification columns to users table

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../../rental.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database for migration");
  }
});

// Add email verification columns if they don't exist
db.serialize(() => {
  // Check if columns exist first
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error("Error checking table structure:", err);
      return;
    }

    const columnNames = columns.map((col) => col.name);

    // Add verification_token if it doesn't exist
    if (!columnNames.includes("verification_token")) {
      db.run("ALTER TABLE users ADD COLUMN verification_token TEXT", (err) => {
        if (err) {
          console.error("Error adding verification_token:", err);
        } else {
          console.log("✅ Added verification_token column");
        }
      });
    }

    // Add verification_token_expires if it doesn't exist
    if (!columnNames.includes("verification_token_expires")) {
      db.run(
        "ALTER TABLE users ADD COLUMN verification_token_expires INTEGER",
        (err) => {
          if (err) {
            console.error("Error adding verification_token_expires:", err);
          } else {
            console.log("✅ Added verification_token_expires column");
          }
        },
      );
    }

    console.log("✅ Email verification migration completed!");
    db.close();
  });
});
