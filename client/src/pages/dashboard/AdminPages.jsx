import { useState } from "react";
import { ChartCard } from "../../components/ChartCard";
import { DataTable } from "../../components/DataTable";
import { SectionHeader } from "../../components/SectionHeader";
import { StatCard } from "../../components/StatCard";
import { ApiState, useApiData } from "../../hooks/useApiData";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { statusClass } from "../../utils/statusStyles";

const gymColumns = [{ key: "name", label: "Gym" }, { key: "email", label: "Email" }, { key: "subscription_plan", label: "Plan" }, { key: "subscription_status", label: "Status" }];
const userColumns = [{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "is_active", label: "Active" }];
const paymentColumns = [{ key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "paid_at", label: "Date" }];

export function AdminDashboard() {
  const { data, loading, error } = useApiData("/admin/dashboard", {});
  const cards = [
    ["Total Gyms", data.totalGyms ?? 0, ""],
    ["Active Gyms", data.activeGyms ?? 0, ""],
    ["Expired Gyms", data.expiredGyms ?? 0, ""],
    ["Total Members", data.totalMembers ?? 0, ""],
    ["Monthly Revenue", `Rs. ${data.monthlyRevenue ?? 0}`, ""]
  ];

  return (
    <>
      <SectionHeader title="Platform Dashboard" subtitle="Live platform data from the backend." />
      <ApiState loading={loading} error={error}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, meta]) => <StatCard key={label} label={label} value={value} meta={meta} />)}</div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2"><ChartCard title="Monthly Revenue Chart" /><ChartCard title="Subscription Growth Chart" type="bar" dataKey="subscriptions" /></div>
      </ApiState>
    </>
  );
}

function GymManager({ title, subtitle }) {
  const state = useApiData("/admin/gyms");
  const [busyId, setBusyId] = useState(null);

  async function setStatus(gym, status) {
    setBusyId(gym.id);
    try {
      await api.patch(`/admin/gyms/${gym.id}`, { status });
      await state.reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <SectionHeader title={title} subtitle={subtitle} />
      <ApiState {...state} empty={!state.data.length}>
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/60">
                <tr>
                  {["Gym", "Email", "Plan", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {state.data.map((gym) => (
                  <tr key={gym.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{gym.name}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{gym.email}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{gym.subscription_plan}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${statusClass(gym.subscription_status)}`}>{gym.subscription_status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {gym.subscription_status !== "active" && (
                          <button className="btn-primary px-3 py-1 text-xs" disabled={busyId === gym.id} onClick={() => setStatus(gym, "active")}>Activate</button>
                        )}
                        {gym.subscription_status === "active" && (
                          <button className="btn-secondary px-3 py-1 text-xs text-rose-600" disabled={busyId === gym.id} onClick={() => setStatus(gym, "suspended")}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ApiState>
    </>
  );
}

export function AdminGyms() {
  return <GymManager title="Gyms" subtitle="Activate a gym after the owner pays you on WhatsApp." />;
}

export function AdminSubscriptions() {
  return <GymManager title="Subscriptions" subtitle="Live subscription status across all gyms — activate or suspend access here." />;
}

export function AdminRevenue() {
  const state = useApiData("/admin/payments");
  return <><SectionHeader title="Revenue" /><ApiState {...state} empty={!state.data.length}><DataTable columns={paymentColumns} rows={state.data} /></ApiState></>;
}

export function AdminUsers() {
  const state = useApiData("/admin/users");

  async function resetPassword(u) {
    const newPassword = window.prompt(`Set a new password for ${u.email}\n(8+ chars, upper, lower, number, symbol):`);
    if (!newPassword) return;
    try {
      await api.post(`/admin/users/${u.id}/reset-password`, { newPassword });
      window.alert("Password reset. Share it with the user over WhatsApp.");
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not reset password.");
    }
  }

  return (
    <>
      <SectionHeader title="Users" subtitle="Reset a locked-out user's password here." />
      <ApiState {...state} empty={!state.data.length}>
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/60">
                <tr>{["Name", "Email", "Role", "Active", "Actions"].map((h) => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {state.data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{u.name}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.email}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.role?.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-3"><button className="btn-secondary px-3 py-1 text-xs" onClick={() => resetPassword(u)}>Reset password</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ApiState>
    </>
  );
}

export function Settings({ title = "Settings" }) {
  const { user } = useAuth();
  const [msg, setMsg] = useState(null);

  async function changePassword(event) {
    event.preventDefault();
    setMsg(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("newPassword") !== data.get("confirm")) {
      setMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    try {
      await api.post("/auth/change-password", {
        currentPassword: data.get("currentPassword"),
        newPassword: data.get("newPassword")
      });
      form.reset();
      setMsg({ ok: true, text: "Password updated successfully." });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "Could not update password." });
    }
  }

  return (
    <>
      <SectionHeader title={title} subtitle="Your account and security settings." />
      <div className="surface mb-6 max-w-2xl p-6">
        <h3 className="font-bold text-slate-950 dark:text-white">Account</h3>
        <div className="mt-3 grid gap-1 text-sm text-slate-600 dark:text-slate-300">
          <p>Name: <strong>{user?.name}</strong></p>
          <p>Email: <strong>{user?.email}</strong></p>
          <p>Role: <strong>{user?.role?.replace("_", " ")}</strong></p>
        </div>
      </div>
      <form className="surface grid max-w-2xl gap-4 p-6" onSubmit={changePassword}>
        <h3 className="font-bold text-slate-950 dark:text-white">Change Password</h3>
        <input className="app-input" name="currentPassword" placeholder="Current password" type="password" required />
        <input className="app-input" name="newPassword" placeholder="New password" type="password" required />
        <input className="app-input" name="confirm" placeholder="Confirm new password" type="password" required />
        <p className="-mt-2 text-xs text-slate-500">8+ chars with upper, lower, number, and symbol.</p>
        {msg && <p className={`rounded-md p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>{msg.text}</p>}
        <button className="btn-primary w-fit">Update Password</button>
      </form>
    </>
  );
}
