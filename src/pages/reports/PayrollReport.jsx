import { useState, useMemo } from "react";
import { useApp } from "../../../AppContext";
import { formatCurrency, calculateHours, exportToCSV } from "../../../helpers";
import { useSortableTable } from "../../hooks/useSortableTable";

function Th({ label, col, sortKey, sortDir, onSort }) {
  return (
    <th
      style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
      onClick={() => onSort(col)}
    >
      {label}
      {sortKey === col && (
        <span style={{ marginLeft: 4, fontSize: 10 }}>
          {sortDir === "asc" ? "▲" : "▼"}
        </span>
      )}
    </th>
  );
}

const PERIOD_OPTIONS = ["weekly", "monthly"];
const PERIOD_MULTIPLIER = { weekly: 1, monthly: 4 };
const PERIOD_LABEL = { weekly: "Weekly", monthly: "Monthly (×4 est.)" };

export default function PayrollReport() {
  const { employees, sessions } = useApp();

  const [filterEmployee, setFilterEmployee] = useState("");
  const [period, setPeriod] = useState("weekly");

  const multiplier = PERIOD_MULTIPLIER[period];

  const rows = useMemo(() => {
    const list = filterEmployee
      ? employees.filter((e) => e.id === Number(filterEmployee))
      : employees;

    return list.map((e) => {
      const baseHours = calculateHours(sessions, e.id);
      const hours = parseFloat((baseHours * multiplier).toFixed(2));
      const gross = hours * e.hourlyRate;
      return {
        _id: e.id,
        name: e.name,
        role: e.role,
        hours,
        hourlyRate: e.hourlyRate,
        gross,
      };
    });
  }, [employees, sessions, filterEmployee, multiplier]);

  const { sortedData, sortKey, sortDir, handleSort } = useSortableTable(rows);

  const totalHours = rows.reduce((acc, r) => acc + r.hours, 0);
  const totalGross = rows.reduce((acc, r) => acc + r.gross, 0);
  const avgRate =
    rows.length > 0
      ? rows.reduce((acc, r) => acc + r.hourlyRate, 0) / rows.length
      : 0;

  function handleExport() {
    const today = new Date().toISOString().slice(0, 10);
    const exportRows = rows.map((r) => ({
      Employee: r.name,
      Role: r.role,
      "Hours Worked": r.hours.toFixed(2),
      "Hourly Rate": `$${r.hourlyRate.toFixed(2)}`,
      "Gross Pay": formatCurrency(r.gross),
      Period: PERIOD_LABEL[period],
    }));
    exportToCSV(exportRows, `payroll-report-${today}.csv`);
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Payroll Report</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Hours and gross pay calculated from scheduled sessions
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={rows.length === 0}
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div>
          <label style={labelStyle}>Employee</label>
          <select
            className="form-select"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Pay Period</label>
          <select
            className="form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {period === "monthly" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 12,
              color: "#64748b",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 7,
              padding: "8px 11px",
            }}
          >
            Monthly estimate = weekly hours × 4
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div className="stat-card">
          <div className="stat-label">Total Hours</div>
          <div className="stat-value">{totalHours.toFixed(1)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Gross Pay</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {formatCurrency(totalGross)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Employees</div>
          <div className="stat-value">{rows.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Hourly Rate</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {rows.length > 0 ? formatCurrency(avgRate) : "—"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {rows.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            No payroll data matches the selected filters.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <Th
                    label="Employee"
                    col="name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <th>Role</th>
                  <Th
                    label="Hours Worked"
                    col="hours"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <th>Hourly Rate</th>
                  <Th
                    label="Gross Pay"
                    col="gross"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.role}</td>
                    <td>{r.hours.toFixed(2)} hrs</td>
                    <td>${r.hourlyRate.toFixed(2)}/hr</td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(r.gross)}
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {PERIOD_LABEL[period]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
  display: "block",
  marginBottom: 5,
};
