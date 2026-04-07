import React, { useState, useEffect } from "react";
import styled from "styled-components";
import "../styles/OwnerDashboard.css";
import { roomsAPI, roomAPI, rentalsAPI } from "../services/api";
import RoomForm from "../components/RoomForm";

const ContentWrapper = styled.div`
  padding: 18px;

  @media (max-width: 960px) {
    padding: 14px;
  }
`;

const OwnerDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rentalRequests, setRentalRequests] = useState([]);

  useEffect(() => {
    fetchMyRooms();
    fetchRentalRequests();
  }, []);

  const fetchMyRooms = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching rooms...");
      const data = await roomsAPI.getMyRooms();
      console.log("Rooms fetched successfully:", data);
      setRooms(data.rooms || []);
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch rooms";
      console.error("Fetch rooms error:", errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalRequests = async () => {
    try {
      const data = await rentalsAPI.getRentalRequests("approved");
      console.log("Rental requests fetched:", data);
      setRentalRequests(data.requests || []);
    } catch (err) {
      console.error("Fetch rental requests error:", err);
    }
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleSubmitRoom = async (formData) => {
    try {
      console.log("Submitting room, editing:", !!editingRoom);
      let result;
      if (editingRoom) {
        console.log("Updating room:", editingRoom.id);
        result = await roomAPI.updateRoom(editingRoom.id, formData);
        console.log("Room updated successfully");
        setShowModal(false);
        setEditingRoom(null);
        setError("");
        await fetchMyRooms();
      } else {
        console.log("Creating new room");
        result = await roomAPI.createRoom(formData);
        console.log("Room created successfully", result);
        setError("");
        await fetchMyRooms();
      }
      return result;
    } catch (err) {
      const errorMsg = err.message || "Failed to save room";
      console.error("Save room error:", errorMsg, err);
      setError(errorMsg);
      throw err;
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      console.log("Deleting room:", roomId);
      await roomAPI.deleteRoom(roomId);
      console.log("Room deleted successfully");
      setDeleteConfirm(null);
      setError("");
      await fetchMyRooms();
    } catch (err) {
      const errorMsg = err.message || "Failed to delete room";
      console.error("Delete room error:", errorMsg, err);
      setError(errorMsg);
    }
  };

  return (
    <ContentWrapper>
      <div className="dashboard-header">
        <div className="header-content">
          <h1>My Rooms</h1>
          <p>Manage your room listings and add new properties</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-add-room" onClick={handleAddRoom}>
            <i className="fa-solid fa-plus" style={{ marginRight: "8px" }} />
            List a New Room
          </button>
        </div>
      </div>

      {!loading && rooms.length > 0 && (
        <div className="analytics-section">
          <div className="analytics-card">
            <div className="analytics-label">Total Rooms</div>
            <div className="analytics-value">{rooms.length}</div>
            <div className="analytics-hint">All listings</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-label">Available Rooms</div>
            <div className="analytics-value">
              {rooms.filter((r) => r.is_available).length}
            </div>
            <div className="analytics-hint">Ready to book</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-label">Rooms on Rent</div>
            <div className="analytics-value">
              {
                new Set(
                  rentalRequests
                    .filter((req) => req.status === "approved")
                    .map((req) => req.room_id),
                ).size
              }
            </div>
            <div className="analytics-hint">Successfully rented</div>
          </div>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading your rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="no-rooms">
          <p>
            You haven't listed any rooms yet. Start by adding your first
            property!
          </p>
          <button className="btn-primary" onClick={handleAddRoom}>
            <i className="fa-solid fa-home" style={{ marginRight: "8px" }} />
            List Your First Room
          </button>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-image">
                <img
                  src={
                    room.main_image
                      ? room.main_image.startsWith("http")
                        ? room.main_image
                        : `http://localhost:5000${room.main_image}`
                      : "/placeholder.jpg"
                  }
                  alt={room.title}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
                <div className="room-status">
                  {room.is_available ? (
                    <span className="status-available">Available</span>
                  ) : (
                    <span className="status-unavailable">Unavailable</span>
                  )}
                </div>
              </div>

              <div className="room-content">
                <h3>{room.title}</h3>
                <p className="room-location">
                  <i
                    className="fa-solid fa-map-pin"
                    style={{ marginRight: "8px" }}
                  />{" "}
                  {room.location}
                </p>
                <p className="room-address">{room.address}</p>

                <div className="room-details">
                  <span className="detail">{room.bedrooms} Beds</span>
                  <span className="detail">{room.bathrooms} Baths</span>
                </div>

                {room.description && (
                  <p className="room-description">{room.description}</p>
                )}

                <div className="room-footer">
                  <div className="price">Rs {room.price}/month</div>
                  <div className="room-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditRoom(room)}
                      title="Update room details"
                    >
                      <i
                        className="fa-solid fa-pen-to-square"
                        style={{ marginRight: "6px" }}
                      />{" "}
                      Update
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => setDeleteConfirm(room.id)}
                      title="Remove this listing"
                    >
                      <i
                        className="fa-solid fa-trash-can"
                        style={{ marginRight: "6px" }}
                      />{" "}
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {deleteConfirm === room.id && (
                <div className="delete-confirm">
                  <div className="confirm-dialog">
                    <p>
                      <i
                        className="fa-solid fa-exclamation-triangle"
                        style={{ marginRight: "8px", color: "#dc2626" }}
                      />
                      Are you sure you want to remove this listing?
                    </p>
                    <div className="confirm-actions">
                      <button
                        className="btn-cancel"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        <i
                          className="fa-solid fa-arrow-left"
                          style={{ marginRight: "6px" }}
                        />
                        Keep It
                      </button>
                      <button
                        className="btn-confirm"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        <i
                          className="fa-solid fa-check"
                          style={{ marginRight: "6px" }}
                        />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RoomForm
          room={editingRoom}
          onSubmit={handleSubmitRoom}
          onClose={() => {
            setShowModal(false);
            setEditingRoom(null);
          }}
        />
      )}
    </ContentWrapper>
  );
};

export default OwnerDashboard;
