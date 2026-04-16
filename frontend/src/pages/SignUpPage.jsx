import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  Page,
  Card,
  Form,
  Input,
  Select as BaseSelect,
  Button as BaseButton,
  ErrorBox,
} from "../styles/CommonStyles";
import { register } from "../services/authService";

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

const Select = styled(BaseSelect)`
  width: 100%;
  padding: 12px 14px;
`;

const Button = styled(BaseButton)`
  width: 100%;
  padding: 12px 14px;
`;

const Footer = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 14px;
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

const SignUpPageContainer = styled(Page)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;

  ${Card} {
    width: 100%;
    max-width: 520px;
  }
`;

const SignUpPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const type = (params.get("type") || "").toLowerCase();
  const defaultRole = type === "owner" ? "owner" : "tenant";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (pw) => {
    if (!pw || pw.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignUpPageContainer $bg="#f1f5f9">
      <Card $pad="32px" $radius="14px">
        <Title>Create an Account</Title>
        <Subtitle>Create a Tenant or Owner account.</Subtitle>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="tenant">Tenant</option>
            <option value="owner">Owner</option>
          </Select>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </Form>

        <Footer>
          <SmallLink to="/login">Login</SmallLink>
          <SmallLink to="/">Home</SmallLink>
        </Footer>
      </Card>
    </SignUpPageContainer>
  );
};

export default SignUpPage;
