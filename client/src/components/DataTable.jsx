import { FiEdit2, FiEye, FiKey, FiTrash2 } from "react-icons/fi";
import { statusClass } from "../utils/statusStyles";

export function DataTable({ columns, rows, actions = false, onResetPassword }) {
  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950/60">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, index) => (
              <tr key={`${row.name || row.member || index}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                    {column.key === "status" ? (
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${statusClass(row[column.key])}`}>
                        {row[column.key]}
                      </span>
                    ) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onResetPassword && (
                        <button className="btn-secondary px-2" aria-label="Reset password" title="Reset login password" onClick={() => onResetPassword(row)}><FiKey /></button>
                      )}
                      <button className="btn-secondary px-2" aria-label="View"><FiEye /></button>
                      <button className="btn-secondary px-2" aria-label="Edit"><FiEdit2 /></button>
                      <button className="btn-secondary px-2 text-rose-600" aria-label="Delete"><FiTrash2 /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
