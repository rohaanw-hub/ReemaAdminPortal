import { useState, useMemo } from "react";
import {
  getSlotsForDay,
  isTutorAvailableAt,
  hasWeeklyConflict,
} from "../../helpers";

const SCHEDULE_CLASSROOMS = ["Classroom 1", "Classroom 2", "Classroom 3"];
const CLASSROOM_CAPACITY = 4;

export default function MoveSessionModal({
  session,
  day,
  initTime,
  initClassroom,
  employees,
  sessions,
  students,
  weeklyConflicts,
  onConfirm,
  onCancel,
}) {
  const slots = getSlotsForDay(day);
  const defaultTime = slots.includes(initTime) ? initTime : (slots[0] ?? "");

  const [time, setTime] = useState(defaultTime);
  const [classroom, setClassroom] = useState(initClassroom);
  const [employeeId, setEmployeeId] = useState(session.employeeId ?? "");

  const student = students.find((s) => s.id === session.studentId);
  const fromEmployee = employees.find((e) => e.id === session.employeeId);

  // Active sessions at the target slot (excluding the session being moved)
  const targetSlotSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.id !== session.id &&
          s.day === day &&
          s.time === time &&
          s.status !== "cancelled",
      ),
    [sessions, session.id, day, time],
  );

  // Classroom occupancy at target slot
  const classroomCount = useMemo(
    () => targetSlotSessions.filter((s) => s.classroom === classroom).length,
    [targetSlotSessions, classroom],
  );

  const classroomFull = classroomCount >= CLASSROOM_CAPACITY;

  // Available teachers for target day+time
  const availableTeachers = useMemo(
    () =>
      employees.filter((emp) => {
        if (emp.accountRole === "admin") return false;
        if (!isTutorAvailableAt(emp, day, time)) return false;
        if (hasWeeklyConflict(weeklyConflicts, emp.id, day, time)) return false;
        // Allow already-selected teacher even if double-booked (just warn below)
        return true;
      }),
    [employees, day, time, weeklyConflicts],
  );

  const selectedEmployee = employees.find((e) => e.id === Number(employeeId));

  // Conflict checks
  const teacherUnavailable =
    selectedEmployee && !isTutorAvailableAt(selectedEmployee, day, time);

  const teacherHasWeeklyConflict =
    selectedEmployee &&
    hasWeeklyConflict(weeklyConflicts, selectedEmployee.id, day, time);

  const teacherDoubleBooked =
    selectedEmployee &&
    targetSlotSessions.some(
      (s) => s.employeeId === selectedEmployee.id && s.classroom !== classroom,
    );

  const studentDoubleBooked = targetSlotSessions.some(
    (s) => s.studentId === session.studentId,
  );

  const handleConfirm = () => {
    onConfirm({
      day,
      time,
      classroom,
      employeeId: employeeId ? Number(employeeId) : null,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Move Session</span>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        {/* Summary */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {student?.name ?? "—"}
          </div>
          <div style={{ color: "#64748b", marginBottom: 4 }}>
            <strong>From:</strong> {session.day} · {session.time} ·{" "}
            {session.classroom} · {fromEmployee?.name ?? "Unassigned"}
          </div>
          <div style={{ color: "#E31837" }}>
            <strong>To:</strong> {day}
          </div>
        </div>

        {/* Time Slot */}
        <div className="form-group">
          <label className="form-label">Time Slot</label>
          {slots.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              No slots available for {day}
            </div>
          ) : (
            <select
              className="form-select"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Classroom */}
        <div className="form-group">
          <label className="form-label">Classroom</label>
          <select
            className="form-select"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
          >
            {SCHEDULE_CLASSROOMS.map((c) => {
              const count = targetSlotSessions.filter(
                (s) => s.classroom === c,
              ).length;
              const full = count >= CLASSROOM_CAPACITY;
              return (
                <option key={c} value={c}>
                  {c} ({count}/{CLASSROOM_CAPACITY}
                  {full ? " — full" : ""})
                </option>
              );
            })}
          </select>
          {classroomFull && (
            <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              This classroom is full at this time
            </div>
          )}
        </div>

        {/* Teacher */}
        <div className="form-group">
          <label className="form-label">Teacher</label>
          <select
            className="form-select"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {employees
              .filter((e) => e.accountRole !== "admin")
              .map((e) => {
                const avail = availableTeachers.some((a) => a.id === e.id);
                return (
                  <option key={e.id} value={e.id}>
                    {e.name}
                    {!avail ? " (unavailable)" : ""}
                  </option>
                );
              })}
          </select>
          {(teacherUnavailable || teacherHasWeeklyConflict) && (
            <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              Teacher is unavailable at this time
            </div>
          )}
          {teacherDoubleBooked && (
            <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              Teacher is already booked at this time
            </div>
          )}
        </div>

        {studentDoubleBooked && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#991b1b",
              marginBottom: 12,
            }}
          >
            Student already has a session at this time
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={slots.length === 0}
          >
            Confirm Move
          </button>
        </div>
      </div>
    </div>
  );
}
