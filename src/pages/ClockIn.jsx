import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  calcHours,
} from "../../helpers";

export default function ClockIn() {
  const { employees, setEmployees, addNotification } = useApp();

  const clockIn = (id) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              clockIns: [
                ...e.clockIns,
                { in: new Date().toISOString(), out: null },
              ],
            }
          : e,
      ),
    );
    const emp = employees.find((e) => e.id === id);
    addNotification("info", `${emp.name} clocked in`, "admin");
  };

  const clockOut = (id) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const clockIns = e.clockIns.map((c, i) =>
          i === e.clockIns.length - 1 && !c.out
            ? { ...c, out: new Date().toISOString() }
            : c,
        );
        return { ...e, clockIns };
      }),
    );
    const emp = employees.find((e) => e.id === id);
    addNotification("info", `${emp.name} clocked out`, "admin");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clock In / Out</h1>
      </div>

      {employees.map((emp) => {
        const lastEntry = emp.clockIns[emp.clockIns.length - 1];
        const isClockedIn = lastEntry && !lastEntry.out;
        const hours = calcHours(emp.clockIns);

        return (
          <div key={emp.id} className="clock-card">
            <div className="flex items-center gap-3">
              <div
                className="avatar"
                style={{
                  background: getAvatarBg(emp.name),
                  color: getAvatarText(emp.name),
                }}
              >
                {getInitials(emp.name)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{emp.name}</div>
                <div className="text-sm">
                  {emp.role} · {hours.toFixed(1)} hrs logged
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isClockedIn && (
                <span className="badge badge-green">Clocked In</span>
              )}
              {isClockedIn ? (
                <button
                  className="btn btn-danger"
                  onClick={() => clockOut(emp.id)}
                >
                  Clock Out
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => clockIn(emp.id)}
                >
                  Clock In
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
