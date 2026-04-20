// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import "../styles/AdminDashboard.css";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { usersAPI } from "../services/api";

export default function AdminDashboard() {
  const tabs = ["Overview", "Users", "Rooms", "Payments"];
  const [active, setActive] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // Track which user is being updated

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [userFilter, setUserFilter] = useState("all"); // all, admin, owner, tenant

  const [rooms, setRooms] = useState([]);
  const [roomsPagination, setRoomsPagination] = useState(null);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomActionLoading, setRoomActionLoading] = useState(null);

  const [payments, setPayments] = useState([]);
  const [paymentsPagination, setPaymentsPagination] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Revenue state
  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Confirmation modal state for user status
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    userId: null,
    currentStatus: null,
    userName: "",
  });

  // Normalize role to lowercase
  const normalizeRole = (role) =>
    String(role || "")
      .trim()
      .toLowerCase();

  const loadUsers = async () => {
    setError("");
    setLoading(true);
    try {
      // If you want filters later: usersAPI.getAllUsers({ role: "owner" })
      const res = await usersAPI.getAllUsers(); // ✅ returns { users: [], pagination: {} }
      const list = res?.users || [];
      setUsers(list);
      setPagination(res?.pagination || null);
    } catch (e) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadRooms = async () => {
    setRoomsLoading(true);
    try {
      const res = await usersAPI.getAllRooms();
      const list = res?.rooms || [];
      setRooms(list);
      setRoomsPagination(res?.pagination || null);
    } catch (e) {
      console.error("Failed to load rooms:", e);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Load rooms when Rooms tab is activated
  useEffect(() => {
    if (active === "Rooms" && rooms.length === 0 && !roomsLoading) {
      loadRooms();
    }
  }, [active, rooms.length, roomsLoading]);

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await usersAPI.getAllPayments();
      const list = res?.payments || [];
      setPayments(list);
      setPaymentsPagination(res?.pagination || null);
    } catch (e) {
      console.error("Failed to load payments:", e);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Load payments when Payments tab is activated
  useEffect(() => {
    if (active === "Payments" && payments.length === 0 && !paymentsLoading) {
      loadPayments();
    }
  }, [active, payments.length, paymentsLoading]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await usersAPI.getAdminStats();
      setStats(res?.stats || null);
    } catch (e) {
      console.error("Failed to load stats:", e);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load stats when Overview tab is activated
  useEffect(() => {
    if (active === "Overview" && !stats && !statsLoading) {
      loadStats();
    }
  }, [active, stats, statsLoading]);

  // Load revenue when Overview tab is activated or dates change
  useEffect(() => {
    const loadRevenue = async () => {
      setRevenueLoading(true);
      try {
        const res = await usersAPI.getRevenue(fromDate, toDate);
        setRevenue(res || null);
      } catch (e) {
        console.error("Failed to load revenue:", e);
      } finally {
        setRevenueLoading(false);
      }
    };

    if (active === "Overview") {
      loadRevenue();
    }
  }, [active, fromDate, toDate]);

  const counts = useMemo(() => {
    const total = users.length;
    const admins = users.filter(
      (u) => normalizeRole(u.role) === "admin",
    ).length;
    const owners = users.filter(
      (u) => normalizeRole(u.role) === "owner",
    ).length;
    const tenants = users.filter((u) =>
      ["tenant"].includes(normalizeRole(u.role)),
    ).length;

    return { total, admins, owners, tenants };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (userFilter === "all") return users;
    return users.filter((u) => normalizeRole(u.role) === userFilter);
  }, [users, userFilter]);

  // Handle activate/deactivate user
  const handleToggleUserStatus = async (
    userId,
    isCurrentlyActive,
    userName,
  ) => {
    setConfirmModal({
      show: true,
      userId,
      currentStatus: isCurrentlyActive,
      userName,
    });
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    const { userId, currentStatus } = confirmModal;
    setActionLoading(userId);
    try {
      await usersAPI.updateUser(userId, {
        isActive: !currentStatus,
      });
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, is_active: currentStatus ? 0 : 1 } : u,
        ),
      );
      setConfirmModal({
        show: false,
        userId: null,
        currentStatus: null,
        userName: "",
      });
    } catch (err) {
      console.error("Error toggling user status:", err);
      alert(
        `Failed to ${currentStatus ? "deactivate" : "activate"} user: ${err.message}`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle verify/unverify room
  const handleToggleRoomVerification = async (roomId, isCurrentlyVerified) => {
    setRoomActionLoading(roomId);
    try {
      await usersAPI.updateRoomVerification(roomId, !isCurrentlyVerified);
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === roomId
            ? { ...r, is_verified: isCurrentlyVerified ? 0 : 1 }
            : r,
        ),
      );
    } catch (err) {
      console.error("Error updating room verification:", err);
      alert(`Failed to update room: ${err.message}`);
    } finally {
      setRoomActionLoading(null);
    }
  };

  const statsCards = useMemo(
    () => [
      { label: "Total Users", value: pagination?.totalUsers ?? counts.total },
      { label: "Admins", value: counts.admins },
      { label: "Owners", value: counts.owners },
      { label: "Tenants", value: counts.tenants },
    ],
    [counts, pagination],
  );

  return (
    <Page>
      <Layout>
        <Sidebar $open={sidebarOpen}>
          <SidebarHeader>
            <Brand>
              <BrandText>
                <b>Admin Dashboard</b>
              </BrandText>
            </Brand>
          </SidebarHeader>

          <Nav>
            {tabs.map((t) => (
              <NavItem
                key={t}
                $active={active === t}
                onClick={() => {
                  setActive(t);
                  setSidebarOpen(false);
                }}
              >
                {t}
              </NavItem>
            ))}
          </Nav>
        </Sidebar>

        <Content>
          <div className="dashboard-header">
            <div className="header-content">
              <h1>{active}</h1>
              <p>Manage your administrative tasks</p>
            </div>
          </div>

          <Section $pad="20px" $padMobile="14px">
            {loading && (
              <Panel>
                <PanelTitle>Loading...</PanelTitle>
                <p style={{ margin: 0, color: "#546173" }}>Fetching users.</p>
              </Panel>
            )}

            {!loading && error && (
              <Panel>
                <PanelTitle style={{ color: "#b42318" }}>Error</PanelTitle>
                <p style={{ margin: 0, color: "#b42318" }}>{error}</p>
                <div style={{ marginTop: 12 }}>
                  <PrimaryBtn onClick={loadUsers}>Try Again</PrimaryBtn>
                </div>
              </Panel>
            )}

            {!loading && !error && active === "Overview" && (
              <>
                <Grid>
                  {statsCards.map((s) => (
                    <Card key={s.label}>
                      <CardLabel>{s.label}</CardLabel>
                      <CardValue>{s.value ?? "-"}</CardValue>
                      <CardHint>Live data</CardHint>
                    </Card>
                  ))}
                </Grid>

                <Panel style={{ marginTop: 12, marginBottom: 12 }}>
                  <PanelTitle>Revenue Collection</PanelTitle>
                  <FilterRow>
                    <FilterGroup>
                      <FilterLabel>From Date</FilterLabel>
                      <FilterInput
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </FilterGroup>
                    <FilterGroup>
                      <FilterLabel>To Date</FilterLabel>
                      <FilterInput
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </FilterGroup>
                    <ClearBtn
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                    >
                      Clear Filters
                    </ClearBtn>
                  </FilterRow>

                  {revenueLoading ? (
                    <p style={{ margin: "12px 0 0", color: "#546173" }}>
                      Loading revenue data...
                    </p>
                  ) : revenue ? (
                    <RevenueInfo>
                      <RevenueItem>
                        <RevenueLabel>Total Revenue</RevenueLabel>
                        <RevenueValue>
                          Rs{" "}
                          {Number(revenue.totalRevenue || 0).toLocaleString(
                            "en-US",
                          )}
                        </RevenueValue>
                      </RevenueItem>
                      <RevenueItem>
                        <RevenueLabel>Total Payments</RevenueLabel>
                        <RevenueValue>
                          {revenue.totalPayments || 0}
                        </RevenueValue>
                      </RevenueItem>
                      <RevenueItem>
                        <RevenueLabel>
                          Revenue generated to Company (20%)
                        </RevenueLabel>
                        <RevenueValue>
                          Rs{" "}
                          {Math.round(
                            (revenue.totalRevenue || 0) * 0.2,
                          ).toLocaleString("en-US")}
                        </RevenueValue>
                      </RevenueItem>
                    </RevenueInfo>
                  ) : (
                    <p style={{ margin: "12px 0 0", color: "#546173" }}>
                      No revenue data available.
                    </p>
                  )}
                </Panel>

                {statsLoading ? (
                  <Panel style={{ marginTop: 12 }}>
                    <PanelTitle>Loading Analytics...</PanelTitle>
                    <p style={{ margin: "12px 0 0", color: "#546173" }}>
                      Fetching platform analytics.
                    </p>
                  </Panel>
                ) : !stats ? (
                  <Panel style={{ marginTop: 12 }}>
                    <PanelTitle>Error Loading Analytics</PanelTitle>
                    <p style={{ margin: "12px 0 0", color: "#b42318" }}>
                      Failed to load analytics data.
                    </p>
                    <PrimaryBtn onClick={loadStats} style={{ marginTop: 12 }}>
                      Try Again
                    </PrimaryBtn>
                  </Panel>
                ) : (
                  <>
                    {/* Stats Cards from API */}
                    <Grid style={{ marginTop: 0 }}>
                      <Card>
                        <CardLabel>Total Users</CardLabel>
                        <CardValue>{stats.users?.total ?? 0}</CardValue>
                        <CardHint>All registered users</CardHint>
                      </Card>
                      <Card>
                        <CardLabel>Total Rooms</CardLabel>
                        <CardValue>{stats.rooms?.total ?? 0}</CardValue>
                        <CardHint>All listed rooms</CardHint>
                      </Card>
                      <Card>
                        <CardLabel>Rooms on Rent</CardLabel>
                        <CardValue>{stats.bookings?.total ?? 0}</CardValue>
                        <CardHint>All bookings</CardHint>
                      </Card>
                      <Card>
                        <CardLabel>Payments Done</CardLabel>
                        <CardValue>{stats.payments?.total ?? 0}</CardValue>
                        <CardHint>Total payments processed</CardHint>
                      </Card>
                    </Grid>

                    {/* Charts */}
                    <div style={{ marginTop: 24 }}>
                      <h3
                        style={{
                          margin: "0 0 12px 0",
                          color: "#0f172a",
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        System Analytics
                      </h3>
                      <TwoCol style={{ marginBottom: 12 }}>
                        <Panel>
                          <PanelTitle>User Distribution by Role</PanelTitle>
                          <ChartContainer>
                            <ResponsiveContainer width="100%" height={280}>
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: "Admins",
                                      value: stats.users?.admins ?? 0,
                                      fill: "#fcd34d",
                                    },
                                    {
                                      name: "Owners",
                                      value: stats.users?.owners ?? 0,
                                      fill: "#93c5fd",
                                    },
                                    {
                                      name: "Tenants",
                                      value: stats.users?.tenants ?? 0,
                                      fill: "#86efac",
                                    },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, value }) =>
                                    `${name}: ${value}`
                                  }
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  <Cell fill="#fcd34d" />
                                  <Cell fill="#93c5fd" />
                                  <Cell fill="#86efac" />
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </Panel>

                        <Panel>
                          <PanelTitle>Room Availability</PanelTitle>
                          <ChartContainer>
                            <ResponsiveContainer width="100%" height={280}>
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: "Available",
                                      value: stats.rooms?.available ?? 0,
                                      fill: "#86efac",
                                    },
                                    {
                                      name: "Unavailable",
                                      value:
                                        (stats.rooms?.total ?? 0) -
                                        (stats.rooms?.available ?? 0),
                                      fill: "#fca5a5",
                                    },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, value }) =>
                                    `${name}: ${value}`
                                  }
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  <Cell fill="#86efac" />
                                  <Cell fill="#fca5a5" />
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </Panel>
                      </TwoCol>
                    </div>

                    {/* Room Price Distribution Bar Chart */}
                    <Panel style={{ marginTop: 12 }}>
                      <PanelTitle>Room Price Distribution</PanelTitle>
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={[
                              {
                                range: "Budget (0-5K)",
                                count: stats.priceRanges?.budget ?? 0,
                              },
                              {
                                range: "Mid-Range (5K-15K)",
                                count: stats.priceRanges?.mid ?? 0,
                              },
                              {
                                range: "High (15K-30K)",
                                count: stats.priceRanges?.high ?? 0,
                              },
                              {
                                range: "Premium (30K+)",
                                count: stats.priceRanges?.premium ?? 0,
                              },
                            ]}
                            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="range"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              radius={[8, 8, 0, 0]}
                              name="Number of Rooms"
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#3b82f6" />
                              <Cell fill="#f59e0b" />
                              <Cell fill="#ef4444" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </Panel>

                    {/* Summary Stats */}
                    <TwoCol>
                      <Panel>
                        <PanelTitle>User Summary</PanelTitle>
                        <List>
                          <li>
                            <StatItem>
                              <StatLabel>Admins:</StatLabel>
                              <StatValue>{stats.users?.admins ?? 0}</StatValue>
                            </StatItem>
                          </li>
                          <li>
                            <StatItem>
                              <StatLabel>Owners:</StatLabel>
                              <StatValue>{stats.users?.owners ?? 0}</StatValue>
                            </StatItem>
                          </li>
                          <li>
                            <StatItem>
                              <StatLabel>Tenants:</StatLabel>
                              <StatValue>{stats.users?.tenants ?? 0}</StatValue>
                            </StatItem>
                          </li>
                        </List>
                      </Panel>

                      <Panel>
                        <PanelTitle>Room & Pricing Summary</PanelTitle>
                        <List>
                          <li>
                            <StatItem>
                              <StatLabel>Total Rooms:</StatLabel>
                              <StatValue>{stats.rooms?.total ?? 0}</StatValue>
                            </StatItem>
                          </li>
                          <li>
                            <StatItem>
                              <StatLabel>Available:</StatLabel>
                              <StatValue>
                                {stats.rooms?.available ?? 0}
                              </StatValue>
                            </StatItem>
                          </li>
                          <li>
                            <StatItem>
                              <StatLabel>Avg Price:</StatLabel>
                              <StatValue>
                                Rs. {stats.rooms?.avgPrice ?? 0}
                              </StatValue>
                            </StatItem>
                          </li>
                          <li>
                            <StatItem>
                              <StatLabel>Price Range:</StatLabel>
                              <StatValue>
                                Rs. {stats.rooms?.minPrice ?? 0} -{" "}
                                {stats.rooms?.maxPrice ?? 0}
                              </StatValue>
                            </StatItem>
                          </li>
                        </List>
                      </Panel>
                    </TwoCol>
                  </>
                )}
              </>
            )}

            {!loading && !error && active === "Users" && (
              <Panel>
                <PanelTitle>User Management</PanelTitle>

                {/* Role Filter Tabs */}
                <TabRow>
                  <Tab
                    $active={userFilter === "all"}
                    onClick={() => setUserFilter("all")}
                  >
                    All Users
                  </Tab>
                  <Tab
                    $active={userFilter === "admin"}
                    onClick={() => setUserFilter("admin")}
                  >
                    Admin
                  </Tab>
                  <Tab
                    $active={userFilter === "owner"}
                    onClick={() => setUserFilter("owner")}
                  >
                    Owners
                  </Tab>
                  <Tab
                    $active={userFilter === "tenant"}
                    onClick={() => setUserFilter("tenant")}
                  >
                    Tenants
                  </Tab>
                </TabRow>

                {filteredUsers.length === 0 ? (
                  <p style={{ margin: "12px 0 0", color: "#546173" }}>
                    No users found in this category.
                  </p>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const isActive = u.is_active === 1;
                          const isAdmin = normalizeRole(u.role) === "admin";
                          return (
                            <tr key={u.id}>
                              <td>{u.full_name || "-"}</td>
                              <td>{u.email || "-"}</td>
                              <td>
                                <RolePill
                                  $role={normalizeRole(u.role)}
                                  title={`${normalizeRole(u.role).toUpperCase()}`}
                                >
                                  {normalizeRole(u.role) || "-"}
                                </RolePill>
                              </td>
                              <td>
                                <StatusBadge $active={isActive}>
                                  {isActive ? "Active" : "Inactive"}
                                </StatusBadge>
                              </td>
                              <td>
                                {isAdmin ? (
                                  <ActionText>Admin Account</ActionText>
                                ) : (
                                  <ActionButton
                                    $danger={isActive}
                                    onClick={() =>
                                      handleToggleUserStatus(
                                        u.id,
                                        isActive,
                                        u.full_name,
                                      )
                                    }
                                    disabled={actionLoading === u.id}
                                  >
                                    {actionLoading === u.id
                                      ? "..."
                                      : isActive
                                        ? "Deactivate"
                                        : "Activate"}
                                  </ActionButton>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
              </Panel>
            )}

            {!loading && !error && active === "Rooms" && (
              <Panel>
                <PanelTitle>
                  All Rooms{" "}
                  <span
                    style={{ color: "#64748b", fontWeight: 600, fontSize: 13 }}
                  >
                    ({roomsPagination?.totalRooms ?? rooms.length})
                  </span>
                </PanelTitle>

                {roomsLoading ? (
                  <p style={{ margin: "12px 0 0", color: "#546173" }}>
                    Loading rooms...
                  </p>
                ) : rooms.length === 0 ? (
                  <p style={{ margin: "12px 0 0", color: "#546173" }}>
                    No rooms found.
                  </p>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <th>Room Title</th>
                          <th>Owner Name</th>
                          <th>Owner Email</th>
                          <th>Location</th>
                          <th>Price</th>
                          <th>Available</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id}>
                            <td>{room.title || "-"}</td>
                            <td>{room.owner_name || "-"}</td>
                            <td>{room.owner_email || "-"}</td>
                            <td>{room.location || "-"}</td>
                            <td>Rs. {room.price || "-"}</td>
                            <td>
                              <StatusBadge $active={room.is_available === 1}>
                                {room.is_available === 1 ? "Yes" : "No"}
                              </StatusBadge>
                            </td>
                            <td>
                              <StatusBadge $active={room.is_verified === 1}>
                                {room.is_verified === 1
                                  ? "Verified"
                                  : "Unverified"}
                              </StatusBadge>
                            </td>
                            <td>
                              <ActionButton
                                onClick={() =>
                                  handleToggleRoomVerification(
                                    room.id,
                                    room.is_verified === 1,
                                  )
                                }
                                disabled={roomActionLoading === room.id}
                                $danger={room.is_verified === 1}
                              >
                                {roomActionLoading === room.id
                                  ? "..."
                                  : room.is_verified === 1
                                    ? "Unverify"
                                    : "Verify"}
                              </ActionButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
              </Panel>
            )}

            {!loading && !error && active === "Payments" && (
              <Panel>
                <PanelTitle>
                  Payment Records{" "}
                  <span
                    style={{ color: "#64748b", fontWeight: 600, fontSize: 13 }}
                  >
                    ({paymentsPagination?.totalPayments ?? payments.length})
                  </span>
                </PanelTitle>

                {paymentsLoading ? (
                  <p style={{ margin: "12px 0 0", color: "#546173" }}>
                    Loading payments...
                  </p>
                ) : payments.length === 0 ? (
                  <p style={{ margin: "12px 0 0", color: "#546173" }}>
                    No payments found.
                  </p>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <th>Tenant Name</th>
                          <th>Email</th>
                          <th>Room</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td>{p.tenant_name || "-"}</td>
                            <td>{p.tenant_email || "-"}</td>
                            <td>{p.room_title || "-"}</td>
                            <td>Rs. {p.amount || "-"}</td>
                            <td>
                              <StatusBadge $active={p.status === "completed"}>
                                {p.status?.charAt(0).toUpperCase() +
                                  p.status?.slice(1) || "-"}
                              </StatusBadge>
                            </td>
                            <td>
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
              </Panel>
            )}

            {!loading &&
              !error &&
              active !== "Overview" &&
              active !== "Users" &&
              active !== "Rooms" &&
              active !== "Payments" && (
                <Panel>
                  <PanelTitle>{active}</PanelTitle>
                  <p style={{ margin: 0, color: "#546173" }}>
                    Hook this tab to your API when ready.
                  </p>
                </Panel>
              )}
          </Section>
        </Content>
      </Layout>

      {sidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <Modal>
          <ModalContent>
            <ModalTitle>
              {confirmModal.currentStatus ? "Deactivate User" : "Activate User"}
            </ModalTitle>
            <ModalBody>
              <p>
                {confirmModal.currentStatus
                  ? `Are you sure you want to deactivate ${confirmModal.userName}? They will be notified: "after reviewing your activity, we have confirmed your involvement on a suspicious act. to reactivate your account, contact admin asap."`
                  : `Are you sure you want to activate ${confirmModal.userName}? They will be notified: "your account is activated successfully"`}
              </p>
            </ModalBody>
            <ModalActions>
              <CancelBtn
                onClick={() =>
                  setConfirmModal({
                    show: false,
                    userId: null,
                    currentStatus: null,
                    userName: "",
                  })
                }
              >
                Cancel
              </CancelBtn>
              <ConfirmBtn
                $danger={confirmModal.currentStatus}
                onClick={confirmStatusChange}
              >
                {confirmModal.currentStatus ? "Deactivate" : "Activate"}
              </ConfirmBtn>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Page>
  );
}

/* ---------------- styles ---------------- */

const Page = styled.div`
  min-height: 100vh;
  background: #f6f8fb;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
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

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoDot = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #22c55e);
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.1;

  small {
    color: #64748b;
  }
`;

const Nav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const NavItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$active ? "#cfe2ff" : "transparent")};
  background: ${(p) => (p.$active ? "#eef6ff" : "transparent")};
  color: ${(p) => (p.$active ? "#1f4fd6" : "#1f2937")};
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${(p) => (p.$active ? "#eef6ff" : "#f3f6fb")};
  }
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 14px;
`;

const DangerBtn = styled.button`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #ffd2d2;
  background: #fff5f5;
  color: #b42318;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #ffecec;
  }
`;

const Content = styled.main`
  padding: 18px;

  @media (max-width: 960px) {
    padding: 14px;
  }
`;

const Topbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1px solid #e7edf5;
  border-radius: 16px;
  padding: 14px;
`;

const LeftTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleBlock = styled.div`
  h1 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.3px;
    color: #0f172a;
  }
  p {
    margin: 2px 0 0;
    color: #64748b;
    font-size: 13px;
  }
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e7edf5;
  background: #ffffff;
  cursor: pointer;
  font-size: 18px;

  &:hover {
    background: #f3f6fb;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #0f172a;
  color: #ffffff;
  font-weight: 800;
`;

const TabRow = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const Tab = styled.button`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$active ? "#cfe2ff" : "#e7edf5")};
  background: ${(p) => (p.$active ? "#eef6ff" : "#ffffff")};
  color: ${(p) => (p.$active ? "#1f4fd6" : "#1f2937")};
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${(p) => (p.$active ? "#eef6ff" : "#f3f6fb")};
  }
`;

const Section = styled.section`
  padding: ${(p) => p.$pad || "18px"};

  @media (max-width: 768px) {
    padding: ${(p) => p.$padMobile || "14px"};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e7edf5;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
`;

const CardLabel = styled.div`
  color: #64748b;
  font-weight: 700;
  font-size: 13px;
`;

const CardValue = styled.div`
  margin-top: 8px;
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
`;

const CardHint = styled.div`
  margin-top: 6px;
  color: #94a3b8;
  font-size: 12px;
`;

const TwoCol = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: #ffffff;
  border: 1px solid #e7edf5;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
`;

const PanelTitle = styled.h3`
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 16px;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: #334155;

  li {
    margin: 6px 0;
  }
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PrimaryBtn = styled.button`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #cfe2ff;
  background: #eef6ff;
  color: #1f4fd6;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: #e3f0ff;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: 10px 8px;
  }

  th {
    color: #64748b;
    font-size: 13px;
  }

  td {
    color: #0f172a;
    font-size: 14px;
  }

  tbody tr {
    border-top: 1px solid #e7edf5;
  }
`;

const RolePill = styled.span`
  display: inline-block;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  font-size: 14px;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e7edf5;
  background: ${(p) => (p.$danger ? "#fee2e2" : "#dcfce7")};
  color: ${(p) => (p.$danger ? "#991b1b" : "#166534")};
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.$danger ? "#fca5a5" : "#86efac")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionText = styled.span`
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const StatLabel = styled.span`
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
`;

const StatValue = styled.span`
  color: #0f172a;
  font-weight: 900;
  font-size: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 150px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ClearBtn = styled.button`
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }
`;

const RevenueInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const RevenueItem = styled.div`
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RevenueLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
`;

const RevenueValue = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  z-index: 40;

  @media (min-width: 961px) {
    display: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px;
  color: #0f172a;
  font-size: 18px;
`;

const ModalBody = styled.div`
  margin-bottom: 20px;

  p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e7edf5;
  background: #ffffff;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const ConfirmBtn = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: ${(p) => (p.$danger ? "#ef4444" : "#22c55e")};
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.$danger ? "#dc2626" : "#16a34a")};
  }
`;
