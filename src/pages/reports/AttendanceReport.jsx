import { useState, useMemo } from "react";
import { useApp } from "../../../AppContext";
import { DAYS, exportToCSV } from "../../../helpers";

const STATUS_OPTIONS = ["all", "scheduled", "attended", "cancelled"];

const STATUS_BADGE = {
  scheduled: "badge-gray",
  attended: "badge-green",
  cancelled: "badge-red",
};

export default function AttendanceReport() {
  const { sessions, employees, students } = useApp();

  const [filterStudent, setFilterStudent] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (filterStudent && s.studentId !== Number(filterStudent)) return false;
      if (filterEmployee && s.employeeId !== Number(filterEmployee))
        return false;
      if (filterDay && s.day !== filterDay) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      return true;
    });
  }, [sessions, filterStudent, filterEmployee, filterDay, filterStatus]);

  const total = filtered.length;
  const attended = filtered.filter((s) => s.status === "attended").length;
  const cancelled = filtered.filter((s) => s.status === "cancelled").length;
  const eligible = total - cancelled;
  const rate = eligible > 0 ? Math.round((attended / eligible) * 100) : 0;

  function studentName(id) {
    return students.find((s) => s.id === id)?.name ?? "—";
  }
  function teacherName(id) {
    if (!id) return "Unassigned";
    return employees.find((e) => e.id === id)?.name ?? "—";
  }

  function handleExport() {
    const today = new Date().toISOString().slice(0, 10);
    const rows = filtered.map((s) => ({
      Day: s.day,
      Time: s.time,
      Student: studentName(s.studentId),
      Teacher: teacherName(s.employeeId),
      Subject: s.subject,
      Status: s.status,
      Duration: `${s.duration} min`,
    }));
    exportToCSV(rows, `attendance-report-${today}.csv`);
  }

  function clearFilters() {
    setFilterStudent("");
    setFilterEmployee("");
    setFilterDay("");
    setFilterStatus("all");
  }

  const hasFilters =
    filterStudent || filterEmployee || filterDay || filterStatus !== "all";

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Attendance Report</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Session attendance by student, teacher, day, and status
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div>
          <label style={labelStyle}>Student</label>
          <select
            className="form-select"
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
          >
            <option value="">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Teacher</label>
          <select
            className="form-select"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
          >
            <option value="">All Teachers</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Day</label>
          <select
            className="form-select"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
          >
            <option value="">All Days</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all"
                  ? "All Statuses"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              className="btn"
              style={{
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#475569",
                width: "100%",
              }}
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div className="stat-card">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attended</div>
          <div className="stat-value" style={{ color: "#166534" }}>
            {attended}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelled</div>
          <div className="stat-value" style={{ color: "#dc2626" }}>
            {cancelled}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attendance Rate</div>
          <div
            className="stat-value"
            style={{
              color:
                rate >= 80 ? "#166534" : rate >= 60 ? "#d97706" : "#dc2626",
            }}
          >
            {eligible > 0 ? `${rate}%` : "—"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            No sessions match the selected filters.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Student</th>
                  <th>Teacher</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.day}</td>
                    <td>{s.time}</td>
                    <td>{studentName(s.studentId)}</td>
                    <td
                      style={{
                        color: s.employeeId ? "#334155" : "#94a3b8",
                        fontStyle: s.employeeId ? "normal" : "italic",
                      }}
                    >
                      {teacherName(s.employeeId)}
                    </td>
                    <td>{s.subject}</td>
                    <td>
                      <span
                        className={`badge ${STATUS_BADGE[s.status] ?? "badge-gray"}`}
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td>{s.duration} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
  display: "block",
  marginBottom: 5,
};
