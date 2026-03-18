import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Bell, ChevronRight, ChevronDown } from "lucide-react";
import { useApp } from "../../AppContext";
import { getInitials, getAvatarBg, getAvatarText } from "../../helpers";
import SearchBar from "./SearchBar";
import eyeLevelLogo from "../assets/EyeLevelLogo.png";

const ROLE_LABEL = { admin: "Admin", teacher: "Teacher", parent: "Parent" };

const ADMIN_NAV = [
  { to: "/schedule", label: "Schedule" },
  { to: "/employees", label: "Employees" },
  { to: "/students", label: "Students" },
  { to: "/clock-in", label: "Clock In/Out" },
  { to: "/payroll", label: "Payroll" },
];

const REPORTS_NAV = [
  { to: "/reports/attendance", label: "Attendance" },
  { to: "/reports/payroll", label: "Payroll" },
];

function teacherNav(profileId) {
  return [
    { to: "/schedule", label: "My Schedule" },
    { to: `/employees/${profileId}`, label: "My Profile" },
    { to: "/students", label: "Students" },
  ];
}

function formatNotifTime(ts) {
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " · " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Layout() {
  const { currentUser, logout, notifications, markAllRead, employees } =
    useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const panelRef = useRef(null);
  const [reportsOpen, setReportsOpen] = useState(
    location.pathname.startsWith("/reports"),
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Close profile dropdown on navigation
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const myNotifs = notifications.filter((n) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return n.scope === "admin";
    if (currentUser.role === "teacher")
      return n.scope === `teacher:${currentUser.profileId}`;
    return false;
  });
  const unreadCount = myNotifs.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems =
    currentUser?.role === "teacher"
      ? teacherNav(currentUser.profileId)
      : ADMIN_NAV;

  // Resolve profile photo from employee record (admin/teacher only)
  const empRecord =
    currentUser?.profileId != null
      ? employees.find((e) => e.id === currentUser.profileId)
      : null;
  const profilePhoto = empRecord?.photo ?? null;
  const profileName = currentUser?.name ?? "";
  const profileRole = currentUser?.role ?? "";
  const profileLink =
    profileRole === "parent"
      ? "/parent"
      : currentUser?.profileId != null
        ? `/employees/${currentUser.profileId}`
        : null;

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}
    >
      <aside
        style={{
          width: 220,
          background: "#fff",
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "16px 16px 12px",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <img
            src={eyeLevelLogo}
            alt="Eye Level"
            style={{ maxWidth: 140, height: "auto" }}
          />
          <div
            style={{
              fontSize: 11,
              color: "#E31837",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            Eye Level — Missouri City
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 12, overflowY: "auto" }}>
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              style={({ isActive }) => ({
                display: "block",
                padding: "8px 12px",
                borderRadius: 8,
                marginBottom: 4,
                textDecoration: "none",
                fontSize: 14,
                background: isActive ? "#FFF0F2" : "transparent",
                color: isActive ? "#E31837" : "#555",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive
                  ? "3px solid #E31837"
                  : "3px solid transparent",
              })}
            >
              {n.label}
            </NavLink>
          ))}

          {/* Reports dropdown — admin only */}
          {currentUser?.role === "admin" && (
            <div style={{ marginTop: 2 }}>
              <button
                onClick={() => setReportsOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  marginBottom: 2,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  background: location.pathname.startsWith("/reports")
                    ? "#FFF0F2"
                    : "transparent",
                  color: location.pathname.startsWith("/reports")
                    ? "#E31837"
                    : "#555",
                  fontWeight: location.pathname.startsWith("/reports")
                    ? 600
                    : 400,
                  borderLeft: location.pathname.startsWith("/reports")
                    ? "3px solid #E31837"
                    : "3px solid transparent",
                  textAlign: "left",
                }}
              >
                Reports
                {reportsOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>

              {reportsOpen && (
                <div style={{ marginBottom: 4 }}>
                  {REPORTS_NAV.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      style={({ isActive }) => ({
                        display: "block",
                        padding: "7px 12px 7px 28px",
                        borderRadius: 8,
                        marginBottom: 2,
                        textDecoration: "none",
                        fontSize: 13,
                        background: isActive ? "#FFF0F2" : "transparent",
                        color: isActive ? "#E31837" : "#6b7280",
                        fontWeight: isActive ? 600 : 400,
                        borderLeft: isActive
                          ? "3px solid #E31837"
                          : "3px solid transparent",
                      })}
                    >
                      {n.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>

      <div style={{ marginLeft: 220, flex: 1, background: "#f5f4f0" }}>
        {/* Topbar — search + bell + profile avatar */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #eee",
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }} />
          <SearchBar />

          {/* Bell */}
          <div ref={panelRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 8,
                color: notifOpen ? "#E31837" : "#64748b",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "#E31837",
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 9,
                    fontWeight: 700,
                    minWidth: 14,
                    height: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 2px",
                    lineHeight: 1,
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification panel — opens downward */}
            {notifOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 320,
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                  border: "1px solid #e2e8f0",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}
                  >
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#E31837",
                        fontWeight: 500,
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {myNotifs.length === 0 ? (
                    <div
                      style={{
                        padding: "24px 16px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: 13,
                      }}
                    >
                      No notifications
                    </div>
                  ) : (
                    myNotifs.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "10px 16px",
                          borderBottom: "1px solid #f8fafc",
                          background: n.read ? "#fff" : "#fdf8f8",
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        {!n.read && (
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 999,
                              background: "#E31837",
                              flexShrink: 0,
                              marginTop: 5,
                            }}
                          />
                        )}
                        <div style={{ flex: 1, paddingLeft: n.read ? 17 : 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#0f172a",
                              lineHeight: 1.4,
                            }}
                          >
                            {n.msg}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              marginTop: 3,
                            }}
                          >
                            {formatNotifTime(n.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {currentUser && (
            <div ref={profileRef} style={{ position: "relative" }}>
              {/* Avatar button */}
              <button
                onClick={() => setProfileOpen((v) => !v)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: profileOpen
                    ? "2px solid #E31837"
                    : "2px solid transparent",
                  cursor: "pointer",
                  padding: 0,
                  overflow: "hidden",
                  background: profilePhoto
                    ? "transparent"
                    : getAvatarBg(profileName),
                  color: getAvatarText(profileName),
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Profile menu"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={profileName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  getInitials(profileName)
                )}
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 220,
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                    border: "1px solid #e2e8f0",
                    zIndex: 1000,
                    overflow: "hidden",
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: profilePhoto
                          ? "transparent"
                          : getAvatarBg(profileName),
                        color: getAvatarText(profileName),
                        fontSize: 18,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt={profileName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        getInitials(profileName)
                      )}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                      >
                        {profileName}
                      </div>
                      <span
                        className="badge badge-red"
                        style={{ marginTop: 4, fontSize: 11 }}
                      >
                        {ROLE_LABEL[profileRole] ?? profileRole}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: "8px 0" }}>
                    {profileLink && (
                      <NavLink
                        to={profileLink}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: "block",
                          padding: "8px 16px",
                          fontSize: 13,
                          color: "#334155",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        Go to my profile
                      </NavLink>
                    )}
                    <div
                      style={{
                        height: 1,
                        background: "#f1f5f9",
                        margin: "4px 0",
                      }}
                    />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 16px",
                        fontSize: 13,
                        color: "#E31837",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FFF0F2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <main style={{ padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
