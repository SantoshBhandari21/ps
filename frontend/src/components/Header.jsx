// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getStoredUser } from "../services/api";
import NotificationBell from "./NotificationBell";
import logo from "../../../logo.png";

const HeaderWrapper = styled.header`
  width: 100%;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContainer = styled.div`
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  @media (max-width: 768px) {
    padding: 0 16px;
    height: 64px;
  }
`;

const LogoImage = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
  img {
    height: 73px;
    width: auto;
    object-fit: contain;
  }
  @media (max-width: 480px) {
    img {
      height: 80px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 18px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  padding: 8px 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
  &:hover {
    color: #2563eb;
    background-color: #f8fafc;
  }
  &.active {
    color: #2563eb;
    background-color: #eff6ff;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Btn = styled(Link)`
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  ${({ $outline }) =>
    $outline
      ? `
    background: transparent;
    color: #2563eb;
    border: 1px solid #2563eb;
    &:hover {
      background: #2563eb;
      color: white;
      transform: translateY(-1px);
    }
  `
      : `
    background: #2563eb;
    color: white;
    border: 1px solid #2563eb;
    &:hover {
      background: #1d4ed8;
      border-color: #1d4ed8;
      transform: translateY(-1px);
    }
  `}
`;

const MobileMenuBtn = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
  }
`;

const Hamburger = styled.div`
  width: 24px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  span {
    height: 2px;
    width: 100%;
    background-color: #1e293b;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  &.open span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }
  &.open span:nth-child(2) {
    opacity: 0;
  }
  &.open span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }
`;

const MobileMenu = styled.div`
  display: none;
  background-color: white;
  border-top: 1px solid #e2e8f0;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  &.open {
    max-height: 520px;
  }
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 24px 0;
`;

const MobileLink = styled(Link)`
  padding: 12px 16px;
  border-radius: 6px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease;
  &:hover {
    background-color: #f8fafc;
    color: #2563eb;
  }
  &.active {
    background-color: #2563eb;
    color: white;
  }
`;

const MobileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
`;

const MobileBtn = styled(Btn)`
  padding: 12px 20px;
  width: 100%;
  text-align: center;
`;

const LogoutBtn = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  &:hover {
    background: #2563eb;
    color: white;
    transform: translateY(-1px);
  }
`;

const MobileLogoutBtn = styled(LogoutBtn)`
  padding: 12px 20px;
  width: 100%;
`;

const ProfileIcon = styled(Link)`
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  padding: 8px 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover {
    color: #2563eb;
    background-color: #f8fafc;
  }
  &.active {
    color: #2563eb;
    background-color: #eff6ff;
  }
`;

const MobileProfileIcon = styled(ProfileIcon)`
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
  gap: 8px;
  font-size: 14px;
  &:hover {
    background: #2563eb;
    color: white;
  }
`;

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse Rooms" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Check user on mount and pathname change
  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
  }, [pathname]);

  // Listen to storage changes
  useEffect(() => {
    const handleStorageChange = () => setUser(getStoredUser());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    navigate("/login");
  };

  const isActive = (path) => (pathname === path ? "active" : "");
  const isMobile = () => setOpen(false);

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <LogoImage to="/">
          <img src={logo} alt="myRentals Logo" />
        </LogoImage>

        <Nav>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={isActive(to)}>
              {label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={isActive("/admin/dashboard")}
              >
                Admin Dashboard
              </NavLink>
              <ProfileIcon to="/profile" title="Profile">
                <i className="fa-solid fa-circle-user"></i>
                Profile
              </ProfileIcon>
            </>
          )}
          {user?.role === "tenant" && (
            <>
              <NavLink
                to="/tenant/dashboard"
                className={isActive("/tenant/dashboard")}
              >
                Tenant Dashboard
              </NavLink>
              <NotificationBell isNav={true} />
              <ProfileIcon to="/profile" title="Profile">
                <i className="fa-solid fa-circle-user"></i>
                Profile
              </ProfileIcon>
            </>
          )}
          {user?.role === "owner" && (
            <>
              <NavLink
                to="/owner/dashboard"
                className={isActive("/owner/dashboard")}
              >
                Owner Dashboard
              </NavLink>
              <NotificationBell isNav={true} />
              <ProfileIcon to="/profile" title="Profile">
                <i className="fa-solid fa-circle-user"></i>
                Profile
              </ProfileIcon>
            </>
          )}
        </Nav>

        <NavActions>
          {!user ? (
            <>
              <Btn as={Link} to="/login" $outline>
                Login
              </Btn>
              <Btn as={Link} to="/register">
                Sign Up
              </Btn>
            </>
          ) : (
            <>
              <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
            </>
          )}
        </NavActions>

        <MobileMenuBtn onClick={() => setOpen((s) => !s)}>
          <Hamburger className={open ? "open" : ""}>
            <span />
            <span />
            <span />
          </Hamburger>
        </MobileMenuBtn>
      </HeaderContainer>

      <MobileMenu className={open ? "open" : ""}>
        <MobileNav>
          {NAV_LINKS.map(({ to, label }) => (
            <MobileLink
              key={to}
              to={to}
              className={isActive(to)}
              onClick={isMobile}
            >
              {label}
            </MobileLink>
          ))}
          {user?.role === "admin" && (
            <MobileLink
              to="/admin/dashboard"
              className={isActive("/admin/dashboard")}
              onClick={isMobile}
            >
              Admin Dashboard
            </MobileLink>
          )}
          {user?.role === "tenant" && (
            <MobileLink
              to="/tenant/dashboard"
              className={isActive("/tenant/dashboard")}
              onClick={isMobile}
            >
              Tenant Dashboard
            </MobileLink>
          )}
          {user?.role === "owner" && (
            <MobileLink
              to="/owner/dashboard"
              className={isActive("/owner/dashboard")}
              onClick={isMobile}
            >
              Owner Dashboard
            </MobileLink>
          )}
        </MobileNav>

        <MobileActions>
          {!user ? (
            <>
              <MobileBtn as={Link} to="/login" $outline onClick={isMobile}>
                Login
              </MobileBtn>
              <MobileBtn as={Link} to="/register" onClick={isMobile}>
                Sign Up
              </MobileBtn>
            </>
          ) : (
            <>
              {(user?.role === "tenant" || user?.role === "owner") && (
                <MobileProfileIcon to="/profile" onClick={isMobile}>
                  <i className="fa-solid fa-circle-user"></i> Profile
                </MobileProfileIcon>
              )}
              <MobileLogoutBtn
                onClick={() => {
                  handleLogout();
                  isMobile();
                }}
              >
                Logout
              </MobileLogoutBtn>
            </>
          )}
        </MobileActions>
      </MobileMenu>
    </HeaderWrapper>
  );
};

export default Header;
