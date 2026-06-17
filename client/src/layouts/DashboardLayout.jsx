import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FiBarChart2, FiCheckSquare, FiCreditCard, FiGrid, FiMenu, FiMoon, FiSettings, FiSun, FiUsers, FiX } from "react-icons/fi";
import { FaDumbbell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const menus = {
  platform_admin: [["Dashboard", "/admin", FiGrid], ["Gyms", "/admin/gyms", FaDumbbell], ["Subscriptions", "/admin/subscriptions", FiCreditCard], ["Revenue", "/admin/revenue", FiBarChart2], ["Users", "/admin/users", FiUsers], ["Settings", "/admin/settings", FiSettings]],
  gym_owner: [["Dashboard", "/owner", FiGrid], ["Gym Profile", "/owner/profile", FaDumbbell], ["Membership Plans", "/owner/plans", FiCreditCard], ["Trainers", "/owner/trainers", FiUsers], ["Members", "/owner/members", FiUsers], ["Payments", "/owner/payments", FiCreditCard], ["Attendance", "/owner/attendance", FiCheckSquare], ["Diet Plans", "/owner/diet-plans", FiGrid], ["Workout Plans", "/owner/workout-plans", FaDumbbell], ["Analytics", "/owner/analytics", FiBarChart2], ["Settings", "/owner/settings", FiSettings]],
  trainer: [["Dashboard", "/trainer", FiGrid], ["Assigned Members", "/trainer/members", FiUsers], ["Diet Plans", "/trainer/diet-plans", FiGrid], ["Workout Plans", "/trainer/workout-plans", FaDumbbell], ["Settings", "/trainer/settings", FiSettings]],
  member: [["Dashboard", "/member", FiGrid], ["Membership", "/member/membership", FiCreditCard], ["Payments", "/member/payments", FiBarChart2], ["Workout Plan", "/member/workout-plan", FaDumbbell], ["Diet Plan", "/member/diet-plan", FiGrid], ["Settings", "/member/settings", FiSettings]]
};

export function DashboardLayout({ role }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <span className="text-xl font-black text-slate-950 dark:text-white">FitManager</span>
        <button className="btn-secondary px-2 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><FiX /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menus[role].map(([label, to, Icon]) => (
          <NavLink key={to} end={to.split("/").length === 2} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-100" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
            <Icon /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{user?.role?.replace("_", " ")}</p>
        <button className="btn-secondary mt-3 w-full" onClick={logout}>Logout</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="hidden md:fixed md:inset-y-0 md:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setOpen(false)} />}
      {open && <div className="fixed inset-y-0 left-0 z-50 md:hidden">{sidebar}</div>}
      <div className="md:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex items-center gap-3">
            <button className="btn-secondary px-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><FiMenu /></button>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
              <p className="font-semibold text-slate-950 dark:text-white">{user?.name || "Guest"}</p>
            </div>
          </div>
          <button className="btn-secondary px-3" onClick={toggleTheme} aria-label="Toggle theme">{theme === "light" ? <FiMoon /> : <FiSun />}</button>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
