import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  formatDate,
  DAYS,
  GRADES,
  GRADE_LEVELS,
  serializeSchedule,
  deserializeSchedule,
  validatePhotoFile,
  attendanceColor,
} from "../../helpers";
import ScheduleEditor from "../components/ScheduleEditor";
import GradeLevelPill from "../components/GradeLevelPill";
import { ChevronLeft, Pencil } from "lucide-react";

const PROGRESS_SUBJECTS = ["math", "reading", "writing"];
const SUBJECT_LABEL = { math: "Math", reading: "Reading", writing: "Writing" };
const SUBJECT_COLOR = {
  math: { bg: "#dcfce7", color: "#166534" },
  reading: { bg: "#FFF0F2", color: "#B5112A" },
  writing: { bg: "#ede9fe", color: "#5b21b6" },
};

function EditModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    name: student.name,
    grade: student.grade,
    schedule: deserializeSchedule(student.schedule),
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    parentName2: student.parentName2 || "",
    parentPhone2: student.parentPhone2 || "",
    notes: student.notes || "",
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = () =>
    onSave({ ...form, schedule: serializeSchedule(form.schedule) });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Edit Student</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Grade</label>
            <select
              className="form-select"
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
            >
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">Schedule</div>
        <ScheduleEditor
          schedule={form.schedule}
          onChange={(s) => setForm((f) => ({ ...f, schedule: s }))}
        />

        <div className="form-section">Parent / Guardian</div>
        <div className="form-group">
          <label className="form-label">Primary Name</label>
          <input
            className="form-input"
            value={form.parentName}
            onChange={(e) => set("parentName", e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={form.parentPhone}
              onChange={(e) => set("parentPhone", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={form.parentEmail}
              onChange={(e) => set("parentEmail", e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Secondary Name (optional)</label>
            <input
              className="form-input"
              value={form.parentName2}
              onChange={(e) => set("parentName2", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Secondary Phone</label>
            <input
              className="form-input"
              value={form.parentPhone2}
              onChange={(e) => set("parentPhone2", e.target.value)}
            />
          </div>
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

export default function StudentProfile() {
  const { id } = useParams();
  const { students, setStudents, sessions, employees, currentUser } = useApp();
  const isTeacher = currentUser?.role === "teacher";
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const isAdmin = currentUser?.role === "admin";
  const canEditProgress = isAdmin || isTeacher;

  const student = students.find((s) => s.id === Number(id));
  if (!student) return <div className="card">Student not found.</div>;

  const stuSessions = sessions.filter((s) => s.studentId === student.id);

  const handleSaveEdit = (updated) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, ...updated } : s)),
    );
    setShowEdit(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    const { ok, error } = validatePhotoFile(file);
    if (!ok) {
      if (error) setPhotoError(error);
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, photo: ev.target.result } : s,
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  const startEditGrade = (subj) => {
    setEditingSubject(subj);
    setEditingValue(student.gradeLevel?.[subj] ?? "");
  };

  const saveGradeLevel = () => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,
              gradeLevel: {
                ...(s.gradeLevel ?? {}),
                [editingSubject]: editingValue,
              },
            }
          : s,
      ),
    );
    setEditingSubject(null);
  };

  return (
    <div>
      <div className="back-link" onClick={() => navigate("/students")}>
        <ChevronLeft size={16} /> Back to Students
      </div>

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
              background: student.photo
                ? "transparent"
                : getAvatarBg(student.name),
              color: getAvatarText(student.name),
              overflow: "hidden",
              padding: 0,
            }}
          >
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              getInitials(student.name)
            )}
          </div>
          {isAdmin && (
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: "#E31837",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {student.photo ? "Change photo" : "Upload photo"}
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
          <div style={{ fontWeight: 700, fontSize: 20 }}>{student.name}</div>
          <div className="text-sm" style={{ fontSize: 13, marginTop: 2 }}>
            Grade {student.grade} · Enrolled {formatDate(student.enrollDate)}
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
                fontWeight: 700,
                fontSize: 14,
                color: attendanceColor(student.attendance),
              }}
            >
              {student.attendance}% attendance
            </span>
            <span className="text-sm">· {student.sessions} sessions</span>
          </div>
        </div>
        {!isTeacher && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowEdit(true)}
          >
            Edit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["overview", "schedule", "family"].map((t) => (
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
        <div>
          {/* Academic Progress — full width, top */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title">Academic Progress</div>
            {PROGRESS_SUBJECTS.map((subj) => {
              const level = student.gradeLevel?.[subj] ?? "—";
              const isEditing = editingSubject === subj;
              return (
                <div
                  key={subj}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#0f172a",
                    }}
                  >
                    {SUBJECT_LABEL[subj]}
                  </div>
                  {isEditing ? (
                    <>
                      <select
                        className="form-select"
                        style={{ width: 120, padding: "4px 8px", fontSize: 13 }}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      >
                        {GRADE_LEVELS.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={saveGradeLevel}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditingSubject(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {level === "—" ? (
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>
                          —
                        </span>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            flex: 1,
                          }}
                        >
                          <GradeLevelPill
                            subject={subj}
                            level={level}
                            size="lg"
                          />
                          <div
                            className="progress-bar"
                            style={{ height: 5, maxWidth: 200 }}
                            title={`${level} — level ${GRADE_LEVELS.indexOf(level) + 1} of ${GRADE_LEVELS.length}`}
                          >
                            <div
                              className="progress-fill"
                              style={{
                                width: `${((GRADE_LEVELS.indexOf(level) + 1) / GRADE_LEVELS.length) * 100}%`,
                                background: SUBJECT_COLOR[subj].color,
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {canEditProgress && (
                        <button
                          onClick={() => startEditGrade(subj)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: "2px 4px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title={`Edit ${SUBJECT_LABEL[subj]} grade level`}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="profile-grid">
            <div className="card">
              <div className="section-title">Student Info</div>
              <div className="detail-row">
                <div className="detail-label">Grade</div>
                <div className="detail-value">{student.grade}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Attendance</div>
                <div className="detail-value">{student.attendance}%</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Sessions Completed</div>
                <div className="detail-value">{student.sessions}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Enrolled</div>
                <div className="detail-value">
                  {formatDate(student.enrollDate)}
                </div>
              </div>
              {student.notes && (
                <div className="detail-row">
                  <div className="detail-label">Notes</div>
                  <div className="detail-value">{student.notes}</div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="section-title">Assigned Sessions</div>
              {stuSessions.length === 0 ? (
                <p className="text-sm">No sessions assigned.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Tutor</th>
                        <th>Subject</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stuSessions.map((s) => {
                        const emp = employees.find(
                          (x) => x.id === s.employeeId,
                        );
                        return (
                          <tr key={s.id}>
                            <td>{s.day}</td>
                            <td>{s.time}</td>
                            <td>{emp?.name ?? "Unassigned"}</td>
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
        </div>
      )}

      {/* Schedule Tab */}
      {tab === "schedule" && (
        <div className="card">
          <div className="section-title">Weekly Schedule</div>
          <div className="schedule-grid">
            {DAYS.map((day) => (
              <div key={day} className="day-col">
                <div className="day-label">{day}</div>
                {(student.schedule[day] || []).map((slot) => (
                  <div key={slot} className="session-block">
                    {slot}
                  </div>
                ))}
                {!student.schedule[day] && (
                  <div className="text-sm" style={{ textAlign: "center" }}>
                    —
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="section-title">Session Details</div>
            {stuSessions.length === 0 ? (
              <p className="text-sm">No sessions assigned.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Tutor</th>
                      <th>Subject</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stuSessions.map((s) => {
                      const emp = employees.find((x) => x.id === s.employeeId);
                      return (
                        <tr key={s.id}>
                          <td>{s.day}</td>
                          <td>{s.time}</td>
                          <td>{emp?.name ?? "Unassigned"}</td>
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

      {/* Family Tab */}
      {tab === "family" && (
        <div className="profile-grid">
          <div className="card">
            <div className="section-title">Primary Guardian</div>
            <div className="detail-row">
              <div className="detail-label">Name</div>
              <div className="detail-value">{student.parentName}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{student.parentPhone}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{student.parentEmail}</div>
            </div>
          </div>

          {student.parentName2 ? (
            <div className="card">
              <div className="section-title">Secondary Guardian</div>
              <div className="detail-row">
                <div className="detail-label">Name</div>
                <div className="detail-value">{student.parentName2}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{student.parentPhone2}</div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="section-title">Secondary Guardian</div>
              <p className="text-sm">No secondary guardian on file.</p>
            </div>
          )}
        </div>
      )}

      {showEdit && (
        <EditModal
          student={student}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
