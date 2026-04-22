// src/middleware/upload.js
// Importing multer for handling file uploads
const multer = require("multer");
// Importing path utilities for file handling
const path = require("path");
// Importing file system module
const fs = require("fs");

// Creating uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuring disk storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "room-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Validating file types before upload
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Initializing multer with storage and file validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

// Exporting upload middleware for single and multiple image uploads
const uploadImage = upload.single("mainImage");
const uploadImages = upload.array("images", 10);

// Exporting configured upload handlers
module.exports = { upload, uploadImage, uploadImages };
