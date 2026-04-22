// backend/src/migrations/update_notification_types.js
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

// Executing migration for notification type updates
db.serialize(() => {
  // Creating backup of existing notifications
  db.run(
    `CREATE TABLE notifications_backup AS SELECT * FROM notifications`,
    (err) => {
      if (err) {
        console.log(
          "Backup table may already exist or no data to backup:",
          err.message,
        );
      } else {
        console.log("Backed up existing notifications");
      }

      // Dropping old notifications table to recreate with new constraints
      db.run(`DROP TABLE notifications`, (dropErr) => {
        if (dropErr) {
          console.error("Error dropping old notifications table:", dropErr);
          return;
        }
        console.log("Dropped old notifications table");

        // Creating new notifications table with updated constraints
        db.run(
          `CREATE TABLE notifications (
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
      )`,
          (createErr) => {
            if (createErr) {
              console.error(
                "Error creating new notifications table:",
                createErr,
              );
              return;
            }
            console.log(
              "Created new notifications table with updated CHECK constraint",
            );

            // Restoring notifications from backup
            db.run(
              `INSERT INTO notifications SELECT * FROM notifications_backup`,
              (restoreErr) => {
                if (restoreErr) {
                  console.error("Error restoring notifications:", restoreErr);
                } else {
                  console.log("Restored notifications from backup");

                  // Dropping backup table after restoration
                  db.run(`DROP TABLE notifications_backup`, (dropBackupErr) => {
                    if (dropBackupErr) {
                      console.error(
                        "Error dropping backup table:",
                        dropBackupErr,
                      );
                    } else {
                      console.log("Dropped backup table");
                    }
                  });
                }
              },
            );
          },
        );
      });
    },
  );
});

// Close database connection after operations complete
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
}, 2000);
