// src/middleware/auth.js
// Importing JWT library for token verification
const jwt = require("jsonwebtoken");
// Importing database query function
const { getOne } = require("../config/database");

// Defining authentication error messages
const AUTH_ERRORS = {
  NO_TOKEN: "No token, authorization denied",
  USER_NOT_FOUND: "User not found",
  ACCOUNT_DEACTIVATED: "Account is deactivated",
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN: "Token is not valid",
  NOT_AUTHENTICATED: "Not authenticated",
  ACCESS_DENIED: (roles) =>
    `Access denied. Required role: ${roles.join(" or ")}`,
};

// Verifying JWT tokens and validating user authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: AUTH_ERRORS.NO_TOKEN });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getOne(
      "SELECT id, email, full_name, role, is_active FROM users WHERE id = ?",
      [decoded.id],
    );

    if (!user) {
      return res.status(401).json({ message: AUTH_ERRORS.USER_NOT_FOUND });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: AUTH_ERRORS.ACCOUNT_DEACTIVATED });
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? AUTH_ERRORS.TOKEN_EXPIRED
        : AUTH_ERRORS.INVALID_TOKEN;
    res.status(401).json({ message });
  }
};

// Checking user role against required permissions
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: AUTH_ERRORS.NOT_AUTHENTICATED });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: AUTH_ERRORS.ACCESS_DENIED(roles) });
    }

    next();
  };
};

// Exporting authentication and authorization middleware functions
module.exports = {
  authenticate,
  authorize,
  isAdmin: authorize("admin"),
  isOwner: authorize("owner"),
  isTenant: authorize("tenant"),
};
