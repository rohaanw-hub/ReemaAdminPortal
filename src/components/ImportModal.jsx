import { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  STUDENT_IMPORT_FIELDS,
  EMPLOYEE_IMPORT_FIELDS,
  validateImportRow,
  downloadSampleCSV,
  exportToCSV,
} from "../../helpers";

const SKIP = "__skip__";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

// Case-insensitive header auto-match (strips non-alphanumeric)
function autoMatch(label, headers) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(label);
  return headers.find((h) => norm(h) === target) || SKIP;
}

// Step indicator row
function StepIndicator({ step }) {
  const labels = ["Upload", "Map Columns", "Preview", "Done"];
  return (
    <div
      style={{
        display: "flex",
        marginBottom: 24,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 16,
      }}
    >
      {labels.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={n} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                margin: "0 auto 4px",
                background: done ? "#16a34a" : active ? "#E31837" : "#e5e7eb",
                color: done || active ? "#fff" : "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {done ? "✓" : n}
            </div>
            <div
              style={{
                fontSize: 11,
                color: active ? "#E31837" : "#6b7280",
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ImportModal({ type, onClose, onImport, isEmailTaken }) {
  const isStudent = type === "student";
  const fields = isStudent ? STUDENT_IMPORT_FIELDS : EMPLOYEE_IMPORT_FIELDS;
  const title = isStudent ? "Import Students" : "Import Employees";

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [validatedRows, setValidatedRows] = useState([]);
  const [importResult, setImportResult] = useState(null);

  // ── Step 1: parse uploaded file ──────────────────────────────────────────
  const processFile = useCallback(
    (f) => {
      setFileError("");
      if (!f) return;
      // Check size before parsing
      if (f.size > MAX_FILE_BYTES) {
        setFileError("File exceeds 5 MB. Please split into smaller files.");
        return;
      }
      const ext = f.name.split(".").pop().toLowerCase();
      if (!["csv", "xlsx", "xls"].includes(ext)) {
        setFileError(
          "Only CSV (.csv) and Excel (.xlsx, .xls) files are accepted.",
        );
        return;
      }
      setFile(f);
      if (ext === "csv") {
        Papa.parse(f, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const hdrs = result.meta.fields || [];
            const initial = {};
            fields.forEach((fld) => {
              initial[fld.key] = autoMatch(fld.label, hdrs);
            });
            setHeaders(hdrs);
            setRawRows(result.data);
            setFieldMap(initial);
            setStep(2);
          },
          error: () =>
            setFileError("Failed to parse CSV. Check that the file is valid."),
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const wb = XLSX.read(e.target.result, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
            if (!raw.length) {
              setFileError("The file appears to be empty.");
              return;
            }
            const hdrs = raw[0].map(String);
            const rows = raw
              .slice(1)
              .map((row) => {
                const obj = {};
                hdrs.forEach((h, i) => {
                  obj[h] = row[i] !== undefined ? String(row[i]) : "";
                });
                return obj;
              })
              .filter((r) => Object.values(r).some((v) => v !== ""));
            const initial = {};
            fields.forEach((fld) => {
              initial[fld.key] = autoMatch(fld.label, hdrs);
            });
            setHeaders(hdrs);
            setRawRows(rows);
            setFieldMap(initial);
            setStep(2);
          } catch {
            setFileError(
              "Failed to parse Excel file. Check that the file is valid.",
            );
          }
        };
        reader.readAsArrayBuffer(f);
      }
    },
    [fields],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile],
  );

  // ── Step 2: column mapper ────────────────────────────────────────────────
  const allRequiredMapped = fields
    .filter((f) => f.required)
    .every((f) => fieldMap[f.key] && fieldMap[f.key] !== SKIP);

  // ── Step 3: validate all rows ────────────────────────────────────────────
  const runValidation = () => {
    const results = rawRows.map((row) => ({
      ...validateImportRow(row, fieldMap, type, isEmailTaken),
      raw: row,
    }));
    setValidatedRows(results);
    setStep(3);
  };

  const validCount = validatedRows.filter((r) => r.valid).length;
  const errorCount = validatedRows.filter((r) => !r.valid).length;

  const downloadErrors = () => {
    const errRows = validatedRows
      .filter((r) => !r.valid)
      .map((r) => ({ ...r.raw, _errors: r.errors.join("; ") }));
    exportToCSV(errRows, "import-errors.csv");
  };

  // ── Step 4: commit import ────────────────────────────────────────────────
  const runImport = () => {
    const records = validatedRows.filter((r) => r.valid).map((r) => r.record);
    onImport(records);
    setImportResult({ imported: records.length, skipped: errorCount });
    setStep(4);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{
          maxWidth: 700,
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <StepIndicator step={step} />

        {/* ── Step 1: Upload ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById("import-file-input").click()
              }
              style={{
                border: `2px dashed ${isDragging ? "#E31837" : "#d1d5db"}`,
                borderRadius: 8,
                padding: 40,
                textAlign: "center",
                cursor: "pointer",
                background: isDragging ? "#FFF0F2" : "#f9fafb",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Drag &amp; drop your file here
              </div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                or click to browse
              </div>
              <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>
                Accepts .csv, .xlsx, .xls — max 5 MB
              </div>
              <input
                id="import-file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => processFile(e.target.files[0])}
              />
            </div>
            {fileError && (
              <div style={{ color: "#E31837", marginTop: 10, fontSize: 13 }}>
                {fileError}
              </div>
            )}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                className="btn btn-outline"
                style={{ fontSize: 12 }}
                onClick={() => downloadSampleCSV(type)}
              >
                ↓ Download sample template
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Column Mapper ──────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 10, color: "#374151", fontSize: 14 }}>
              <strong>{rawRows.length}</strong> rows detected from{" "}
              <strong>{file?.name}</strong>
            </div>
            {rawRows.length > 0 && (
              <div
                style={{
                  marginBottom: 14,
                  padding: "8px 12px",
                  background: "#f3f4f6",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                <strong>Preview:</strong>{" "}
                {Object.values(rawRows[0]).slice(0, 5).map(String).join(" · ")}
                {rawRows[1] && (
                  <>
                    {" "}
                    &nbsp;|&nbsp;{" "}
                    {Object.values(rawRows[1])
                      .slice(0, 5)
                      .map(String)
                      .join(" · ")}
                  </>
                )}
              </div>
            )}
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
              Match your file&#39;s columns to the app fields. Required fields
              are marked with <span style={{ color: "#E31837" }}>*</span>.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 20px",
                marginBottom: 20,
              }}
            >
              {fields.map((fld) => (
                <div key={fld.key}>
                  <label className="form-label" style={{ fontSize: 12 }}>
                    {fld.label}
                    {fld.required && (
                      <span style={{ color: "#E31837" }}> *</span>
                    )}
                  </label>
                  <select
                    className="form-select"
                    value={fieldMap[fld.key] || SKIP}
                    onChange={(e) =>
                      setFieldMap((m) => ({ ...m, [fld.key]: e.target.value }))
                    }
                  >
                    <option value={SKIP}>— Skip this field —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {!allRequiredMapped && (
              <div style={{ color: "#E31837", fontSize: 12, marginBottom: 12 }}>
                Map all required fields before continuing.
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!allRequiredMapped}
                onClick={runValidation}
              >
                Preview →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview & Validation ──────────────────────────────── */}
        {step === 3 && (
          <div>
            <div
              style={{
                marginBottom: 12,
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#16a34a", fontWeight: 600 }}>
                ✓ {validCount} ready to import
              </span>
              {errorCount > 0 && (
                <>
                  <span style={{ color: "#E31837", fontWeight: 600 }}>
                    ✗ {errorCount} with errors (will be skipped)
                  </span>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: 11, padding: "2px 10px" }}
                    onClick={downloadErrors}
                  >
                    Download errors
                  </button>
                </>
              )}
            </div>
            <div
              style={{
                maxHeight: 340,
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
              }}
            >
              <table
                style={{
                  width: "100%",
                  fontSize: 12,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <th
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      #
                    </th>
                    {fields
                      .filter(
                        (f) => fieldMap[f.key] && fieldMap[f.key] !== SKIP,
                      )
                      .map((f) => (
                        <th
                          key={f.key}
                          style={{
                            padding: "6px 8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          {f.label}
                        </th>
                      ))}
                    <th
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        background: row.valid ? "#f0fdf4" : "#fff1f2",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td style={{ padding: "5px 8px", color: "#9ca3af" }}>
                        {i + 1}
                      </td>
                      {fields
                        .filter(
                          (f) => fieldMap[f.key] && fieldMap[f.key] !== SKIP,
                        )
                        .map((f) => (
                          <td key={f.key} style={{ padding: "5px 8px" }}>
                            {String(row.raw[fieldMap[f.key]] ?? "")}
                          </td>
                        ))}
                      <td style={{ padding: "5px 8px" }}>
                        {row.valid ? (
                          <span style={{ color: "#16a34a" }}>✓ Ready</span>
                        ) : (
                          <span style={{ color: "#E31837" }}>
                            {row.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                disabled={validCount === 0}
                onClick={runImport}
              >
                Import {validCount} record{validCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Results ───────────────────────────────────────────── */}
        {step === 4 && importResult && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {importResult.imported} {isStudent ? "student" : "employee"}
              {importResult.imported !== 1 ? "s" : ""} imported successfully
            </div>
            {importResult.skipped > 0 && (
              <div style={{ color: "#6b7280" }}>
                {importResult.skipped} row
                {importResult.skipped !== 1 ? "s" : ""} skipped due to errors
              </div>
            )}
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
