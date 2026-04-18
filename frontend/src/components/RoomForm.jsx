import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";

/* Styled Components */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  max-width: 700px;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  overflow-y: auto;
  padding: 0;
  width: 90%;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const RoomFormStyled = styled.form`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #667eea;
  }
`;

const FormError = styled.div`
  background-color: #fee;
  border-left: 4px solid #f44;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const ImageUpload = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);

  &:hover {
    background: #dc2626;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    transform: scale(1.1);
  }
`;

const ImagePlaceholder = styled.div`
  color: #999;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
`;

const UploadZone = styled.label`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;

  &:hover {
    border-color: #667eea;
    background-color: #f0f4ff;
  }
`;

const InputFile = styled.input`
  display: none;
`;

const Placeholder = styled.div`
  color: #999;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
`;

const UploadLabel = styled.label`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: inline-block;
  align-self: flex-start;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
  }

  input,
  textarea,
  select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: all 0.3s ease;
    background-color: #fafafa;

    &:focus {
      outline: none;
      border-color: #667eea;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  select {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23475569'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' /%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.2em;
    padding-right: 2.5rem;
  }
`;

const Required = styled.span`
  color: #ff6b6b;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const AmenitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const AmenityCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #333;

  &:hover {
    border-color: #667eea;
    background-color: #f9f9f9;
  }

  input[type="checkbox"] {
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: #667eea;
    margin: 0;
  }

  input[type="checkbox"]:checked {
    & ~ * {
      color: #667eea;
    }
  }

  &:has(input[type="checkbox"]:checked) {
    background-color: #eef2ff;
    border-color: #667eea;
    color: #667eea;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background: white;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.3px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled(Button)`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 1.5px solid #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    border-color: #9ca3af;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SubmitBtn = styled(Button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }
`;

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
    amenities: [],
  });

  const [imagePreviewsLocal, setImagePreviewsLocal] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState(null);

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
        amenities: room.amenities || [],
      });
      // Load existing images for editing
      if (room.images && room.images.length > 0) {
        const previews = room.images.map((img) => {
          const imageUrl = img.image_url.startsWith("http")
            ? img.image_url
            : `http://localhost:5000${img.image_url}`;
          return { id: img.id, url: imageUrl, isExisting: true };
        });
        setImagePreviewsLocal(previews);
      } else if (room.main_image) {
        const imageUrl = room.main_image.startsWith("http")
          ? room.main_image
          : `http://localhost:5000${room.main_image}`;
        setImagePreviewsLocal([
          { id: "main", url: imageUrl, isExisting: true },
        ]);
      }
    }
  }, [room]);

  const handleCloseSuccess = useCallback(() => {
    setSuccess(false);
    setCreatedRoomId(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        handleCloseSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, handleCloseSuccess]);

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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Add new files to existing ones
    const newImages = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: `new-${Date.now()}-${Math.random()}`,
            file: file,
            url: reader.result,
            isExisting: false,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then((newPreviews) => {
      setImagePreviewsLocal((prev) => [...prev, ...newPreviews]);
      setImageFiles((prev) => [...prev, ...files]);
    });

    // Reset file input
    e.target.value = "";
  };

  const handleRemoveImage = (imageId) => {
    setImagePreviewsLocal((prev) => prev.filter((img) => img.id !== imageId));
    setImageFiles((prev) => {
      const newFiles = prev.filter((_, index) => {
        // Find the index in the original array
        const previewIndex = imagePreviewsLocal.findIndex(
          (img) => img.id === imageId,
        );
        return (
          index !==
          previewIndex -
            imagePreviewsLocal.filter((img) => img.isExisting).length
        );
      });
      return newFiles;
    });
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
      !formData.area
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

    if (!room && imageFiles.length === 0 && imagePreviewsLocal.length === 0) {
      setError("Please upload at least one room image");
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
      submitData.append("amenities", JSON.stringify(formData.amenities));

      // Append all new image files with "images" key for multiple file handling
      imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      // If editing, send list of existing images to keep
      if (room && imagePreviewsLocal.length > 0) {
        const existingImageIds = imagePreviewsLocal
          .filter((img) => img.isExisting)
          .map((img) => img.id);

        if (existingImageIds.length > 0) {
          submitData.append("keepImageIds", JSON.stringify(existingImageIds));
        }
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
        amenities: formData.amenities,
        imageCount: imageFiles.length,
      });

      const result = await onSubmit(submitData);

      // If this is a new room (not editing), show success with room ID
      if (!room && result && result.room) {
        setSuccess(true);
        setCreatedRoomId(result.room.id);
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

  // Show success screen for new rooms
  if (success && !room) {
    return (
      <ModalOverlay onClick={handleCloseSuccess}>
        <ModalContent
          onClick={(e) => e.stopPropagation()}
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: "40px 20px",
          }}
        >
          <p
            style={{
              color: "#10b981",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0",
            }}
          >
            Room with ID #{createdRoomId} listed successfully
          </p>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{room ? "Edit Room" : "Add New Room"}</h2>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </ModalHeader>

        <RoomFormStyled onSubmit={handleSubmit}>
          {error && <FormError>{error}</FormError>}

          {/* Image Upload Section */}
          <FormSection>
            <h3>Room Photos</h3>
            {imagePreviewsLocal.length > 0 && (
              <>
                <p
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {imagePreviewsLocal.length} photo
                  {imagePreviewsLocal.length !== 1 ? "s" : ""} selected
                </p>
                <ImagesGrid>
                  {imagePreviewsLocal.map((preview) => (
                    <ImagePreview key={preview.id}>
                      <img src={preview.url} alt="Room preview" />
                      <RemoveImageBtn
                        type="button"
                        onClick={() => handleRemoveImage(preview.id)}
                        title="Remove this image"
                      >
                        ✕
                      </RemoveImageBtn>
                    </ImagePreview>
                  ))}
                </ImagesGrid>
              </>
            )}
            <UploadZone htmlFor="imagesInput">
              <InputFile
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="imagesInput"
                multiple
              />
              <div style={{ pointerEvents: "none" }}>
                <i
                  className="fa-solid fa-cloud-arrow-up"
                  style={{
                    fontSize: "2rem",
                    color: "#667eea",
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                />
                <p
                  style={{
                    margin: "0.5rem 0",
                    color: "#333",
                    fontWeight: "600",
                  }}
                >
                  Click to upload or drag and drop
                </p>
                <p
                  style={{
                    margin: "0.25rem 0",
                    color: "#999",
                    fontSize: "0.85rem",
                  }}
                >
                  PNG, JPG, GIF up to 5MB each
                </p>
              </div>
            </UploadZone>
          </FormSection>

          {/* Basic Information */}
          <FormSection>
            <h3>Basic Information</h3>
            <FormGroup>
              <label>
                Room Title <Required>*</Required>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Cozy Studio in Downtown"
              />
            </FormGroup>

            <FormGroup>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your room, its features, and what makes it special..."
                rows="4"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <label>
                  Monthly Rent (Rs) <Required>*</Required>
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
              </FormGroup>
            </FormRow>
          </FormSection>

          {/* Location */}
          <FormSection>
            <h3>Location</h3>
            <FormGroup>
              <label>
                Address <Required>*</Required>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Main Street, Apt 4B"
              />
            </FormGroup>

            <FormGroup>
              <label>
                City/Location <Required>*</Required>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Pokhara, Lakeside"
              />
            </FormGroup>
          </FormSection>

          {/* Room Details */}
          <FormSection>
            <h3>Room Details</h3>

            <FormRow>
              <FormGroup>
                <label>
                  Bedrooms <Required>*</Required>
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleNumberChange}
                  placeholder="0"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <label>
                  Bathrooms <Required>*</Required>
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleNumberChange}
                  placeholder="0"
                  min="0"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <label>
                Area (sq ft) <Required>*</Required>
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
            </FormGroup>
          </FormSection>

          {/* Amenities */}
          <FormSection>
            <h3>Amenities</h3>
            <AmenitiesGrid>
              {amenitiesOptions.map((amenity) => (
                <AmenityCheckbox key={amenity}>
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  {amenity}
                </AmenityCheckbox>
              ))}
            </AmenitiesGrid>
          </FormSection>

          {/* Form Actions */}
          <FormActions>
            <CancelBtn type="button" onClick={onClose} disabled={loading}>
              <i
                className="fa-solid fa-arrow-left"
                style={{ marginRight: "6px" }}
              />
              Go Back
            </CancelBtn>
            <SubmitBtn type="submit" disabled={loading}>
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
            </SubmitBtn>
          </FormActions>
        </RoomFormStyled>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RoomForm;
