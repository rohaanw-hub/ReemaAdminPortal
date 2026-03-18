import { useState, useMemo, useEffect } from "react";

export function usePagination(data, defaultPageSize = 25) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset to page 1 whenever data length changes (search/filter applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // Clamp currentPage if data shrinks
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const paginationInfo = useMemo(() => {
    const start = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, data.length);
    return { start, end, total: data.length };
  }, [data.length, safePage, pageSize]);

  const handleSetPageSize = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    paginatedData,
    currentPage: safePage,
    totalPages,
    pageSize,
    setPage: setCurrentPage,
    setPageSize: handleSetPageSize,
    paginationInfo,
  };
}
