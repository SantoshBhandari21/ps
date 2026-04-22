// Importing dependencies
import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import NotificationBell from "./NotificationBell";

// Main layout container
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
`;

// Sidebar navigation menu
const Sidebar = styled.aside`
  display: none;
  background: #ffffff;
  border-right: 1px solid #e7edf5;
  padding: 16px;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: 960px) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(${(p) => (p.$open ? "0" : "-105%")});
    transition: transform 0.2s ease;
    z-index: 50;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  }
`;

// Sidebar header button
const SidebarHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f6fb;
    border-color: #e7edf5;
  }
`;

// Brand name styling
const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #000000;
  font-size: 16px;
`;

// Navigation item button
const NavItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$active ? "#cfe2ff" : "transparent")};
  background: ${(p) => (p.$active ? "#f3e8ff" : "transparent")};
  color: ${(p) => (p.$active ? "#7c3aed" : "#1f2937")};
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${(p) => (p.$active ? "#f3e8ff" : "#f3f6fb")};
  }
`;

// Sidebar footer section
const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Notification label text
const NotificationLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

// Profile button in sidebar
const ProfileButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e7edf5;
  border-radius: 12px;
  background: transparent;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  color: #1f2937;

  &:hover {
    background: #f3f6fb;
    border-color: #8b5cf6;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Profile icon container
const ProfileIconBtn = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #8b5cf6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  i {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Main content area
const Content = styled.main`
  padding: 18px;

  @media (max-width: 960px) {
    padding: 14px;
  }
`;

// Mobile overlay for sidebar
const Overlay = styled.div`
  display: none;

  @media (max-width: 960px) {
    display: ${(p) => (p.$open ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
`;

// Layout component for owner dashboard
const OwnerLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Navigating to specified path
  const handleNavigation = (path) => {
    if (path) navigate(path);
  };

  return (
    <Container>
      <Sidebar $open={sidebarOpen}>
        <SidebarHeader onClick={() => handleNavigation("/owner/dashboard")}>
          <Brand>Owner Dashboard</Brand>
        </SidebarHeader>

        <SidebarFooter>
          <NotificationBell
            isOpen={notificationsOpen}
            setIsOpen={setNotificationsOpen}
          />
          <ProfileButton
            onClick={() => handleNavigation("/profile")}
            title="Profile"
          >
            <ProfileIconBtn>
              <i className="fa-solid fa-circle-user"></i>
            </ProfileIconBtn>
            <NotificationLabel>Profile</NotificationLabel>
          </ProfileButton>
        </SidebarFooter>
      </Sidebar>

      <Overlay $open={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <Content>
        <Outlet />
      </Content>
    </Container>
  );
};

export default OwnerLayout;
