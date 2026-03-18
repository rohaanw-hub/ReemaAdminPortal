import { attendanceColor } from "../../helpers";

export default function AttendanceBar({ pct }) {
  return (
    <div className="att-bar-wrap">
      <span style={{ fontSize: 12, minWidth: 36 }}>{pct}%</span>
      <div className="att-bar">
        <div
          className="att-bar-fill"
          style={{ width: `${pct}%`, background: attendanceColor(pct) }}
        />
      </div>
    </div>
  );
}
