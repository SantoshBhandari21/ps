// Importing styled-components library
import styled from "styled-components";

// Defining footer container with blue gradient background and responsive styling
const FooterContainer = styled.footer`
  background: linear-gradient(135deg, rgb(0, 64, 175) 0%, rgb(0, 58, 138) 100%);
  padding: 20px;
  text-align: center;
  margin-top: auto;
  width: 100%;
`;

// Defining footer text styling with responsive font sizes
const FooterText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: rgb(255, 255, 255);

  @media (max-width: 600px) {
    font-size: 12px;
  }
`;

// Defining copyright symbol styling
const Copyright = styled.span`
  margin-right: 4px;
  color: rgb(255, 255, 255);
`;

// Rendering footer component with copyright information
function Footer() {
  return (
    <FooterContainer>
      <FooterText>
        <Copyright>&copy;</Copyright>
        Copyright 2026 myRentals. All rights reserved.
      </FooterText>
    </FooterContainer>
  );
}

export default Footer;
