import styled, { css } from "styled-components";

/* ===== COMMON FOCUS STATE ===== */
export const controlFocus = css`
  &:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.6);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #ffffff;
  }
`;

/* ===== PAGE LAYOUT ===== */
export const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${(p) => p.$bg || "#f1f5f9"};
  padding: ${(p) => p.$pad || "0"};
`;

export const Container = styled.div`
  width: 100%;
  max-width: ${(p) => p.$max || "1200px"};
  margin: 0 auto;
  padding: ${(p) => p.$pad || "0 24px"};

  @media (max-width: 768px) {
    padding: ${(p) => p.$padMobile || "0 16px"};
  }
`;

export const Section = styled.section`
  width: 100%;
  padding: ${(p) => p.$pad || "80px 0"};

  @media (max-width: 768px) {
    padding: ${(p) => p.$padMobile || "60px 0"};
  }
`;

/* ===== CARDS & PANELS ===== */
export const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: ${(p) => p.$radius || "14px"};
  padding: ${(p) => p.$pad || "32px"};
  box-shadow: ${(p) => p.$shadow || "0 10px 24px rgba(2, 6, 23, 0.06)"};

  @media (max-width: 480px) {
    padding: ${(p) => p.$padMobile || "22px"};
  }
`;

export const Panel = styled.div`
  background: #ffffff;
  border: 1px solid #e7edf5;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
`;

/* ===== FORM ELEMENTS ===== */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.$gap || "14px"};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${(p) => p.$pad || "12px 14px"};
  border-radius: ${(p) => p.$radius || "10px"};
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #f8fafc;
  color: #0f172a;
  ${controlFocus}

  &::placeholder {
    color: #cbd5e1;
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${(p) => p.$pad || "12px 14px"};
  border-radius: ${(p) => p.$radius || "10px"};
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #f8fafc;
  color: #0f172a;
  ${controlFocus}

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${(p) => p.$pad || "12px 14px"};
  border-radius: ${(p) => p.$radius || "10px"};
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  min-height: ${(p) => p.$height || "140px"};
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
  ${controlFocus}

  &::placeholder {
    color: #94a3b8;
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: ${(p) => p.$size || "13px"};
  font-weight: ${(p) => p.$weight || "600"};
  color: ${(p) => p.$color || "#0f172a"};
  margin-bottom: ${(p) => p.$gap || "8px"};
`;

/* ===== BUTTONS ===== */
export const Button = styled.button`
  width: 100%;
  padding: ${(p) => p.$pad || "12px 14px"};
  border-radius: ${(p) => p.$radius || "10px"};
  border: ${(p) => p.$border || "none"};
  background: ${(p) => p.$bg || "#2563eb"};
  color: ${(p) => p.$color || "white"};
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(p) => p.$hoverBg || "#1e40af"};
    ${(p) => p.$hoverTransform && "transform: translateY(-2px);"}
    ${(p) => p.$hoverShadow && `box-shadow: 0 4px 12px ${p.$hoverShadow};`}
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const OutlineButton = styled(Button)`
  background: transparent;
  border: 2px solid #2563eb;
  color: #2563eb;

  &:hover:not(:disabled) {
    background: #2563eb;
    color: white;
  }
`;

export const SecondaryButton = styled(Button)`
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #cbd5e1;

  &:hover:not(:disabled) {
    background: #e2e8f0;
  }
`;

/* ===== TYPOGRAPHY ===== */
export const Title = styled.h1`
  margin: ${(p) => p.$margin || "0 0 8px"};
  font-weight: ${(p) => p.$weight || "900"};
  color: ${(p) => p.$color || "#0f172a"};
  font-size: ${(p) => p.$size || "28px"};

  @media (max-width: 768px) {
    font-size: ${(p) => p.$sizeMobile || "24px"};
  }
`;

export const Subtitle = styled.p`
  margin: ${(p) => p.$margin || "0 0 24px"};
  color: ${(p) => p.$color || "#475569"};
  font-size: ${(p) => p.$size || "15px"};
  line-height: ${(p) => p.$lineHeight || "1.6"};
`;

export const SectionTitle = styled.h2`
  margin: ${(p) => p.$margin || "24px 0 16px"};
  color: ${(p) => p.$color || "#0f172a"};
  font-size: ${(p) => p.$size || "22px"};
  font-weight: ${(p) => p.$weight || "900"};
  ${(p) =>
    p.$border && `border-bottom: 3px solid #2563eb; padding-bottom: 8px;`}
`;

/* ===== ALERT BOXES ===== */
export const ErrorBox = styled.div`
  margin-bottom: ${(p) => p.$gap || "14px"};
  padding: 10px 12px;
  border-radius: 10px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  font-size: 13px;
`;

export const SuccessBox = styled.div`
  margin-bottom: ${(p) => p.$gap || "14px"};
  padding: 10px 12px;
  border-radius: 10px;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 13px;
`;

export const InfoBox = styled.div`
  background: ${(p) => p.$bg || "#f0fdf4"};
  border: 1px solid ${(p) => p.$border || "#bbf7d0"};
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;

  p {
    margin: 8px 0;
    color: ${(p) => p.$color || "#166534"};
    font-size: 14px;
    line-height: 1.5;

    strong {
      font-weight: 700;
    }
  }

  @media (max-width: 480px) {
    padding: 14px;
    margin-bottom: 16px;

    p {
      font-size: 13px;
    }
  }
`;

/* ===== BADGES & TAGS ===== */
export const Badge = styled.span`
  display: inline-block;
  padding: ${(p) => p.$pad || "6px 12px"};
  border-radius: ${(p) => p.$radius || "6px"};
  font-size: ${(p) => p.$size || "12px"};
  font-weight: ${(p) => p.$weight || "600"};
  background: ${(p) => p.$bg || "#2563eb"};
  color: ${(p) => p.$color || "white"};
`;

export const Tag = styled(Badge)`
  padding: ${(p) => p.$pad || "6px 10px"};
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 800;
  text-transform: capitalize;
`;

/* ===== GRID LAYOUTS ===== */
export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${(p) =>
    p.$cols || "repeat(auto-fit, minmax(250px, 1fr))"};
  gap: ${(p) => p.$gap || "16px"};

  @media (max-width: 768px) {
    grid-template-columns: ${(p) => p.$colsMobile || "1fr"};
  }
`;

export const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(p) => p.$gap || "16px"};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(p) => p.$gap || "16px"};
  flex-wrap: ${(p) => p.$wrap || "wrap"};
`;

/* ===== MODALS ===== */
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: ${(p) => p.$bg || "rgba(15, 23, 42, 0.5)"};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

export const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  max-width: ${(p) => p.$max || "400px"};
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
`;

export const ModalTitle = styled.h2`
  margin: 0 0 16px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 900;
`;

export const ModalBody = styled.div`
  margin-bottom: 20px;

  p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

/* ===== UTILITIES ===== */
export const LoadingSpinner = styled.div`
  width: ${(p) => p.$size || "50px"};
  height: ${(p) => p.$size || "50px"};
  margin: 16px auto 24px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Empty = styled.div`
  text-align: center;
  padding: ${(p) => p.$pad || "60px 12px"};
  color: ${(p) => p.$color || "#475569"};
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  z-index: 40;
`;
