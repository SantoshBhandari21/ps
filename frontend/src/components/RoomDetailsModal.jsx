import React, { useState } from "react";
import styled from "styled-components";
import { paymentsAPI } from "../services/api";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  overflow-y: auto;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }
`;

const Header = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  background: #f1f5f9;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const HeaderImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
`;

const Description = styled.p`
  color: #475569;
  line-height: 1.6;
  margin: 0 0 1.5rem;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DetailCard = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #2563eb;
    flex-shrink: 0;
  }
`;

const DetailText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span:first-child {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 600;
  }

  span:last-child {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
  }
`;

const AmenitiesSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
`;

const AmenitiesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
`;

const AmenityTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 0.9rem;
  font-weight: 500;
`;

const RentalSection = styled.div`
  background: #f0f9ff;
  border: 2px solid #0284c7;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
`;

const RentalTitle = styled.h3`
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
`;

const RentalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  background: white;

  &:focus {
    outline: none;
    border-color: #0284c7;
    box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const PriceCalculation = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin: 1rem 0;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  ${(props) => props.$border && "border-bottom: 1px solid #e2e8f0;"}

  span:first-child {
    color: #64748b;
    font-weight: 600;
  }

  span:last-child {
    font-weight: 600;
    color: #0f172a;
  }
`;

const TotalPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  padding-top: 1rem;
  border-top: 2px solid #0284c7;

  span:first-child {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
  }

  span:last-child {
    font-size: 1.5rem;
    font-weight: 900;
    color: #0284c7;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RentButton = styled(Button)`
  background: #0284c7;
  color: white;

  &:hover:not(:disabled) {
    background: #0369a1;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
  }
`;

const CancelButton = styled(Button)`
  background: transparent;
  color: #0284c7;
  border: 1px solid #0284c7;

  &:hover:not(:disabled) {
    background: #f0f9ff;
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;

  ${(props) =>
    props.$type === "error"
      ? `
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #991b1b;
  `
      : `
    background: #dcfce7;
    border: 1px solid #bbf7d0;
    color: #166534;
  `}
`;

const getAmenityIcon = (amenity) => {
  const name = typeof amenity === "string" ? amenity.toLowerCase() : "";
  if (name.includes("wifi"))
    return <i className="fa-solid fa-wifi" style={{ fontSize: "18px" }} />;
  if (name.includes("parking"))
    return <i className="fa-solid fa-car" style={{ fontSize: "18px" }} />;
  if (name.includes("kitchen"))
    return <i className="fa-solid fa-utensils" style={{ fontSize: "18px" }} />;
  if (name.includes("gym"))
    return <i className="fa-solid fa-dumbbell" style={{ fontSize: "18px" }} />;
  return <i className="fa-solid fa-building" style={{ fontSize: "18px" }} />;
};

const RoomDetailsModal = ({ room, onClose }) => {
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const totalPrice = Math.max(1, months) * room.price;

  const handleRent = async (e) => {
    e.preventDefault();

    if (months < 1) {
      setMessage({ type: "error", text: "Minimum rental period is 1 month" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const rentalData = {
        roomId: room.id,
        months: parseInt(months),
        totalPrice: totalPrice,
      };

      // Step 1: Create rental
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/rentals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(rentalData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit rental request");
      }

      const bookingId = data.booking?.id;

      if (!bookingId) {
        throw new Error("Failed to retrieve booking ID from rental response");
      }

      setMessage({
        type: "success",
        text: "✓ Rental created! Redirecting to payment...",
      });

      // Step 2: Initiate Khalti payment
      try {
        const paymentResponse = await paymentsAPI.initiatePayment({
          bookingId: bookingId,
          amount: totalPrice,
        });

        if (paymentResponse && paymentResponse.payment_url) {
          // Redirect to Khalti payment page
          window.location.href = paymentResponse.payment_url;
        } else {
          throw new Error("Failed to get Khalti payment URL");
        }
      } catch (paymentErr) {
        setMessage({
          type: "error",
          text: `Payment initiation failed: ${paymentErr.message}. Your rental has been created but payment is pending.`,
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const amenities = (() => {
    if (!room.amenities) return [];
    if (typeof room.amenities === "string") {
      try {
        return JSON.parse(room.amenities);
      } catch {
        return [];
      }
    }
    return Array.isArray(room.amenities) ? room.amenities : [];
  })();

  const imageUrl = room.main_image
    ? room.main_image.startsWith("http")
      ? room.main_image
      : `http://localhost:5000${room.main_image}`
    : "https://via.placeholder.com/800x300?text=Room+Image";

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose} title="Close modal">
          <i className="fa-solid fa-xmark" style={{ fontSize: "24px" }} />
        </CloseBtn>

        <Header>
          <HeaderImg
            src={imageUrl}
            alt={room.title}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/800x300?text=Room+Image";
            }}
          />
        </Header>

        <Content>
          <Title>{room.title}</Title>

          <LocationRow>
            <i className="fa-solid fa-map-pin" style={{ fontSize: "18px" }} />
            {room.location}
          </LocationRow>

          {room.description && <Description>{room.description}</Description>}

          <DetailsGrid>
            <DetailCard>
              <i
                className="fa-solid fa-bed"
                style={{ fontSize: "20px", color: "#2563eb" }}
              />
              <DetailText>
                <span>Bedrooms</span>
                <span>{room.bedrooms}</span>
              </DetailText>
            </DetailCard>

            <DetailCard>
              <i
                className="fa-solid fa-bath"
                style={{ fontSize: "20px", color: "#2563eb" }}
              />
              <DetailText>
                <span>Bathrooms</span>
                <span>{room.bathrooms}</span>
              </DetailText>
            </DetailCard>

            <DetailCard>
              <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                Rs {room.price.toLocaleString()}
              </span>
              <DetailText>
                <span>Price</span>
                <span>/month</span>
              </DetailText>
            </DetailCard>
          </DetailsGrid>

          {amenities.length > 0 && (
            <AmenitiesSection>
              <SectionTitle>Amenities</SectionTitle>
              <AmenitiesList>
                {amenities.map((amenity, idx) => (
                  <AmenityTag key={idx}>
                    {getAmenityIcon(amenity)}
                    {typeof amenity === "string"
                      ? amenity
                      : amenity.name || amenity}
                  </AmenityTag>
                ))}
              </AmenitiesList>
            </AmenitiesSection>
          )}

          {!showRentalForm ? (
            <RentalSection>
              <RentalTitle>Ready to rent this room?</RentalTitle>
              <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                Click below to proceed with rental. You'll need to pay the
                entire rental amount in advance through Khalti.
              </p>
              <RentButton
                onClick={() => setShowRentalForm(true)}
                style={{ width: "100%" }}
              >
                💰 Rent This Room
              </RentButton>
            </RentalSection>
          ) : (
            <RentalSection>
              <RentalTitle>Rental Details</RentalTitle>

              {message.text && (
                <Message $type={message.type}>{message.text}</Message>
              )}

              <RentalForm onSubmit={handleRent}>
                <FormGroup>
                  <Label htmlFor="months">
                    Number of Months <span style={{ color: "#e11d48" }}>*</span>
                  </Label>
                  <Input
                    id="months"
                    type="number"
                    min="1"
                    step="1"
                    value={months}
                    onChange={(e) =>
                      setMonths(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    disabled={loading}
                    required
                  />
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      margin: "0",
                    }}
                  >
                    Minimum rental period: 1 month
                  </p>
                </FormGroup>

                <PriceCalculation>
                  <PriceRow>
                    <span>Monthly Rate:</span>
                    <span>Rs {room.price.toLocaleString()}</span>
                  </PriceRow>
                  <PriceRow $border>
                    <span>Duration:</span>
                    <span>
                      {months} month{months !== 1 ? "s" : ""}
                    </span>
                  </PriceRow>
                  <TotalPrice>
                    <span>Total (Due in Advance):</span>
                    <span>Rs {totalPrice.toLocaleString()}</span>
                  </TotalPrice>
                </PriceCalculation>

                <p
                  style={{
                    color: "#7c3aed",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  ℹ️ You must pay {months} month{months !== 1 ? "s" : ""} of
                  rent in advance ({months} × Rs {room.price.toLocaleString()} =
                  Rs {totalPrice.toLocaleString()})
                </p>

                <ButtonGroup>
                  <CancelButton
                    type="button"
                    onClick={() => {
                      setShowRentalForm(false);
                      setMessage({ type: "", text: "" });
                      setMonths(1);
                    }}
                    disabled={loading}
                  >
                    Back
                  </CancelButton>
                  <RentButton type="submit" disabled={loading}>
                    {loading ? "Processing payment..." : "💳 Pay for Room"}
                  </RentButton>
                </ButtonGroup>
              </RentalForm>
            </RentalSection>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

export default RoomDetailsModal;
