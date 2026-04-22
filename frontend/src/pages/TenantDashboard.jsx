// Importing dependencies
import React, { useState } from "react";
import RentalHistory from "../components/RentalHistory";
import Receipts from "../components/Receipts";
import "../styles/TenantDashboard.css";

// Tenant dashboard component
const TenantDashboard = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState("rentals");

  return (
    <div className="tenant-dashboard">
      <div className="dashboard-header">
        <h1>Tenant Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "rentals" ? "active" : ""}`}
          onClick={() => setActiveTab("rentals")}
        >
          📋 Rental History
        </button>
        <button
          className={`tab-btn ${activeTab === "receipts" ? "active" : ""}`}
          onClick={() => setActiveTab("receipts")}
        >
          🧾 Payment Receipts
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "rentals" && <RentalHistory />}
        {activeTab === "receipts" && <Receipts />}
      </div>
    </div>
  );
};

export default TenantDashboard;
