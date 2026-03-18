import { useMemo } from "react";
import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  calcReliability,
  reliabilityColor,
} from "../../helpers";
import AttendanceBar from "../components/AttendanceBar";

const TODAY = "Mon";

export default function Dashboard() {
  const { employees, students, sessions, notifications, dismissNotification } =
    useApp();

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === "active").length,
    [employees],
  );
  const enrolledStudents = useMemo(
    () => students.filter((s) => s.status === "active").length,
    [students],
  );
  const todaySessions = useMemo(
    () => sessions.filter((s) => s.day === TODAY),
    [sessions],
  );
  const avgAttendance = useMemo(
    () =>
      students.length
        ? Math.round(
            students.reduce((sum, s) => sum + s.attendance, 0) /
              students.length,
          )
        : 0,
    [students],
  );

  const stats = useMemo(
    () => [
      {
        label: "Active Employees",
        value: activeEmployees,
        color: "#E31837",
        sub: "on staff",
      },
      {
        label: "Enrolled Students",
        value: enrolledStudents,
        color: "#16a34a",
        sub: "active",
      },
      {
        label: "Sessions Today",
        value: todaySessions.length,
        color: "#d97706",
        sub: "Monday",
      },
      {
        label: "Avg Attendance",
        value: `${avgAttendance}%`,
        color: "#7c3aed",
        sub: "all students",
      },
    ],
    [activeEmployees, enrolledStudents, todaySessions.length, avgAttendance],
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span className="text-sm">Monday (default view)</span>
      </div>

      {notifications.length > 0 && (
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
      )}

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Today's Schedule */}
        <div className="card">
          <div className="section-title">
            {"Today's Schedule \u2014 Monday"}
          </div>
          {todaySessions.length === 0 ? (
            <p className="text-sm">No sessions scheduled for today.</p>
          ) : (
            todaySessions.map((s) => {
              const student = students.find((x) => x.id === s.studentId);
              const emp = employees.find((x) => x.id === s.employeeId);
              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      minWidth: 44,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {s.time}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {student?.name ?? "—"}
                    </div>
                    <div className="text-sm">
                      {emp ? emp.name : "Tutor: Unassigned"} · {s.subject}
                    </div>
                  </div>
                  {s.status === "cancelled" ? (
                    <span className="badge badge-red">Cancelled</span>
                  ) : (
                    <span className="badge badge-blue">Scheduled</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Employee Status */}
        <div className="card">
          <div className="section-title">Employee Status Today</div>
          {employees.map((emp) => {
            const rel = calcReliability(emp.callouts, emp.totalShifts);
            const todaySlots = emp.schedule[TODAY] || [];
            return (
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
                    background: getAvatarBg(emp.name),
                    color: getAvatarText(emp.name),
                  }}
                >
                  {getInitials(emp.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {emp.name}
                  </div>
                  <div className="text-sm">
                    {emp.role} ·{" "}
                    {todaySlots.length > 0
                      ? todaySlots.join(", ")
                      : "Not scheduled today"}
                  </div>
                </div>
                <span
                  style={{
                    color: reliabilityColor(rel),
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {rel}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Overview */}
      <div className="card">
        <div className="section-title">Student Overview</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="avatar"
                        style={{
                          background: getAvatarBg(s.name),
                          color: getAvatarText(s.name),
                        }}
                      >
                        {getInitials(s.name)}
                      </div>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                    </div>
                  </td>
                  <td>{s.grade}</td>
                  <td>
                    <AttendanceBar pct={s.attendance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
