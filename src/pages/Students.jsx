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
  exportToCSV,
  exportToExcel,
} from "../../helpers";
import { useSortableTable } from "../hooks/useSortableTable";
import ScheduleEditor from "../components/ScheduleEditor";
import AttendanceBar from "../components/AttendanceBar";
import Th from "../components/Th";
import ImportModal from "../components/ImportModal";

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
  const isParent = currentUser?.role === "parent";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // TODO(v2): enforce Admin-only import server-side once Supabase auth is in place.
  // Currently the button is hidden from non-admins but there is no server guard.
  const handleImport = (records) => {
    let nextId = Math.max(0, ...students.map((s) => s.id)) + 1;
    const newStudents = records.map((r) => ({ ...r, id: nextId++ }));
    setStudents((prev) => [...prev, ...newStudents]);
    newStudents.forEach((s) =>
      sendInvite(s.parentName, s.parentEmail, "parent"),
    );
    setShowImport(false);
  };

  const toExportRow = (s) => ({
    "First Name": s.name.split(" ")[0] ?? "",
    "Last Name": s.name.split(" ").slice(1).join(" ") ?? "",
    Grade: s.grade,
    "Enroll Date": s.enrollDate,
    "Attendance (%)": s.attendance,
    "Sessions Completed": s.sessions,
    "Math Grade Level": s.gradeLevel?.math ?? "",
    "Reading Grade Level": s.gradeLevel?.reading ?? "",
    "Writing Grade Level": s.gradeLevel?.writing ?? "",
    "Parent Email": s.parentEmail,
    Notes: s.notes,
  });

  const today = new Date().toISOString().split("T")[0];

  const handleExportCSV = () => {
    exportToCSV(sortedData.map(toExportRow), `students-export-${today}.csv`);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportToExcel(
      sortedData.map(toExportRow),
      `students-export-${today}.xlsx`,
      { percentCols: ["Attendance (%)"], dateCols: ["Enroll Date"] },
    );
    setShowExportMenu(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        {!isParent && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowExportMenu((v) => !v)}
              >
                ↓ Export
              </button>
              {showExportMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 100,
                    minWidth: 160,
                  }}
                >
                  <button
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                    onClick={handleExportCSV}
                  >
                    Export as CSV (.csv)
                  </button>
                  <button
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                    onClick={handleExportExcel}
                  >
                    Export as Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
            {!isTeacher && (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowImport(true)}
                >
                  ↑ Import
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  + Add Student
                </button>
              </>
            )}
          </div>
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
                <th>Progress</th>
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
                    {s.gradeLevel ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ color: "#166534" }}>
                          M:{s.gradeLevel.math}
                        </span>
                        <span style={{ color: "#B5112A" }}>
                          R:{s.gradeLevel.reading}
                        </span>
                        <span style={{ color: "#5b21b6" }}>
                          W:{s.gradeLevel.writing}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                    )}
                  </td>
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
                    colSpan={6}
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
      {showImport && (
        <ImportModal
          type="student"
          onClose={() => setShowImport(false)}
          onImport={handleImport}
          isEmailTaken={isEmailTaken}
        />
      )}
    </div>
  );
}
