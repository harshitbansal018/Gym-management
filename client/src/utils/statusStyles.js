export function statusClass(status) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    Expired: "bg-rose-50 text-rose-700 ring-rose-200",
    Failed: "bg-rose-50 text-rose-700 ring-rose-200",
    Suspended: "bg-rose-50 text-rose-700 ring-rose-200",
    Inactive: "bg-slate-100 text-slate-700 ring-slate-200"
  };

  const normalized = typeof status === "string" ? status.charAt(0).toUpperCase() + status.slice(1) : status;
  return styles[status] || styles[normalized] || styles.Inactive;
}
