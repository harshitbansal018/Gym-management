import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { DataTable } from "../../components/DataTable";
import { SectionHeader } from "../../components/SectionHeader";
import { StatCard } from "../../components/StatCard";
import { ApiState, useApiData } from "../../hooks/useApiData";
import { api } from "../../services/api";
import { waLink } from "../../utils/whatsapp";

const paymentColumns = [{ key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "paid_at", label: "Date" }];

export function MemberDashboard() {
  const { data, loading, error } = useApiData("/member/dashboard", {});
  const member = data.member;
  const daysRemaining = member?.expiry_date ? Math.max(0, Math.ceil((new Date(member.expiry_date) - new Date()) / 86400000)) : 0;
  const cards = [["Membership Status", member?.status || "Not found", ""], ["Expiry Date", member?.expiry_date || "-", ""], ["Days Remaining", daysRemaining, ""]];

  return (
    <>
      <SectionHeader title="Member Dashboard" subtitle="Live membership, payments, workout plan, and diet plan." />
      <ApiState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-3">{cards.map(([label, value, meta]) => <StatCard key={label} label={label} value={value} meta={meta} />)}</div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <MembershipCard member={member} gym={data.gym} />
          <CheckInCard />
          <PlanSummary title="Workout Plan" item={data.workoutPlans?.[0]} field="exercises" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <PlanSummary title="Diet Plan" item={data.dietPlans?.[0]} field="meals" />
        </div>
        <div className="mt-6"><SectionHeader title="Payment History" /><DataTable columns={paymentColumns} rows={data.payments || []} /></div>
      </ApiState>
    </>
  );
}

function CheckInCard() {
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
    <div className="surface p-5">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">Attendance</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Mark your attendance for today.</p>
      {result ? (
        <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${result.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {result.ok && <FiCheckCircle />} {result.message}
        </p>
      ) : (
        <button className="btn-primary mt-5 w-full" onClick={checkIn} disabled={busy}>{busy ? "Checking in…" : "Check in now"}</button>
      )}
    </div>
  );
}

export function MembershipPage() {
  const state = useApiData("/member/membership", null);
  const gym = state.data ? { name: state.data.gym_name, whatsapp: state.data.gym_whatsapp, payment_qr_url: state.data.gym_payment_qr_url } : null;
  return <><SectionHeader title="Membership" /><ApiState {...state} empty={!state.data}><div className="max-w-md"><MembershipCard member={state.data} gym={gym} /></div></ApiState></>;
}

export function MemberPayments() {
  const state = useApiData("/member/payments");
  return <><SectionHeader title="Payment History" /><ApiState {...state} empty={!state.data.length}><DataTable columns={paymentColumns} rows={state.data} /></ApiState></>;
}

export function MemberWorkoutPlan() {
  const { data, loading, error } = useApiData("/member/dashboard", {});
  return <><SectionHeader title="Workout Plan" /><ApiState loading={loading} error={error} empty={!data.workoutPlans?.length}><PlanDetail item={data.workoutPlans?.[0]} detail={data.workoutPlans?.[0]?.exercises} /></ApiState></>;
}

export function MemberDietPlan() {
  const { data, loading, error } = useApiData("/member/dashboard", {});
  return <><SectionHeader title="Diet Plan" /><ApiState loading={loading} error={error} empty={!data.dietPlans?.length}><PlanDetail item={data.dietPlans?.[0]} detail={`${data.dietPlans?.[0]?.calories || 0} calories · ${data.dietPlans?.[0]?.meals || ""}`} /></ApiState></>;
}

function MembershipCard({ member, gym }) {
  const active = member?.status === "active";
  const payMessage = `Hi${gym?.name ? ` ${gym.name}` : ""}, I want to pay my membership fee${member?.plan_name ? ` for the ${member.plan_name} plan` : ""}${member?.price ? ` (Rs. ${member.price})` : ""}. My name is ${member?.name || ""}.`;
  const payLink = waLink(gym?.whatsapp, payMessage);

  return (
    <div className="surface p-5">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">Current Plan</h3>
      <p className="mt-2 text-3xl font-black text-brand-600">{member?.plan_name || "No plan"}</p>
      <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
        <p>Start Date: {member?.start_date || "-"}</p>
        <p>Expiry Date: {member?.expiry_date || "-"}</p>
      </div>

      {payLink ? (
        <a className="btn-primary mt-5 flex w-full justify-center bg-emerald-600 hover:bg-emerald-700" href={payLink} target="_blank" rel="noreferrer">
          <FaWhatsapp className="text-lg" /> {active ? "Pay via WhatsApp" : "Renew via WhatsApp"}
        </a>
      ) : (
        <p className="mt-5 rounded-md bg-amber-50 p-3 text-xs text-amber-700">Your gym hasn't added a WhatsApp payment number yet.</p>
      )}

      {gym?.payment_qr_url && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">Scan to pay</p>
          <img className="mx-auto mt-2 h-36 w-36 rounded-md border border-slate-200 bg-white p-2 object-contain" src={gym.payment_qr_url} alt="Payment QR" />
        </div>
      )}
    </div>
  );
}

function PlanSummary({ title, item, field }) {
  return <div className="surface p-5"><h3 className="font-bold dark:text-white">{title}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item ? `${item.title}: ${item[field] || ""}` : "No plan assigned yet."}</p></div>;
}

function PlanDetail({ item, detail }) {
  return (
    <div className="surface max-w-3xl p-6">
      <h2 className="text-xl font-bold dark:text-white">{item.title}</h2>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{item.description}</p>
      <p className="mt-4 font-semibold text-brand-600">{detail}</p>
    </div>
  );
}
