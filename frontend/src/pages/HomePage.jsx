// Importing dependencies
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";

// Page wrapper container
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

// Main page container
const Page = styled.div`
  width: 100%;
  min-height: 100vh;
`;

// Reusable section styling
const Section = styled.section`
  width: 100%;
  padding: ${(p) => p.$pad || "50px 0"};

  @media (max-width: 768px) {
    padding: ${(p) => p.$padMobile || "40px 0"};
  }
`;

// Hero section with background image
const Hero = styled(Section)`
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.4) 100%),
    url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80")
      center/cover no-repeat;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 500px;
  }
`;

// Hero content wrapper
const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 820px;
  margin: 0 auto;
`;

// Main hero heading
const H1 = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 20px;
  line-height: 1.2;
  color: white;

  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 16px;
  }
`;

// Hero description text
const HeroText = styled.p`
  font-size: 20px;
  margin: 0 0 40px;
  opacity: 0.95;
  line-height: 1.6;
  color: white;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 28px;
  }
`;

// Search form styling
const Form = styled.form`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 28px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

// Input grid layout
const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  transition: 0.2s ease;

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const Button = styled.button`
  padding: 16px 32px;
  background: #1d4ed8;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s ease;
  white-space: nowrap;
  text-decoration: none;

  &:hover {
    background: #1e293b;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    color: white;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    padding: 14px 24px;
  }
`;

const LinkRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
`;

const OutlineLink = styled(Link)`
  padding: 12px 24px;
  background: #1d4ed8;
  color: white;
  border: 1px solid #1d4ed8;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: 0.2s ease;

  &:hover {
    background: #1e293b;
    border-color: #1e293b;
    text-decoration: none;
    color: white;
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

/* FEATURES */
const Features = styled(Section)`
  background: white;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 40px;
  margin: 0 0 40px;
  color: #1e293b;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 30px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Card = styled.div`
  text-align: center;
  padding: 28px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: #2563eb;
  }
`;

const Icon = styled.div`
  font-size: 44px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  color: #2563eb;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  margin: 0 0 8px;
  color: #1e293b;
  font-weight: 700;
`;

const CardText = styled.p`
  margin: 0;
  color: #64748b;
  line-height: 1.6;
  font-size: 15px;
`;

/* CTA */
const CTA = styled(Section)`
  background: #f8fafc;
`;

const CTAGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const CTACard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #e2e8f0;
  text-align: center;

  @media (max-width: 768px) {
    padding: 32px;
  }
`;

const CTATitle = styled.h3`
  font-size: 28px;
  margin: 0 0 14px;
  color: #2563eb;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const CTAText = styled.p`
  margin: 0 0 28px;
  font-size: 16px;
  line-height: 1.6;
  color: #64748b;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    font-size: 15px;
  }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CTAButton = styled(Link)`
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: 0.2s ease;
  text-align: center;

  &:hover {
    text-decoration: none;
  }

  &.primary {
    background: #1d4ed8;
    color: white;
    border: 2px solid #1d4ed8;

    &:hover {
      background: #1e293b;
      border-color: #1e293b;
      transform: translateY(-2px);
      color: white;
      text-decoration: none;
    }
  }

  &.secondary {
    background: transparent;
    color: #2563eb;
    border: 2px solid #2563eb;

    &:hover {
      background: #2563eb;
      color: white;
      transform: translateY(-2px);
      text-decoration: none;
    }
  }
`;

const HomePage = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (searchLocation.trim())
      searchParams.append("location", searchLocation.trim());
    if (maxPrice.trim()) searchParams.append("maxPrice", maxPrice.trim());

    navigate(`/browse?${searchParams.toString()}`);
  };

  return (
    <Page>
      <Hero $pad="60px 0" $padMobile="50px 0">
        <Container>
          <HeroContent>
            <H1>Find Your Perfect Room</H1>
            <HeroText>
              Discover comfortable and affordable rooms for rent in your area.
              Book securely for at least one month.
            </HeroText>

            <Form onSubmit={handleSearch}>
              <InputGrid>
                <Input
                  type="text"
                  placeholder="Enter location (e.g., Pokhara)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max price per month"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
                <Button type="submit">Search Rooms</Button>
              </InputGrid>
            </Form>

            <LinkRow>
              <OutlineLink to="/browse">Browse All Rooms</OutlineLink>
            </LinkRow>
          </HeroContent>
        </Container>
      </Hero>

      <CTA>
        <Container>
          <CTAGrid>
            <CTACard>
              <CTATitle>Looking for a Room?</CTATitle>
              <CTAText>
                Browse available rooms and book instantly (minimum 1 month).
              </CTAText>
              <BtnRow>
                <CTAButton to="/browse" className="primary">
                  Browse Rooms
                </CTAButton>
                <CTAButton to="/register?type=tenant" className="secondary">
                  Sign Up as Tenant
                </CTAButton>
              </BtnRow>
            </CTACard>

            <CTACard>
              <CTATitle>Have a Room to Rent?</CTATitle>
              <CTAText>
                Create an owner account and start listing rooms.
              </CTAText>
              <BtnRow>
                <CTAButton to="/register?type=owner" className="primary">
                  List Your Room
                </CTAButton>
                <CTAButton to="/login" className="secondary">
                  Owner Login
                </CTAButton>
              </BtnRow>
            </CTACard>
          </CTAGrid>
        </Container>
      </CTA>
    </Page>
  );
};

export default HomePage;
