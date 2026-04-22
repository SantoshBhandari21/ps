// backend/src/migrations/add_email_verification.js
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

// Executing migration to add email verification columns
db.serialize(() => {
  // Checking existing table structure
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error("Error checking table structure:", err);
      return;
    }

    const columnNames = columns.map((col) => col.name);

    // Adding verification token column if missing
    if (!columnNames.includes("verification_token")) {
      db.run("ALTER TABLE users ADD COLUMN verification_token TEXT", (err) => {
        if (err) {
          console.error("Error adding verification_token:", err);
        } else {
          console.log("Added verification_token column");
        }
      });
    }

    // Adding token expiration column if missing
    if (!columnNames.includes("verification_token_expires")) {
      db.run(
        "ALTER TABLE users ADD COLUMN verification_token_expires INTEGER",
        (err) => {
          if (err) {
            console.error("Error adding verification_token_expires:", err);
          } else {
            console.log("Added verification_token_expires column");
          }
        },
      );
    }

    console.log("Email verification migration completed!");
    db.close();
  });
});
