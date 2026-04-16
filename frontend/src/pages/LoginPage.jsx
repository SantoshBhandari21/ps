import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Page,
  Card,
  Form,
  Input,
  Button as BaseButton,
  ErrorBox,
} from "../styles/CommonStyles";
import { login } from "../services/authService";

const Title = styled.h2`
  margin: 0 0 8px;
  font-weight: 900;
  color: #0f172a;
`;

const Subtitle = styled.p`
  margin: 0 0 18px;
  color: #475569;
  font-size: 14px;
`;

const Button = styled(BaseButton)`
  width: 100%;
  padding: 12px 14px;
`;

const Footer = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: center;
  font-size: 14px;
`;

const SmallLink = styled(Link)`
  color: #2563eb;
  text-decoration: none;
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginPageContainer = styled(Page)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;

  ${Card} {
    width: 100%;
    max-width: 460px;
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      // Owner/Admin always go to their dashboards
      if (user.role === "owner") {
        navigate("/owner/dashboard", { replace: true });
        return;
      }

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      // Tenant/tenant: return to intended room if available
      if (returnTo) {
        navigate(returnTo, { replace: true });
      } else {
        navigate("/tenant/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginPageContainer $bg="#f1f5f9">
      <Card $pad="32px" $radius="14px">
        <Title>Login</Title>
        <Subtitle>Enter your email and password.</Subtitle>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>

        <Footer>
          <SmallLink to="/register?type=tenant">Create an account</SmallLink>
        </Footer>
      </Card>
    </LoginPageContainer>
  );
};

export default LoginPage;
