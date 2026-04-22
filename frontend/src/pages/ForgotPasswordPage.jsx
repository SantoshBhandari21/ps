// Importing dependencies
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

// Inline styles for forgot password page
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
    marginBottom: "10px",
    textAlign: "center",
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    color: "#666",
    textAlign: "center",
    marginBottom: "20px",
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
  success: {
    background: "#efe",
    color: "#3c3",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px",
    fontSize: "13px",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "15px",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setEmail("");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password?</h1>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && (
          <div style={styles.success}>
            Password reset link sent to your email! Redirecting to login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={styles.group}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          Remember your password?{" "}
          <Link to="/login" style={styles.link}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
