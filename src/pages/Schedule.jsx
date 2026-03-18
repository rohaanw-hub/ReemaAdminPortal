import { useState, useCallback, useMemo } from "react";
import { useApp } from "../../AppContext";
import {
  OPEN_DAYS,
  ALL_OPEN_SLOTS,
  getSlotsForDay,
  isTutorAvailableAt,
  hasWeeklyConflict,
  CLASSROOMS,
  CLASSROOM_COLORS,
} from "../../helpers";

// ── Pure helpers ───────────────────────────────────────────────────────────────
function relScore(emp) {
  return emp.totalShifts === 0
    ? 100
    : Math.round((1 - emp.callouts / emp.totalShifts) * 100);
}

function isDoubleBooked(sessions, empId, day, time, excludeId = null) {
  return sessions.some(
    (s) =>
      s.employeeId === empId &&
      s.day === day &&
      s.time === time &&
      s.id !== excludeId &&
      s.status !== "cancelled",
  );
}

function findBestTutor(
  sessions,
  employees,
  weeklyConflicts,
  day,
  time,
  excludeEmpId = null,
  excludeSessionId = null,
) {
  const candidates = employees.filter((emp) => {
    if (emp.accountRole === "admin") return false;
    if (emp.id === excludeEmpId) return false;
    if (!isTutorAvailableAt(emp, day, time)) return false;
    if (hasWeeklyConflict(weeklyConflicts, emp.id, day, time)) return false;
    if (isDoubleBooked(sessions, emp.id, day, time, excludeSessionId))
      return false;
    return true;
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => relScore(b) - relScore(a));
  return candidates[0];
}

function getDefaultDay() {
  const dayMap = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 6: "Sat" };
  return dayMap[new Date().getDay()] ?? "Mon";
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "#1e293b",
            color: "#f8fafc",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: 220,
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Classroom Legend ───────────────────────────────────────────────────────────
function ClassroomLegend() {
  return (
    <div
      style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}
    >
      {CLASSROOMS.map((c) => {
        const col = CLASSROOM_COLORS[c];
        return (
          <div
            key={c}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: col.bg,
                border: `2px solid ${col.border}`,
              }}
            />
            <span style={{ fontSize: 13, color: "#475569" }}>{c}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Session Detail Modal ───────────────────────────────────────────────────────
function SessionDetailModal({
  sessionId,
  sessions,
  employees,
  students,
  onClose,
  onUpdate,
  isAdmin,
}) {
  const session = sessions.find((s) => s.id === sessionId);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  if (!session) return null;

  const teacher = employees.find((e) => e.id === session.employeeId);
  const student = students.find((s) => s.id === session.studentId);
  const cls =
    CLASSROOM_COLORS[session.classroom] ?? CLASSROOM_COLORS["Classroom 1"];
  const slotsForDay = getSlotsForDay(session.day);

  const startEdit = () => {
    setEditData({
      classroom: session.classroom ?? "Classroom 1",
      time: session.time,
      employeeId: session.employeeId != null ? String(session.employeeId) : "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate(session.id, {
      classroom: editData.classroom,
      time: editData.time,
      employeeId:
        editData.employeeId !== "" ? Number(editData.employeeId) : null,
    });
    setEditing(false);
    onClose();
  };

  const cancelSession = () => {
    if (window.confirm("Cancel this session?")) {
      onUpdate(session.id, { status: "cancelled" });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">Session Detail</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            padding: "10px 12px",
            borderRadius: 8,
            background: cls.bg,
            border: `1px solid ${cls.border}`,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: cls.color }}>
              {session.classroom ?? "Unassigned Room"}
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {session.day} · {session.time}
            </div>
          </div>
          <span
            className={`badge ${session.status === "scheduled" ? "badge-green" : "badge-gray"}`}
          >
            {session.status}
          </span>
        </div>

        {!editing ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div>
              <span
                style={{ color: "#64748b", fontSize: 12, display: "block" }}
              >
                Teacher
              </span>
              <span style={{ fontWeight: 500 }}>
                {teacher?.name ?? "Unassigned"}
              </span>
            </div>
            <div>
              <span
                style={{ color: "#64748b", fontSize: 12, display: "block" }}
              >
                Student
              </span>
              <span style={{ fontWeight: 500 }}>{student?.name ?? "—"}</span>
            </div>
            <div>
              <span
                style={{ color: "#64748b", fontSize: 12, display: "block" }}
              >
                Subject
              </span>
              <span>{session.subject}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div className="form-group">
              <label className="form-label">Classroom</label>
              <select
                className="form-select"
                value={editData.classroom}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, classroom: e.target.value }))
                }
              >
                {CLASSROOMS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <select
                className="form-select"
                value={editData.time}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, time: e.target.value }))
                }
              >
                {slotsForDay.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Teacher</label>
              <select
                className="form-select"
                value={editData.employeeId}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, employeeId: e.target.value }))
                }
              >
                <option value="">Unassigned</option>
                {employees
                  .filter((e) => e.accountRole !== "admin")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        <div
          className="modal-footer"
          style={{ justifyContent: "space-between" }}
        >
          {isAdmin ? (
            editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveEdit}>
                  Save
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setEditing(false)}
                >
                  Discard
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={startEdit}>
                  Edit
                </button>
                <button
                  className="btn btn-outline"
                  style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                  onClick={cancelSession}
                >
                  Cancel Session
                </button>
              </div>
            )
          ) : (
            <div />
          )}
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Day View ───────────────────────────────────────────────────────────────────
function DayView({
  sessions,
  day,
  employees,
  students,
  tab,
  onSessionClick,
  onMove,
}) {
  const slots = getSlotsForDay(day);
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const daySessions = sessions.filter((s) => s.day === day);

  const getCellSessions = (time, classroom) =>
    daySessions.filter((s) => s.time === time && s.classroom === classroom);

  const handleDragStart = (e, sessionId) => {
    e.dataTransfer.effectAllowed = "move";
    // Defer so the browser captures the original chip as the drag image
    // before the ghost placeholder renders. DO NOT remove this defer.
    setTimeout(() => setDraggedId(sessionId), 0);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragOver = (e, time, classroom) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(`${time}|${classroom}`);
  };

  const handleDrop = (e, time, classroom) => {
    e.preventDefault();
    if (draggedId != null) {
      onMove(draggedId, { time, classroom });
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 560,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                width: 72,
                padding: "10px 12px",
                textAlign: "left",
                color: "#94a3b8",
                fontWeight: 500,
                fontSize: 12,
                borderBottom: "2px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              TIME
            </th>
            {CLASSROOMS.map((c) => {
              const col = CLASSROOM_COLORS[c];
              return (
                <th
                  key={c}
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 13,
                    background: col.bg,
                    color: col.color,
                    borderBottom: "2px solid #e2e8f0",
                    borderLeft: "1px solid #e2e8f0",
                  }}
                >
                  {c}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {slots.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}
              >
                No sessions scheduled for this day.
              </td>
            </tr>
          ) : (
            slots.map((slot) => (
              <tr key={slot}>
                <td
                  style={{
                    padding: "12px",
                    verticalAlign: "top",
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 500,
                    borderBottom: "1px solid #f1f5f9",
                    background: "#f8fafc",
                    whiteSpace: "nowrap",
                  }}
                >
                  {slot.split("-")[0]}
                </td>
                {CLASSROOMS.map((classroom) => {
                  const cellSessions = getCellSessions(slot, classroom);
                  const isTarget = dropTarget === `${slot}|${classroom}`;
                  const col = CLASSROOM_COLORS[classroom];
                  return (
                    <td
                      key={classroom}
                      style={{
                        padding: 8,
                        verticalAlign: "top",
                        borderBottom: "1px solid #f1f5f9",
                        borderLeft: "1px solid #e2e8f0",
                        background: isTarget ? `${col.bg}cc` : "transparent",
                        transition: "background 0.1s",
                        minWidth: 140,
                        minHeight: 72,
                      }}
                      onDragOver={(e) => handleDragOver(e, slot, classroom)}
                      onDrop={(e) => handleDrop(e, slot, classroom)}
                      onDragLeave={() => setDropTarget(null)}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          minHeight: 56,
                        }}
                      >
                        {cellSessions.map((s) => {
                          const teacher = employees.find(
                            (e) => e.id === s.employeeId,
                          );
                          const student = students.find(
                            (st) => st.id === s.studentId,
                          );
                          const isDragging = draggedId === s.id;
                          const line1 =
                            tab === "student"
                              ? (student?.name ?? "—")
                              : (teacher?.name.split(" ")[0] ?? "Unassigned");
                          const line2 =
                            tab === "student"
                              ? (teacher?.name.split(" ")[0] ?? "Unassigned")
                              : (student?.name ?? "—");
                          return (
                            <div
                              key={s.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, s.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => onSessionClick(s.id)}
                              style={{
                                background: col.bg,
                                borderLeft: `4px solid ${col.border}`,
                                borderRadius: 6,
                                padding: "6px 8px",
                                cursor: "pointer",
                                opacity: isDragging ? 0.35 : 1,
                                transition: "opacity 0.15s",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: 13,
                                  color: col.color,
                                  lineHeight: 1.3,
                                }}
                              >
                                {line1}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#64748b",
                                  lineHeight: 1.3,
                                }}
                              >
                                {line2}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Week View ──────────────────────────────────────────────────────────────────
function WeekView({ sessions, employees, students, tab, onSessionClick }) {
  const isSlotOpen = (day, slot) => getSlotsForDay(day).includes(slot);

  const getCellSessions = (day, slot) =>
    sessions.filter((s) => s.day === day && s.time === slot);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 600,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                width: 130,
                padding: "10px 12px",
                textAlign: "left",
                color: "#94a3b8",
                fontWeight: 500,
                fontSize: 12,
                borderBottom: "2px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              SLOT
            </th>
            {OPEN_DAYS.map((d) => (
              <th
                key={d}
                style={{
                  padding: "10px 12px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#1e293b",
                  borderBottom: "2px solid #e2e8f0",
                  borderLeft: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_OPEN_SLOTS.map((slot) => (
            <tr key={slot}>
              <td
                style={{
                  padding: "10px 12px",
                  verticalAlign: "middle",
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 500,
                  borderBottom: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  whiteSpace: "nowrap",
                }}
              >
                {slot}
              </td>
              {OPEN_DAYS.map((day) => {
                const open = isSlotOpen(day, slot);
                const cellSessions = open ? getCellSessions(day, slot) : [];
                return (
                  <td
                    key={day}
                    style={{
                      padding: 6,
                      verticalAlign: "top",
                      borderBottom: "1px solid #f1f5f9",
                      borderLeft: "1px solid #e2e8f0",
                      background: open ? "transparent" : "#f8fafc",
                      minHeight: 48,
                    }}
                  >
                    {!open ? (
                      <div
                        style={{
                          color: "#cbd5e1",
                          fontSize: 11,
                          textAlign: "center",
                          padding: "8px 0",
                        }}
                      >
                        —
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {cellSessions.map((s) => {
                          const col =
                            CLASSROOM_COLORS[s.classroom] ??
                            CLASSROOM_COLORS["Classroom 1"];
                          const teacher = employees.find(
                            (e) => e.id === s.employeeId,
                          );
                          const student = students.find(
                            (st) => st.id === s.studentId,
                          );
                          const nameParts = teacher?.name.split(" ") ?? [];
                          const shortTeacher =
                            nameParts.length >= 2
                              ? `${nameParts[0][0]}. ${nameParts.slice(1).join(" ")}`
                              : (teacher?.name ?? "Unassigned");
                          const label =
                            tab === "student"
                              ? (student?.name ?? "—")
                              : shortTeacher;
                          const tooltipText = [
                            teacher?.name ?? "Unassigned",
                            student?.name ?? "—",
                            s.classroom,
                            s.time,
                          ].join(" · ");
                          return (
                            <div
                              key={s.id}
                              title={tooltipText}
                              onClick={() => onSessionClick(s.id)}
                              style={{
                                background: col.bg,
                                borderLeft: `3px solid ${col.border}`,
                                borderRadius: 4,
                                padding: "2px 5px",
                                cursor: "pointer",
                                fontSize: 11,
                                color: col.color,
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 120,
                              }}
                            >
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Schedule ──────────────────────────────────────────────────────────────
export default function Schedule() {
  const {
    sessions,
    setSessions,
    employees,
    students,
    weeklyConflicts,
    currentUser,
  } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [tab, setTab] = useState("staff");
  const [viewMode, setViewMode] = useState("day");
  const [selectedDay, setSelectedDay] = useState(getDefaultDay);
  const [detailId, setDetailId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const activeSessions = useMemo(
    () => sessions.filter((s) => s.status !== "cancelled"),
    [sessions],
  );

  const handleUpdate = useCallback(
    (sessionId, changes) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...changes } : s)),
      );
      addToast(
        changes.status === "cancelled"
          ? "Session cancelled."
          : "Session updated.",
      );
    },
    [setSessions, addToast],
  );

  const handleMove = useCallback(
    (sessionId, { time, classroom }) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, time, classroom } : s)),
      );
      addToast("Session moved.");
    },
    [setSessions, addToast],
  );

  const autoSchedule = useCallback(() => {
    let count = 0;
    const updated = sessions.map((s) => {
      if (s.employeeId || s.status === "cancelled") return s;
      const best = findBestTutor(
        sessions,
        employees,
        weeklyConflicts,
        s.day,
        s.time,
      );
      if (best) {
        count += 1;
        return { ...s, employeeId: best.id };
      }
      return s;
    });
    setSessions(updated);
    addToast(
      count > 0
        ? `Auto-assigned ${count} session(s).`
        : "No sessions to auto-assign.",
    );
  }, [sessions, employees, weeklyConflicts, setSessions, addToast]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Schedule</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isAdmin && (
            <button className="btn btn-outline" onClick={autoSchedule}>
              Auto-Schedule
            </button>
          )}
          <div
            style={{
              display: "flex",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {["day", "week"].map((mode, i) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "6px 18px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  borderLeft: i > 0 ? "1px solid #e2e8f0" : "none",
                  cursor: "pointer",
                  background: viewMode === mode ? "#E31837" : "transparent",
                  color: viewMode === mode ? "#fff" : "#475569",
                  transition: "background 0.15s",
                }}
              >
                {mode === "day" ? "Day" : "Week"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button
          className={`tab${tab === "staff" ? " tab-active" : ""}`}
          onClick={() => setTab("staff")}
        >
          Staff View
        </button>
        <button
          className={`tab${tab === "student" ? " tab-active" : ""}`}
          onClick={() => setTab("student")}
        >
          Student View
        </button>
      </div>

      <ClassroomLegend />

      {viewMode === "day" && (
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {OPEN_DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: selectedDay === d ? "#E31837" : "#e2e8f0",
                background: selectedDay === d ? "#FFF0F2" : "transparent",
                color: selectedDay === d ? "#E31837" : "#475569",
                fontWeight: selectedDay === d ? 600 : 400,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {viewMode === "day" ? (
          <DayView
            sessions={activeSessions}
            day={selectedDay}
            employees={employees}
            students={students}
            tab={tab}
            onSessionClick={setDetailId}
            onMove={handleMove}
          />
        ) : (
          <WeekView
            sessions={activeSessions}
            employees={employees}
            students={students}
            tab={tab}
            onSessionClick={setDetailId}
          />
        )}
      </div>

      {detailId !== null && (
        <SessionDetailModal
          sessionId={detailId}
          sessions={sessions}
          employees={employees}
          students={students}
          onClose={() => setDetailId(null)}
          onUpdate={handleUpdate}
          isAdmin={isAdmin}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
