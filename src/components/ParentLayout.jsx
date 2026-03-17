import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import eyeLevelLogo from "../assets/EyeLevelLogo.png";

export default function ParentLayout() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

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
            Missouri City
          </div>
        </div>

        {/* Single nav item */}
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

        {/* User + logout */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #E5E7EB" }}>
          {currentUser && (
            <div style={{ marginBottom: 8 }}>
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
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #eee",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 500, color: "#1e293b" }}>
            Eye Level — Missouri City
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 500,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            Parent Portal
          </span>
        </header>
        <main style={{ padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
