import { useState } from "react";
import { empIsAdmin, empIsTeacher } from "../../helpers";
import ModalShell from "./ModalShell";

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

  const footer = (
    <>
      <button className="btn btn-outline" onClick={onCancel}>
        Cancel
      </button>
      <button className="btn btn-primary" onClick={handleSave}>
        Save
      </button>
    </>
  );

  return (
    <ModalShell
      title={`Change Grader — ${day}`}
      onClose={onCancel}
      footer={footer}
    >
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
            .filter((e) => !empIsAdmin(e))
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {empIsTeacher(e) ? "Teacher" : (e.role ?? "Staff")}
              </option>
            ))}
        </select>
      </div>
    </ModalShell>
  );
}
