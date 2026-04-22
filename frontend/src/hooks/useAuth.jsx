// Importing React hooks and authentication service
import React, { createContext, useContext, useState, useEffect } from "react";
import { logout as logoutUser } from "../services/authService";

// Creating authentication context
const AuthContext = createContext();

// Accessing auth context
export const useAuth = () => {
  // Auth context validation
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Initializing user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        // Parsing stored user data
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        // Clearing invalid data on parse error
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Logging out user and clearing session
  const logout = () => {
    setUser(null);
    logoutUser();
  };

  // Providing context value
  const value = { user, logout };

  // Returning provider with context
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
