import React, { useState, useEffect } from "react";
import "../styles/RoomForm.css";

const RoomForm = ({ room, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    roomType: "Single",
    amenities: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const [createdRoomTitle, setCreatedRoomTitle] = useState(null);

  const amenitiesOptions = [
    "WiFi",
    "Air Conditioning",
    "Kitchen",
    "Parking",
    "Garden",
    "Balcony",
    "Gym",
    "Security",
    "Pet Friendly",
    "Heating",
    "Laundry",
    "Dishwasher",
  ];

  const roomTypeOptions = [
    "Single",
    "Studio",
    "1BHK",
    "2BHK",
    "3BHK",
    "4BHK",
    "Shared",
    "Penthouse",
    "Loft",
  ];

  useEffect(() => {
    if (room) {
      setFormData({
        title: room.title || "",
        description: room.description || "",
        address: room.address || "",
        location: room.location || "",
        price: room.price || "",
        bedrooms: room.bedrooms || "",
        bathrooms: room.bathrooms || "",
        area: room.area || "",
        roomType: room.room_type || "Single",
        amenities: room.amenities || [],
      });
      if (room.main_image) {
        setImagePreview(room.main_image);
      }
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "area" ? parseFloat(value) || "" : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || "",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (
      !formData.title ||
      !formData.address ||
      !formData.location ||
      !formData.price ||
      !formData.bedrooms ||
      !formData.bathrooms ||
      !formData.area ||
      !formData.roomType
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      formData.price <= 0 ||
      formData.bedrooms <= 0 ||
      formData.bathrooms <= 0 ||
      formData.area <= 0
    ) {
      setError("Price, bedrooms, bathrooms, and area must be greater than 0");
      return;
    }

    if (!room && !imageFile) {
      setError("Please upload a room image");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart/form-data
      const submitData = new FormData();

      // Append all form fields
      submitData.append("title", String(formData.title).trim());
      submitData.append("description", String(formData.description).trim());
      submitData.append("address", String(formData.address).trim());
      submitData.append("location", String(formData.location).trim());
      submitData.append("price", parseFloat(formData.price));
      submitData.append("bedrooms", parseInt(formData.bedrooms));
      submitData.append("bathrooms", parseInt(formData.bathrooms));
      submitData.append("area", parseFloat(formData.area));
      submitData.append("roomType", String(formData.roomType));
      submitData.append("amenities", JSON.stringify(formData.amenities));

      if (imageFile) {
        submitData.append("mainImage", imageFile);
      }

      console.log("Submitting room data:", {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        location: formData.location,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        roomType: formData.roomType,
        amenities: formData.amenities,
        hasImage: !!imageFile,
      });

      const result = await onSubmit(submitData);

      // If this is a new room (not editing), show success with room ID
      if (!room && result && result.room) {
        setSuccess(true);
        setCreatedRoomId(result.room.id);
        setCreatedRoomTitle(result.room.title);
      } else if (room) {
        // For editing, just close the modal
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to save room");
      console.error("Form submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
    setCreatedRoomId(null);
    setCreatedRoomTitle(null);
    onClose();
  };

  // Show success screen for new rooms
  if (success && !room) {
    return (
      <div className="modal-overlay" onClick={handleCloseSuccess}>
        <div
          className="modal-content room-form-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "20px auto",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            <i className="fa-solid fa-check" style={{ color: "white" }} />
          </div>

          <h2 style={{ marginBottom: "10px", color: "#059669" }}>
            <i
              className="fa-solid fa-party-bell"
              style={{ marginRight: "8px" }}
            />
            Room Created Successfully!
          </h2>

          <p
            style={{
              marginBottom: "20px",
              color: "#666",
              fontSize: "15px",
              lineHeight: "1.6",
            }}
          >
            Your room has been uploaded and is now live on the platform.
          </p>

          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "30px",
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "10px 0",
                color: "#166534",
                fontSize: "14px",
              }}
            >
              <strong>Room Name:</strong> {createdRoomTitle}
            </p>
            <p
              style={{
                margin: "10px 0",
                color: "#166534",
                fontSize: "14px",
              }}
            >
              <strong>Unique Room ID:</strong>{" "}
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#059669",
                }}
              >
                #{createdRoomId}
              </span>
            </p>
            <p
              style={{
                margin: "10px 0",
                color: "#166534",
                fontSize: "13px",
                fontStyle: "italic",
              }}
            >
              Save this ID for your records
            </p>
          </div>

          <button
            onClick={handleCloseSuccess}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "none";
              e.target.style.boxShadow = "none";
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content room-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{room ? "Edit Room" : "Add New Room"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="room-form">
          {error && <div className="form-error">{error}</div>}

          {/* Image Upload Section */}
          <div className="form-section">
            <h3>Room Photo</h3>
            <div className="image-upload">
              <div className="image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Room preview" />
                ) : (
                  <div className="placeholder">No image selected</div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="imageInput"
                style={{ display: "none" }}
              />
              <label htmlFor="imageInput" className="upload-label">
                {imagePreview ? "Change Photo" : "Upload Photo"}
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>
                Room Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Cozy Studio in Downtown"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your room, its features, and what makes it special..."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Monthly Rent (Rs) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  step="1"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3>Location</h3>
            <div className="form-group">
              <label>
                Address <span className="required">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Main Street, Apt 4B"
              />
            </div>

            <div className="form-group">
              <label>
                City/Location <span className="required">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Pokhara, Lakeside"
              />
            </div>
          </div>

          {/* Room Details */}
          <div className="form-section">
            <h3>Room Details</h3>

            <div className="form-group">
              <label>
                Room Type <span className="required">*</span>
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
              >
                {roomTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Bedrooms <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleNumberChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>
                  Bathrooms <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleNumberChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Area (sq ft) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g., 450"
                step="1"
                min="0"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="amenity-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              <i
                className="fa-solid fa-arrow-left"
                style={{ marginRight: "6px" }}
              />
              Go Back
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i
                    className="fa-solid fa-spinner fa-spin"
                    style={{ marginRight: "6px" }}
                  />
                  Saving...
                </>
              ) : room ? (
                <>
                  <i
                    className="fa-solid fa-arrow-rotate-right"
                    style={{ marginRight: "6px" }}
                  />
                  Update Listing
                </>
              ) : (
                <>
                  <i
                    className="fa-solid fa-rocket"
                    style={{ marginRight: "6px" }}
                  />
                  List Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
