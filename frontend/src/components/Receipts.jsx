// Importing dependencies
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { paymentsAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

// Main container
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
`;
// Empty state message styling
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  p {
    font-size: 16px;
    margin: 0;
  }
`;
// List container for receipts
const ReceiptsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;
// Individual receipt card styling
const ReceiptCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  align-items: center;
  gap: 16px;
  &:hover {
    border-color: rgba(53, 121, 197, 1);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr auto;
    gap: 8px;
  }
`;
// Room title heading
const RoomTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
// Card info text
const CardInfo = styled.div`
  font-size: 12px;
  color: #64748b;
  @media (max-width: 1024px) {
    display: none;
  }
`;
// Payment amount styling
const Amount = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  white-space: nowrap;
  text-align: right;
  @media (max-width: 768px) {
    text-align: left;
  }
`;
// Loading message text
const LoadingText = styled.p`
  text-align: center;
  color: #64748b;
  padding: 40px 20px;
  font-size: 15px;
`;

// Page container
const Page = styled.div`
  padding: 30px 16px;
  background: #f1f5f9;
  min-height: 100vh;
`;
// Button controls container
const Controls = styled.div`
  max-width: 480px;
  margin: 0 auto 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  @media print {
    display: none;
  }
`;
// Base button styling
const Btn = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
`;
// Primary action button
const PrimaryBtn = styled(Btn)`
  background: rgba(53, 121, 197, 1);
  color: white;
`;
// Secondary action button
const SecondaryBtn = styled(Btn)`
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
`;
// Receipt display container
const ReceiptBox = styled.div`
  max-width: 480px;
  margin: 0 auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.06);
  @media (max-width: 480px) {
    padding: 16px;
  }
`;
// Logo image in receipt
const Logo = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 16px;
`;
// Receipt header section
const Header = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;
// Receipt title heading
const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
`;
// Dashed divider line
const Divider = styled.div`
  border-top: 1px dashed #cbd5e1;
  margin: 12px 0;
`;
// Receipt section
const Section = styled.div`
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`;
// Section header label
const SectionTitle = styled.p`
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
// Information row layout
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
  span:first-child {
    color: #64748b;
  }
  span:last-child {
    color: #1e293b;
    font-weight: 500;
  }
`;
// Amount display box
const AmountBox = styled.div`
  padding: 12px 0;
  border-top: 1px dashed #cbd5e1;
  border-bottom: 1px dashed #cbd5e1;
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  span:last-child {
    color: #2563eb;
  }
`;
// Receipt footer
const Footer = styled.div`
  text-align: center;
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
`;

// Receipts component for viewing payments
function Receipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetching receipts on mount
  useEffect(() => {
    fetchReceipts();
  }, []);

  // Getting completed payments from API
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await paymentsAPI.getMyPayments();
      const successful = (data.payments || []).filter(
        (r) => r.status === "completed",
      );
      setReceipts(successful);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Formatting date to readable format
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Formatting date with time
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString("en-NP")} at ${date.toLocaleTimeString(
      "en-NP",
      { hour: "2-digit", minute: "2-digit" },
    )}`;
  };

  // Downloading receipt as PDF
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const element = document.querySelector("[data-receipt]");
      if (!element) return;
      const html2pdf = (await import("html2pdf.js")).default;
      html2pdf()
        .set({
          margin: 10,
          filename: `Receipt-${selected.id}.pdf`,
          image: { type: "png", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (selected) {
    return (
      <Page>
        <Controls>
          <PrimaryBtn onClick={handleDownloadPDF} disabled={isDownloading}>
            Download Reciept
          </PrimaryBtn>
          <SecondaryBtn onClick={() => setSelected(null)}>← Back</SecondaryBtn>
        </Controls>
        <ReceiptBox data-receipt>
          <Header>
            <Logo src="/logo.png" alt="Logo" />
            <Title>Payment Receipt</Title>
          </Header>
          <Divider />
          <Section>
            <SectionTitle>Tenant Information</SectionTitle>
            <InfoRow>
              <span>Name</span>
              <span>{selected.tenant_name || user?.full_name || "N/A"}</span>
            </InfoRow>
          </Section>
          <Divider />
          <Section>
            <SectionTitle>Room Details</SectionTitle>
            <InfoRow>
              <span>Room ID</span>
              <span>#{selected.room_id}</span>
            </InfoRow>
            <InfoRow>
              <span>Room Title</span>
              <span>{selected.room_title}</span>
            </InfoRow>
            <InfoRow>
              <span>Location</span>
              <span>{selected.room_location}</span>
            </InfoRow>
          </Section>
          <Divider />
          <Section>
            <SectionTitle>Rental Period</SectionTitle>
            <InfoRow>
              <span>Move In</span>
              <span>{formatDate(selected.move_in_date)}</span>
            </InfoRow>
            <InfoRow>
              <span>Move Out</span>
              <span>{formatDate(selected.move_out_date)}</span>
            </InfoRow>
          </Section>
          <Divider />
          <Section>
            <SectionTitle>Payment Details</SectionTitle>
            <InfoRow>
              <span>Amount</span>
              <span>Rs {selected.amount}</span>
            </InfoRow>
            <InfoRow>
              <span>Method</span>
              <span>{selected.payment_method || "Khalti"}</span>
            </InfoRow>
            <InfoRow>
              <span>Date & Time</span>
              <span>{formatDateTime(selected.created_at)}</span>
            </InfoRow>
          </Section>
          <Divider />
          <Section>
            <AmountBox>
              <span>Total Amount Paid</span>
              <span>Rs {selected.amount}</span>
            </AmountBox>
          </Section>
          <Footer>
            <p style={{ margin: "12px 0 0" }}>
              VAT is already included in the amount. For refunds, contact your
              Administrator. Thank you for using our service!
            </p>
            <p
              style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}
            >
              Generated on {formatDate(new Date())}
            </p>
          </Footer>
        </ReceiptBox>
        <style>{`
          @media print {
            body { background: white; }
            [data-receipt] { box-shadow: none; border: none; }
          }
        `}</style>
      </Page>
    );
  }

  return (
    <Container>
      {loading ? (
        <LoadingText>Loading receipts...</LoadingText>
      ) : receipts.length === 0 ? (
        <EmptyState>
          <p>No payment receipts yet</p>
        </EmptyState>
      ) : (
        <ReceiptsList>
          {receipts.map((receipt) => (
            <ReceiptCard key={receipt.id} onClick={() => setSelected(receipt)}>
              <RoomTitle>{receipt.room_title}</RoomTitle>
              <CardInfo>{receipt.room_location}</CardInfo>
              <CardInfo>
                {new Date(receipt.move_in_date).toLocaleDateString()} -{" "}
                {new Date(receipt.move_out_date).toLocaleDateString()}
              </CardInfo>
              <Amount>Rs {receipt.amount}</Amount>
            </ReceiptCard>
          ))}
        </ReceiptsList>
      )}
    </Container>
  );
}

export default Receipts;
