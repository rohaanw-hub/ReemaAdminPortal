import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useApp } from "../../AppContext";
import { getInitials, getAvatarBg, getAvatarText } from "../../helpers";

const MAX_RESULTS = 8;

function Avatar({ name, photo, size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: photo ? "transparent" : getAvatarBg(name),
        color: getAvatarText(name),
        fontSize: size * 0.38,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

export default function SearchBar() {
  const { employees, students } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Build flat results list
  const results = (() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matchedEmps = employees.filter((e) =>
      e.name.toLowerCase().includes(q),
    );
    const matchedStus = students.filter((s) =>
      s.name.toLowerCase().includes(q),
    );
    const combined = [
      ...matchedEmps.map((e) => ({ type: "employee", item: e })),
      ...matchedStus.map((s) => ({ type: "student", item: s })),
    ];
    return combined.slice(0, MAX_RESULTS);
  })();

  const totalMatches = (() => {
    if (!query.trim()) return 0;
    const q = query.toLowerCase();
    const emps = employees.filter((e) =>
      e.name.toLowerCase().includes(q),
    ).length;
    const stus = students.filter((s) =>
      s.name.toLowerCase().includes(q),
    ).length;
    return emps + stus;
  })();

  const empResults = results.filter((r) => r.type === "employee");
  const stuResults = results.filter((r) => r.type === "student");

  const navigate_to = useCallback(
    (result) => {
      const path =
        result.type === "employee"
          ? `/employees/${result.item.id}`
          : `/students/${result.item.id}`;
      navigate(path);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    },
    [navigate],
  );

  // Outside click closes dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        navigate_to(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} style={{ position: "relative", maxWidth: 480 }}>
      {/* Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: focused ? "#fff" : "#f1f5f9",
          border: focused ? "1px solid #E31837" : "1px solid transparent",
          borderRadius: 8,
          padding: "0 10px",
          gap: 8,
          width: focused ? 360 : 240,
          transition: "width 0.2s, border-color 0.15s, background 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(227,24,55,0.08)" : "none",
        }}
      >
        <Search size={14} color={focused ? "#E31837" : "#94a3b8"} />
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => {
            setFocused(true);
            if (query.trim()) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 13,
            color: "#1e293b",
            padding: "7px 0",
          }}
        />
        {!focused && (
          <span
            style={{
              fontSize: 11,
              color: "#94a3b8",
              background: "#e2e8f0",
              borderRadius: 4,
              padding: "1px 5px",
              fontFamily: "monospace",
              flexShrink: 0,
            }}
          >
            Ctrl+K
          </span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            border: "1px solid #e2e8f0",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {empResults.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Employees</div>
                  {empResults.map((r) => (
                    <ResultRow
                      key={`emp-${r.item.id}`}
                      result={r}
                      isActive={results.indexOf(r) === activeIndex}
                      subtitle={`${r.item.accountRole === "admin" ? "Admin" : "Teacher"} · ${r.item.role}`}
                      onMouseEnter={() => setActiveIndex(results.indexOf(r))}
                      onClick={() => navigate_to(r)}
                    />
                  ))}
                </div>
              )}
              {stuResults.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Students</div>
                  {stuResults.map((r) => (
                    <ResultRow
                      key={`stu-${r.item.id}`}
                      result={r}
                      isActive={results.indexOf(r) === activeIndex}
                      subtitle={`Grade ${r.item.grade}`}
                      onMouseEnter={() => setActiveIndex(results.indexOf(r))}
                      onClick={() => navigate_to(r)}
                    />
                  ))}
                </div>
              )}
              {totalMatches > MAX_RESULTS && (
                <div
                  style={{
                    padding: "8px 14px",
                    fontSize: 11,
                    color: "#94a3b8",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  Showing top {MAX_RESULTS} results — refine your search to
                  narrow down
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultRow({ result, isActive, subtitle, onMouseEnter, onClick }) {
  const { item } = result;
  return (
    <div
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        cursor: "pointer",
        background: isActive ? "#FFF0F2" : "transparent",
        borderBottom: "1px solid #f8fafc",
      }}
    >
      <Avatar name={item.name} photo={item.photo ?? null} size={32} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{subtitle}</div>
      </div>
    </div>
  );
}

const sectionHeaderStyle = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#94a3b8",
  padding: "8px 14px 4px",
  background: "#f8fafc",
  borderBottom: "1px solid #f1f5f9",
};
