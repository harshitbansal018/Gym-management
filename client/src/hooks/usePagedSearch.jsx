import { useEffect, useMemo, useState } from "react";

// Client-side search + pagination over an already-loaded array of rows.
// `keys` limits which fields are searched (defaults to every field on the row).
// Works for any list — table rows or card data.
export function usePagedSearch(rows, { keys, pageSize = 10 } = {}) {
  const [queryText, setQueryText] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const fields = keys || Object.keys(row);
      return fields.some((key) => {
        const value = row[key];
        return value != null && String(value).toLowerCase().includes(q);
      });
    });
  }, [rows, queryText, keys]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Jump back to page 1 whenever the search term changes.
  useEffect(() => { setPage(1); }, [queryText]);
  // Clamp the page if results shrink (e.g. after a reload or delete).
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return {
    queryText,
    setQueryText,
    page,
    setPage,
    totalPages,
    pageRows,
    total,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total)
  };
}
