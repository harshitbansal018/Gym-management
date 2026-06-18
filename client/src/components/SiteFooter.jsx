import { Link } from "react-router-dom";
import { FaDumbbell } from "react-icons/fa";

// Marketing footer for the FitManager public/marketing pages. Uses only real
// in-app routes (no placeholder/social links).
const columns = [
  { title: "Product", links: [["Home", "/"], ["Pricing", "/pricing"], ["About", "/about"]] },
  { title: "Company", links: [["Contact", "/contact"], ["Login", "/login"], ["Start Free Trial", "/register"]] },
  { title: "Legal", links: [["Terms", "/terms"], ["Privacy", "/privacy"], ["Refund Policy", "/refund"]] }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <FaDumbbell className="text-brand-600" /> FitManager
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              The all-in-one platform for gym owners to manage members, payments, attendance, and renewals.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">{column.title}</h3>
              <ul className="mt-4 space-y-2">
                {column.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
          <span>© {new Date().getFullYear()} FitManager. All rights reserved.</span>
          <span className="flex items-center gap-1">Made with <span className="text-rose-500">♥</span> for gym owners in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
