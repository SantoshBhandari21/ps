const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = path.resolve(__dirname, "rental.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    process.exit(1);
  }
});

// Create test admin user
const adminData = {
  full_name: "Admin User",
  email: "admin@test.com",
  password: "admin123",
  role: "admin",
  is_verified: 1,
  is_active: 1,
};

// Hash password
const hashedPassword = bcrypt.hashSync(adminData.password, 10);

// Insert admin user
db.run(
  `INSERT OR IGNORE INTO users (full_name, email, password, role, is_verified, is_active) 
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    adminData.full_name,
    adminData.email,
    hashedPassword,
    adminData.role,
    adminData.is_verified,
    adminData.is_active,
  ],
  function (err) {
    if (err) {
      console.error("Error creating admin user:", err.message);
    } else {
      console.log("✓ Admin user created successfully!");
      console.log("Email: admin@test.com");
      console.log("Password: admin123");
    }
    db.close();
    process.exit(0);
  },
);
