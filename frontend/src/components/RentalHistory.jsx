//IMPORTS
import React, { useMemo, useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { rentalsAPI } from "../services/api";

/* -------------------- Styles -------------------- */
const controlFocus = css`
  &:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.6);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #fff;
  }
`;

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f1f5f9;
`;

const StickyTop = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
`;
const SearchPanel = styled.div`
  background: linear-gradient(135deg, #dbeafe 0%, #eef2ff 100%);
  border-bottom: 1px solid #e2e8f0;
`;
const SearchInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 16px;
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrap = styled.div`
  position: relative;
`;
const IconLeft = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  font-size: 14px;
  ${controlFocus}
`;

const SortSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  ${controlFocus}
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 16px 40px;
`;

const ResultsBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 14px 0 18px;
`;

const TitleBlock = styled.div``;
const H2 = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
`;
const P = styled.p`
  margin: 6px 0 0;
  color: #475569;
  font-size: 14px;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
  margin-bottom: 10px;
`;

const GridWrap = styled.div`
  display: grid;
  grid-template-columns: ${(p) =>
    p.$view === "grid" ? "repeat(3, 1fr)" : "1fr"};
  gap: 16px;
  @media (max-width: 1100px) {
    grid-template-columns: ${(p) =>
      p.$view === "grid" ? "repeat(2, 1fr)" : "1fr"};
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(2, 6, 23, 0.1);
  }
  display: ${(p) => (p.$list ? "grid" : "block")};
  grid-template-columns: ${(p) => (p.$list ? "260px 1fr" : "none")};
  @media (max-width: 820px) {
    grid-template-columns: ${(p) => (p.$list ? "1fr" : "none")};
  }
`;

const ImgWrap = styled.div`
  position: relative;
  height: ${(p) => (p.$list ? "260px" : "210px")};
  @media (max-width: 820px) {
    height: 220px;
  }
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardBody = styled.div`
  padding: 14px 14px 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
`;

const DatesRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
`;
const DateBox = styled.div`
  background: #f1f5f9;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;
const DateLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 4px;
`;
const DateValue = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
`;
const Price = styled.div`
  font-weight: 900;
  color: #1d4ed8;
  margin-bottom: 10px;
`;
const StopButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #dc2626;
  }
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;
const Empty = styled.div`
  text-align: center;
  padding: 60px 12px;
  color: #475569;
`;
const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #475569;
`;
const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  margin-bottom: 16px;
`;

/* -------------------- Component -------------------- */
const RentalHistory = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [stoppingId, setStoppingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await rentalsAPI.getMyRentals();
        setRentals(data.rentals || []);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load rental history");
        setRentals([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredRentals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rentals.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.owner_name.toLowerCase().includes(q),
    );
  }, [searchQuery, rentals]);

  const sortedRentals = useMemo(() => {
    const list = [...filteredRentals];
    switch (sortBy) {
      case "recent":
        return list.sort(
          (a, b) => new Date(b.move_in_date) - new Date(a.move_in_date),
        );
      case "oldest":
        return list.sort(
          (a, b) => new Date(a.move_in_date) - new Date(b.move_in_date),
        );
      case "price-low":
        return list.sort((a, b) => a.total_price - b.total_price);
      case "price-high":
        return list.sort((a, b) => b.total_price - a.total_price);
      default:
        return list;
    }
  }, [filteredRentals, sortBy]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleStopRent = async (rentalId) => {
    if (!window.confirm("Are you sure you want to stop this rental?")) {
      return;
    }
    try {
      setStoppingId(rentalId);
      await rentalsAPI.stopRent(rentalId);
      setRentals(
        rentals.map((r) =>
          r.id === rentalId ? { ...r, status: "cancelled" } : r,
        ),
      );
      setError("");
    } catch (err) {
      setError(err.message || "Failed to stop rental");
    } finally {
      setStoppingId(null);
    }
  };

  const RentalCard = ({ rental, isListView }) => {
    const imageUrl = rental.main_image
      ? `http://localhost:5000${rental.main_image}`
      : "https://via.placeholder.com/400x300?text=No+Image";
    return (
      <Card $list={isListView}>
        <ImgWrap $list={isListView}>
          <Img
            src={imageUrl}
            alt={rental.title}
            onError={(e) =>
              (e.target.src =
                "https://via.placeholder.com/400x300?text=Room+Image")
            }
          />
        </ImgWrap>
        <CardBody>
          <CardTitle>{rental.title}</CardTitle>
          <Info>
            <i
              className="fa-solid fa-map-pin"
              style={{ fontSize: "16px", marginRight: "4px" }}
            />
            <span>{rental.location}</span>
          </Info>
          <Info>
            <i
              className="fa-solid fa-user"
              style={{ fontSize: "16px", marginRight: "4px" }}
            />
            <span>Owner: {rental.owner_name}</span>
          </Info>
          <DatesRow>
            <DateBox>
              <DateLabel>Move In</DateLabel>
              <DateValue>{formatDate(rental.move_in_date)}</DateValue>
            </DateBox>
            <DateBox>
              <DateLabel>Move Out</DateLabel>
              <DateValue>{formatDate(rental.move_out_date)}</DateValue>
            </DateBox>
          </DatesRow>
          <Price>Rs {rental.total_price.toLocaleString()}</Price>
          {rental.status !== "cancelled" && (
            <StopButton
              onClick={() => handleStopRent(rental.id)}
              disabled={stoppingId === rental.id}
            >
              {stoppingId === rental.id ? "Stopping..." : "Stop Rent"}
            </StopButton>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <Page>
      <StickyTop>
        <SearchPanel>
          <SearchInner>
            <SearchGrid>
              <InputWrap>
                <IconLeft>
                  <i
                    className="fa-solid fa-magnifying-glass"
                    style={{ fontSize: "18px" }}
                  />
                </IconLeft>
                <Input
                  type="text"
                  placeholder="Search rooms, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputWrap>
              <SortSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </SortSelect>
            </SearchGrid>
          </SearchInner>
        </SearchPanel>
      </StickyTop>

      <Container>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {loading ? (
          <LoadingSpinner>
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{ fontSize: "32px", marginRight: "12px" }}
            />
            Loading rental history...
          </LoadingSpinner>
        ) : (
          <>
            <ResultsBar>
              <TitleBlock>
                <H2>Rental History</H2>
                <P>
                  {sortedRentals.length} rental
                  {sortedRentals.length !== 1 ? "s" : ""}
                </P>
              </TitleBlock>
            </ResultsBar>

            {sortedRentals.length > 0 ? (
              <GridWrap $view="grid">
                {sortedRentals.map((rental) => (
                  <RentalCard
                    key={rental.id}
                    rental={rental}
                    isListView={false}
                  />
                ))}
              </GridWrap>
            ) : (
              <Empty>
                <i
                  className="fa-solid fa-inbox"
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    opacity: "0.5",
                  }}
                />
                <p style={{ margin: 0 }}>No rental history found</p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "13px",
                    opacity: "0.7",
                  }}
                >
                  You haven't rented any rooms yet
                </p>
              </Empty>
            )}
          </>
        )}
      </Container>
    </Page>
  );
};
export default RentalHistory;
