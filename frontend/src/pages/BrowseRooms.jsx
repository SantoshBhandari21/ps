//IMPORTS
import React, { useMemo, useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { roomsAPI, getStoredUser } from "../services/api";
import RoomDetails from "../components/RoomDetails";

//Filtering options using amenities
const AMENITIES = [
  { id: "wifi", label: "WiFi", iconClass: "fa-solid fa-wifi" },
  { id: "parking", label: "Parking", iconClass: "fa-solid fa-car" },
  { id: "kitchen", label: "Kitchen", iconClass: "fa-solid fa-utensils" },
  { id: "balcony", label: "Balcony", iconClass: "fa-solid fa-building" },
  { id: "gym", label: "Gym", iconClass: "fa-solid fa-dumbbell" },
];

/* -------------------- Styles -------------------- */
const controlFocus = css`
  &:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.6);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #fff;
  }
`;
//page layout style
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
//Searh bar layout style
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

const FilterBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #fff;
    border-color: #94a3b8;
  }
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

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
`;

const IconBtn = styled.button`
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: ${(p) => (p.$active ? "#2563eb" : "white")};
  color: ${(p) => (p.$active ? "white" : "#0f172a")};
  cursor: pointer;

  &:hover {
    border-color: #94a3b8;
  }
`;

const FiltersPanel = styled.div`
  margin-top: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.06);
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const FiltersTitle = styled.div`
  font-weight: 900;
  color: #0f172a;
`;

const CloseBtn = styled.button`
  padding: 8px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #f1f5f9;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
  }
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  margin-bottom: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  ${controlFocus}
`;
//Min and Max price input styles
const NumberRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const NumInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  ${controlFocus}
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid
    ${(p) => (p.$active ? "rgba(37, 99, 235, 0.35)" : "#cbd5e1")};
  background: ${(p) => (p.$active ? "rgba(37, 99, 235, 0.10)" : "white")};
  color: ${(p) => (p.$active ? "#1d4ed8" : "#0f172a")};
  font-weight: 800;
  cursor: pointer;

  &:hover {
    border-color: #94a3b8;
  }
`;
//Room cards grid layout
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

const BadgeRow = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TypeBadge = styled.span`
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.92);
  color: white;
  font-weight: 900;
  font-size: 12px;
`;

const ImageBadge = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(4px);
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

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
  margin-bottom: 10px;
`;

const Specs = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #475569;
  font-size: 13px;
  margin-bottom: 10px;
`;

const Spec = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const AmenityTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Tag = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 800;
  font-size: 12px;
  text-transform: capitalize;
`;
// bottom row of card with rating, price and button
const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const Price = styled.div`
  font-weight: 900;
  color: #1d4ed8;
`;

const DetailsBtn = styled.button`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: white;
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background: #1e40af;
    border-color: #1e40af;
  }
`;
//when no roms match the filters
const Empty = styled.div`
  text-align: center;
  padding: 60px 12px;
  color: #475569;
`;

/* -------------------- main Component -------------------- */
const BrowseRooms = () => {
  const navigate = useNavigate();
  //inputs and toggles
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  //filtering fields
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    amenities: [],
    bedrooms: "all",
    sortBy: "featured",
  });

  // Fetch rooms from API on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await roomsAPI.getRooms();
        console.log("Rooms fetched:", data);
        setRooms(data.rooms || []);
        setError("");
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError(err.message || "Failed to load rooms");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);
  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  //toggle amenities in filter
  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };
  //filtering logic using useMemo for optimization
  const filteredRooms = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const loc = location.toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        room.title.toLowerCase().includes(q) ||
        room.location.toLowerCase().includes(q);

      const matchesLocation = !loc || room.location.toLowerCase().includes(loc);

      const matchesPrice =
        room.price >= filters.priceRange[0] &&
        room.price <= filters.priceRange[1];

      const matchesBedrooms =
        filters.bedrooms === "all" ||
        room.bedrooms === Number(filters.bedrooms);

      const matchesAmenities =
        filters.amenities.length === 0 ||
        (room.amenities &&
          filters.amenities.every((a) =>
            room.amenities.some(
              (amenity) => amenity.toLowerCase() === a.toLowerCase(),
            ),
          ));

      const isAvailable = room.is_available !== 0;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesPrice &&
        matchesBedrooms &&
        matchesAmenities &&
        isAvailable
      );
    });
  }, [searchQuery, location, filters, rooms]);
  //sort rooms based on selected option
  const sortedRooms = useMemo(() => {
    const list = [...filteredRooms];
    switch (filters.sortBy) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [filteredRooms, filters.sortBy]);

  //navigate to login after clicking view details and return after login
  const handleViewDetails = (room) => {
    const user = getStoredUser();
    if (!user) {
      navigate("/login");
    } else {
      setSelectedRoom(room);
    }
  };

  //Room card component
  const RoomCard = ({ room, isListView }) => {
    const imageUrl = room.main_image
      ? `http://localhost:5000${room.main_image}`
      : "https://via.placeholder.com/400x300?text=No+Image";

    return (
      <Card $list={isListView}>
        <ImgWrap $list={isListView}>
          <Img
            src={imageUrl}
            alt={room.title}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=Room+Image";
            }}
          />

          <BadgeRow>
            <div></div>
            <div></div>
          </BadgeRow>
        </ImgWrap>

        <CardBody>
          <CardTitle>{room.title}</CardTitle>
          {/*location display based on view*/}
          <Meta>
            <i
              className="fa-solid fa-map-pin"
              style={{ fontSize: "16px", marginRight: "4px" }}
            />
            <span>{isListView ? room.address : room.location}</span>
          </Meta>

          <Specs>
            <Spec>
              <i
                className="fa-solid fa-bed"
                style={{ fontSize: "16px", marginRight: "4px" }}
              />
              {room.bedrooms} Bed
            </Spec>
            <Spec>
              <i
                className="fa-solid fa-bath"
                style={{ fontSize: "16px", marginRight: "4px" }}
              />
              {room.bathrooms} Bath
            </Spec>
          </Specs>

          {isListView && <P style={{ marginBottom: 10 }}>{room.description}</P>}

          <AmenityTags>
            {(() => {
              let amenities = [];
              try {
                if (Array.isArray(room.amenities)) {
                  amenities = room.amenities;
                } else if (typeof room.amenities === "string") {
                  amenities = JSON.parse(room.amenities);
                }
                // Ensure amenities is always an array
                if (!Array.isArray(amenities)) {
                  amenities = [];
                }
              } catch (e) {
                console.error("Error parsing amenities:", e);
                amenities = [];
              }

              return (
                <>
                  {amenities.slice(0, 4).map((a) => (
                    <Tag key={typeof a === "string" ? a : a.id || a}>
                      {typeof a === "string" ? a : a.name || a}
                    </Tag>
                  ))}
                  {amenities.length > 4 && <Tag>+{amenities.length - 4}</Tag>}
                </>
              );
            })()}
          </AmenityTags>

          <BottomRow>
            <Price>Rs {room.price.toLocaleString()}/mo</Price>

            <DetailsBtn type="button" onClick={() => handleViewDetails(room)}>
              View Details
            </DetailsBtn>
          </BottomRow>
        </CardBody>
      </Card>
    );
  };
  //main return
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
                  placeholder="Search rooms, apartments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputWrap>

              <InputWrap>
                <IconLeft>
                  <i
                    className="fa-solid fa-map-pin"
                    style={{ fontSize: "18px" }}
                  />
                </IconLeft>
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </InputWrap>

              <FilterBtn
                type="button"
                onClick={() => setShowFilters((s) => !s)}
              >
                <i
                  className="fa-solid fa-filter"
                  style={{ fontSize: "18px", marginRight: "8px" }}
                />
                Filters
              </FilterBtn>
            </SearchGrid>

            {showFilters && (
              <FiltersPanel>
                <FiltersHeader>
                  <FiltersTitle>Filters</FiltersTitle>
                  <CloseBtn
                    type="button"
                    onClick={() => setShowFilters(false)}
                    aria-label="close"
                  >
                    <i
                      className="fa-solid fa-xmark"
                      style={{ fontSize: "18px" }}
                    />
                  </CloseBtn>
                </FiltersHeader>

                <FiltersGrid>
                  <Field>
                    <Label>Price Range (Rs/month)</Label>
                    <NumberRow>
                      <NumInput
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange[0]}
                        onChange={(e) =>
                          setFilter("priceRange", [
                            Number(e.target.value) || 0,
                            filters.priceRange[1],
                          ])
                        }
                      />
                      <NumInput
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange[1]}
                        onChange={(e) =>
                          setFilter("priceRange", [
                            filters.priceRange[0],
                            Number(e.target.value) || 100000,
                          ])
                        }
                      />
                    </NumberRow>
                  </Field>

                  <Field>
                    <Label>Bedrooms</Label>
                    <Select
                      value={filters.bedrooms}
                      onChange={(e) => setFilter("bedrooms", e.target.value)}
                    >
                      <option value="all">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </Select>
                  </Field>
                  {/*sorting options*/}
                  <Field>
                    <Label>Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => setFilter("sortBy", e.target.value)}
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </Select>
                  </Field>
                </FiltersGrid>
                {/*amenities filter*/}
                <div style={{ marginTop: 12 }}>
                  <Label>Amenities</Label>
                  <Chips>
                    {AMENITIES.map((a) => {
                      const active = filters.amenities.includes(a.id);
                      return (
                        <Chip
                          key={a.id}
                          type="button"
                          $active={active}
                          onClick={() => toggleAmenity(a.id)}
                        >
                          <i
                            className={a.iconClass}
                            style={{ fontSize: "16px", marginRight: "6px" }}
                          />
                          {a.label}
                        </Chip>
                      );
                    })}
                  </Chips>
                </div>
              </FiltersPanel>
            )}
          </SearchInner>
        </SearchPanel>
      </StickyTop>

      <Container>
        <ResultsBar>
          <TitleBlock>
            <H2>{sortedRooms.length} Properties Available</H2>
            <P>Find your perfect room in Pokhara</P>
          </TitleBlock>

          <ViewToggle>
            <IconBtn
              type="button"
              $active={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              aria-label="grid"
            >
              <i className="fa-solid fa-grip" style={{ fontSize: "20px" }} />
            </IconBtn>
            <IconBtn
              type="button"
              $active={viewMode === "list"}
              onClick={() => setViewMode("list")}
              aria-label="list"
            >
              <i className="fa-solid fa-list" style={{ fontSize: "20px" }} />
            </IconBtn>
          </ViewToggle>
        </ResultsBar>

        {loading ? (
          <Empty>
            <p style={{ fontSize: "18px" }}>Loading rooms...</p>
          </Empty>
        ) : error ? (
          <Empty>
            <Home size={52} style={{ color: "#ef4444" }} />
            <h3 style={{ margin: "12px 0 6px", color: "#0f172a" }}>
              Error loading rooms
            </h3>
            <p style={{ margin: 0, color: "#ef4444" }}>{error}</p>
          </Empty>
        ) : (
          <>
            <GridWrap $view={viewMode}>
              {sortedRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isListView={viewMode === "list"}
                />
              ))}
            </GridWrap>
            {/*message when filter doesnt match any rooms*/}
            {sortedRooms.length === 0 && (
              <Empty>
                <Home size={52} style={{ color: "#94a3b8" }} />
                <h3 style={{ margin: "12px 0 6px", color: "#0f172a" }}>
                  No properties found
                </h3>
                <p style={{ margin: 0 }}>
                  Try adjusting your filters or search criteria.
                </p>
              </Empty>
            )}
          </>
        )}
      </Container>

      {selectedRoom && (
        <RoomDetails
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </Page>
  );
};

export default BrowseRooms;
