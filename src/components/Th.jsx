export default function Th({ label, col, sortKey, sortDir, onSort }) {
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
