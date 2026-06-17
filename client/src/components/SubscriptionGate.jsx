import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { waLink } from "../utils/whatsapp";

// Wraps the gym-owner area. Until a platform admin activates the gym, the owner
// sees a "pending activation" screen with a WhatsApp button to pay the platform.
export function SubscriptionGate() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);
    try {
      const [billing, plat] = await Promise.all([
        api.get("/owner/billing-status"),
        api.get("/public/platform")
      ]);
      setStatus(billing.data.data);
      setPlatform(plat.data.data);
    } catch {
      setStatus({ active: false, status: "pending" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Checking your subscription…</div>;
  }

  if (status?.active) return <Outlet />;

  const message = `Hi, I want to activate my gym "${user?.name || ""}" (${user?.email || ""}) on FitManager. My plan: ${status?.plan || "Starter"}.`;
  const payLink = waLink(platform?.whatsapp, message);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="surface w-full max-w-lg p-8 text-center">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">Pending Activation</span>
        <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">Your gym isn't active yet</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          To unlock your dashboard, complete payment for the <strong>{status?.plan || "Starter"}</strong> plan.
          Message us on WhatsApp to pay — we'll activate your account right after.
        </p>

        {payLink ? (
          <a className="btn-primary mt-6 inline-flex w-full justify-center bg-emerald-600 hover:bg-emerald-700" href={payLink} target="_blank" rel="noreferrer">
            <FaWhatsapp className="text-lg" /> Pay &amp; Activate via WhatsApp
          </a>
        ) : (
          <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-700">Platform WhatsApp number is not configured yet. Please contact support.</p>
        )}

        <button className="btn-secondary mt-3 inline-flex w-full justify-center" onClick={loadStatus}>
          <FiRefreshCw /> I've paid — refresh status
        </button>
        <button className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400" onClick={logout}>Log out</button>
      </div>
    </main>
  );
}
