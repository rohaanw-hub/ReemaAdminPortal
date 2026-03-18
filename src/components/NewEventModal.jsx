import { useState } from "react";
import { OPEN_DAYS, empIsAdmin } from "../../helpers";
import ModalShell from "./ModalShell";

const EVENT_TYPES = ["Workshop", "Meeting", "Training", "Other"];

function blankEvent(day, startTime) {
  const endHour = startTime
    ? (() => {
        const [h, m] = startTime.split(":").map(Number);
        const endH = h + 1;
        return `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      })()
    : "";
  return {
    title: "",
    date: day ?? "Mon",
    startTime: startTime ?? "",
    endTime: endHour,
    description: "",
    location: "Eye Level Missouri City",
    staffIds: [],
    type: "Workshop",
    allDay: false,
  };
}

export default function NewEventModal({
  initDay,
  initTime,
  employees,
  event: existingEvent,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(
    existingEvent ?? blankEvent(initDay, initTime),
  );

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const toggleStaff = (id) => {
    setForm((f) => ({
      ...f,
      staffIds: f.staffIds.includes(id)
        ? f.staffIds.filter((x) => x !== id)
        : [...f.staffIds, id],
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  const isEditing = !!existingEvent;

  const footer = (
    <>
      <button className="btn btn-outline" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={!form.title.trim()}
      >
        {isEditing ? "Save Changes" : "Create Event"}
      </button>
    </>
  );

  return (
    <ModalShell
      title={isEditing ? "Edit Event" : "New Event"}
      onClose={onCancel}
      footer={footer}
    >
      <div className="form-group">
        <label className="form-label">Event Title *</label>
        <input
          className="form-input"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Math Enrichment Workshop"
          autoFocus
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Day</label>
          <select
            className="form-select"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          >
            {OPEN_DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          className="form-label"
        >
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => set("allDay", e.target.checked)}
          />
          All Day
        </label>
      </div>

      {!form.allDay && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              className="form-input"
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              className="form-input"
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          className="form-input"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Optional details..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Staff Involved (optional)</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: "8px",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            maxHeight: 120,
            overflowY: "auto",
          }}
        >
          {employees
            .filter((e) => !empIsAdmin(e))
            .map((e) => (
              <label
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  padding: "2px 6px",
                  background: form.staffIds.includes(e.id)
                    ? "#FFF0F2"
                    : "#f8fafc",
                  borderRadius: 4,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: form.staffIds.includes(e.id)
                    ? "#E31837"
                    : "#e2e8f0",
                  color: form.staffIds.includes(e.id) ? "#E31837" : "#475569",
                }}
              >
                <input
                  type="checkbox"
                  style={{ display: "none" }}
                  checked={form.staffIds.includes(e.id)}
                  onChange={() => toggleStaff(e.id)}
                />
                {e.name.split(" ")[0]}
              </label>
            ))}
        </div>
      </div>
    </ModalShell>
  );
}
