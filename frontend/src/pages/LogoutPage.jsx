import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Page, Card } from "../styles/CommonStyles";

const Message = styled.div`
  color: #0f172a;
  font-weight: 800;
`;

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Page
      $pad="24px"
      $bg="#f1f5f9"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card>
        <Message>You have been logged out.</Message>
      </Card>
    </Page>
  );
};

export default LogoutPage;
