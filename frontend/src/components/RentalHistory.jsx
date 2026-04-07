import React, { useState, useEffect } from "react";
import { rentalsAPI } from "../services/api";

const RentalHistory = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await rentalsAPI.getMyRentals();
      // Sort rentals by move_in_date in descending order (newest first)
      const sortedRentals = (data.rentals || []).sort(
        (a, b) => new Date(b.move_in_date) - new Date(a.move_in_date),
      );
      setRentals(sortedRentals);
    } catch (err) {
      console.error("Error fetching rentals:", err);
      setError(err.message || "Failed to load rental history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="rental-history-container">
        <div className="loading">Loading your rental history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rental-history-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="rental-history-container">
      <div className="rental-history-header">
        <h2>Rental History</h2>
        <p>View all your room rental records</p>
      </div>

      {/* Rentals List */}
      {rentals.length === 0 ? (
        <div className="empty-state">
          <p>No rental records found for this filter.</p>
        </div>
      ) : (
        <div className="rentals-list">
          {rentals.map((rental) => (
            <div key={rental.id} className="rental-card">
              <div className="rental-card-header">
                <div className="rental-info">
                  <h3>{rental.title}</h3>
                  <p className="rental-location">
                    <i
                      className="fa-solid fa-map-pin"
                      style={{ marginRight: "8px" }}
                    />{" "}
                    {rental.location}
                  </p>
                </div>
              </div>

              <div className="rental-details">
                <div className="detail-item">
                  <span className="detail-label">Room ID:</span>
                  <span className="detail-value">#{rental.room_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Owner:</span>
                  <span className="detail-value">{rental.owner_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price/Month:</span>
                  <span className="detail-value">Rs. {rental.price}</span>
                </div>
              </div>

              <div className="rental-dates">
                <div className="date-item">
                  <span className="date-label">Move-in:</span>
                  <span className="date-value">
                    {formatDate(rental.move_in_date)}
                  </span>
                </div>
                <div className="date-item">
                  <span className="date-label">Move-out:</span>
                  <span className="date-value">
                    {rental.move_out_date
                      ? formatDate(rental.move_out_date)
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="rental-amount">
                <span className="amount-label">Total Amount:</span>
                <span className="amount-value">Rs. {rental.total_price}</span>
              </div>

              {rental.main_image && (
                <img
                  src={rental.main_image}
                  alt={rental.title}
                  className="rental-thumbnail"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalHistory;

const rentalHistoryStyles = `
.rental-history-container {
  padding: 40px 20px;
  background-color: #f1f5f9;
  min-height: 100vh;
}

.rental-history-header {
  max-width: 1200px;
  margin: 0 auto 40px;
  text-align: center;
}

.rental-history-header h2 {
  font-size: 32px;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 8px;
}

.rental-history-header p {
  font-size: 15px;
  color: #64748b;
}

/* Rentals List */
.rentals-list {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.rental-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.rental-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.rental-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.rental-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.rental-location {
  font-size: 13px;
  color: #64748b;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending-payment {
  background-color: #fef08a;
  color: #b45309;
}

.status-pending {
  background-color: #fed7aa;
  color: #b45309;
}

.status-approved {
  background-color: #bbf7d0;
  color: #065f46;
}

.status-completed {
  background-color: #bfdbfe;
  color: #1e40af;
}

.status-rejected {
  background-color: #fecaca;
  color: #7f1d1d;
}

.status-cancelled {
  background-color: #e5e7eb;
  color: #374151;
}

.status-default {
  background-color: #e5e7eb;
  color: #4b5563;
}

/* Rental Details */
.rental-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}

/* Rental Dates */
.rental-dates {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.date-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-value {
  font-size: 13px;
  color: #1e293b;
  font-weight: 600;
}

/* Rental Amount */
.rental-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 10px;
  background-color: #f0f4f8;
  border-radius: 4px;
}

.amount-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

.amount-value {
  font-size: 15px;
  color: #64748b;
  font-weight: 700;
}

/* Rental Thumbnail */
.rental-thumbnail {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
  background-color: #e2e8f0;
}

/* Empty State */
.empty-state {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  font-size: 15px;
  color: #64748b;
}

/* Loading State */
.loading {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 40px;
  font-size: 15px;
  color: #64748b;
}

.error-message {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .rental-history-container {
    padding: 20px 16px;
  }

  .rental-history-header h2 {
    font-size: 24px;
  }

  .status-filter {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
  }

  .rentals-list {
    grid-template-columns: 1fr;
  }

  .rental-details {
    grid-template-columns: 1fr;
  }

  .rental-dates {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .rental-history-header h2 {
    font-size: 20px;
  }

  .rental-card {
    padding: 16px;
  }

  .rental-info h3 {
    font-size: 16px;
  }
}
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = rentalHistoryStyles;
  document.head.appendChild(styleSheet);
}
