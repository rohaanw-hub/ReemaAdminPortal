import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  DAYS,
  OPEN_DAYS,
  ALL_OPEN_SLOTS,
  getSlotsForDay,
  SUBJECT_COLORS,
} from "../../helpers";

export default function ParentPortal() {
  const { currentUser, students, sessions, employees } = useApp();

  // Resolve child from profileId (set by resolveLogin when parent logs in)
  const child = students.find((s) => s.id === currentUser?.profileId);

  if (!child) {
    return (
      <div
        className="card"
        style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}
      >
        No student record linked to this account.
      </div>
    );
  }

  const childSessions = sessions.filter((s) => s.studentId === child.id);
  const upcoming = childSessions.filter((s) => s.status !== "cancelled");
  const cancelled = childSessions.filter(
    (s) => s.status === "cancelled",
  ).length;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* ── Child header card ─────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          className="avatar"
          style={{
            width: 64,
            height: 64,
            fontSize: 22,
            flexShrink: 0,
            background: getAvatarBg(child.name),
            color: getAvatarText(child.name),
          }}
        >
          {getInitials(child.name)}
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#0f172a" }}>
            {child.name}
          </div>
          <div className="text-sm" style={{ marginTop: 2 }}>
            Grade {child.grade} · Enrolled {child.enrollDate}
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Attendance",
            value: `${child.attendance}%`,
            sub: "of sessions attended",
          },
          { label: "Total Sessions", value: child.sessions, sub: "all time" },
          { label: "Upcoming", value: upcoming.length, sub: "this week" },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ textAlign: "center", padding: "20px 16px" }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Attendance progress bar ───────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
            Attendance
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color:
                child.attendance >= 90
                  ? "#16a34a"
                  : child.attendance >= 75
                    ? "#d97706"
                    : "#dc2626",
            }}
          >
            {child.attendance}%
          </span>
        </div>
        <div
          style={{
            background: "#f1f5f9",
            borderRadius: 999,
            height: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              width: `${child.attendance}%`,
              background:
                child.attendance >= 90
                  ? "#16a34a"
                  : child.attendance >= 75
                    ? "#d97706"
                    : "#dc2626",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        {cancelled > 0 && (
          <div className="text-sm" style={{ marginTop: 8, color: "#94a3b8" }}>
            {cancelled} session{cancelled > 1 ? "s" : ""} cancelled this period
          </div>
        )}
      </div>

      {/* ── Upcoming sessions table ───────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#0f172a",
            marginBottom: 16,
          }}
        >
          Upcoming Sessions
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm">No upcoming sessions scheduled.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Tutor</th>
                </tr>
              </thead>
              <tbody>
                {upcoming
                  .slice()
                  .sort(
                    (a, b) =>
                      DAYS.indexOf(a.day) - DAYS.indexOf(b.day) ||
                      ALL_OPEN_SLOTS.indexOf(a.time) -
                        ALL_OPEN_SLOTS.indexOf(b.time),
                  )
                  .map((s) => {
                    const tutor = employees.find((e) => e.id === s.employeeId);
                    const colors = SUBJECT_COLORS[s.subject] ?? {
                      bg: "#f1f5f9",
                      color: "#475569",
                    };
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 500 }}>{s.day}</td>
                        <td>{s.time}</td>
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
                          {tutor ? (
                            tutor.name
                          ) : (
                            <span style={{ color: "#94a3b8" }}>Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Weekly schedule grid ──────────────────────────────────────────── */}
      <div className="card">
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#0f172a",
            marginBottom: 16,
          }}
        >
          Weekly Schedule
        </div>
        <div className="week-grid-wrap">
          <table className="week-grid">
            <thead>
              <tr>
                <th>Time</th>
                {OPEN_DAYS.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_OPEN_SLOTS.map((time) => {
                // Only render rows that have at least one session for this child
                const rowHasSessions = OPEN_DAYS.some((day) => {
                  if (!getSlotsForDay(day).includes(time)) return false;
                  return upcoming.some((s) => s.day === day && s.time === time);
                });
                if (!rowHasSessions) return null;

                return (
                  <tr key={time}>
                    <td>{time}</td>
                    {OPEN_DAYS.map((day) => {
                      const isUnavail = !getSlotsForDay(day).includes(time);
                      if (isUnavail)
                        return <td key={day} className="grid-cell-unavail" />;

                      const cellSessions = upcoming.filter(
                        (s) => s.day === day && s.time === time,
                      );
                      return (
                        <td
                          key={day}
                          style={{ position: "relative", verticalAlign: "top" }}
                        >
                          {cellSessions.map((s) => {
                            const tutor = employees.find(
                              (e) => e.id === s.employeeId,
                            );
                            const colors = SUBJECT_COLORS[s.subject] ?? {
                              bg: "#f1f5f9",
                              color: "#475569",
                            };
                            return (
                              <div
                                key={s.id}
                                style={{
                                  background: colors.bg,
                                  color: colors.color,
                                  borderRadius: 6,
                                  padding: "5px 8px",
                                  marginBottom: 4,
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>
                                  {s.subject}
                                </div>
                                <div style={{ fontSize: 11, opacity: 0.85 }}>
                                  {tutor ? tutor.name.split(" ")[0] : "TBD"}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {upcoming.length === 0 && (
          <p className="text-sm" style={{ marginTop: 8 }}>
            No sessions to display.
          </p>
        )}
      </div>
    </div>
  );
}
