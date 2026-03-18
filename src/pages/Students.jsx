import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  DAYS,
  GRADES,
  serializeSchedule,
} from "../../helpers";
import { useSortableTable } from "../hooks/useSortableTable";
import ScheduleEditor from "../components/ScheduleEditor";
import AttendanceBar from "../components/AttendanceBar";
import Th from "../components/Th";

function blankForm() {
  const schedule = {};
  DAYS.forEach((d) => {
    schedule[d] = { enabled: false, time: "" };
  });
  return {
    name: "",
    grade: "3rd",
    schedule,
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentName2: "",
    parentPhone2: "",
    notes: "",
    status: "active",
    attendance: 100,
    sessions: 0,
    enrollDate: new Date().toISOString().split("T")[0],
  };
}

function AddStudentModal({ onClose, onSave, isEmailTaken }) {
  const [form, setForm] = useState(blankForm());
  const [emailError, setEmailError] = useState("");

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (field === "parentEmail") setEmailError("");
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert("Name is required");
    if (!form.parentEmail.trim()) {
      setEmailError("Email is required to create a profile");
      return;
    }
    if (isEmailTaken(form.parentEmail)) {
      setEmailError("This email is already associated with an account");
      return;
    }
    onSave({ ...form, schedule: serializeSchedule(form.schedule) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Student</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Student Name *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="First Last"
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

        <div className="form-section">Parent / Guardian 1</div>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            className="form-input"
            value={form.parentName}
            onChange={(e) => set("parentName", e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={form.parentPhone}
              onChange={(e) => set("parentPhone", e.target.value)}
              placeholder="(713) 555-0100"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className="form-input"
              type="email"
              value={form.parentEmail}
              onChange={(e) => set("parentEmail", e.target.value)}
              placeholder="jane@email.com"
              style={emailError ? { borderColor: "#E31837" } : {}}
            />
            {emailError && (
              <div style={{ color: "#E31837", fontSize: 12, marginTop: 4 }}>
                {emailError}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">Parent / Guardian 2 (optional)</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.parentName2}
              onChange={(e) => set("parentName2", e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={form.parentPhone2}
              onChange={(e) => set("parentPhone2", e.target.value)}
              placeholder="(713) 555-0101"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Learning goals, special considerations..."
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Add Student
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Students() {
  const { students, setStudents, currentUser, isEmailTaken, sendInvite } =
    useApp();
  const isTeacher = currentUser?.role === "teacher";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const allGrades = useMemo(
    () => ["All", ...new Set(students.map((s) => s.grade))],
    [students],
  );

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const matchSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.parentName.toLowerCase().includes(search.toLowerCase());
        const matchGrade = filterGrade === "All" || s.grade === filterGrade;
        return matchSearch && matchGrade;
      }),
    [students, search, filterGrade],
  );

  const { sortedData, sortKey, sortDir, handleSort } =
    useSortableTable(filtered);

  const handleAdd = (formData) => {
    const newId = Math.max(0, ...students.map((s) => s.id)) + 1;
    setStudents((prev) => [...prev, { ...formData, id: newId }]);
    sendInvite(formData.parentName, formData.parentEmail, "parent");
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        {!isTeacher && (
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Student
          </button>
        )}
      </div>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Search by name or parent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 160 }}
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
        >
          {allGrades.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <Th
                  label="Name"
                  col="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <Th
                  label="Grade"
                  col="grade"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <Th
                  label="Enroll Date"
                  col="enrollDate"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((s) => (
                <tr
                  key={s.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/students/${s.id}`)}
                >
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
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                        <div className="text-sm">{s.parentName}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.grade}</td>
                  <td>{s.enrollDate}</td>
                  <td>
                    <AttendanceBar pct={s.attendance} />
                  </td>
                  <td>
                    <span
                      className={`badge ${s.status === "active" ? "badge-green" : "badge-gray"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", color: "#94a3b8" }}
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddStudentModal
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
          isEmailTaken={isEmailTaken}
        />
      )}
    </div>
  );
}
