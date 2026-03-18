const PAGE_SIZES = [10, 25, 50, 100];

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  setPage,
  setPageSize,
  paginationInfo,
  label = "items",
}) {
  const { start, end, total } = paginationInfo;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 16,
        fontSize: 13,
        color: "#64748b",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>Show:</span>
        {PAGE_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setPageSize(size)}
            style={{
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid",
              borderColor: pageSize === size ? "#E31837" : "#e2e8f0",
              background: pageSize === size ? "#FFF0F2" : "#fff",
              color: pageSize === size ? "#E31837" : "#64748b",
              fontWeight: pageSize === size ? 700 : 400,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {size}
          </button>
        ))}
        <span>per page</span>
      </div>

      <span>
        {total === 0
          ? `No ${label} found`
          : `Showing ${start}–${end} of ${total} ${label}`}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={navBtnStyle(currentPage === 1)}
        >
          ‹ Prev
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} style={{ padding: "2px 4px" }}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={pageBtnStyle(p === currentPage)}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={navBtnStyle(currentPage === totalPages)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

function navBtnStyle(disabled) {
  return {
    padding: "4px 10px",
    borderRadius: 4,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: disabled ? "#cbd5e1" : "#475569",
    cursor: disabled ? "default" : "pointer",
    fontSize: 12,
  };
}

function pageBtnStyle(active) {
  return {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid",
    borderColor: active ? "#E31837" : "#e2e8f0",
    background: active ? "#E31837" : "#fff",
    color: active ? "#fff" : "#475569",
    fontWeight: active ? 700 : 400,
    cursor: "pointer",
    fontSize: 12,
    minWidth: 28,
  };
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("...");
    pages.push(total);
  }
  return pages;
}
