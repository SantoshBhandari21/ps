import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";

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
  warning: {
    background: "#fef3cd",
    color: "#856404",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px",
    fontSize: "13px",
    borderLeft: "4px solid #ffc107",
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
  requirements: {
    fontSize: "12px",
    color: "#666",
    marginTop: "15px",
    padding: "10px",
    background: "#f9f9f9",
    borderRadius: "4px",
    lineHeight: "1.6",
  },
};

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Invalid Link</h1>
          <div style={styles.error}>{error}</div>
          <div style={styles.footer}>
            <Link to="/forgot-password" style={styles.link}>
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Your Password</h1>
        <p style={styles.subtitle}>
          Enter your new password below. Make sure it's at least 6 characters
          long.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && (
          <div style={styles.success}>
            ✅ Password reset successfully! Redirecting to login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={styles.group}>
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={styles.requirements}>
          <strong>Password Requirements:</strong>
          <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
            <li>At least 6 characters long</li>
            <li>Use a mix of letters and numbers</li>
            <li>Keep your password secure and don't share it</li>
          </ul>
        </div>

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
