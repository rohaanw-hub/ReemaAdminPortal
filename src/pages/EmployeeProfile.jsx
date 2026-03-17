import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  formatDate,
  calcReliability,
  reliabilityColor,
  calcHours,
  DAYS,
  SUBJECTS,
  ED_LEVELS,
  ALL_TIME_SLOTS,
} from "../../helpers";
import { ChevronLeft } from "lucide-react";

const ROLES = ["Lead Tutor", "Reading Specialist", "SAT Specialist", "Tutor"];

function EditModal({ emp, onClose, onSave, isAdmin, isAdminAccount }) {
  const initSchedule = () => {
    const s = {};
    DAYS.forEach((d) => {
      s[d] = {
        enabled: !!emp.schedule[d]?.length,
        time: emp.schedule[d]?.[0] || "",
      };
    });
    return s;
  };

  const [form, setForm] = useState({
    name: emp.name,
    role: emp.role,
    email: emp.email,
    phone: emp.phone,
    grade: emp.grade,
    subjects: [...emp.subjects],
    hourlyRate: emp.hourlyRate,
    conflicts: emp.conflicts || "",
    notes: emp.notes || "",
    schedule: initSchedule(),
    accountRole: emp.accountRole ?? "teacher",
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const toggleSubject = (s) =>
    set(
      "subjects",
      form.subjects.includes(s)
        ? form.subjects.filter((x) => x !== s)
        : [...form.subjects, s],
    );

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: { ...f.schedule[day], enabled: !f.schedule[day].enabled },
      },
    }));

  const setDayTime = (day, val) =>
    setForm((f) => ({
      ...f,
      schedule: { ...f.schedule, [day]: { ...f.schedule[day], time: val } },
    }));

  const handleSave = () => {
    const schedule = {};
    DAYS.forEach((d) => {
      if (form.schedule[d].enabled && form.schedule[d].time) {
        schedule[d] = [form.schedule[d].time];
      }
    });
    onSave({ ...form, schedule });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Edit Employee</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Position</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {isAdmin && (
          <div className="form-group">
            <label className="form-label">Account Role</label>
            {isAdminAccount ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-red">Admin</span>
                <span
                  className="text-sm"
                  style={{ color: "#94a3b8" }}
                  title="Default admin account — role cannot be changed"
                >
                  Default admin account — role cannot be changed
                </span>
              </div>
            ) : (
              <select
                className="form-select"
                value={form.accountRole}
                onChange={(e) => set("accountRole", e.target.value)}
              >
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            )}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Education Level</label>
            <select
              className="form-select"
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
            >
              {ED_LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Hourly Rate ($)</label>
            <input
              className="form-input"
              type="number"
              min="10"
              max="100"
              value={form.hourlyRate}
              onChange={(e) => set("hourlyRate", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Subjects</label>
          <div className="checkbox-group">
            {SUBJECTS.map((s) => (
              <label
                key={s}
                className={`checkbox-chip${form.subjects.includes(s) ? " selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={form.subjects.includes(s)}
                  onChange={() => toggleSubject(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">Availability</div>
        {DAYS.map((day) => (
          <div
            key={day}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <label
              className={`checkbox-chip${form.schedule[day].enabled ? " selected" : ""}`}
              style={{ minWidth: 52 }}
            >
              <input
                type="checkbox"
                checked={form.schedule[day].enabled}
                onChange={() => toggleDay(day)}
              />
              {day}
            </label>
            {form.schedule[day].enabled && (
              <input
                className="form-input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder="e.g. 3PM-7PM"
                value={form.schedule[day].time}
                onChange={(e) => setDayTime(day, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="form-group" style={{ marginTop: 8 }}>
          <label className="form-label">Conflicts / Restrictions</label>
          <textarea
            className="form-textarea"
            value={form.conflicts}
            onChange={(e) => set("conflicts", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const {
    employees,
    setEmployees,
    sessions,
    students,
    weeklyConflicts,
    addWeeklyConflict,
    removeWeeklyConflict,
    currentUser,
    addNotification,
  } = useApp();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [showAddConflict, setShowAddConflict] = useState(false);
  const blankConflict = {
    day: "Mon",
    allDay: false,
    startTime: "3PM",
    endTime: "4PM",
    reason: "",
  };
  const [conflictForm, setConflictForm] = useState(blankConflict);

  const setConflict = (field, val) =>
    setConflictForm((f) => ({ ...f, [field]: val }));

  const handleAddConflict = () => {
    if (!conflictForm.reason.trim()) return;
    addWeeklyConflict(emp.id, {
      day: conflictForm.day,
      startTime: conflictForm.allDay ? "All Day" : conflictForm.startTime,
      endTime: conflictForm.allDay ? "All Day" : conflictForm.endTime,
      reason: conflictForm.reason.trim(),
    });
    setConflictForm(blankConflict);
    setShowAddConflict(false);
  };

  const emp = employees.find((e) => e.id === Number(id));
  if (!emp) return <div className="card">Employee not found.</div>;

  // Teachers can only view their own profile
  if (isTeacher && Number(id) !== currentUser.profileId) {
    navigate(`/employees/${currentUser.profileId}`, { replace: true });
    return null;
  }

  const isAdminAccount = emp.email.toLowerCase() === "mehdi.reema@gmail.com";
  const rel = calcReliability(emp.callouts, emp.totalShifts);
  const hours = calcHours(emp.clockIns);
  const empSessions = sessions.filter((s) => s.employeeId === emp.id);
  const myConflicts = weeklyConflicts[emp.id] || [];

  const handleSaveEdit = (updated) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, ...updated } : e)),
    );
    setShowEdit(false);
  };

  const logCallout = () => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === emp.id
          ? { ...e, callouts: e.callouts + 1, totalShifts: e.totalShifts + 1 }
          : e,
      ),
    );
    addNotification("warning", `${emp.name} logged a callout`, "admin");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setPhotoError("Only JPG, PNG, or WEBP files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("File must be under 2MB.");
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEmployees((prev) =>
        prev.map((x) =>
          x.id === emp.id ? { ...x, photo: ev.target.result } : x,
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  const canUploadPhoto =
    isAdmin || (isTeacher && emp.id === currentUser?.profileId);

  return (
    <div>
      {!isTeacher && (
        <div className="back-link" onClick={() => navigate("/employees")}>
          <ChevronLeft size={16} /> Back to Employees
        </div>
      )}

      {/* Header */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            className="avatar"
            style={{
              width: 64,
              height: 64,
              fontSize: 22,
              background: emp.photo ? "transparent" : getAvatarBg(emp.name),
              color: getAvatarText(emp.name),
              overflow: "hidden",
              padding: 0,
            }}
          >
            {emp.photo ? (
              <img
                src={emp.photo}
                alt={emp.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              getInitials(emp.name)
            )}
          </div>
          {canUploadPhoto && (
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: "#E31837",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {emp.photo ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
              </label>
              {photoError && (
                <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>
                  {photoError}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{emp.name}</div>
          <div className="text-sm" style={{ fontSize: 13, marginTop: 2 }}>
            {emp.role} · {emp.grade}
            {" · "}
            <span
              className={`badge ${emp.accountRole === "admin" ? "badge-red" : "badge-gray"}`}
              style={{ fontSize: 11, verticalAlign: "middle" }}
            >
              {emp.accountRole === "admin" ? "Admin" : "Teacher"}
            </span>
          </div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: reliabilityColor(rel),
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {rel}% reliable
            </span>
            <span className="text-sm">·</span>
            <span className="text-sm">
              {emp.callouts} callouts / {emp.totalShifts} shifts
            </span>
            <span className="text-sm">·</span>
            <span className="text-sm">${emp.hourlyRate}/hr</span>
          </div>
        </div>
        {!isTeacher && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-warning btn-sm" onClick={logCallout}>
              Log Callout
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["overview", "schedule", "hours", "reliability"].map((t) => (
          <button
            key={t}
            className={`tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="profile-grid">
          <div className="card">
            <div className="section-title">Contact & Details</div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{emp.email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{emp.phone}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Education</div>
              <div className="detail-value">{emp.grade}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Subjects</div>
              <div className="detail-value">{emp.subjects.join(", ")}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Hire Date</div>
              <div className="detail-value">{formatDate(emp.hireDate)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Hourly Rate</div>
              <div className="detail-value">${emp.hourlyRate}/hr</div>
            </div>
            {emp.conflicts && (
              <div className="detail-row">
                <div className="detail-label">Conflicts</div>
                <div className="detail-value">{emp.conflicts}</div>
              </div>
            )}
            {emp.notes && (
              <div className="detail-row">
                <div className="detail-label">Notes</div>
                <div className="detail-value">{emp.notes}</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">Assigned Sessions</div>
            {empSessions.length === 0 ? (
              <p className="text-sm">No sessions assigned.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empSessions.map((s) => {
                      const student = students.find(
                        (x) => x.id === s.studentId,
                      );
                      return (
                        <tr key={s.id}>
                          <td>{s.day}</td>
                          <td>{s.time}</td>
                          <td>{student?.name ?? "—"}</td>
                          <td>{s.subject}</td>
                          <td>
                            <span
                              className={`badge ${s.status === "cancelled" ? "badge-red" : "badge-green"}`}
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
            )}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {tab === "schedule" && (
        <div className="card">
          <div className="section-title">Weekly Availability</div>
          <div className="schedule-grid">
            {DAYS.map((day) => (
              <div key={day} className="day-col">
                <div className="day-label">{day}</div>
                {(emp.schedule[day] || []).map((slot) => (
                  <div key={slot} className="session-block">
                    {slot}
                  </div>
                ))}
                {!emp.schedule[day] && (
                  <div className="text-sm" style={{ textAlign: "center" }}>
                    —
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* This Week's Conflicts */}
          <div
            style={{
              marginTop: 24,
              borderTop: "1px solid #f1f5f9",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div className="section-title" style={{ marginBottom: 0 }}>
                This Week's Conflicts
                {myConflicts.length > 0 && (
                  <span className="badge badge-red" style={{ marginLeft: 8 }}>
                    {myConflicts.length}
                  </span>
                )}
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddConflict((v) => !v)}
              >
                {showAddConflict ? "Cancel" : "+ Add Conflict"}
              </button>
            </div>

            {myConflicts.length === 0 && !showAddConflict && (
              <p className="text-sm">No conflicts this week.</p>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: myConflicts.length ? 12 : 0,
              }}
            >
              {myConflicts.map((c) => (
                <span
                  key={c.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {c.day}{" "}
                  {c.startTime === "All Day"
                    ? "All Day"
                    : `${c.startTime}–${c.endTime}`}
                  {c.reason ? ` — ${c.reason}` : ""}
                  <button
                    onClick={() => removeWeeklyConflict(emp.id, c.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#991b1b",
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {showAddConflict && (
              <div
                style={{
                  background: "#fff8f8",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: 14,
                  marginTop: 8,
                }}
              >
                <div className="form-row" style={{ marginBottom: 10 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Day</label>
                    <select
                      className="form-select"
                      value={conflictForm.day}
                      onChange={(e) => setConflict("day", e.target.value)}
                    >
                      {DAYS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">All Day?</label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 6,
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={conflictForm.allDay}
                        onChange={(e) =>
                          setConflict("allDay", e.target.checked)
                        }
                      />
                      All Day
                    </label>
                  </div>
                </div>
                {!conflictForm.allDay && (
                  <div className="form-row" style={{ marginBottom: 10 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Start Time</label>
                      <select
                        className="form-select"
                        value={conflictForm.startTime}
                        onChange={(e) =>
                          setConflict("startTime", e.target.value)
                        }
                      >
                        {ALL_TIME_SLOTS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">End Time</label>
                      <select
                        className="form-select"
                        value={conflictForm.endTime}
                        onChange={(e) => setConflict("endTime", e.target.value)}
                      >
                        {ALL_TIME_SLOTS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">Reason</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Doctor's appointment"
                    value={conflictForm.reason}
                    onChange={(e) => setConflict("reason", e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleAddConflict}
                >
                  Add Conflict
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="section-title">Sessions by Day</div>
            {DAYS.map((day) => {
              const daySessions = empSessions.filter((s) => s.day === day);
              if (daySessions.length === 0) return null;
              return (
                <div key={day} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 6,
                      color: "#475569",
                    }}
                  >
                    {day}
                  </div>
                  {daySessions.map((s) => {
                    const student = students.find((x) => x.id === s.studentId);
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "6px 0",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: "#64748b", minWidth: 44 }}>
                          {s.time}
                        </span>
                        <span>{student?.name ?? "—"}</span>
                        <span className="text-sm">· {s.subject}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hours Tab */}
      {tab === "hours" && (
        <div className="card">
          <div className="section-title">Hours Summary</div>
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
                label: "Hours Logged",
                value: hours.toFixed(1),
                sub: "this period",
              },
              {
                label: "Total Shifts",
                value: emp.totalShifts,
                sub: "all time",
              },
              {
                label: "Est. Earnings",
                value: `$${(hours * emp.hourlyRate).toFixed(2)}`,
                sub: "before deductions",
              },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div
                  style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}
                >
                  {s.value}
                </div>
                <div className="text-sm">{s.sub}</div>
              </div>
            ))}
          </div>
          {emp.clockIns.length === 0 ? (
            <p className="text-sm">No clock-in records yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {emp.clockIns.map((c, i) => {
                    const dur = c.out
                      ? (
                          (new Date(c.out) - new Date(c.in)) /
                          3_600_000
                        ).toFixed(2)
                      : "—";
                    return (
                      <tr key={i}>
                        <td>{new Date(c.in).toLocaleString()}</td>
                        <td>
                          {c.out
                            ? new Date(c.out).toLocaleString()
                            : "In progress"}
                        </td>
                        <td>{dur !== "—" ? `${dur} hrs` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reliability Tab */}
      {tab === "reliability" && (
        <div className="card">
          <div className="section-title">Reliability Report</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Reliability Score",
                value: `${rel}%`,
                color: reliabilityColor(rel),
              },
              {
                label: "Callouts",
                value: emp.callouts,
                color: emp.callouts > 2 ? "#dc2626" : "#d97706",
              },
              {
                label: "Total Shifts",
                value: emp.totalShifts,
                color: "#E31837",
              },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              <span>Reliability Score</span>
              <span style={{ fontWeight: 700, color: reliabilityColor(rel) }}>
                {rel}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div
                className="progress-fill"
                style={{ width: `${rel}%`, background: reliabilityColor(rel) }}
              />
            </div>
          </div>

          <div className="text-sm" style={{ marginTop: 12 }}>
            {rel >= 90 &&
              "Excellent reliability — fewer than 10% callout rate."}
            {rel >= 75 &&
              rel < 90 &&
              "Good reliability — minor improvement recommended."}
            {rel < 75 &&
              "Reliability needs attention — please review callout history."}
          </div>

          {!isTeacher && (
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-warning" onClick={logCallout}>
                Log a Callout
              </button>
            </div>
          )}
        </div>
      )}

      {showEdit && (
        <EditModal
          emp={emp}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
          isAdmin={isAdmin}
          isAdminAccount={isAdminAccount}
        />
      )}
    </div>
  );
}
