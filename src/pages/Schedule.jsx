import { useState, useCallback, useMemo } from "react";
import { useApp } from "../../AppContext";
import {
  DAYS,
  OPEN_DAYS,
  ALL_OPEN_SLOTS,
  getSlotsForDay,
  isTutorAvailableAt,
  hasWeeklyConflict,
  timeToMinutes,
  SUBJECT_COLORS,
} from "../../helpers";

// ── Pure helpers ──────────────────────────────────────────────────────────────
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
  subject,
  excludeEmpId = null,
  excludeSessionId = null,
) {
  const candidates = employees.filter((emp) => {
    if (emp.id === excludeEmpId) return false;
    if (!emp.subjects.includes(subject)) return false;
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

// ── Toast ─────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: t.type === "success" ? "#16a34a" : "#dc2626",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            maxWidth: 340,
            animation: "fadeInUp 0.2s ease",
          }}
        >
          {t.type === "success" ? "✓ " : "✕ "}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Conflicts Panel ───────────────────────────────────────────────────────────
function ConflictsPanel({
  employees,
  weeklyConflicts,
  addWeeklyConflict,
  removeWeeklyConflict,
  clearWeeklyConflicts,
  onClose,
}) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id ?? "");

  // Derive sorted time-point boundaries from slots for the given day
  function getTimePoints(day) {
    const slots = getSlotsForDay(day);
    if (!slots.length) return [];
    const pts = new Set();
    for (const slot of slots) {
      const [s, e] = slot.split("-");
      pts.add(s.trim());
      pts.add(e.trim());
    }
    return [...pts].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  }

  const blankForm = {
    day: "Mon",
    startTime: "4:30",
    endTime: "5:30",
    reason: "",
  };
  const [form, setForm] = useState(blankForm);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const timeOptions = getTimePoints(form.day);
  const endOptions = timeOptions.filter(
    (t) => timeToMinutes(t) > timeToMinutes(form.startTime),
  );

  const handleAdd = () => {
    if (!form.reason.trim()) return alert("Please enter a reason.");
    addWeeklyConflict(Number(selectedEmpId), {
      day: form.day,
      startTime: form.startTime,
      endTime: form.startTime === "All Day" ? "All Day" : form.endTime,
      reason: form.reason,
    });
    setForm((f) => ({ ...f, reason: "" }));
  };

  const empConflicts = weeklyConflicts[selectedEmpId] || [];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Weekly Conflicts</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Employee</label>
          <select
            className="form-select"
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(Number(e.target.value))}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.role}
              </option>
            ))}
          </select>
        </div>

        {/* Active conflicts */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div className="form-label" style={{ marginBottom: 0 }}>
              Active conflicts ({empConflicts.length})
            </div>
            {empConflicts.length > 0 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => clearWeeklyConflicts(Number(selectedEmpId))}
              >
                Clear All
              </button>
            )}
          </div>

          {empConflicts.length === 0 ? (
            <div className="text-sm" style={{ padding: "8px 0" }}>
              No conflicts set for this employee.
            </div>
          ) : (
            empConflicts.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 7,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#991b1b",
                    fontSize: 12,
                    minWidth: 32,
                  }}
                >
                  {c.day}
                </span>
                <span style={{ fontSize: 12, color: "#475569", minWidth: 80 }}>
                  {c.startTime === "All Day"
                    ? "All Day"
                    : `${c.startTime}–${c.endTime}`}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: "#334155" }}>
                  {c.reason}
                </span>
                <button
                  onClick={() =>
                    removeWeeklyConflict(Number(selectedEmpId), c.id)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#dc2626",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add form */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 16,
            background: "#fafafa",
          }}
        >
          <div className="form-label" style={{ marginBottom: 12 }}>
            Add Conflict
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Day</label>
              <select
                className="form-select"
                value={form.day}
                onChange={(e) => {
                  const d = e.target.value;
                  const pts = getTimePoints(d);
                  setForm((f) => ({
                    ...f,
                    day: d,
                    startTime: pts[0] || "4:30",
                    endTime: pts[1] || pts[0] || "5:30",
                  }));
                }}
              >
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <select
                className="form-select"
                value={form.startTime}
                onChange={(e) => {
                  const st = e.target.value;
                  const eo = timeOptions.filter(
                    (t) => timeToMinutes(t) > timeToMinutes(st),
                  );
                  setForm((f) => ({
                    ...f,
                    startTime: st,
                    endTime: eo[0] || "",
                  }));
                }}
              >
                <option value="All Day">All Day</option>
                {timeOptions.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {form.startTime !== "All Day" && (
            <div className="form-group">
              <label className="form-label">End Time</label>
              <select
                className="form-select"
                value={form.endTime}
                onChange={(e) => setField("endTime", e.target.value)}
              >
                {endOptions.map((t) => (
                  <option key={t}>{t}</option>
                ))}
                {endOptions.length === 0 && (
                  <option disabled>No valid end times</option>
                )}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason</label>
            <input
              className="form-input"
              placeholder="Doctor appointment, class conflict, personal..."
              value={form.reason}
              onChange={(e) => setField("reason", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>

          <button className="btn btn-danger" onClick={handleAdd}>
            + Add Conflict
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Session Chip ──────────────────────────────────────────────────────────────
function SessionChip({
  session,
  students,
  employees,
  weeklyConflicts,
  onClick,
  isDragging,
  onDragStart,
  onDragEnd,
  readOnly,
}) {
  const student = students.find((s) => s.id === session.studentId);
  const emp = employees.find((e) => e.id === session.employeeId);
  const colors = SUBJECT_COLORS[session.subject] || {
    bg: "#f1f5f9",
    color: "#475569",
  };

  const isCancelled = session.status === "cancelled";
  const isUnassigned = !session.employeeId && !isCancelled;
  const hasConflict =
    emp &&
    !isCancelled &&
    hasWeeklyConflict(weeklyConflicts, emp.id, session.day, session.time);

  // Ghost placeholder while dragging
  if (isDragging) {
    return (
      <div
        style={{
          borderRadius: 6,
          padding: "5px 8px",
          marginBottom: 4,
          border: "2px dashed #94a3b8",
          background: "rgba(148,163,184,0.08)",
          minHeight: 44,
        }}
      />
    );
  }

  let chipStyle = {};
  let extraClass = "";

  if (isCancelled) {
    extraClass = " cancelled";
  } else if (isUnassigned) {
    extraClass = " unassigned";
  } else {
    chipStyle = {
      background: colors.bg,
      borderColor: hasConflict ? "#f59e0b" : colors.bg,
      color: colors.color,
      border: hasConflict ? "2px solid #f59e0b" : "1px solid transparent",
    };
  }

  const handleDragStart = (e) => {
    if (isCancelled || readOnly) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(session.id));
    setTimeout(() => onDragStart(session), 0);
  };

  return (
    <div
      className={`session-chip${extraClass}`}
      style={chipStyle}
      draggable={!isCancelled && !readOnly}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onClick(session)}
    >
      <div
        className="session-chip-name"
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        {student?.name ?? "—"}
        {hasConflict && (
          <span
            title={`${emp.name} has a weekly conflict at this time`}
            style={{ color: "#d97706", fontSize: 12 }}
          >
            ⚠
          </span>
        )}
      </div>
      <div className="session-chip-sub">
        {isCancelled
          ? "Cancelled"
          : hasConflict
            ? `${emp.name.split(" ")[0]} — Conflict!`
            : emp
              ? emp.name.split(" ")[0]
              : "Unassigned"}
        {" · "}
        {session.subject}
      </div>
    </div>
  );
}

// ── Week Grid ─────────────────────────────────────────────────────────────────
function WeekGrid({
  sessions,
  students,
  employees,
  weeklyConflicts,
  onClickSession,
  draggedSession,
  dragOverCell,
  checkDropValidity,
  onDragStart,
  onDragEnd,
  onCellDragEnter,
  onCellDrop,
  readOnly,
}) {
  return (
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
          {ALL_OPEN_SLOTS.map((time) => (
            <tr key={time}>
              <td>{time}</td>
              {OPEN_DAYS.map((day) => {
                const isUnavail = !getSlotsForDay(day).includes(time);

                const cellSessions = sessions.filter(
                  (s) => s.day === day && s.time === time,
                );

                // Check if any session in this cell has a tutor with a weekly conflict
                const cellHasConflict =
                  !isUnavail &&
                  cellSessions.some((s) => {
                    const emp = employees.find((e) => e.id === s.employeeId);
                    return (
                      emp &&
                      s.status !== "cancelled" &&
                      hasWeeklyConflict(weeklyConflicts, emp.id, day, time)
                    );
                  });

                // Determine any employee who has a conflict in this slot (for the unavailability tint)
                const conflictedEmps = !isUnavail
                  ? employees.filter((emp) =>
                      hasWeeklyConflict(weeklyConflicts, emp.id, day, time),
                    )
                  : [];

                const isHovered =
                  !isUnavail &&
                  dragOverCell?.day === day &&
                  dragOverCell?.time === time;

                const validity =
                  isHovered && draggedSession
                    ? checkDropValidity(draggedSession, day, time)
                    : null;

                // Build cell style
                let cellStyle = {};
                if (isHovered && validity) {
                  cellStyle = validity.valid
                    ? {
                        background: "rgba(22,163,74,0.08)",
                        outline: "2px dashed #16a34a",
                        outlineOffset: "-2px",
                      }
                    : {
                        background: "rgba(220,38,38,0.08)",
                        outline: "2px dashed #dc2626",
                        outlineOffset: "-2px",
                      };
                } else if (cellHasConflict) {
                  cellStyle = {
                    background: "rgba(245,158,11,0.06)",
                    outline: "1px solid #fde68a",
                    outlineOffset: "-1px",
                  };
                } else if (
                  !isUnavail &&
                  conflictedEmps.length > 0 &&
                  cellSessions.length === 0
                ) {
                  // Empty cell where a conflicted emp would normally work
                  cellStyle = { background: "rgba(239,68,68,0.04)" };
                }

                const conflictTooltip =
                  conflictedEmps.length > 0
                    ? conflictedEmps
                        .map((e) => {
                          const c = (weeklyConflicts[e.id] || []).find((cf) => {
                            if (cf.day !== day) return false;
                            if (cf.startTime === "All Day") return true;
                            const t = timeToMinutes(time);
                            return (
                              t >= timeToMinutes(cf.startTime) &&
                              t < timeToMinutes(cf.endTime)
                            );
                          });
                          return c ? `${e.name}: ${c.reason}` : null;
                        })
                        .filter(Boolean)
                        .join("\n")
                    : null;

                return (
                  <td
                    key={day}
                    className={isUnavail ? "grid-cell-unavail" : ""}
                    style={{ position: "relative", ...cellStyle }}
                    title={conflictTooltip || undefined}
                    onDragOver={(e) => {
                      if (readOnly || !draggedSession || isUnavail) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDragEnter={(e) => {
                      if (readOnly || !draggedSession || isUnavail) return;
                      e.preventDefault();
                      onCellDragEnter(day, time);
                    }}
                    onDrop={(e) => {
                      if (readOnly || isUnavail) return;
                      e.preventDefault();
                      onCellDrop(day, time);
                    }}
                  >
                    {!isUnavail &&
                      cellSessions.map((s) => (
                        <SessionChip
                          key={s.id}
                          session={s}
                          students={students}
                          employees={employees}
                          weeklyConflicts={weeklyConflicts}
                          onClick={onClickSession}
                          isDragging={draggedSession?.id === s.id}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          readOnly={readOnly}
                        />
                      ))}

                    {/* Conflict indicator for empty conflicted slots */}
                    {!isUnavail &&
                      cellSessions.length === 0 &&
                      conflictedEmps.length > 0 &&
                      !draggedSession && (
                        <div
                          style={{
                            fontSize: 9,
                            color: "#ef4444",
                            textAlign: "center",
                            padding: "3px 0",
                            opacity: 0.7,
                          }}
                        >
                          🚫 Unavailable
                        </div>
                      )}

                    {/* Drop hint for hovered empty cell */}
                    {isHovered &&
                      cellSessions.filter((s) => draggedSession?.id !== s.id)
                        .length === 0 &&
                      validity && (
                        <div
                          style={{
                            fontSize: 10,
                            textAlign: "center",
                            color: validity.valid ? "#16a34a" : "#dc2626",
                            padding: "4px 2px",
                            pointerEvents: "none",
                          }}
                        >
                          {validity.valid ? "Drop here" : validity.reason}
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

// ── Employee Session Modal ────────────────────────────────────────────────────
function EmpSessionModal({
  session,
  sessions,
  employees,
  students,
  weeklyConflicts,
  onClose,
  onUpdate,
  readOnly,
  addNotification,
}) {
  const student = students.find((s) => s.id === session.studentId);
  const currentEmp = employees.find((e) => e.id === session.employeeId);
  const sessionHasConflict =
    currentEmp &&
    hasWeeklyConflict(
      weeklyConflicts,
      currentEmp.id,
      session.day,
      session.time,
    );

  const availableEmps = employees.filter((emp) => {
    if (!emp.subjects.includes(session.subject)) return false;
    if (!isTutorAvailableAt(emp, session.day, session.time)) return false;
    if (hasWeeklyConflict(weeklyConflicts, emp.id, session.day, session.time))
      return false;
    if (isDoubleBooked(sessions, emp.id, session.day, session.time, session.id))
      return false;
    return true;
  });

  const [selectedEmpId, setSelectedEmpId] = useState(session.employeeId ?? "");

  const handleReassign = () => {
    const newEmpId = selectedEmpId ? Number(selectedEmpId) : null;
    const newEmp = newEmpId ? employees.find((e) => e.id === newEmpId) : null;
    onUpdate({ ...session, employeeId: newEmpId, status: "scheduled" });
    addNotification(
      "info",
      `${student?.name ?? "Student"}'s ${session.subject} session reassigned to ${newEmp?.name ?? "Unassigned"}.`,
      "admin",
    );
    if (session.employeeId && session.employeeId !== newEmpId)
      addNotification(
        "info",
        `${student?.name ?? "Student"}'s ${session.subject} session (${session.day} ${session.time}) has been reassigned to another tutor.`,
        `teacher:${session.employeeId}`,
      );
    if (newEmpId && newEmpId !== session.employeeId)
      addNotification(
        "info",
        `You've been assigned a new session: ${student?.name ?? "Student"} · ${session.subject} · ${session.day} ${session.time}.`,
        `teacher:${newEmpId}`,
      );
    onClose();
  };

  const handleCancel = () => {
    onUpdate({ ...session, status: "cancelled" });
    const label = `${student?.name ?? "Student"}'s ${session.subject} session (${session.day} ${session.time})`;
    addNotification("warning", `${label} has been cancelled.`, "admin");
    if (session.employeeId)
      addNotification(
        "warning",
        `${label} has been cancelled.`,
        `teacher:${session.employeeId}`,
      );
    addNotification(
      "warning",
      `Your child's ${session.subject} session on ${session.day} at ${session.time} has been cancelled.`,
      `parent:${session.studentId}`,
    );
    onClose();
  };

  const handleFindReplacement = () => {
    const best = findBestTutor(
      sessions,
      employees,
      weeklyConflicts,
      session.day,
      session.time,
      session.subject,
      session.employeeId,
      session.id,
    );
    if (best) {
      onUpdate({ ...session, employeeId: best.id, status: "scheduled" });
      addNotification(
        "info",
        `${student?.name ?? "Student"}'s session assigned to ${best.name}.`,
        "admin",
      );
      addNotification(
        "info",
        `You've been assigned a new session: ${student?.name ?? "Student"} · ${session.subject} · ${session.day} ${session.time}.`,
        `teacher:${best.id}`,
      );
      onClose();
    } else {
      alert("No available replacement found at this time.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <span className="modal-title">Session Details</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>{student?.name ?? "—"}</div>
          <div className="text-sm">
            {session.day} · {session.time} · {session.subject}
          </div>
          <div className="text-sm" style={{ marginTop: 4 }}>
            Tutor: {currentEmp?.name ?? "Unassigned"}
          </div>
          {sessionHasConflict && (
            <div
              style={{
                marginTop: 6,
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 12,
                color: "#92400e",
              }}
            >
              ⚠ {currentEmp.name} has a weekly conflict at this time.
            </div>
          )}
          {session.status === "cancelled" && (
            <span className="badge badge-red" style={{ marginTop: 6 }}>
              Cancelled
            </span>
          )}
        </div>

        {!readOnly && session.status !== "cancelled" && (
          <div className="form-group">
            <label className="form-label">Reassign Tutor</label>
            <select
              className="form-select"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {availableEmps.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({relScore(emp)}% reliable)
                </option>
              ))}
            </select>
            {availableEmps.length === 0 && (
              <div className="text-sm" style={{ marginTop: 6 }}>
                No available tutors at this time.
              </div>
            )}
          </div>
        )}

        <div className="modal-footer" style={{ flexWrap: "wrap" }}>
          {readOnly ? (
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              Close
            </button>
          ) : session.status === "cancelled" ? (
            <button className="btn btn-success" onClick={handleFindReplacement}>
              Find Replacement
            </button>
          ) : (
            <>
              <button className="btn btn-danger btn-sm" onClick={handleCancel}>
                Mark Cancelled
              </button>
              {sessionHasConflict && (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={handleFindReplacement}
                >
                  Find Replacement
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={onClose}>
                Close
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleReassign}
              >
                Save Assignment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Student Session Modal ─────────────────────────────────────────────────────
function StuSessionModal({
  session,
  sessions: _sessions,
  employees,
  students,
  onClose,
  onUpdate,
  onMove,
  addNotification,
}) {
  const student = students.find((s) => s.id === session.studentId);
  const emp = employees.find((e) => e.id === session.employeeId);

  const handleCancel = () => {
    onUpdate({ ...session, status: "cancelled" });
    const label = `${student?.name ?? "Student"}'s ${session.subject} session (${session.day} ${session.time})`;
    addNotification("warning", `${label} has been cancelled.`, "admin");
    if (session.employeeId)
      addNotification(
        "warning",
        `${label} has been cancelled.`,
        `teacher:${session.employeeId}`,
      );
    addNotification(
      "warning",
      `Your child's ${session.subject} session on ${session.day} at ${session.time} has been cancelled.`,
      `parent:${session.studentId}`,
    );
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <span className="modal-title">Student Session</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {student?.name ?? "—"}
          </div>
          <div className="text-sm" style={{ marginTop: 4 }}>
            {session.day} · {session.time} · {session.subject}
          </div>
          <div className="text-sm">Tutor: {emp?.name ?? "Unassigned"}</div>
          {session.status === "cancelled" && (
            <span
              className="badge badge-red"
              style={{ marginTop: 6, display: "inline-flex" }}
            >
              Cancelled
            </span>
          )}
        </div>

        <div className="modal-footer" style={{ flexWrap: "wrap" }}>
          {session.status !== "cancelled" && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel}>
              Cancel Session
            </button>
          )}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              onClose();
              onMove(session);
            }}
          >
            Move Session
          </button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Move Session Modal ────────────────────────────────────────────────────────
function MoveModal({
  session,
  sessions,
  employees,
  students,
  weeklyConflicts,
  onClose,
  onMove,
}) {
  const [newDay, setNewDay] = useState(session.day);
  const [newTime, setNewTime] = useState(session.time);
  const emp = employees.find((e) => e.id === session.employeeId);

  const tutorAvail =
    !emp ||
    (isTutorAvailableAt(emp, newDay, newTime) &&
      !hasWeeklyConflict(weeklyConflicts, emp.id, newDay, newTime));
  const conflict = sessions.some(
    (s) =>
      s.id !== session.id &&
      s.studentId === session.studentId &&
      s.day === newDay &&
      s.time === newTime,
  );
  const validTimes = getSlotsForDay(newDay);

  const handleMove = () => {
    if (conflict) return alert("Student already has a session at this time.");
    if (!tutorAvail) {
      const best = findBestTutor(
        sessions,
        employees,
        weeklyConflicts,
        newDay,
        newTime,
        session.subject,
        null,
        session.id,
      );
      onMove(session.id, newDay, newTime, best ? best.id : null);
    } else {
      onMove(session.id, newDay, newTime, session.employeeId);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <span className="modal-title">Move Session</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16, fontSize: 13, color: "#475569" }}>
          Moving session for{" "}
          <strong>
            {students.find((s) => s.id === session.studentId)?.name ?? "—"}
          </strong>
        </div>

        <div className="form-group">
          <label className="form-label">New Day</label>
          <select
            className="form-select"
            value={newDay}
            onChange={(e) => {
              const d = e.target.value;
              setNewDay(d);
              setNewTime(getSlotsForDay(d)[0] ?? "");
            }}
          >
            {OPEN_DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">New Time</label>
          <select
            className="form-select"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          >
            {validTimes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {!tutorAvail && !conflict && (
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: 7,
              padding: "8px 12px",
              fontSize: 12,
              color: "#92400e",
              marginBottom: 12,
            }}
          >
            Current tutor unavailable at this time. A replacement will be
            auto-assigned if possible.
          </div>
        )}
        {conflict && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 7,
              padding: "8px 12px",
              fontSize: 12,
              color: "#991b1b",
              marginBottom: 12,
            }}
          >
            Student already has a session at this time.
          </div>
        )}
        {tutorAvail && !conflict && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              borderRadius: 7,
              padding: "8px 12px",
              fontSize: 12,
              color: "#166534",
              marginBottom: 12,
            }}
          >
            Tutor is available at this time. Ready to move!
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleMove}
            disabled={conflict}
          >
            Confirm Move
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ showCancelled = false }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 14,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {Object.entries(SUBJECT_COLORS).map(([subj, { bg, color }]) => (
        <div
          key={subj}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: bg,
              border: `1px solid ${color}`,
            }}
          />
          <span style={{ color: "#64748b" }}>{subj}</span>
        </div>
      ))}
      <div
        style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
          }}
        />
        <span style={{ color: "#64748b" }}>Unassigned</span>
      </div>
      {showCancelled && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: "#fee2e2",
              border: "1px solid #fca5a5",
            }}
          />
          <span style={{ color: "#64748b" }}>Cancelled</span>
        </div>
      )}
      <div
        style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}
      >
        <span style={{ color: "#f59e0b" }}>⚠</span>
        <span style={{ color: "#64748b" }}>Weekly conflict</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          marginLeft: 4,
          color: "#94a3b8",
        }}
      >
        <span style={{ color: "#16a34a", fontWeight: 600 }}>Green</span>=drop
        valid · <span style={{ color: "#dc2626", fontWeight: 600 }}>Red</span>
        =conflict
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Schedule() {
  const {
    sessions,
    setSessions,
    employees,
    students,
    addNotification,
    weeklyConflicts,
    addWeeklyConflict,
    removeWeeklyConflict,
    clearWeeklyConflicts,
    currentUser,
  } = useApp();

  const isTeacher = currentUser?.role === "teacher";
  const visibleSessions = useMemo(
    () =>
      isTeacher
        ? sessions.filter((s) => s.employeeId === currentUser.profileId)
        : sessions,
    [isTeacher, sessions, currentUser?.profileId],
  );

  const [activeTab, setActiveTab] = useState("employee");
  const [selectedSession, setSelectedSession] = useState(null);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showStuModal, setShowStuModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null);
  const [showConflictsPanel, setShowConflictsPanel] = useState(false);

  // Drag & Drop state
  const [draggedSession, setDraggedSession] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  }, []);

  // Validity check: includes weekly conflict check
  const checkDropValidity = useCallback(
    (session, newDay, newTime) => {
      if (session.day === newDay && session.time === newTime) {
        return { valid: true, reason: null };
      }

      const emp = employees.find((e) => e.id === session.employeeId);

      if (emp && !isTutorAvailableAt(emp, newDay, newTime)) {
        return {
          valid: false,
          reason: `${emp.name.split(" ")[0]} unavailable on ${newDay}`,
        };
      }

      if (emp && hasWeeklyConflict(weeklyConflicts, emp.id, newDay, newTime)) {
        const conflictEntry = (weeklyConflicts[emp.id] || []).find((c) => {
          if (c.day !== newDay) return false;
          if (c.startTime === "All Day") return true;
          const t = timeToMinutes(newTime);
          return (
            t >= timeToMinutes(c.startTime) && t < timeToMinutes(c.endTime)
          );
        });
        return {
          valid: false,
          reason: `${emp.name.split(" ")[0]}: ${conflictEntry?.reason ?? "weekly conflict"}`,
        };
      }

      if (
        emp &&
        isDoubleBooked(sessions, emp.id, newDay, newTime, session.id)
      ) {
        return {
          valid: false,
          reason: `${emp.name.split(" ")[0]} already booked at ${newTime}`,
        };
      }

      if (activeTab === "student") {
        const hasConflict = sessions.some(
          (s) =>
            s.id !== session.id &&
            s.studentId === session.studentId &&
            s.day === newDay &&
            s.time === newTime &&
            s.status !== "cancelled",
        );
        if (hasConflict) {
          return {
            valid: false,
            reason: "Student already scheduled at this time",
          };
        }
      }

      return { valid: true, reason: null };
    },
    [employees, sessions, weeklyConflicts, activeTab],
  );

  // DnD handlers
  const handleDragStart = useCallback(
    (session) => setDraggedSession(session),
    [],
  );
  const handleDragEnd = useCallback(() => {
    setDraggedSession(null);
    setDragOverCell(null);
  }, []);
  const handleCellDragEnter = useCallback(
    (day, time) => setDragOverCell({ day, time }),
    [],
  );

  const handleCellDrop = useCallback(
    (day, time) => {
      if (!draggedSession) return;
      setDragOverCell(null);
      if (draggedSession.day === day && draggedSession.time === time) {
        setDraggedSession(null);
        return;
      }
      const { valid, reason } = checkDropValidity(draggedSession, day, time);
      if (!valid) {
        showToast(reason, "error");
        setDraggedSession(null);
        return;
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === draggedSession.id
            ? { ...s, day, time, status: "scheduled" }
            : s,
        ),
      );
      showToast(`Session moved to ${day} ${time}`, "success");
      setDraggedSession(null);
    },
    [draggedSession, checkDropValidity, setSessions, showToast],
  );

  // Auto-Schedule Employees (respects weekly conflicts)
  const autoScheduleEmployees = () => {
    let updated = sessions.map((s) => ({ ...s }));
    let assigned = 0;

    updated
      .filter((s) => !s.employeeId && s.status === "scheduled")
      .forEach((session) => {
        const best = findBestTutor(
          updated,
          employees,
          weeklyConflicts,
          session.day,
          session.time,
          session.subject,
          null,
          session.id,
        );
        if (best) {
          const idx = updated.findIndex((s) => s.id === session.id);
          updated[idx] = { ...updated[idx], employeeId: best.id };
          assigned++;
        }
      });

    setSessions(updated);
    addNotification(
      "info",
      assigned > 0
        ? `Auto-scheduled ${assigned} session${assigned > 1 ? "s" : ""} (skipping conflicted tutors).`
        : "All sessions already assigned or no valid matches found.",
      "admin",
    );
  };

  // Auto-Schedule Students (respects weekly conflicts)
  const autoScheduleStudents = () => {
    let updated = [...sessions];
    let nextId = Math.max(0, ...sessions.map((s) => s.id)) + 1;
    let created = 0;

    students.forEach((student) => {
      Object.entries(student.schedule).forEach(([day, times]) => {
        times.forEach((timeRange) => {
          const sessionTime = timeRange.split("-")[0].trim();
          const already = updated.some(
            (s) =>
              s.studentId === student.id &&
              s.day === day &&
              s.time === sessionTime &&
              s.status !== "cancelled",
          );
          if (already) return;

          for (const subject of student.subjects) {
            const emp = findBestTutor(
              updated,
              employees,
              weeklyConflicts,
              day,
              sessionTime,
              subject,
              null,
              null,
            );
            if (emp) {
              updated.push({
                id: nextId++,
                day,
                time: sessionTime,
                duration: 60,
                studentId: student.id,
                employeeId: emp.id,
                subject,
                status: "scheduled",
              });
              created++;
              break;
            }
          }
        });
      });
    });

    setSessions(updated);
    addNotification(
      "info",
      created > 0
        ? `Created ${created} new session${created > 1 ? "s" : ""} for students.`
        : "All student slots are already covered.",
      "admin",
    );
  };

  const updateSession = (updated) => {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const moveSession = (sessionId, newDay, newTime, newEmpId) => {
    const session = sessions.find((s) => s.id === sessionId);
    const student = students.find((s) => s.id === session?.studentId);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              day: newDay,
              time: newTime,
              employeeId: newEmpId,
              status: "scheduled",
            }
          : s,
      ),
    );
    addNotification(
      "info",
      `${student?.name ?? "Session"} moved to ${newDay} at ${newTime}.`,
      "admin",
    );
    if (session?.employeeId)
      addNotification(
        "info",
        `Your session with ${student?.name ?? "a student"} has been moved to ${newDay} at ${newTime}.`,
        `teacher:${session.employeeId}`,
      );
    addNotification(
      "info",
      `Your child's ${session?.subject ?? ""} session has been moved to ${newDay} at ${newTime}.`,
      `parent:${session?.studentId}`,
    );
  };

  const openMove = useCallback((session) => {
    setMoveTarget(session);
    setShowMoveModal(true);
  }, []);

  const unassignedCount = useMemo(
    () =>
      sessions.filter((s) => !s.employeeId && s.status === "scheduled").length,
    [sessions],
  );
  const cancelledCount = useMemo(
    () => sessions.filter((s) => s.status === "cancelled").length,
    [sessions],
  );
  const totalConflicts = useMemo(
    () =>
      Object.values(weeklyConflicts).reduce(
        (sum, arr) => sum + (arr?.length ?? 0),
        0,
      ),
    [weeklyConflicts],
  );

  const onClickEmpSession = useCallback((s) => {
    setSelectedSession(s);
    setShowEmpModal(true);
  }, []);

  const onClickStuSession = useCallback((s) => {
    setSelectedSession(s);
    setShowStuModal(true);
  }, []);

  const onCloseEmpModal = useCallback(() => {
    setShowEmpModal(false);
    setSelectedSession(null);
  }, []);

  const onCloseStuModal = useCallback(() => {
    setShowStuModal(false);
    setSelectedSession(null);
  }, []);

  const onStuMove = useCallback(
    (s) => {
      setSelectedSession(null);
      openMove(s);
    },
    [openMove],
  );

  const onCloseMoveModal = useCallback(() => {
    setShowMoveModal(false);
    setMoveTarget(null);
  }, []);

  const dragProps = {
    draggedSession,
    dragOverCell,
    checkDropValidity,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onCellDragEnter: handleCellDragEnter,
    onCellDrop: handleCellDrop,
  };

  return (
    <div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Schedule</h1>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {unassignedCount > 0 && (
            <span className="badge badge-amber">
              {unassignedCount} unassigned
            </span>
          )}
          {cancelledCount > 0 && (
            <span className="badge badge-red">{cancelledCount} cancelled</span>
          )}
          {totalConflicts > 0 && (
            <span className="badge badge-red">
              {totalConflicts} conflict{totalConflicts > 1 ? "s" : ""}
            </span>
          )}
          {!isTeacher && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowConflictsPanel(true)}
            >
              🚫 Manage Conflicts
            </button>
          )}
        </div>
      </div>

      {/* Tabs — hidden for teacher (always shows employee view) */}
      {!isTeacher && (
        <div className="tabs">
          <button
            className={`tab${activeTab === "employee" ? " active" : ""}`}
            onClick={() => setActiveTab("employee")}
          >
            Employee Schedule
          </button>
          <button
            className={`tab${activeTab === "student" ? " active" : ""}`}
            onClick={() => setActiveTab("student")}
          >
            Student Schedule
          </button>
        </div>
      )}

      {/* Employee Tab */}
      {(activeTab === "employee" || isTeacher) && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {!isTeacher && (
              <button
                className="btn btn-primary"
                onClick={autoScheduleEmployees}
              >
                Auto-Schedule Employees
              </button>
            )}
            <span className="text-sm">
              {isTeacher
                ? "Your sessions this week"
                : "Drag sessions to move · Click to reassign or cancel"}
            </span>
          </div>
          <Legend showCancelled />
          <div className="card" style={{ padding: 12 }}>
            <WeekGrid
              sessions={visibleSessions}
              students={students}
              employees={employees}
              weeklyConflicts={weeklyConflicts}
              onClickSession={onClickEmpSession}
              readOnly={isTeacher}
              {...dragProps}
            />
          </div>
        </div>
      )}

      {/* Student Tab */}
      {activeTab === "student" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary" onClick={autoScheduleStudents}>
              Auto-Schedule Students
            </button>
            <span className="text-sm">
              Drag sessions to move · Click to cancel or move
            </span>
          </div>
          <Legend />
          <div className="card" style={{ padding: 12 }}>
            <WeekGrid
              sessions={sessions}
              students={students}
              employees={employees}
              weeklyConflicts={weeklyConflicts}
              onClickSession={onClickStuSession}
              {...dragProps}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showEmpModal && selectedSession && (
        <EmpSessionModal
          session={selectedSession}
          sessions={sessions}
          employees={employees}
          students={students}
          weeklyConflicts={weeklyConflicts}
          onClose={onCloseEmpModal}
          onUpdate={updateSession}
          readOnly={isTeacher}
          addNotification={addNotification}
        />
      )}

      {showStuModal && selectedSession && (
        <StuSessionModal
          session={selectedSession}
          sessions={sessions}
          employees={employees}
          students={students}
          onClose={onCloseStuModal}
          onUpdate={updateSession}
          onMove={onStuMove}
          addNotification={addNotification}
        />
      )}

      {showMoveModal && moveTarget && (
        <MoveModal
          session={moveTarget}
          sessions={sessions}
          employees={employees}
          students={students}
          weeklyConflicts={weeklyConflicts}
          onClose={onCloseMoveModal}
          onMove={moveSession}
        />
      )}

      {showConflictsPanel && (
        <ConflictsPanel
          employees={employees}
          weeklyConflicts={weeklyConflicts}
          addWeeklyConflict={addWeeklyConflict}
          removeWeeklyConflict={removeWeeklyConflict}
          clearWeeklyConflicts={clearWeeklyConflicts}
          onClose={() => setShowConflictsPanel(false)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
