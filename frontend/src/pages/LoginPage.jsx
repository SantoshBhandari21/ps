// Importing dependencies
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

// Inline styles for login page
const styles = {
  container: {
    minHeight: "85vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 40%)",
    padding: "30px",
  },
  card: {
    background: "white",
    borderRadius: "8px",
    padding: "40px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
    textAlign: "center",
    margin: 0,
  },
  group: { marginBottom: "15px" },
  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "5px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    background: "#fee",
    color: "#c33",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px",
    fontSize: "13px",
  },
  footer: { textAlign: "center", fontSize: "13px", marginTop: "15px" },
  termsText: {
    fontSize: "12px",
    color: "#999",
    textAlign: "center",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  link: { color: "#667eea", textDecoration: "none", fontWeight: "600" },
  forgotPassword: {
    display: "block",
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    marginTop: "8px",
  },
};

// Login page component
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handling login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>myRentals</h1>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={styles.termsText}>
          By logging in you accept all the terms and conditions of myRentals.
        </div>
        <div style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Sign up
          </Link>
          <Link to="/forgot-password" style={styles.forgotPassword}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
