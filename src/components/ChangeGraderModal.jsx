import { useState } from "react";

export default function ChangeGraderModal({
  day,
  currentGraderId,
  employees,
  onSave,
  onCancel,
}) {
  const [selectedId, setSelectedId] = useState(
    currentGraderId != null ? String(currentGraderId) : "",
  );

  const currentGrader = employees.find((e) => e.id === currentGraderId);

  const handleSave = () => {
    onSave(selectedId ? Number(selectedId) : null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Change Grader — {day}</span>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Current Grader</label>
          <div
            style={{
              padding: "8px 12px",
              background: "#f8fafc",
              borderRadius: 6,
              fontSize: 13,
              color: "#475569",
              fontWeight: 500,
            }}
          >
            {currentGrader?.name ?? "—"}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">New Grader</label>
          <select
            className="form-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {employees
              .filter((e) => e.accountRole !== "admin")
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} —{" "}
                  {e.accountRole === "teacher"
                    ? "Teacher"
                    : (e.role ?? "Staff")}
                </option>
              ))}
          </select>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
