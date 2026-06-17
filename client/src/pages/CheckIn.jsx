import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheckCircle, FiLogIn } from "react-icons/fi";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

// Landing page for the gym's door QR (/gym/:slug/checkin). A logged-in member
// taps to record attendance. The backend ties the check-in to the member's own
// gym, so the slug here is only for branding/return-after-login.
export function CheckIn() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function checkIn() {
    setBusy(true);
    try {
      const { data } = await api.post("/member/attendance");
      setResult({ ok: true, message: data.message || "Checked in!" });
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.message || "Could not check in." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="surface w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">Gym Check-in</h1>

        {!user ? (
          <>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Please log in to check in.</p>
            <Link className="btn-primary mt-6 inline-flex w-full justify-center" to={`/login?redirect=/gym/${slug}/checkin`}>
              <FiLogIn /> Log in to check in
            </Link>
          </>
        ) : result ? (
          <div className={`mt-6 rounded-md p-5 ${result.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {result.ok && <FiCheckCircle className="mx-auto mb-2 text-3xl" />}
            <p className="font-semibold">{result.message}</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Signed in as <strong>{user.name}</strong>. Tap below to record today's attendance.</p>
            <button className="btn-primary mt-6 inline-flex w-full justify-center" onClick={checkIn} disabled={busy}>
              {busy ? "Checking in…" : "Check in now"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
