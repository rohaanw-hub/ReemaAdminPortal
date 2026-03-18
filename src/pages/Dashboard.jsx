import { useMemo } from "react";
import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  getSlotsForDay,
  OPEN_DAYS,
  SUBJECT_COLORS,
} from "../../helpers";

const DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function todayAbbr() {
  return DAY_ABBRS[new Date().getDay()];
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function nextOpenDay(abbr) {
  const idx = DAY_ABBRS.indexOf(abbr);
  for (let i = 1; i <= 7; i++) {
    const next = DAY_ABBRS[(idx + i) % 7];
    if (OPEN_DAYS.includes(next)) return next;
  }
  return null;
}

export default function Dashboard() {
  const { employees, students, sessions, notifications, dismissNotification } =
    useApp();

  const today = todayAbbr();
  const isOpen = OPEN_DAYS.includes(today);
  const nextDay = isOpen ? null : nextOpenDay(today);
  const todaySlots = getSlotsForDay(today);

  const todaySessions = useMemo(
    () => sessions.filter((s) => s.day === today),
    [sessions, today],
  );

  const previewSessions = useMemo(
    () => (nextDay ? sessions.filter((s) => s.day === nextDay) : []),
    [sessions, nextDay],
  );

  const studentCount = useMemo(
    () =>
      new Set(
        todaySessions
          .filter((s) => s.status !== "cancelled")
          .map((s) => s.studentId),
      ).size,
    [todaySessions],
  );

  const employeeCount = useMemo(
    () =>
      new Set(
        todaySessions
          .filter((s) => s.status !== "cancelled" && s.employeeId)
          .map((s) => s.employeeId),
      ).size,
    [todaySessions],
  );

  const activeSessionCount = useMemo(
    () => todaySessions.filter((s) => s.status !== "cancelled").length,
    [todaySessions],
  );

  const studentsBySlot = useMemo(
    () =>
      todaySlots.map((slot) => ({
        slot,
        sessions: todaySessions.filter((s) => s.time === slot),
      })),
    [todaySessions, todaySlots],
  );

  const employeesWorking = useMemo(() => {
    const empIds = new Set(
      todaySessions
        .filter((s) => s.status !== "cancelled" && s.employeeId)
        .map((s) => s.employeeId),
    );
    return employees
      .filter((e) => empIds.has(e.id))
      .map((e) => ({
        ...e,
        slots: [
          ...new Set(
            todaySessions
              .filter((s) => s.employeeId === e.id && s.status !== "cancelled")
              .map((s) => s.time),
          ),
        ],
      }));
  }, [employees, todaySessions]);

  const notifBanner = notifications.length > 0 && (
    <div style={{ marginBottom: 20 }}>
      {notifications.map((n) => (
        <div key={n.id} className={`notification notification-${n.type}`}>
          <span style={{ flex: 1 }}>{n.msg}</span>
          <button
            onClick={() => dismissNotification(n.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "inherit",
              opacity: 0.6,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  if (!isOpen) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <span className="text-sm">{todayLabel()}</span>
        </div>
        {notifBanner}
        <div
          className="card"
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Center is closed today
          </div>
          <div className="text-sm">
            The tutoring center is not open on{" "}
            {DAY_FULL[DAY_ABBRS.indexOf(today)]}s.
          </div>
        </div>
        {nextDay && previewSessions.length > 0 && (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="section-title">
              Next open day: {DAY_FULL[DAY_ABBRS.indexOf(nextDay)]} preview
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Student</th>
                    <th>Tutor</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewSessions.map((s) => {
                    const student = students.find((x) => x.id === s.studentId);
                    const emp = employees.find((x) => x.id === s.employeeId);
                    return (
                      <tr key={s.id}>
                        <td>{s.time}</td>
                        <td>{student?.name ?? "—"}</td>
                        <td
                          style={{
                            color: emp ? "#334155" : "#94a3b8",
                            fontStyle: emp ? "normal" : "italic",
                          }}
                        >
                          {emp?.name ?? "Unassigned"}
                        </td>
                        <td>{s.subject}</td>
                        <td>
                          <span
                            className={`badge ${s.status === "cancelled" ? "badge-red" : "badge-gray"}`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span className="text-sm">{todayLabel()}</span>
      </div>

      {notifBanner}

      {/* Section 1: Summary bar */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {[
          {
            label: "Today",
            value: today,
            sub: todayLabel().split(",")[0],
            color: "#0f172a",
          },
          {
            label: "Students Today",
            value: studentCount,
            sub: "scheduled",
            color: "#16a34a",
          },
          {
            label: "Employees Today",
            value: employeeCount,
            sub: "working",
            color: "#E31837",
          },
          {
            label: "Sessions Today",
            value: activeSessionCount,
            sub: "total",
            color: "#d97706",
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-sm" style={{ marginTop: 4 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Sections 2 & 3: students + employees side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Section 2: Students grouped by slot */}
        <div className="card">
          <div className="section-title">Students Today</div>
          {todaySessions.length === 0 ? (
            <p className="text-sm">No students scheduled today.</p>
          ) : (
            studentsBySlot
              .filter((g) => g.sessions.length > 0)
              .map(({ slot, sessions: slotSessions }) => (
                <div key={slot} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                      paddingBottom: 4,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {slot}
                  </div>
                  {slotSessions.map((s) => {
                    const student = students.find((x) => x.id === s.studentId);
                    const colors = SUBJECT_COLORS[s.subject] ?? {
                      bg: "#f1f5f9",
                      color: "#475569",
                    };
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 0",
                          borderBottom: "1px solid #f8fafc",
                        }}
                      >
                        <div
                          className="avatar"
                          style={{
                            background: getAvatarBg(student?.name ?? ""),
                            color: getAvatarText(student?.name ?? ""),
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(student?.name ?? "?")}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {student?.name ?? "—"}
                          </div>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "1px 6px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 600,
                              background: colors.bg,
                              color: colors.color,
                            }}
                          >
                            {s.subject}
                          </span>
                        </div>
                        <span
                          className={`badge ${s.status === "cancelled" ? "badge-red" : "badge-green"}`}
                          style={{ flexShrink: 0 }}
                        >
                          {s.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))
          )}
        </div>

        {/* Section 3: Employees working today */}
        <div className="card">
          <div className="section-title">Employees Today</div>
          {employeesWorking.length === 0 ? (
            <p className="text-sm">No employees assigned to sessions today.</p>
          ) : (
            employeesWorking.map((emp) => (
              <div
                key={emp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  className="avatar"
                  style={{
                    background: emp.photo
                      ? "transparent"
                      : getAvatarBg(emp.name),
                    color: getAvatarText(emp.name),
                    overflow: "hidden",
                    padding: emp.photo ? 0 : undefined,
                    flexShrink: 0,
                  }}
                >
                  {emp.photo ? (
                    <img
                      src={emp.photo}
                      alt={emp.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getInitials(emp.name)
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {emp.name}
                  </div>
                  <div className="text-sm">
                    {emp.role} · {emp.slots.join(", ")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 4: Full day schedule grid */}
      <div className="card">
        <div className="section-title">Full Day Schedule — {today}</div>
        {todaySessions.length === 0 ? (
          <p className="text-sm">No sessions scheduled for today.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todaySlots.flatMap((slot) =>
                  todaySessions
                    .filter((s) => s.time === slot)
                    .map((s) => {
                      const student = students.find(
                        (x) => x.id === s.studentId,
                      );
                      const emp = employees.find((x) => x.id === s.employeeId);
                      const colors = SUBJECT_COLORS[s.subject] ?? {
                        bg: "#f1f5f9",
                        color: "#475569",
                      };
                      return (
                        <tr key={s.id}>
                          <td
                            style={{
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.time}
                          </td>
                          <td>{student?.name ?? "—"}</td>
                          <td
                            style={{
                              color: emp ? "#334155" : "#94a3b8",
                              fontStyle: emp ? "normal" : "italic",
                            }}
                          >
                            {emp?.name ?? "Unassigned"}
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                background: colors.bg,
                                color: colors.color,
                              }}
                            >
                              {s.subject}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${s.status === "cancelled" ? "badge-red" : "badge-green"}`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    }),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
