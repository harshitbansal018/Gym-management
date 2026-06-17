import { FiEdit2, FiTrash2 } from "react-icons/fi";

export function PlanCard({ plan, onDelete, editable = false }) {
  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.duration}</p>
        </div>
        <p className="text-xl font-bold text-brand-600">{plan.price}</p>
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
      {editable && (
        <div className="mt-5 flex gap-2">
          <button className="btn-secondary flex-1"><FiEdit2 /> Edit</button>
          <button className="btn-secondary flex-1 text-rose-600" onClick={() => onDelete(plan.name)}><FiTrash2 /> Delete</button>
        </div>
      )}
    </div>
  );
}
