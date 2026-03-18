import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import eyeLevelLogo from "../assets/EyeLevelLogo.png";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) {
        setError("Invalid email or password. Please try again.");
        return;
      }
      const dest = result.user.role === "parent" ? "/parent" : "/schedule";
      navigate(dest, {
        replace: true,
      });
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff 0%, #FFF0F2 60%, #fce7ea 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "48px 48px",
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(227,24,55,0.08)",
          border: "1px solid rgba(227,24,55,0.1)",
          maxWidth: 420,
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={eyeLevelLogo}
            alt="Eye Level"
            style={{
              maxWidth: 180,
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
          <div
            style={{
              fontSize: 12,
              color: "#E31837",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            Missouri City
          </div>
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Sign In
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Eye Level Missouri City Portal
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@reema.com"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                color: "#0f172a",
                border: `1px solid ${error ? "#E31837" : "#e2e8f0"}`,
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                color: "#0f172a",
                border: `1px solid ${error ? "#E31837" : "#e2e8f0"}`,
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "#FFF0F2",
                border: "1px solid rgba(227,24,55,0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: "#E31837",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="7" fill="#E31837" />
                <path
                  d="M7 4v3.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="7" cy="10" r="0.75" fill="white" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 16px",
              background: loading ? "#f1a0ab" : "#E31837",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
