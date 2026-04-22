// Importing dependencies
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Page, Container, Card, Section } from "../styles/CommonStyles";

// Page title heading
const Title = styled.h1`
  margin: 0 0 16px;
  color: #0f172a;
  font-size: 32px;
  font-weight: 900;
`;

// Section heading styling
const SectionTitle = styled.h2`
  margin: 24px 0 16px;
  color: #0f172a;
  font-size: 22px;
  font-weight: 900;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 8px;
`;

// Paragraph text styling
const P = styled.p`
  margin: 0 0 16px;
  color: #475569;
  line-height: 1.8;
  font-size: 15px;
`;

// Grid layout for features
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 20px 0;
`;

// Feature box with hover effect
const Box = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.12);
    border-color: #2563eb;
  }

  h3 {
    margin: 0 0 12px;
    color: #0f172a;
    font-size: 18px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      color: #2563eb;
      font-size: 24px;
    }
  }

  p {
    margin: 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
  }

  ul {
    margin: 12px 0 0;
    padding: 0 0 0 20px;
    list-style: none;

    li {
      padding: 6px 0 6px 20px;
      color: #475569;
      font-size: 13px;
      position: relative;

      &:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #2563eb;
        font-weight: 900;
      }
    }
  }
`;

// Statistics display grid
const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  > div {
    background: linear-gradient(135deg, #f0f9ff, #f8fafc);
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    padding: 16px;
    text-align: center;

    h4 {
      margin: 0 0 6px;
      color: #2563eb;
      font-size: 22px;
      font-weight: 900;
    }
    p {
      margin: 0;
      color: #475569;
      font-size: 13px;
      font-weight: 800;
    }
  }
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;

  span {
    background: #2563eb;
    color: white;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 800;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;

  a {
    padding: 11px 22px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 900;
    border: 2px solid #2563eb;
    transition: 0.2s;

    &.primary {
      background: #2563eb;
      color: white;

      &:hover {
        background: #1e40af;
      }
    }

    &.secondary {
      color: #2563eb;

      &:hover {
        background: #2563eb;
        color: white;
      }
    }
  }
`;

const AboutPage = () => (
  <Page>
    <Container>
      <Card>
        <Title>About myRentals</Title>
        <P>
          myRentals is a modern room rental platform connecting tenants and
          property owners. Browse rooms, filter by location/price, and book
          instantly. Owners list and manage properties. Admins monitor all
          listings with secure eSewa payments and auto-generated invoices.
        </P>

        <SectionTitle>Why Choose Us?</SectionTitle>
        <Grid>
          <Box>
            <h3>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ marginRight: "8px", color: "#2563eb" }}
              />{" "}
              Smart Search
            </h3>
            <p>
              Filter by location, price, and amenities to find your perfect room
              instantly.
            </p>
          </Box>
          <Box>
            <h3>
              <i
                className="fa-solid fa-check"
                style={{ marginRight: "8px", color: "#2563eb" }}
              />{" "}
              Verified
            </h3>
            <p>
              All listings verified with authentic photos, pricing, and owner
              information.
            </p>
          </Box>
          <Box>
            <h3>
              <i
                className="fa-solid fa-credit-card"
                style={{ marginRight: "8px", color: "#2563eb" }}
              />{" "}
              Secure Pay
            </h3>
            <p>
              eSewa integration with auto-generated invoices for every
              transaction.
            </p>
          </Box>
          <Box>
            <h3>
              <i
                className="fa-solid fa-star"
                style={{ marginRight: "8px", color: "#2563eb" }}
              />{" "}
              Reviews
            </h3>
            <p>
              Only verified tenants can review, ensuring genuine feedback
              quality.
            </p>
          </Box>
          <Box>
            <h3>
              <i
                className="fa-solid fa-chart-line"
                style={{ marginRight: "8px", color: "#2563eb" }}
              />{" "}
              Dashboard
            </h3>
            <p>Easy management tools for tenants, owners, and admins.</p>
          </Box>
          <Box>
            <h3>
              <i
                className="fa-solid fa-shield"
                style={{ marginRight: "8px", color: "#2563eb" }}
              />{" "}
              Secure
            </h3>
            <p>
              Modern security standards with encrypted data and transactions.
            </p>
          </Box>
        </Grid>

        <SectionTitle>How It Works</SectionTitle>
        <Grid>
          <Box>
            <h3>Tenants</h3>
            <ul>
              <li>Search by location & price</li>
              <li>View verified photos</li>
              <li>Book with eSewa (1+ months)</li>
              <li>Get invoices</li>
              <li>Leave reviews</li>
            </ul>
          </Box>
          <Box>
            <h3>Owners</h3>
            <ul>
              <li>Create verified account</li>
              <li>Upload room details</li>
              <li>Set pricing & availability</li>
              <li>Manage bookings</li>
              <li>Track history</li>
            </ul>
          </Box>
          <Box>
            <h3>Admins</h3>
            <ul>
              <li>Monitor listings</li>
              <li>Verify submissions</li>
              <li>Manage accounts</li>
              <li>Track payments</li>
              <li>Support users</li>
            </ul>
          </Box>
        </Grid>

        <SectionTitle>Our Commitment</SectionTitle>
        <P>
          We are committed to providing a transparent, secure, and user-friendly
          platform for room rentals. Our goal is to build trust through verified
          listings, genuine reviews, and reliable payment processing. Whether
          you're looking for a room or want to list your property, myRentals is
          your trusted partner.
        </P>

        <ButtonRow>
          <Link to="/browse" className="primary">
            Browse Rooms
          </Link>
          <Link to="/contact" className="secondary">
            Contact Us
          </Link>
        </ButtonRow>
      </Card>
    </Container>
  </Page>
);

export default AboutPage;
