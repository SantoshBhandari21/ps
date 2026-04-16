// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";

// Global styles + layout
import GlobalStyles from "./styles/GlobalStyles";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import ProtectedRoute from "./components/ProtectedRoute"; // COMMENTED OUT: Access control disabled

// Pages (based on your folder structure: src/pages/*.jsx)
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import BrowseRooms from "./pages/BrowseRooms";
import LogoutPage from "./pages/LogoutPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerLayout from "./components/OwnerLayout";
import TenantDashboard from "./pages/TenantDashboard";
import ProfilePage from "./pages/ProfilePage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

// Auth Context
import { AuthProvider } from "./hooks/useAuth.jsx";

const AppShell = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell>
          <GlobalStyles />
          <Header />

          <Main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignUpPage />} />
              <Route path="/browse" element={<BrowseRooms />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/logout" element={<LogoutPage />} />

              {/* Payment Routes */}
              <Route
                path="/rental/payment-success"
                element={<PaymentSuccess />}
              />
              <Route
                path="/rental/payment-failed"
                element={<PaymentFailed />}
              />

              {/* COMMENTED OUT: Access control disabled */}
              {/* Protected: Profile (Any authenticated user) */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Protected: Role-based Dashboards */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/owner/*" element={<OwnerLayout />}>
                <Route path="dashboard" element={<OwnerDashboard />} />
              </Route>
              <Route path="/tenant/dashboard" element={<TenantDashboard />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div style={{ padding: "2rem", textAlign: "center" }}>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                }
              />
            </Routes>
          </Main>
          <Footer />
        </AppShell>
      </Router>
    </AuthProvider>
  );
}

export default App;
