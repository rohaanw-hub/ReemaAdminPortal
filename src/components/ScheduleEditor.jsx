import { DAYS } from "../../helpers";

export default function ScheduleEditor({ schedule, onChange }) {
  const toggleDay = (day) =>
    onChange({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled },
    });

  const setTime = (day, val) =>
    onChange({
      ...schedule,
      [day]: { ...schedule[day], time: val },
    });

  return (
    <>
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
            className={`checkbox-chip${schedule[day].enabled ? " selected" : ""}`}
            style={{ minWidth: 52 }}
          >
            <input
              type="checkbox"
              checked={schedule[day].enabled}
              onChange={() => toggleDay(day)}
            />
            {day}
          </label>
          {schedule[day].enabled && (
            <input
              className="form-input"
              style={{ flex: 1, fontSize: 13 }}
              placeholder="e.g. 3PM-7PM"
              value={schedule[day].time}
              onChange={(e) => setTime(day, e.target.value)}
            />
          )}
        </div>
      ))}
    </>
  );
}
