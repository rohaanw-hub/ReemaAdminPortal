import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useApp } from "../../AppContext";
import eyeLevelLogo from "../assets/EyeLevelLogo.png";

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

export default function ParentLayout() {
  const { currentUser, logout, notifications, markAllRead } = useApp();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const myNotifs = notifications.filter((n) =>
    currentUser ? n.scope === `parent:${currentUser.profileId}` : false,
  );
  const unreadCount = myNotifs.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
        <nav style={{ flex: 1, padding: 12 }}>
          <NavLink
            to="/parent"
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
            My Child
          </NavLink>
        </nav>

        {/* User info + bell + sign out */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #E5E7EB" }}>
          {currentUser && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0f172a",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser.name}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Parent</div>
              </div>

              {/* Bell */}
              <div
                ref={panelRef}
                style={{ position: "relative", flexShrink: 0 }}
              >
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
                  <Bell size={16} />
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

                {/* Notification panel — opens upward */}
                {notifOpen && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: 0,
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
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#0f172a",
                        }}
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
                            <div
                              style={{
                                flex: 1,
                                paddingLeft: n.read ? 17 : 0,
                              }}
                            >
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
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "7px 12px",
              background: "#FFF0F2",
              color: "#E31837",
              border: "1px solid rgba(227,24,55,0.2)",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: 220, flex: 1, background: "#f5f4f0" }}>
        <main style={{ padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
