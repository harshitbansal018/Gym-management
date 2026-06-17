import { Link, NavLink, Outlet } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { roleHome, useAuth } from "../context/AuthContext";

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
            {user ? (
              <>
                <span className="hidden text-sm text-slate-500 dark:text-slate-400 lg:inline">Hi, {user.name?.split(" ")[0]}</span>
                <Link className="btn-primary" to={roleHome[user.role] || "/login"}>{dashboardLabel[user.role] || "Dashboard"}</Link>
                <button className="btn-secondary" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn-secondary hidden sm:inline-flex" to="/login">Login</Link>
                <Link className="btn-primary" to="/register">Start Free Trial</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <Outlet />
      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} FitManager. All rights reserved.</span>
          <div className="flex gap-5">
            <Link className="hover:text-brand-600" to="/terms">Terms</Link>
            <Link className="hover:text-brand-600" to="/privacy">Privacy</Link>
            <Link className="hover:text-brand-600" to="/refund">Refund Policy</Link>
            <Link className="hover:text-brand-600" to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
