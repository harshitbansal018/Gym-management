import { FiTrendingUp } from "react-icons/fi";

export function StatCard({ label, value, meta }) {
  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className="rounded-md bg-brand-50 p-2 text-brand-600 dark:bg-brand-600/10">
          <FiTrendingUp />
        </span>
      </div>
      <p className="mt-3 text-xs font-medium text-emerald-600">{meta}</p>
    </div>
  );
}
