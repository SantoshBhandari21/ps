// Importing dependencies
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getStoredUser, authAPI } from "../services/api";

// Page wrapper
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f1f5f9;
`;

// Header section with gradient
const Header = styled.div`
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: white;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 32px 20px;
  }
`;

// Header content container
const HeaderContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;

  h1 {
    font-size: 32px;
    font-weight: 900;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 15px;
    opacity: 0.95;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }
`;

// Main content container
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// Content grid layout
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

// Card container
const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

// Card title heading
const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
`;

// Form group container
const FormGroup = styled.div`
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
`;

// Form label styling
const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #f8fafc;
  color: #0f172a;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    background: white;
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #cbd5e1;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  ${(p) =>
    p.$primary
      ? `
    background: #2563eb;
    color: white;

    &:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
  `
      : `
    background: #f1f5f9;
    color: #0f172a;
    border: 1px solid #cbd5e1;

    &:hover:not(:disabled) {
      background: #e2e8f0;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AlertBox = styled.div`
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${(p) =>
    p.$error
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

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBox = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    margin: 0;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(p) => {
    switch (p.$role) {
      case "admin":
        return "#fee2e2";
      case "owner":
        return "#fef3c7";
      case "tenant":
        return "#dcfce7";
      default:
        return "#f1f5f9";
    }
  }};
  color: ${(p) => {
    switch (p.$role) {
      case "admin":
        return "#991b1b";
      case "owner":
        return "#92400e";
      case "tenant":
        return "#166534";
      default:
        return "#475569";
    }
  }};
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #94a3b8;
  margin: 8px 0 0 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #64748b;
  font-size: 14px;
`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!deletePassword) {
      setError("Password is required to delete account");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeletingAccount(true);
      await authAPI.deleteAccount({ password: deletePassword });
      setSuccess("Account deleted successfully. Redirecting to login...");
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setDeletePassword("");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Header>
          <HeaderContent>
            <h1>My Profile</h1>
          </HeaderContent>
        </Header>
        <Container>
          <LoadingContainer>Loading your profile...</LoadingContainer>
        </Container>
      </PageWrapper>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageWrapper>
      <Header>
        <HeaderContent>
          <h1>My Profile</h1>
          <p>Manage your account and security settings</p>
        </HeaderContent>
      </Header>

      <Container>
        <ContentGrid>
          <Card>
            <CardTitle>Account Information</CardTitle>

            <InfoSection>
              <InfoBox>
                <label>Email Address</label>
                <p>{user.email || "-"}</p>
              </InfoBox>

              <InfoBox>
                <label>Full Name</label>
                <p>{user.full_name || "-"}</p>
              </InfoBox>

              <InfoBox>
                <label>Account Role</label>
                <p>
                  <RoleBadge $role={user.role}>{user.role}</RoleBadge>
                </p>
              </InfoBox>

              {user.created_at && (
                <InfoBox>
                  <label>Member Since</label>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </InfoBox>
              )}
            </InfoSection>
          </Card>

          {user.role !== "admin" && (
            <Card>
              <CardTitle>Delete Account</CardTitle>
              <HelpText>
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </HelpText>

              {error && <AlertBox $error>{error}</AlertBox>}
              {success && <AlertBox>{success}</AlertBox>}

              <Form onSubmit={handleDeleteAccount}>
                <FormGroup>
                  <Label htmlFor="deletePassword">Password</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Enter your password to delete account"
                    disabled={deletingAccount}
                  />
                </FormGroup>

                <ButtonGroup>
                  <Button
                    type="submit"
                    disabled={deletingAccount}
                    style={{ background: "#dc2626", color: "white" }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#b91c1c")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "#dc2626")
                    }
                  >
                    {deletingAccount ? "Deleting..." : "Delete Account"}
                  </Button>
                </ButtonGroup>
              </Form>
            </Card>
          )}
        </ContentGrid>
      </Container>
    </PageWrapper>
  );
};

export default ProfilePage;
