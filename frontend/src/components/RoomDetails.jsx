import React, { useState } from "react";
import styled from "styled-components";
import { paymentsAPI } from "../services/api";

const AMENITY_ICONS = {
  wifi: "fa-solid fa-wifi",
  parking: "fa-solid fa-car",
  kitchen: "fa-solid fa-utensils",
  gym: "fa-solid fa-dumbbell",
  balcony: "fa-solid fa-building",
  furnished: "fa-solid fa-couch",
  ac: "fa-solid fa-fan",
  laundry: "fa-solid fa-person-hiking",
  dishwasher: "fa-solid fa-plate-wheat",
  "air conditioning": "fa-solid fa-snowflake",
  "shared kitchen": "fa-solid fa-utensils",
  "study area": "fa-solid fa-book",
  "close to campus": "fa-solid fa-graduation-cap",
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  width: 90%;
  max-width: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
`;

const ImageSection = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background: #f1f5f9;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ImageNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 12px 16px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  &.prev {
    left: 12px;
  }

  &.next {
    right: 12px;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #f9f9f9;
  overflow-x: auto;
  max-width: 100%;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #e5e7eb;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;

    &:hover {
      background: #6b7280;
    }
  }
`;

const Thumbnail = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${(props) => (props.active ? "#2563eb" : "transparent")};
  object-fit: cover;
  flex-shrink: 0;

  &:hover {
    border-color: #2563eb;
    transform: scale(1.05);
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;

  button {
    background: none;
    border: none;
    font-size: 24px;
    color: #64748b;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: #0f172a;
    }
  }
`;

const Title = styled.h2`
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
`;

const Location = styled.p`
  margin: 0 0 12px;
  color: #64748b;
  font-size: 14px;
`;

const Price = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: #2563eb;
  margin-bottom: 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const StatBox = styled.div`
  padding: 12px;
  background: #f1f5f9;
  border-radius: 10px;
  text-align: center;

  .label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
  }

  .value {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
  }
`;

const Description = styled.p`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 0 0 16px;
`;

const AmenitiesLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const Amenities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const AmenityTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 13px;
  color: #0c4a6e;

  i {
    font-size: 14px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Btn = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  font-weight: 900;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &.primary {
    background: #2563eb;
    color: white;
    &:hover {
      background: #1e40af;
    }
  }

  &.outline {
    background: white;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    &:hover {
      background: #f8fafc;
    }
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  padding: 10px 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 13px;
  margin-bottom: 12px;
`;

const RoomDetails = ({ room, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images (including main_image and images from room_images table)
  const getAllImages = () => {
    const images = [];

    // Add images from room_images table first
    if (room.images && Array.isArray(room.images) && room.images.length > 0) {
      room.images.forEach((img) => {
        const url = img.image_url.startsWith("http")
          ? img.image_url
          : `http://localhost:5000${img.image_url}`;
        images.push(url);
      });
    }

    // Add main_image if not already added
    if (
      room.main_image &&
      !images.some((img) => img.includes(room.main_image))
    ) {
      const url = room.main_image.startsWith("http")
        ? room.main_image
        : `http://localhost:5000${room.main_image}`;
      images.push(url);
    }

    return images.length > 0
      ? images
      : [
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23f1f5f9' width='100' height='100'/%3E%3C/svg%3E",
        ];
  };

  const allImages = getAllImages();
  const currentImage = allImages[currentImageIndex];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleSelectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const getAmenityIcon = (amenity) => {
    const key = amenity.toLowerCase();
    return AMENITY_ICONS[key] || "fa-solid fa-check";
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      // Initiate payment
      const result = await paymentsAPI.initiatePayment({
        bookingId: room.id,
        amount: room.price,
      });

      if (result.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = result.payment_url;
      }
    } catch (err) {
      setError(err.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ImageSection>
          {!imgError && currentImage ? (
            <img
              src={currentImage}
              alt={`${room.title} - Photo ${currentImageIndex + 1}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: "900",
              }}
            >
              <i className="fa-solid fa-image" style={{ fontSize: "48px" }} />
            </div>
          )}

          {allImages.length > 1 && (
            <>
              <ImageNav
                className="prev"
                onClick={handlePreviousImage}
                disabled={allImages.length === 1}
                title="Previous photo"
              >
                <i className="fa-solid fa-chevron-left" />
              </ImageNav>
              <ImageNav
                className="next"
                onClick={handleNextImage}
                disabled={allImages.length === 1}
                title="Next photo"
              >
                <i className="fa-solid fa-chevron-right" />
              </ImageNav>
              <ImageCounter>
                {currentImageIndex + 1} / {allImages.length}
              </ImageCounter>
            </>
          )}
        </ImageSection>

        {allImages.length > 1 && (
          <ImageThumbnails>
            {allImages.map((image, index) => (
              <Thumbnail
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                active={index === currentImageIndex}
                onClick={() => handleSelectImage(index)}
              />
            ))}
          </ImageThumbnails>
        )}

        <Content>
          <Header>
            <div style={{ flex: 1 }}>
              <Title>{room.title}</Title>
              <Location>
                <i className="fa-solid fa-location-dot"></i>{" "}
                {room.address || room.location}
              </Location>
            </div>
            <button onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </Header>

          <Price>Rs {room.price.toLocaleString()}/month</Price>

          <Grid>
            <StatBox>
              <div className="label">Bedrooms</div>
              <div className="value">{room.bedrooms}</div>
            </StatBox>
            <StatBox>
              <div className="label">Bathrooms</div>
              <div className="value">{room.bathrooms}</div>
            </StatBox>
            <StatBox>
              <div className="label">Area</div>
              <div className="value">{room.area} sq ft</div>
            </StatBox>
          </Grid>

          {room.description && <Description>{room.description}</Description>}

          {room.amenities && room.amenities.length > 0 && (
            <>
              <AmenitiesLabel>Amenities</AmenitiesLabel>
              <Amenities>
                {room.amenities.map((amenity, idx) => (
                  <AmenityTag key={idx}>
                    <i className={getAmenityIcon(amenity)}></i>
                    {amenity}
                  </AmenityTag>
                ))}
              </Amenities>
            </>
          )}

          {error && <Error>{error}</Error>}

          <ButtonGroup>
            <Btn className="outline" onClick={onClose}>
              Close
            </Btn>
            <Btn className="primary" onClick={handlePayment} disabled={loading}>
              {loading
                ? "Processing..."
                : `Pay Rs ${room.price.toLocaleString()}`}
            </Btn>
          </ButtonGroup>
        </Content>
      </Modal>
    </Backdrop>
  );
};

export default RoomDetails;
