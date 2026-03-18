import { useApp } from "../../AppContext";
import {
  getInitials,
  getAvatarBg,
  getAvatarText,
  calcHours,
} from "../../helpers";

export default function Payroll() {
  const { employees } = useApp();

  const rows = employees.map((e) => {
    const hours = calcHours(e.clockIns);
    const gross = hours * e.hourlyRate;
    return { ...e, hours, gross };
  });

  const totalGross = rows.reduce((acc, r) => acc + r.gross, 0);
  const totalHours = rows.reduce((acc, r) => acc + r.hours, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payroll</h1>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Hours</div>
          <div className="stat-value">{totalHours.toFixed(1)}</div>
          <div className="text-sm">this period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gross Payroll</div>
          <div className="stat-value">${totalGross.toFixed(2)}</div>
          <div className="text-sm">before deductions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Employees</div>
          <div className="stat-value">{employees.length}</div>
          <div className="text-sm">on payroll</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Rate</th>
                <th>Hours</th>
                <th>Gross Pay</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
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
                      <span style={{ fontWeight: 500 }}>{e.name}</span>
                    </div>
                  </td>
                  <td>{e.role}</td>
                  <td>${e.hourlyRate}/hr</td>
                  <td>{e.hours.toFixed(1)}</td>
                  <td style={{ fontWeight: 600 }}>${e.gross.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
