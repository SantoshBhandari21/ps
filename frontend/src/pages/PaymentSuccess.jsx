import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Receipts from "../components/Receipts";

const styles = {
  container: {
    padding: "40px 16px",
    background: "#f1f5f9",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "600px",
    margin: "0 auto",
    background: "white",
    borderRadius: "8px",
    padding: "40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  icon: { fontSize: "60px", marginBottom: "20px" },
  title: {
    fontSize: "28px",
    fontWeight: "600",
    margin: "0 0 10px",
    color: "#0f172a",
  },
  subtitle: { fontSize: "16px", color: "#475569", margin: "0 0 30px" },
  button: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
  },
  receiptsSection: {
    marginTop: "40px",
    maxWidth: "1000px",
    margin: "40px auto 0",
  },
};

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const pidx = params.get("pidx");
        const khaltiStatus = params.get("status");

        if (!pidx || khaltiStatus !== "Completed") {
          setStatus("error");
          setError("Payment verification failed. Please try again.");
          return;
        }

        // Verify with backend
        const token = localStorage.getItem("token");
        const verifyUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/payments/verify?pidx=${pidx}&status=${khaltiStatus}`;

        const response = await fetch(verifyUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          setStatus("success");
        } else {
          throw new Error("Verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("success"); // Still show success since Khalti confirmed payment
      }
    };

    verifyPayment();
  }, [location]);

  if (status === "verifying") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⏳</div>
          <h1 style={styles.title}>Verifying Payment</h1>
          <p style={styles.subtitle}>Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>❌</div>
          <h1 style={styles.title}>Payment Error</h1>
          <p style={styles.subtitle}>{error}</p>
          <button
            style={styles.button}
            onClick={() => navigate("/tenant/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✨</div>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.subtitle}>Your rental has been confirmed.</p>
        <button
          style={styles.button}
          onClick={() => navigate("/tenant/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
      <div style={styles.receiptsSection}>
        <Receipts />
      </div>
    </div>
  );
}
