import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { roleHome, useAuth } from "../context/AuthContext";
import { SiteFooter } from "../components/SiteFooter";

const links = [["Home", "/"], ["Pricing", "/pricing"], ["About", "/about"], ["Contact", "/contact"]];

const dashboardLabel = {
  platform_admin: "Admin Panel",
  gym_owner: "My Dashboard",
  trainer: "Trainer Dashboard",
  member: "My Membership"
};

export function PublicLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-black text-slate-950 dark:text-white">FitManager</Link>
          <div className="hidden items-center gap-6 md:flex">
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-600" : "text-slate-600 dark:text-slate-300"}`}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary px-3" onClick={toggleTheme} aria-label="Toggle theme">{theme === "light" ? <FiMoon /> : <FiSun />}</button>
            {/* Desktop actions */}
            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <>
                  <span className="hidden text-sm text-slate-500 dark:text-slate-400 lg:inline">Hi, {user.name?.split(" ")[0]}</span>
                  <Link className="btn-primary" to={roleHome[user.role] || "/login"}>{dashboardLabel[user.role] || "Dashboard"}</Link>
                  <button className="btn-secondary" onClick={logout}>Logout</button>
                </>
              ) : (
                <>
                  <Link className="btn-secondary" to="/login">Login</Link>
                  <Link className="btn-primary" to="/register">Start Free Trial</Link>
                </>
              )}
            </div>
            {/* Mobile menu toggle */}
            <button className="btn-secondary px-2 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}>
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown panel */}
        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map(([label, to]) => (
                <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-100" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              {user ? (
                <>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Hi, {user.name?.split(" ")[0]}</span>
                  <Link className="btn-primary w-full" to={roleHome[user.role] || "/login"} onClick={() => setOpen(false)}>{dashboardLabel[user.role] || "Dashboard"}</Link>
                  <button className="btn-secondary w-full" onClick={() => { setOpen(false); logout(); }}>Logout</button>
                </>
              ) : (
                <>
                  <Link className="btn-secondary w-full" to="/login" onClick={() => setOpen(false)}>Login</Link>
                  <Link className="btn-primary w-full" to="/register" onClick={() => setOpen(false)}>Start Free Trial</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <Outlet />
      <SiteFooter />
    </div>
  );
}
