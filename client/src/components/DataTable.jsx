import { FiEdit2, FiEye, FiKey, FiLoader, FiTrash2 } from "react-icons/fi";
import { statusClass } from "../utils/statusStyles";
import { usePagedSearch } from "../hooks/usePagedSearch";
import { Pagination, SearchInput } from "./TableControls";

// Generic table. Action buttons only render when a matching handler is passed,
// so there are no dead buttons. `busyId` shows a spinner on the row currently
// being deleted and disables its actions.
//
// Opt-in search + pagination:
//   searchable  - true to search all columns, or an array of keys to search.
//   pageSize    - rows per page (enables the pager). Omit to show all rows.
export function DataTable({ columns, rows, actions = false, onResetPassword, onView, onEdit, onDelete, busyId, searchable, pageSize, searchPlaceholder = "Search…" }) {
  const showActions = actions || onResetPassword || onView || onEdit || onDelete;
  const searchKeys = Array.isArray(searchable) ? searchable : columns.map((column) => column.key);
  const paged = usePagedSearch(rows, { keys: searchKeys, pageSize: pageSize || rows.length || 1 });

  const enabled = Boolean(searchable || pageSize);
  const displayRows = enabled ? paged.pageRows : rows;
  const colSpan = columns.length + (showActions ? 1 : 0);

  return (
    <div className="surface overflow-hidden">
      {searchable && (
        <div className="border-b border-slate-200 p-3 dark:border-slate-800">
          <SearchInput value={paged.queryText} onChange={paged.setQueryText} placeholder={searchPlaceholder} />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950/60">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                  {column.label}
                </th>
              ))}
              {showActions && <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {paged.queryText ? "No results match your search." : "No records found yet."}
                </td>
              </tr>
            ) : displayRows.map((row, index) => {
              const busy = busyId && row.id === busyId;
              return (
                <tr key={row.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {column.key === "status" ? (
                        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${statusClass(row[column.key])}`}>
                          {row[column.key]}
                        </span>
                      ) : row[column.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {onResetPassword && (
                          <button className="btn-secondary px-2" aria-label="Reset password" title="Reset login password" disabled={busy} onClick={() => onResetPassword(row)}><FiKey /></button>
                        )}
                        {onView && (
                          <button className="btn-secondary px-2" aria-label="View" title="View details" disabled={busy} onClick={() => onView(row)}><FiEye /></button>
                        )}
                        {onEdit && (
                          <button className="btn-secondary px-2" aria-label="Edit" title="Edit" disabled={busy} onClick={() => onEdit(row)}><FiEdit2 /></button>
                        )}
                        {onDelete && (
                          <button className="btn-secondary px-2 text-rose-600" aria-label="Delete" title="Delete" disabled={busy} onClick={() => onDelete(row)}>
                            {busy ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pageSize && (
        <Pagination page={paged.page} totalPages={paged.totalPages} onPage={paged.setPage} rangeStart={paged.rangeStart} rangeEnd={paged.rangeEnd} total={paged.total} />
      )}
    </div>
  );
}
