import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Page, Card, Title, Subtitle } from "../styles/CommonStyles";

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;

  h3 {
    margin: 12px 0 10px;
    color: #7f1d1d;
    font-weight: 700;
    font-size: 14px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    color: #991b1b;
    font-size: 14px;
    line-height: 1.6;

    li {
      margin-bottom: 6px;
    }
  }

  p {
    margin: 0;
    color: #991b1b;
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    padding: 14px;
    margin-bottom: 16px;

    h3,
    ul,
    p {
      font-size: 13px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${(props) =>
    props.$primary
      ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
      : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) =>
      props.$primary
        ? "0 8px 20px rgba(37, 99, 235, 0.3)"
        : "0 8px 20px rgba(107, 114, 128, 0.3)"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [reason, setReason] = useState("Payment was cancelled or failed");

  useEffect(() => {
    // Parse reason from URL if available
    const params = new URLSearchParams(window.location.search);
    const khaltiStatus = params.get("status") || params.get("error");
    if (khaltiStatus) {
      setReason(`Payment status: ${khaltiStatus}`);
    }
  }, []);

  return (
    <Page>
      <Container>
        <Card>
          <IconWrapper>
            <i
              className="fa-solid fa-circle-exclamation"
              style={{ fontSize: "50px", color: "white" }}
            />
          </IconWrapper>
          <Title>Payment Failed</Title>
          <Subtitle>
            We were unable to process your payment through Khalti.
          </Subtitle>

          <ErrorBox>
            <p>{reason}</p>
            <h3>What you can do:</h3>
            <ul>
              <li>Try the payment again</li>
              <li>Verify your Khalti account balance</li>
              <li>Check your internet connection</li>
              <li>Try with a different payment method</li>
              <li>Contact Khalti support if the problem persists</li>
            </ul>
          </ErrorBox>

          <ButtonGroup>
            <Button $primary onClick={() => navigate(-1)}>
              Try Payment Again
            </Button>
            <Button onClick={() => navigate("/browse")}>
              <i
                className="fa-solid fa-house"
                style={{ fontSize: "18px", marginRight: "8px" }}
              />
              Browse Other Rooms
            </Button>
          </ButtonGroup>

          <Subtitle
            style={{ marginTop: "20px", fontSize: "13px", color: "#6b7280" }}
          >
            If you need assistance, please contact our support team.
          </Subtitle>
        </Card>
      </Container>
    </Page>
  );
};

export default PaymentFailed;
