import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { waLink } from "../utils/whatsapp";

// Gates the member portal: until the member's membership is active and unexpired,
// they see a "renew to continue" screen with a WhatsApp pay button. Mirrors the
// gym owner's SubscriptionGate.
export function MemberGate() {
  const { user, logout } = useAuth();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/member/membership");
      setMembership(data.data);
    } catch {
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Checking your membership…</div>;
  }

  const status = membership?.status;
  // Trust the stored status, but also catch an expiry that the daily job hasn't
  // processed yet (expiry strictly before today counts as expired).
  const todayMidnight = new Date(new Date().toDateString());
  const pastExpiry = membership?.expiry_date && new Date(membership.expiry_date) < todayMidnight;
  const isExpired = status === "expired" || pastExpiry;
  const active = status === "active" && !pastExpiry;

  if (active) return <Outlet />;

  const gymName = membership?.gym_name || user?.gym_name || "your gym";
  const planText = membership?.plan_name ? ` Plan: ${membership.plan_name}${membership?.price != null ? ` (Rs. ${membership.price})` : ""}.` : "";
  const message = `Hi ${gymName}, I want to ${isExpired ? "renew" : "activate"} my membership.${planText} My name is ${user?.name || ""}.`;
  const payLink = waLink(membership?.gym_whatsapp, message);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="surface w-full max-w-lg p-8 text-center">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
          {isExpired ? "Membership Expired" : "Not Active Yet"}
        </span>
        <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
          {isExpired ? "Your membership has expired" : "Your membership isn't active yet"}
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {isExpired
            ? "Renew your plan to unlock check-in and your member portal. Pay your gym on WhatsApp and they'll reactivate you right away."
            : "Once your gym activates your membership you'll get full access. Reach out on WhatsApp to get started."}
        </p>

        {membership?.expiry_date && (
          <p className="mt-4 text-sm text-slate-500">
            {isExpired ? "Expired on" : "Valid until"} <strong>{new Date(membership.expiry_date).toLocaleDateString()}</strong>
          </p>
        )}

        {payLink ? (
          <a className="btn-primary mt-6 inline-flex w-full justify-center bg-emerald-600 hover:bg-emerald-700" href={payLink} target="_blank" rel="noreferrer">
            <FaWhatsapp className="text-lg" /> {isExpired ? "Renew" : "Activate"} via WhatsApp
          </a>
        ) : (
          <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-700">Your gym hasn't added a WhatsApp number yet. Please contact them directly.</p>
        )}

        {membership?.gym_payment_qr_url && (
          <div className="mt-4">
            <p className="text-xs text-slate-500">Scan to pay</p>
            <img className="mx-auto mt-2 h-40 w-40 rounded-md border border-slate-200 bg-white p-2 object-contain" src={membership.gym_payment_qr_url} alt="Payment QR" />
          </div>
        )}

        <button className="btn-secondary mt-3 inline-flex w-full justify-center" onClick={load}>
          <FiRefreshCw /> I've paid — refresh
        </button>
        <button className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400" onClick={logout}>Log out</button>
      </div>
    </main>
  );
}
