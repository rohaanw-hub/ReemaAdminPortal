import { useState } from "react";
import NewEventModal from "./NewEventModal";
import { format24hTo12h } from "../../helpers";

const TYPE_COLORS = {
  Workshop: { bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd" },
  Meeting: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  Training: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
  Other: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
};

export default function EventDetailModal({
  event,
  employees,
  isAdmin,
  onUpdate,
  onDelete,
  onClose,
}) {
  const [editing, setEditing] = useState(false);

  const col = TYPE_COLORS[event.type] ?? TYPE_COLORS.Other;
  const staffNames = employees
    .filter((e) => event.staffIds?.includes(e.id))
    .map((e) => e.name);

  const handleUpdate = (changes) => {
    onUpdate(event.id, changes);
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${event.title}"?`)) {
      onDelete(event.id);
      onClose();
    }
  };

  if (editing) {
    return (
      <NewEventModal
        event={event}
        employees={employees}
        onSave={handleUpdate}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: col.bg,
                color: col.color,
                border: `1px solid ${col.border}`,
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {event.type}
            </span>
            <span className="modal-title">{event.title}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-row">
          <div className="detail-label">Day</div>
          <div className="detail-value">{event.date}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Time</div>
          <div className="detail-value">
            {event.allDay
              ? "All Day"
              : `${format24hTo12h(event.startTime)} – ${format24hTo12h(event.endTime)}`}
          </div>
        </div>
        {event.location && (
          <div className="detail-row">
            <div className="detail-label">Location</div>
            <div className="detail-value">{event.location}</div>
          </div>
        )}
        {staffNames.length > 0 && (
          <div className="detail-row">
            <div className="detail-label">Staff</div>
            <div className="detail-value">{staffNames.join(", ")}</div>
          </div>
        )}
        {event.description && (
          <div className="detail-row">
            <div className="detail-label">Notes</div>
            <div className="detail-value">{event.description}</div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {isAdmin && (
            <>
              <button
                className="btn btn-outline"
                onClick={handleDelete}
                style={{ color: "#dc2626", borderColor: "#dc2626" }}
              >
                Delete
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
