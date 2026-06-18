import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative w-full sm:max-w-xs ${className}`}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="app-input pl-9"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}

// Prev/next pager with a "showing X–Y of Z" summary. Renders nothing when the
// list fits on a single page.
export function Pagination({ page, totalPages, onPage, rangeStart, rangeEnd, total }) {
  if (total === 0 || totalPages <= 1) return null;
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800 sm:flex-row">
      <span className="text-slate-500 dark:text-slate-400">Showing {rangeStart}–{rangeEnd} of {total}</span>
      <div className="flex items-center gap-2">
        <button className="btn-secondary px-2 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><FiChevronLeft /></button>
        <span className="text-slate-600 dark:text-slate-300">Page {page} of {totalPages}</span>
        <button className="btn-secondary px-2 py-1 disabled:opacity-50" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><FiChevronRight /></button>
      </div>
    </div>
  );
}
