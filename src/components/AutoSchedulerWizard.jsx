import { useState, useMemo } from "react";
import {
  OPEN_DAYS,
  getSlotsForDay,
  isTutorAvailableAt,
  hasWeeklyConflict,
  formatShortDate,
  autoAssignSessions,
} from "../../helpers";

const SCHED_CLASSROOMS = ["Classroom 1", "Classroom 2", "Classroom 3"];

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
      }}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background:
                n < current ? "#E31837" : n === current ? "#E31837" : "#e2e8f0",
              color: n <= current ? "#fff" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {n < current ? "✓" : n}
          </div>
          {n < total && (
            <div
              style={{
                width: 32,
                height: 2,
                background: n < current ? "#E31837" : "#e2e8f0",
              }}
            />
          )}
        </div>
      ))}
      <span style={{ fontSize: 12, color: "#64748b", marginLeft: 6 }}>
        Step {current} of {total}
      </span>
    </div>
  );
}

// ─── Step 1: Week & Scope ─────────────────────────────────────────────────────
function Step1({
  weekDates,
  selectedDays,
  setSelectedDays,
  replaceAll,
  setReplaceAll,
}) {
  const monDate = weekDates?.Mon;
  const satDate = weekDates?.Sat;
  const weekLabel =
    monDate && satDate
      ? `${formatShortDate(monDate)} – ${formatShortDate(satDate)}`
      : "Current week";

  const toggleDay = (d) =>
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Week being scheduled</label>
        <div
          style={{
            padding: "8px 12px",
            background: "#f8fafc",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#374151",
            fontWeight: 500,
          }}
        >
          {weekLabel}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Days to schedule</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {OPEN_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: selectedDays.includes(d) ? "#E31837" : "#e2e8f0",
                background: selectedDays.includes(d)
                  ? "#FFF0F2"
                  : "transparent",
                color: selectedDays.includes(d) ? "#E31837" : "#475569",
                fontWeight: selectedDays.includes(d) ? 600 : 400,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {d}
              {weekDates?.[d] && (
                <span
                  style={{
                    fontSize: 10,
                    marginLeft: 4,
                    fontWeight: 400,
                    opacity: 0.7,
                  }}
                >
                  {formatShortDate(weekDates[d])}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Scheduling mode</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="replaceMode"
              checked={!replaceAll}
              onChange={() => setReplaceAll(false)}
              style={{ marginTop: 2 }}
            />
            <span>
              <strong>Fill empty slots only</strong>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Add sessions where none exist; keep current schedule intact.
              </div>
            </span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="replaceMode"
              checked={replaceAll}
              onChange={() => setReplaceAll(true)}
              style={{ marginTop: 2 }}
            />
            <span>
              <strong>Replace entire week</strong>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Remove all existing sessions for selected days and rebuild.
              </div>
            </span>
          </label>
        </div>
        {replaceAll && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: 6,
              fontSize: 12,
              color: "#92400e",
            }}
          >
            ⚠ All existing sessions for the selected days will be removed and
            replaced.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Select Students ──────────────────────────────────────────────────
function Step2({
  students,
  selectedStudentIds,
  setSelectedStudentIds,
  existingSessions,
  weekDates,
  selectedDays,
}) {
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected =
    students.length > 0 && selectedStudentIds.length === students.length;

  const toggleStudent = (id) =>
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const isFullyScheduled = (student) => {
    return selectedDays.every((day) => {
      const date = weekDates?.[day];
      const slots = getSlotsForDay(day);
      return slots.some((slot) =>
        existingSessions.some(
          (s) =>
            s.studentId === student.id &&
            s.day === day &&
            (date ? s.date === date : true) &&
            s.time === slot &&
            s.status !== "cancelled",
        ),
      );
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <label className="form-label" style={{ margin: 0 }}>
          Students ({selectedStudentIds.length} / {students.length} selected)
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 12, padding: "3px 10px" }}
            onClick={() => setSelectedStudentIds(students.map((s) => s.id))}
          >
            Select all
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 12, padding: "3px 10px" }}
            onClick={() => setSelectedStudentIds([])}
          >
            Deselect all
          </button>
        </div>
      </div>

      <input
        className="form-input"
        placeholder="Search students..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <div
        style={{
          maxHeight: 280,
          overflowY: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 6,
        }}
      >
        {filtered.length === 0 && (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            No students found
          </div>
        )}
        {filtered.map((s, i) => {
          const checked = selectedStudentIds.includes(s.id);
          const fullyScheduled = isFullyScheduled(s);
          return (
            <label
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderBottom:
                  i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                cursor: "pointer",
                background: checked ? "#FFF0F2" : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleStudent(s.id)}
              />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
                {s.name}
              </span>
              {fullyScheduled && (
                <span
                  style={{
                    fontSize: 10,
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontWeight: 600,
                  }}
                >
                  Fully scheduled
                </span>
              )}
            </label>
          );
        })}
      </div>
      {!allSelected && students.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          {students.length - selectedStudentIds.length} student(s) not selected.
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Teachers & Graders ───────────────────────────────────────────────
function Step3({
  employees,
  classroomTeachers,
  setClassroomTeachers,
  selectedDays,
  weeklyConflicts,
}) {
  const teachers = employees.filter((e) => e.accountRole !== "admin");

  const setTeacher = (classroom, empId) =>
    setClassroomTeachers((prev) => ({
      ...prev,
      [classroom]: empId ? Number(empId) : null,
    }));

  const getConflicts = (empId) => {
    if (!empId) return [];
    const emp = employees.find((e) => e.id === Number(empId));
    if (!emp) return [];
    return selectedDays.reduce((acc, day) => {
      const slot = getSlotsForDay(day)[0];
      if (!slot) return acc;
      if (!isTutorAvailableAt(emp, day, slot)) {
        acc.push(`${day}: unavailable (schedule)`);
      } else if (hasWeeklyConflict(weeklyConflicts, emp.id, day, slot)) {
        acc.push(`${day}: weekly conflict`);
      }
      return acc;
    }, []);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Assign a teacher to each classroom for {selectedDays.join(", ")}.
      </p>
      {SCHED_CLASSROOMS.map((classroom) => {
        const selected = classroomTeachers[classroom];
        const conflicts = getConflicts(selected);
        return (
          <div className="form-group" key={classroom}>
            <label className="form-label">{classroom}</label>
            <select
              className="form-select"
              value={selected ?? ""}
              onChange={(e) => setTeacher(classroom, e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {teachers.map((t) => {
                const tConflicts = selectedDays.reduce((acc, day) => {
                  const slot = getSlotsForDay(day)[0];
                  if (!slot) return acc;
                  if (!isTutorAvailableAt(t, day, slot))
                    acc.push(`unavailable ${day}`);
                  else if (hasWeeklyConflict(weeklyConflicts, t.id, day, slot))
                    acc.push(`conflict ${day}`);
                  return acc;
                }, []);
                const label =
                  tConflicts.length > 0
                    ? `${t.name} — ⚠ ${tConflicts.join(", ")}`
                    : t.name;
                return (
                  <option key={t.id} value={t.id}>
                    {label}
                  </option>
                );
              })}
            </select>
            {conflicts.length > 0 && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "#92400e",
                  background: "#fef3c7",
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #fde68a",
                }}
              >
                ⚠ {conflicts.join(" · ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 4: Review & Confirm ─────────────────────────────────────────────────
function Step4({ proposed, conflicts, studentMap, employeeMap }) {
  return (
    <div>
      {conflicts.length > 0 && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            background: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: 6,
          }}
        >
          <strong style={{ fontSize: 12, color: "#92400e" }}>
            ⚠ {conflicts.length} conflict(s) detected (you may still apply)
          </strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {conflicts.map((c, i) => (
              <li key={i} style={{ fontSize: 12, color: "#92400e" }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: 10, fontSize: 13, color: "#374151" }}>
        <strong>{proposed.length}</strong> session(s) to create.
      </div>

      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              {["Day", "Time", "Classroom", "Teacher", "Student"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "6px 10px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#475569",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proposed.map((s, i) => {
              const student = studentMap[s.studentId];
              const emp = s.employeeId ? employeeMap[s.employeeId] : null;
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "5px 10px" }}>{s.day}</td>
                  <td style={{ padding: "5px 10px", whiteSpace: "nowrap" }}>
                    {s.time}
                  </td>
                  <td style={{ padding: "5px 10px" }}>{s.classroom}</td>
                  <td style={{ padding: "5px 10px" }}>
                    {emp ? emp.name.split(" ")[0] : "—"}
                  </td>
                  <td style={{ padding: "5px 10px" }}>
                    {student ? student.name : "—"}
                  </td>
                </tr>
              );
            })}
            {proposed.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}
                >
                  No sessions to create.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function AutoSchedulerWizard({
  weekDates,
  employees,
  students,
  existingSessions,
  weeklyConflicts,
  onApply,
  onCancel,
}) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [selectedDays, setSelectedDays] = useState([...OPEN_DAYS]);
  const [replaceAll, setReplaceAll] = useState(false);

  // Step 2 state
  const [selectedStudentIds, setSelectedStudentIds] = useState(
    students.map((s) => s.id),
  );

  // Step 3 state
  const [classroomTeachers, setClassroomTeachers] = useState(() => {
    const init = {};
    SCHED_CLASSROOMS.forEach((c) => {
      init[c] = null;
    });
    return init;
  });

  const selectedStudents = useMemo(
    () => students.filter((s) => selectedStudentIds.includes(s.id)),
    [students, selectedStudentIds],
  );

  const studentMap = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s])),
    [students],
  );

  const employeeMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );

  // Step 4: compute proposed sessions and conflicts
  const { sessions: proposed, conflicts } = useMemo(() => {
    if (step < 4) return { sessions: [], conflicts: [] };
    return autoAssignSessions(
      selectedStudents,
      classroomTeachers,
      selectedDays,
      weekDates,
      existingSessions,
      weeklyConflicts,
      employees,
      replaceAll,
    );
  }, [
    step,
    selectedStudents,
    classroomTeachers,
    selectedDays,
    weekDates,
    existingSessions,
    weeklyConflicts,
    employees,
    replaceAll,
  ]);

  const canNext =
    step === 1
      ? selectedDays.length > 0
      : step === 2
        ? selectedStudentIds.length > 0
        : step === 3
          ? true
          : false;

  const handleApply = () => {
    onApply({ proposed, replaceAll, selectedDays, weekDates });
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{
          maxWidth: 580,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div className="modal-header">
          <span className="modal-title">Auto-Scheduler Wizard</span>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <StepIndicator current={step} total={4} />

        {step === 1 && (
          <Step1
            weekDates={weekDates}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            replaceAll={replaceAll}
            setReplaceAll={setReplaceAll}
          />
        )}
        {step === 2 && (
          <Step2
            students={students}
            selectedStudentIds={selectedStudentIds}
            setSelectedStudentIds={setSelectedStudentIds}
            existingSessions={existingSessions}
            weekDates={weekDates}
            selectedDays={selectedDays}
          />
        )}
        {step === 3 && (
          <Step3
            employees={employees}
            classroomTeachers={classroomTeachers}
            setClassroomTeachers={setClassroomTeachers}
            selectedDays={selectedDays}
            weeklyConflicts={weeklyConflicts}
          />
        )}
        {step === 4 && (
          <Step4
            proposed={proposed}
            conflicts={conflicts}
            studentMap={studentMap}
            employeeMap={employeeMap}
          />
        )}

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          {step > 1 && (
            <button
              className="btn btn-outline"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
            >
              Next
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleApply}
              disabled={proposed.length === 0}
            >
              Apply Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
