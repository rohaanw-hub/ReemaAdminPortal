import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  calcReliability,
  reliabilityColor,
  DAYS,
  ED_LEVELS,
  serializeSchedule,
} from "../../helpers";
import { useSortableTable } from "../hooks/useSortableTable";
import { usePagination } from "../hooks/usePagination";
import ScheduleEditor from "../components/ScheduleEditor";
import Th from "../components/Th";
import ImportModal from "../components/ImportModal";
import Pagination from "../components/Pagination";

function blankForm() {
  const schedule = {};
  DAYS.forEach((d) => {
    schedule[d] = { enabled: false, time: "" };
  });
  return {
    name: "",
    email: "",
    phone: "",
    grade: "College Freshman",
    hourlyRate: 15,
    schedule,
    conflicts: "",
    notes: "",
    status: "active",
    callouts: 0,
    totalShifts: 0,
    clockIns: [],
    hireDate: new Date().toISOString().split("T")[0],
  };
}

function AddEmployeeModal({ onClose, onSave, isEmailTaken }) {
  const [form, setForm] = useState(blankForm());
  const [emailError, setEmailError] = useState("");

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (field === "email") setEmailError("");
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert("Name is required");
    if (!form.email.trim()) {
      setEmailError("Email is required to create a profile");
      return;
    }
    if (isEmailTaken(form.email)) {
      setEmailError("This email is already associated with an account");
      return;
    }
    onSave({
      ...form,
      schedule: serializeSchedule(form.schedule),
      accountRole: "teacher",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Employee</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Smith"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@reema.com"
              style={emailError ? { borderColor: "#E31837" } : {}}
            />
            {emailError && (
              <div style={{ color: "#E31837", fontSize: 12, marginTop: 4 }}>
                {emailError}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(713) 555-0100"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Year in School</label>
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

        <div className="form-section">Availability</div>
        <ScheduleEditor
          schedule={form.schedule}
          onChange={(s) => setForm((f) => ({ ...f, schedule: s }))}
        />

        <div className="form-group" style={{ marginTop: 8 }}>
          <label className="form-label">Conflicts / Restrictions</label>
          <textarea
            className="form-textarea"
            value={form.conflicts}
            onChange={(e) => set("conflicts", e.target.value)}
            placeholder="Any scheduling conflicts or restrictions..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Additional notes..."
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Add Employee
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const { employees, setEmployees, currentUser, isEmailTaken, sendInvite } =
    useApp();
  const isAdmin = currentUser?.role === "admin";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [employees, search],
  );

  const withReliability = useMemo(
    () =>
      filtered.map((e) => ({
        ...e,
        _rel: calcReliability(e.callouts, e.totalShifts),
      })),
    [filtered],
  );

  const { sortedData, sortKey, sortDir, handleSort } =
    useSortableTable(withReliability);

  const {
    paginatedData,
    currentPage,
    totalPages,
    pageSize,
    setPage,
    setPageSize,
    paginationInfo,
  } = usePagination(sortedData, 25);

  const handleAdd = (formData) => {
    const newId = Math.max(0, ...employees.map((e) => e.id)) + 1;
    setEmployees((prev) => [...prev, { ...formData, id: newId }]);
    sendInvite(formData.name, formData.email, "teacher");
    setShowModal(false);
  };

  const handleImport = (records) => {
    let nextId = Math.max(0, ...employees.map((e) => e.id)) + 1;
    const newEmployees = records.map((r) => ({ ...r, id: nextId++ }));
    setEmployees((prev) => [...prev, ...newEmployees]);
    newEmployees.forEach((emp) => sendInvite(emp.name, emp.email, "teacher"));
    setShowImport(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && (
            <button
              className="btn btn-outline"
              onClick={() => setShowImport(true)}
            >
              ↑ Import
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                <th>Account</th>
                <th>Year in School</th>
                <th>Rate</th>
                <Th
                  label="Hire Date"
                  col="hireDate"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <Th
                  label="Reliability"
                  col="_rel"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((e) => {
                const rel = e._rel;
                return (
                  <tr
                    key={e.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/employees/${e.id}`)}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="avatar"
                          style={{
                            background: getAvatarBg(e.name),
                            color: getAvatarText(e.name),
                          }}
                        >
                          {getInitials(e.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{e.name}</div>
                          <div className="text-sm">{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${e.accountRole === "admin" ? "badge-red" : "badge-gray"}`}
                      >
                        {e.accountRole === "admin" ? "Admin" : "Teacher"}
                      </span>
                    </td>
                    <td>{e.grade}</td>
                    <td>${e.hourlyRate}/hr</td>
                    <td>{e.hireDate}</td>
                    <td>
                      <span
                        style={{
                          color: reliabilityColor(rel),
                          fontWeight: 700,
                        }}
                      >
                        {rel}%
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${e.status === "active" ? "badge-green" : "badge-gray"}`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", color: "#94a3b8" }}
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          paginationInfo={paginationInfo}
          label="employees"
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </div>

      {showModal && (
        <AddEmployeeModal
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
          isEmailTaken={isEmailTaken}
        />
      )}
      {showImport && (
        <ImportModal
          type="employee"
          onClose={() => setShowImport(false)}
          onImport={handleImport}
          isEmailTaken={isEmailTaken}
        />
      )}
    </div>
  );
}
