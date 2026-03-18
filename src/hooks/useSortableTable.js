import { useState, useMemo } from "react";

/**
 * useSortableTable — shared sorting hook for data tables.
 *
 * @param {Array} data  The (filtered) array to sort.
 * @returns {{ sortedData, sortKey, sortDir, handleSort }}
 *
 * Clicking a column header cycles: asc → desc → default (unsorted).
 */
export function useSortableTable(data) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  function handleSort(key) {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return { sortedData, sortKey, sortDir, handleSort };
}
