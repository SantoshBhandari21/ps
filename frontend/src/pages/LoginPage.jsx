// Importing dependencies
import React, { useEffect, useState } from "react";
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
  termsButton: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#667eea",
    fontWeight: "600",
    cursor: "pointer",
    font: "inherit",
  },
  link: { color: "#667eea", textDecoration: "none", fontWeight: "600" },
  forgotPassword: {
    display: "block",
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    marginTop: "8px",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1000,
  },
  modalCard: {
    width: "100%",
    maxWidth: "720px",
    maxHeight: "90vh",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 48px rgba(0,0,0,0.2)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
  },
  modalClose: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
    padding: 0,
  },
  modalBody: {
    padding: "24px",
    overflowY: "auto",
  },
  modalSectionTitle: {
    margin: "0 0 12px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  },
  modalParagraph: {
    margin: "0 0 12px",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#334155",
  },
  modalList: {
    margin: "0 0 16px",
    paddingLeft: "20px",
    color: "#334155",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  modalListItem: {
    marginBottom: "10px",
  },
};

const TERMS_POINTS = [
  "Tenants and owners using the platform must follow the Muluki Civil Code, 2074 and other rental related laws of Nepal.",
  "Money transactions between owners and tenants outside the platform are strictly prohibited. Such transactions may lead to termination of both owner and tenant accounts from this platform.",
  "Every user must register with a unique email and password before using the system. Users are assigned roles such as tenant and owner.",
  "Only owners are allowed to add, edit or remove room listings in the system. Each listing includes proper details like title, location, price, description and availability.",
  "Rooms with ongoing renting cannot be deleted by their owner.",
  "A room can only be booked when it is marked as available. Unavailable rooms are not available for rent.",
  "Only tenants can book rooms through the platform. Each booking must be linked with one tenant, one owner and one room.",
  "Rent must be paid in advance to confirm a booking. A booking is not successful until the payment is completed.",
  "Online payments are made through Khalti in the system. The renting process is confirmed only after the payment is verified successfully.",
  "Each renting has a clear status such as pending, approved, rejected, cancelled or completed. This helps the system track the booking process properly.",
  "Tenants are responsible for electricity, water, internet and waste charges unless the owner has clearly mentioned in the description that these are included in the rent.",
  "Tenants are not allowed to sublet the rented room or property to another person.",
  "The system sends notifications for important activities such as bookings, payments and other updates so that users can stay informed.",
  "Admin has the authority to manage users, monitor payments and review room listings. Admin can also activate, deactivate, verify or unverify users and listings when needed.",
  "Only active users are allowed to use the main features of the platform. Deactivated users are not able to continue using the system.",
  "Contact admin if you need to reactivate your account or know why your account was deactivated.",
  "Tenants can view their rental history and payment receipts from their dashboard after successful transactions.",
  "Tenants can only select move in date inside 10 days on current date.",
];

function TermsModal({ onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Terms and Conditions</h2>
          </div>
          <button type="button" style={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div style={styles.modalBody}>
          <p style={styles.modalParagraph}>
            Please read the following platform rules and policies carefully.
          </p>
          <ul style={styles.modalList}>
            {TERMS_POINTS.map((point) => (
              <li key={point} style={styles.modalListItem}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Login page component
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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
          By logging in you accept all the{" "}
          <button
            type="button"
            style={styles.termsButton}
            onClick={() => setShowTerms(true)}
          >
            terms and conditions
          </button>{" "}
          of myRentals.
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
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}
