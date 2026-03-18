import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useApp } from "../../AppContext";
import {
  OPEN_DAYS,
  getSlotsForDay,
  CLASSROOMS,
  CLASSROOM_COLORS,
  timeToMinutes,
  getWeekDates,
  formatShortDate,
  userIsAdmin,
  empIsAdmin,
} from "../../helpers";
import MoveSessionModal from "../components/MoveSessionModal";
import ChangeGraderModal from "../components/ChangeGraderModal";
import NewEventModal from "../components/NewEventModal";
import EventDetailModal from "../components/EventDetailModal";
import AutoSchedulerWizard from "../components/AutoSchedulerWizard";

// Classrooms shown in the schedule grid — excludes Grader
const SCHEDULE_CLASSROOMS = ["Classroom 1", "Classroom 2", "Classroom 3"];

// 24-hour calendar constants
const HOUR_HEIGHT = 60; // px per hour
const CAL_HEIGHT = 480; // visible container height (scrollable)
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT; // 1440px

function getCalHours() {
  return Array.from({ length: 24 }, (_, i) => i);
}

function hourLabel(h) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function sessionTopPx(time) {
  const startStr = String(time).split("-")[0].trim();
  const min = timeToMinutes(startStr);
  return (min / 60) * HOUR_HEIGHT;
}

function sessionHeightPx(time) {
  const parts = String(time).split("-");
  if (parts.length < 2) return HOUR_HEIGHT;
  const dur = timeToMinutes(parts[1].trim()) - timeToMinutes(parts[0].trim());
  return Math.max((dur / 60) * HOUR_HEIGHT, 20);
}

// Minutes to scroll to on initial load
function scrollStartMin(day) {
  return day === "Sat" ? 600 : 930; // 10:00 AM or 3:30 PM
}

// Operating hour range in minutes for background shading
function opRange(day) {
  if (day === "Sat") return { start: 630, end: 810 }; // 10:30 AM – 1:30 PM
  return { start: 990, end: 1170 }; // 4:30 PM – 7:30 PM
}

// ── Pure helpers ───────────────────────────────────────────────────────────────
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
      {SCHEDULE_CLASSROOMS.map((c) => {
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
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            background: EVENT_COLORS.bg,
            border: `2px solid ${EVENT_COLORS.border}`,
          }}
        />
        <span style={{ fontSize: 13, color: "#475569" }}>Events</span>
      </div>
    </div>
  );
}

// ── Grader Bar (Day View) ──────────────────────────────────────────────────────
function GraderBar({ graderSchedule, employeeMap, day, isAdmin, onClick }) {
  const empId = graderSchedule?.[day];
  const grader = employeeMap[empId];
  return (
    <div
      onClick={isAdmin ? onClick : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#f0f9ff",
        border: "1px solid #e0f2fe",
        borderRadius: 6,
        padding: "8px 16px",
        fontSize: 13,
        color: "#0369a1",
        marginBottom: 12,
        cursor: isAdmin ? "pointer" : "default",
      }}
    >
      <span>📋 Grader:</span>
      <span
        style={{
          fontWeight: 500,
          textDecoration: isAdmin ? "underline dotted" : "none",
        }}
      >
        {grader ? grader.name : "No grader assigned"}
      </span>
      {isAdmin && (
        <span style={{ fontSize: 11, color: "#7dd3fc", marginLeft: 4 }}>
          (click to change)
        </span>
      )}
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
                  .filter((e) => !empIsAdmin(e))
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

// Event block style
const EVENT_COLORS = { bg: "#ede9fe", border: "#8b5cf6", color: "#5b21b6" };

// ── Day View — 24-hour calendar ────────────────────────────────────────────────
function DayView({
  sessions,
  day,
  employeeMap,
  studentMap,
  onSessionClick,
  onMove,
  calendarEvents,
  onEventClick,
  onSlotClick,
}) {
  const slots = getSlotsForDay(day);
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const scrollRef = useRef(null);
  const { start: opStart, end: opEnd } = opRange(day);

  // Scroll to correct time position whenever day changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (scrollStartMin(day) / 60) * HOUR_HEIGHT;
    }
  }, [day]);

  const daySessions = sessions.filter((s) => s.day === day);

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

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 560 }}>
        {/* Sticky classroom header */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #e2e8f0",
            background: "#f8fafc",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 64,
              flexShrink: 0,
              padding: "10px 8px",
              fontSize: 11,
              fontWeight: 500,
              color: "#94a3b8",
            }}
          >
            TIME
          </div>
          {SCHEDULE_CLASSROOMS.map((c) => {
            const col = CLASSROOM_COLORS[c];
            return (
              <div
                key={c}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 13,
                  background: col.bg,
                  color: col.color,
                  borderLeft: "1px solid #e2e8f0",
                  minWidth: 140,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>

        {/* Scrollable 24-hour body */}
        <div ref={scrollRef} style={{ height: CAL_HEIGHT, overflowY: "auto" }}>
          <div
            style={{
              position: "relative",
              height: TOTAL_HEIGHT,
              display: "flex",
            }}
          >
            {/* Time axis */}
            <div
              style={{
                width: 64,
                flexShrink: 0,
                position: "relative",
                background: "#f8fafc",
                borderRight: "1px solid #e2e8f0",
              }}
            >
              {getCalHours().map((h) => (
                <div
                  key={h}
                  style={{
                    position: "absolute",
                    top: h * HOUR_HEIGHT - 7,
                    left: 0,
                    right: 4,
                    textAlign: "right",
                    fontSize: 10,
                    color: "#94a3b8",
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {hourLabel(h)}
                </div>
              ))}
              {/* Hour dividers */}
              {getCalHours().map((h) => (
                <div
                  key={`line-${h}`}
                  style={{
                    position: "absolute",
                    top: h * HOUR_HEIGHT,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: "#e2e8f0",
                    pointerEvents: "none",
                  }}
                />
              ))}
            </div>

            {/* Classroom columns */}
            {SCHEDULE_CLASSROOMS.map((classroom) => {
              const col = CLASSROOM_COLORS[classroom];
              const classSessions = daySessions.filter(
                (s) => s.classroom === classroom,
              );

              return (
                <div
                  key={classroom}
                  style={{
                    flex: 1,
                    position: "relative",
                    borderLeft: "1px solid #e2e8f0",
                    minWidth: 140,
                  }}
                >
                  {/* Hour row backgrounds (click to create event) */}
                  {getCalHours().map((h) => {
                    const rowMin = h * 60;
                    const isOp = rowMin >= opStart && rowMin < opEnd;
                    const hh = String(h).padStart(2, "0");
                    return (
                      <div
                        key={h}
                        onClick={
                          onSlotClick
                            ? () => onSlotClick(day, `${hh}:00`)
                            : undefined
                        }
                        style={{
                          position: "absolute",
                          top: h * HOUR_HEIGHT,
                          left: 0,
                          right: 0,
                          height: HOUR_HEIGHT,
                          background: isOp ? "#fff" : "#f8fafc",
                          borderBottom: "1px solid #f1f5f9",
                          cursor: onSlotClick ? "pointer" : "default",
                        }}
                      />
                    );
                  })}

                  {/* Drop zones — one per valid slot */}
                  {onMove &&
                    slots.map((slot) => {
                      const top = sessionTopPx(slot);
                      const isTarget = dropTarget === `${slot}|${classroom}`;
                      return (
                        <div
                          key={slot}
                          style={{
                            position: "absolute",
                            top,
                            left: 0,
                            right: 0,
                            height: HOUR_HEIGHT,
                            zIndex: 1,
                            background: isTarget
                              ? `${col.bg}cc`
                              : "transparent",
                            transition: "background 0.1s",
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            setDropTarget(`${slot}|${classroom}`);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedId != null) {
                              onMove(draggedId, {
                                time: slot,
                                classroom,
                              });
                            }
                            setDraggedId(null);
                            setDropTarget(null);
                          }}
                          onDragLeave={() => setDropTarget(null)}
                        />
                      );
                    })}

                  {/* Session blocks — grouped by time slot; one block shows teacher + all students */}
                  {(() => {
                    const groups = {};
                    classSessions.forEach((s) => {
                      if (!groups[s.time]) {
                        groups[s.time] = {
                          time: s.time,
                          employeeId: s.employeeId,
                          firstId: s.id,
                          students: [],
                        };
                      }
                      const st = studentMap[s.studentId];
                      if (st) groups[s.time].students.push(st);
                    });
                    return Object.values(groups).map((g) => {
                      const top = sessionTopPx(g.time);
                      const height = sessionHeightPx(g.time) - 2;
                      const teacher = employeeMap[g.employeeId];
                      const isDragging = draggedId === g.firstId;
                      return (
                        <div
                          key={g.time}
                          draggable={!!onMove}
                          onDragStart={(e) => handleDragStart(e, g.firstId)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onSessionClick(g.firstId)}
                          style={{
                            position: "absolute",
                            top: top + 2,
                            left: 4,
                            right: 4,
                            height,
                            zIndex: 2,
                            background: col.bg,
                            borderLeft: `4px solid ${col.border}`,
                            borderRadius: 6,
                            padding: "4px 8px",
                            cursor: "pointer",
                            opacity: isDragging ? 0.35 : 1,
                            transition: "opacity 0.15s",
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 11,
                              color: col.color,
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {teacher?.name.split(" ")[0] ?? "Unassigned"}
                          </div>
                          {g.students.map((st) => (
                            <div
                              key={st.id}
                              style={{
                                fontSize: 10,
                                color: "#475569",
                                lineHeight: 1.25,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {st.name}
                            </div>
                          ))}
                        </div>
                      );
                    });
                  })()}
                </div>
              );
            })}

            {/* Event overlay — floats above the classroom grid, no dedicated column */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 64, // after time gutter
                width: 160,
                height: TOTAL_HEIGHT,
                pointerEvents: "none",
                zIndex: 4,
              }}
            >
              {calendarEvents
                ?.filter((ev) => ev.date === day && !ev.allDay)
                .map((ev) => {
                  const evTop =
                    (timeToMinutes(ev.startTime) / 60) * HOUR_HEIGHT;
                  const evEnd = (timeToMinutes(ev.endTime) / 60) * HOUR_HEIGHT;
                  const evHeight = Math.max(evEnd - evTop - 2, 20);
                  return (
                    <div
                      key={`ev-${ev.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick && onEventClick(ev);
                      }}
                      style={{
                        position: "absolute",
                        top: evTop + 2,
                        left: 0,
                        right: 0,
                        height: evHeight,
                        pointerEvents: "auto",
                        background: EVENT_COLORS.bg,
                        borderLeft: `4px solid ${EVENT_COLORS.border}`,
                        borderRadius: 6,
                        padding: "3px 7px",
                        cursor: "pointer",
                        overflow: "hidden",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                        opacity: 0.95,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 11,
                          color: EVENT_COLORS.color,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ev.title}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Week View — 24-hour calendar ───────────────────────────────────────────────
function WeekView({
  sessions,
  employeeMap,
  graderSchedule,
  onSessionClick,
  isAdmin,
  onGraderClick,
  calendarEvents,
  onEventClick,
  onSlotClick,
  weekDates,
}) {
  const scrollRef = useRef(null);

  // Scroll to 3:30 PM on initial load (weekday default; Sat sessions will require scrolling up)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (930 / 60) * HOUR_HEIGHT;
    }
  }, []);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 640 }}>
        {/* Sticky header: time gutter + grader + day columns */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #e2e8f0",
            background: "#f8fafc",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ width: 64, flexShrink: 0 }} />
          {OPEN_DAYS.map((d) => {
            const empId = graderSchedule?.[d];
            const grader = employeeMap[empId];
            return (
              <div
                key={d}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  textAlign: "center",
                  borderLeft: "1px solid #e2e8f0",
                  minWidth: 100,
                }}
              >
                <div
                  style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}
                >
                  {d}
                  {weekDates?.[d] && (
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: 10,
                        color: "#64748b",
                        marginLeft: 4,
                      }}
                    >
                      {formatShortDate(weekDates[d])}
                    </span>
                  )}
                </div>
                <div
                  onClick={isAdmin ? () => onGraderClick(d) : undefined}
                  style={{
                    fontSize: 10,
                    color: "#0369a1",
                    marginTop: 2,
                    cursor: isAdmin ? "pointer" : "default",
                    textDecoration: isAdmin ? "underline dotted" : "none",
                  }}
                  title={isAdmin ? "Click to change grader" : undefined}
                >
                  Grader: {grader ? grader.name.split(" ")[0] : "—"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable 24-hour body */}
        <div ref={scrollRef} style={{ height: CAL_HEIGHT, overflowY: "auto" }}>
          <div
            style={{
              position: "relative",
              height: TOTAL_HEIGHT,
              display: "flex",
            }}
          >
            {/* Time axis */}
            <div
              style={{
                width: 64,
                flexShrink: 0,
                position: "relative",
                background: "#f8fafc",
                borderRight: "1px solid #e2e8f0",
              }}
            >
              {getCalHours().map((h) => (
                <div
                  key={h}
                  style={{
                    position: "absolute",
                    top: h * HOUR_HEIGHT - 7,
                    left: 0,
                    right: 4,
                    textAlign: "right",
                    fontSize: 10,
                    color: "#94a3b8",
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {hourLabel(h)}
                </div>
              ))}
              {getCalHours().map((h) => (
                <div
                  key={`line-${h}`}
                  style={{
                    position: "absolute",
                    top: h * HOUR_HEIGHT,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: "#e2e8f0",
                    pointerEvents: "none",
                  }}
                />
              ))}
            </div>

            {/* Day columns */}
            {OPEN_DAYS.map((day) => {
              const { start: opStart, end: opEnd } = opRange(day);
              const daySessions = sessions.filter((s) => s.day === day);

              return (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    position: "relative",
                    borderLeft: "1px solid #e2e8f0",
                    minWidth: 100,
                  }}
                >
                  {/* Hour backgrounds — click to create event */}
                  {getCalHours().map((h) => {
                    const rowMin = h * 60;
                    const isOp = rowMin >= opStart && rowMin < opEnd;
                    const hh = String(h).padStart(2, "0");
                    return (
                      <div
                        key={h}
                        onClick={
                          onSlotClick
                            ? () => onSlotClick(day, `${hh}:00`)
                            : undefined
                        }
                        style={{
                          position: "absolute",
                          top: h * HOUR_HEIGHT,
                          left: 0,
                          right: 0,
                          height: HOUR_HEIGHT,
                          cursor: onSlotClick ? "pointer" : "default",
                          background: isOp ? "#fff" : "#f8fafc",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      />
                    );
                  })}

                  {/* Session blocks — grouped by classroom+time for week view */}
                  {(() => {
                    const groups = {};
                    daySessions.forEach((s) => {
                      const key = `${s.classroom}||${s.time}`;
                      if (!groups[key]) {
                        groups[key] = {
                          classroom: s.classroom,
                          time: s.time,
                          employeeId: s.employeeId,
                          firstId: s.id,
                          count: 0,
                        };
                      }
                      groups[key].count += 1;
                    });
                    return Object.values(groups).map((g) => {
                      const col =
                        CLASSROOM_COLORS[g.classroom] ??
                        CLASSROOM_COLORS["Classroom 1"];
                      const top = sessionTopPx(g.time);
                      const height = sessionHeightPx(g.time) - 2;
                      const teacher = employeeMap[g.employeeId];
                      const tooltipText = [
                        teacher?.name ?? "Unassigned",
                        `${g.count} student${g.count !== 1 ? "s" : ""}`,
                        g.classroom,
                        g.time,
                      ].join(" · ");
                      return (
                        <div
                          key={`${g.classroom}-${g.time}`}
                          title={tooltipText}
                          onClick={() => onSessionClick(g.firstId)}
                          style={{
                            position: "absolute",
                            top: top + 2,
                            left: 2,
                            right: 2,
                            height,
                            zIndex: 2,
                            background: col.bg,
                            borderLeft: `3px solid ${col.border}`,
                            borderRadius: 4,
                            padding: "2px 5px",
                            cursor: "pointer",
                            overflow: "hidden",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: col.color,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {teacher?.name ?? "Unassigned"}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: col.color,
                              opacity: 0.8,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {g.count} student{g.count !== 1 ? "s" : ""}
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {/* Calendar event blocks */}
                  {calendarEvents
                    ?.filter((ev) => ev.date === day && !ev.allDay)
                    .map((ev) => {
                      const evTop =
                        (timeToMinutes(ev.startTime) / 60) * HOUR_HEIGHT;
                      const evEnd =
                        (timeToMinutes(ev.endTime) / 60) * HOUR_HEIGHT;
                      const evHeight = Math.max(evEnd - evTop - 2, 16);
                      return (
                        <div
                          key={`ev-${ev.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick && onEventClick(ev);
                          }}
                          style={{
                            position: "absolute",
                            top: evTop + 2,
                            left: 2,
                            right: 2,
                            height: evHeight,
                            zIndex: 3,
                            background: EVENT_COLORS.bg,
                            borderLeft: `3px solid ${EVENT_COLORS.border}`,
                            borderRadius: 4,
                            padding: "2px 5px",
                            cursor: "pointer",
                            overflow: "hidden",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              color: EVENT_COLORS.color,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {ev.title}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
    graderSchedule,
    setGraderSchedule,
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useApp();
  const isAdmin = userIsAdmin(currentUser);

  const [viewMode, setViewMode] = useState("day");
  const [selectedDay, setSelectedDay] = useState(getDefaultDay);
  const [weekOffset, setWeekOffset] = useState(0); // 0=current week, +1/-1=next/prev
  const [detailId, setDetailId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pendingMove, setPendingMove] = useState(null);
  const [graderDay, setGraderDay] = useState(null); // day for grader change modal
  const [newEventInit, setNewEventInit] = useState(null); // { day, startTime } for new event
  const [detailEvent, setDetailEvent] = useState(null); // event for detail modal
  const [wizardOpen, setWizardOpen] = useState(false);

  const MIN_WEEK_OFFSET = -1;
  const MAX_WEEK_OFFSET = 4;

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const activeSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.status !== "cancelled" &&
          (s.date ? s.date === weekDates[s.day] : weekOffset === 0),
      ),
    [sessions, weekDates, weekOffset],
  );

  const employeeMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );

  const studentMap = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s])),
    [students],
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

  const handleMoveRequest = useCallback(
    (sessionId, { time, classroom }) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;
      setPendingMove({ session, initTime: time, initClassroom: classroom });
    },
    [sessions],
  );

  const handleMoveConfirm = useCallback(
    ({ day, time, classroom, employeeId }) => {
      if (!pendingMove) return;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === pendingMove.session.id
            ? { ...s, day, time, classroom, employeeId, date: weekDates[day] }
            : s,
        ),
      );
      addToast("Session moved.");
      setPendingMove(null);
    },
    [pendingMove, setSessions, addToast, weekDates],
  );

  const handleGraderSave = useCallback(
    (day, employeeId) => {
      setGraderSchedule((prev) => ({ ...prev, [day]: employeeId }));
      const emp = employees.find((e) => e.id === employeeId);
      addToast(`Grader updated for ${day}${emp ? `: ${emp.name}` : ""}.`);
      setGraderDay(null);
    },
    [setGraderSchedule, employees, addToast],
  );

  const handleWizardApply = useCallback(
    ({ proposed, replaceAll, selectedDays, weekDates: wDates }) => {
      setSessions((prev) => {
        let base = prev;
        if (replaceAll) {
          // Remove all non-cancelled sessions for the selected days in this week
          base = prev.filter(
            (s) =>
              s.status === "cancelled" ||
              !selectedDays.includes(s.day) ||
              (s.date && s.date !== wDates[s.day]),
          );
        }
        return [...base, ...proposed];
      });
      addToast(`Schedule applied: ${proposed.length} session(s) created.`);
      setWizardOpen(false);
    },
    [setSessions, addToast],
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Schedule</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isAdmin && (
            <button
              className="btn btn-outline"
              onClick={() => setWizardOpen(true)}
            >
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

      <ClassroomLegend />

      {/* Week navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <button
          className="btn btn-outline"
          onClick={() => setWeekOffset((o) => Math.max(MIN_WEEK_OFFSET, o - 1))}
          disabled={weekOffset <= MIN_WEEK_OFFSET}
          style={{ padding: "5px 12px", fontSize: 16, lineHeight: 1 }}
        >
          ‹
        </button>
        <span
          style={{
            fontWeight: 500,
            fontSize: 13,
            color: "#374151",
            minWidth: 160,
            textAlign: "center",
          }}
        >
          {formatShortDate(weekDates.Mon)} – {formatShortDate(weekDates.Sat)}
        </span>
        <button
          className="btn btn-outline"
          onClick={() => setWeekOffset((o) => Math.min(MAX_WEEK_OFFSET, o + 1))}
          disabled={weekOffset >= MAX_WEEK_OFFSET}
          style={{ padding: "5px 12px", fontSize: 16, lineHeight: 1 }}
        >
          ›
        </button>
        {weekOffset !== 0 && (
          <button
            className="btn btn-outline"
            onClick={() => setWeekOffset(0)}
            style={{ fontSize: 12, padding: "4px 10px" }}
          >
            Today
          </button>
        )}
      </div>

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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span>{d}</span>
              <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.75 }}>
                {formatShortDate(weekDates[d])}
              </span>
            </button>
          ))}
        </div>
      )}

      {viewMode === "day" && (
        <GraderBar
          graderSchedule={graderSchedule}
          employeeMap={employeeMap}
          day={selectedDay}
          isAdmin={isAdmin}
          onClick={() => setGraderDay(selectedDay)}
        />
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {viewMode === "day" ? (
          <DayView
            sessions={activeSessions}
            day={selectedDay}
            employeeMap={employeeMap}
            studentMap={studentMap}
            onSessionClick={setDetailId}
            onMove={isAdmin ? handleMoveRequest : undefined}
            calendarEvents={calendarEvents}
            onEventClick={setDetailEvent}
            onSlotClick={
              isAdmin
                ? (day, time) => setNewEventInit({ day, startTime: time })
                : undefined
            }
          />
        ) : (
          <WeekView
            sessions={activeSessions}
            employeeMap={employeeMap}
            studentMap={studentMap}
            graderSchedule={graderSchedule}
            onSessionClick={setDetailId}
            isAdmin={isAdmin}
            onGraderClick={setGraderDay}
            calendarEvents={calendarEvents}
            onEventClick={setDetailEvent}
            onSlotClick={
              isAdmin
                ? (day, time) => setNewEventInit({ day, startTime: time })
                : undefined
            }
            weekDates={weekDates}
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

      {pendingMove && (
        <MoveSessionModal
          session={pendingMove.session}
          day={selectedDay}
          initTime={pendingMove.initTime}
          initClassroom={pendingMove.initClassroom}
          employees={employees}
          sessions={sessions}
          students={students}
          weeklyConflicts={weeklyConflicts}
          onConfirm={handleMoveConfirm}
          onCancel={() => setPendingMove(null)}
        />
      )}

      {graderDay && (
        <ChangeGraderModal
          day={graderDay}
          currentGraderId={graderSchedule?.[graderDay]}
          employees={employees}
          onSave={(empId) => handleGraderSave(graderDay, empId)}
          onCancel={() => setGraderDay(null)}
        />
      )}

      {newEventInit && (
        <NewEventModal
          initDay={newEventInit.day}
          initTime={newEventInit.startTime}
          employees={employees}
          onSave={(eventData) => {
            addCalendarEvent(eventData);
            addToast("Event created.");
            setNewEventInit(null);
          }}
          onCancel={() => setNewEventInit(null)}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          employees={employees}
          isAdmin={isAdmin}
          onUpdate={(id, changes) => {
            updateCalendarEvent(id, changes);
            setDetailEvent((prev) => ({ ...prev, ...changes }));
            addToast("Event updated.");
          }}
          onDelete={(id) => {
            deleteCalendarEvent(id);
            addToast("Event deleted.");
          }}
          onClose={() => setDetailEvent(null)}
        />
      )}

      {wizardOpen && (
        <AutoSchedulerWizard
          weekDates={weekDates}
          employees={employees}
          students={students}
          existingSessions={sessions}
          weeklyConflicts={weeklyConflicts}
          onApply={handleWizardApply}
          onCancel={() => setWizardOpen(false)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
