import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { FiPlus } from "react-icons/fi";
import { ChartCard } from "../../components/ChartCard";
import { DataTable } from "../../components/DataTable";
import { PlanCard } from "../../components/PlanCard";
import { SectionHeader } from "../../components/SectionHeader";
import { StatCard } from "../../components/StatCard";
import { GymWebsiteCard } from "../../components/GymWebsiteCard";
import { ApiState, useApiData } from "../../hooks/useApiData";
import { api } from "../../services/api";

const memberColumns = [{ key: "name", label: "Member Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "start_date", label: "Start Date" }, { key: "expiry_date", label: "Expiry Date" }, { key: "status", label: "Status" }];
const trainerColumns = [{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "specialization", label: "Specialization" }, { key: "status", label: "Status" }];
const paymentColumns = [{ key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "paid_at", label: "Date" }];
const attendanceColumns = [{ key: "member_name", label: "Member" }, { key: "member_email", label: "Email" }, { key: "checked_in_at", label: "Checked In" }];

export function OwnerDashboard() {
  const { data, loading, error } = useApiData("/owner/dashboard", {});
  const memberCount = (status) => data.members?.find((item) => item.status === status)?.count || 0;
  const paymentCount = (status) => data.payments?.find((item) => item.status === status)?.count || 0;
  const cards = [
    ["Active Members", memberCount("active"), ""],
    ["Inactive Members", memberCount("expired"), ""],
    ["Revenue Today", `Rs. ${data.revenueToday ?? 0}`, ""],
    ["Revenue This Month", `Rs. ${data.revenueThisMonth ?? 0}`, ""],
    ["Successful Payments", paymentCount("success"), ""],
    ["Pending Payments", paymentCount("pending"), ""],
    ["Memberships Expiring Soon", data.membershipsExpiringSoon ?? 0, "7 days"]
  ];

  return (
    <>
      <SectionHeader title="Gym Owner Dashboard" subtitle="Live operations, revenue, renewals, and member growth." />
      <ApiState loading={loading} error={error}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, meta]) => <StatCard key={label} label={label} value={value} meta={meta} />)}</div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2"><ChartCard title="Revenue Chart" /><ChartCard title="Membership Growth Chart" type="bar" dataKey="members" /></div>
      </ApiState>
    </>
  );
}

export function GymProfile() {
  const state = useApiData("/owner/profile", {});

  async function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.patch("/owner/profile", {
      name: form.get("name"),
      logoUrl: form.get("logoUrl") || null,
      address: form.get("address") || null,
      phone: form.get("phone") || null,
      email: form.get("email") || null,
      description: form.get("description") || null,
      workingHours: form.get("workingHours") || null,
      whatsapp: form.get("whatsapp") || null,
      paymentQrUrl: form.get("paymentQrUrl") || null
    });
    state.reload();
  }

  return (
    <>
      <SectionHeader title="Gym Profile" subtitle="Live gym details saved to your database." />
      <ApiState {...state}>
        <div className="mb-6">
          <GymWebsiteCard gym={state.data} />
        </div>
        <form className="surface grid gap-4 p-6 lg:grid-cols-2" onSubmit={save}>
          <input className="app-input" name="name" defaultValue={state.data.name || ""} placeholder="Gym Name" />
          <input className="app-input" name="logoUrl" defaultValue={state.data.logo_url || ""} placeholder="Logo URL" />
          <input className="app-input" name="address" defaultValue={state.data.address || ""} placeholder="Address" />
          <input className="app-input" name="phone" defaultValue={state.data.phone || ""} placeholder="Phone" />
          <input className="app-input" name="email" defaultValue={state.data.email || ""} placeholder="Email" />
          <input className="app-input" name="workingHours" defaultValue={state.data.working_hours || ""} placeholder="Working Hours" />
          <textarea className="app-input min-h-28 lg:col-span-2" name="description" defaultValue={state.data.description || ""} placeholder="Description" />
          <div className="lg:col-span-2 mt-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <h3 className="font-bold text-slate-950 dark:text-white">Member Payments (WhatsApp)</h3>
            <p className="mt-1 text-sm text-slate-500">Members tap "Pay via WhatsApp" and reach this number. Share your UPI/payment QR there, or paste its image URL below to show it in their portal.</p>
          </div>
          <input className="app-input" name="whatsapp" defaultValue={state.data.whatsapp || ""} placeholder="WhatsApp number with country code, e.g. 919876543210" />
          <input className="app-input" name="paymentQrUrl" defaultValue={state.data.payment_qr_url || ""} placeholder="Payment QR image URL (optional)" />
          {state.data.payment_qr_url && (
            <div className="lg:col-span-2">
              <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Current payment QR preview:</p>
              <img className="h-40 w-40 rounded-md border border-slate-200 bg-white p-2 object-contain" src={state.data.payment_qr_url} alt="Payment QR" />
            </div>
          )}
          <button className="btn-primary w-fit">Save Gym Profile</button>
        </form>
      </ApiState>
    </>
  );
}

export function MembershipPlans() {
  const state = useApiData("/owner/plans");

  async function createPlan(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post("/owner/plans", {
      name: form.get("name"),
      price: Number(form.get("price")),
      durationDays: Number(form.get("durationDays")),
      description: form.get("description")
    });
    event.currentTarget.reset();
    state.reload();
  }

  async function deletePlan(id) {
    await api.delete(`/owner/plans/${id}`);
    state.reload();
  }

  return (
    <>
      <SectionHeader title="Membership Plans" />
      <ApiState {...state} empty={!state.data.length}>
        <div className="grid gap-4 md:grid-cols-3">{state.data.map((plan) => <PlanCard key={plan.id} plan={{ ...plan, duration: `${plan.duration_days} Days`, price: `Rs. ${plan.price}` }} editable onDelete={() => deletePlan(plan.id)} />)}</div>
      </ApiState>
      <form className="surface mt-6 grid gap-4 p-6 md:grid-cols-2" onSubmit={createPlan}>
        <input className="app-input" name="name" placeholder="Plan Name" required />
        <input className="app-input" name="price" placeholder="Price" type="number" required />
        <input className="app-input" name="durationDays" placeholder="Duration Days" type="number" required />
        <textarea className="app-input md:col-span-2" name="description" placeholder="Description" />
        <button className="btn-primary w-fit"><FiPlus /> Create Plan</button>
      </form>
    </>
  );
}

export function Trainers() {
  return (
    <ResourceTable
      title="Trainers"
      path="/owner/trainers"
      columns={trainerColumns}
      buildPayload={(form) => ({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        specialization: form.get("specialization"),
        status: form.get("status")
      })}
      formFields={<><input className="app-input" name="name" placeholder="Name" required /><input className="app-input" name="email" placeholder="Email" type="email" required /><input className="app-input" name="phone" placeholder="Phone" /><input className="app-input" name="specialization" placeholder="Specialization" /><select className="app-input" name="status"><option value="active">Active</option><option value="inactive">Inactive</option></select></>}
    />
  );
}

export function Members() {
  const state = useApiData("/owner/members");
  const [createLogin, setCreateLogin] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [formError, setFormError] = useState("");

  async function resetPassword(member) {
    const newPassword = window.prompt(`Set a new password for ${member.name} (${member.email}).\n8+ chars, upper, lower, number, symbol:`);
    if (!newPassword) return;
    try {
      await api.post(`/owner/members/${member.id}/reset-password`, { newPassword });
      window.alert("Password reset. Share the new password with the member over WhatsApp.");
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not reset password.");
    }
  }

  async function create(event) {
    event.preventDefault();
    setFormError("");
    const form = new FormData(event.currentTarget);
    try {
      const { data } = await api.post("/owner/members", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        startDate: form.get("startDate") || null,
        expiryDate: form.get("expiryDate") || null,
        status: form.get("status"),
        createLogin,
        password: createLogin ? form.get("password") : null
      });
      event.currentTarget.reset();
      setCreateLogin(false);
      if (data.login) setCredentials(data.login);
      state.reload();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not add member");
    }
  }

  return (
    <>
      <SectionHeader title="Members" />
      {credentials && (
        <div className="surface mb-4 border-emerald-200 bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p className="font-semibold text-emerald-800 dark:text-emerald-200">Member login created — share these over WhatsApp:</p>
          <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">Email: <strong>{credentials.email}</strong> · Password: <strong>{credentials.password}</strong></p>
          <button className="btn-secondary mt-3" type="button" onClick={() => navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`)}>Copy credentials</button>
        </div>
      )}
      <ApiState {...state} empty={!state.data.length}><DataTable columns={memberColumns} rows={state.data} actions onResetPassword={resetPassword} /></ApiState>
      <form className="surface mt-6 grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3" onSubmit={create}>
        <input className="app-input" name="name" placeholder="Name" required />
        <input className="app-input" name="email" placeholder="Email" type="email" required />
        <input className="app-input" name="phone" placeholder="Phone" />
        <input className="app-input" name="startDate" type="date" />
        <input className="app-input" name="expiryDate" type="date" />
        <select className="app-input" name="status"><option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option></select>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 md:col-span-2 xl:col-span-3">
          <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} />
          Create a login so this member can sign in (pay, check in, view plans)
        </label>
        {createLogin && (
          <input className="app-input md:col-span-2 xl:col-span-1" name="password" type="text" placeholder="Set a password (8+ chars, upper/lower/number/symbol)" required />
        )}
        {formError && <p className="text-sm text-rose-600 md:col-span-2 xl:col-span-3">{formError}</p>}
        <button className="btn-primary w-fit"><FiPlus /> Add Member</button>
      </form>
    </>
  );
}

export function Payments() {
  const state = useApiData("/owner/payments");
  const totalRevenue = state.data.filter((item) => item.status === "success").reduce((sum, item) => sum + Number(item.amount), 0);

  async function createPayment(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post("/owner/payments", {
      amount: Number(form.get("amount")),
      status: form.get("status")
    });
    event.currentTarget.reset();
    state.reload();
  }

  return (
    <>
      <SectionHeader title="Payments" />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Revenue" value={`Rs. ${totalRevenue}`} meta="" />
        <StatCard label="Pending Payments" value={state.data.filter((item) => item.status === "pending").length} meta="" />
        <StatCard label="Successful Payments" value={state.data.filter((item) => item.status === "success").length} meta="" />
      </div>
      <ApiState {...state} empty={!state.data.length}><DataTable columns={paymentColumns} rows={state.data} /></ApiState>
      <form className="surface mt-6 grid gap-4 p-6 md:grid-cols-3" onSubmit={createPayment}>
        <input className="app-input" name="amount" placeholder="Amount" type="number" required />
        <select className="app-input" name="status"><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
        <button className="btn-primary w-fit">Add Payment</button>
      </form>
    </>
  );
}

function PlanBuilder({ type, path, fields }) {
  const state = useApiData(path);
  const isDiet = type === "Diet";

  async function create(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post(path, isDiet ? {
      title: form.get("title"),
      description: form.get("description"),
      calories: Number(form.get("calories")),
      meals: form.get("meals")
    } : {
      title: form.get("title"),
      description: form.get("description"),
      exercises: form.get("exercises")
    });
    event.currentTarget.reset();
    state.reload();
  }

  return (
    <>
      <SectionHeader title={`${type} Plans`} subtitle={`Create and manage live ${type.toLowerCase()} plans.`} />
      <form className="surface grid gap-4 p-6 md:grid-cols-2" onSubmit={create}>
        <input className="app-input" name="title" placeholder="Title" required />
        {fields}
        <textarea className="app-input md:col-span-2" name="description" placeholder="Description" />
        <button className="btn-primary w-fit">Create {type} Plan</button>
      </form>
      <ApiState {...state} empty={!state.data.length}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">{state.data.map((item) => <div className="surface p-5" key={item.id}><h3 className="font-bold dark:text-white">{item.title}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p><p className="mt-3 text-sm font-semibold text-brand-600">{isDiet ? `${item.calories || 0} calories · ${item.meals || ""}` : item.exercises}</p></div>)}</div>
      </ApiState>
    </>
  );
}

function ResourceTable({ title, path, columns, formFields, buildPayload }) {
  const state = useApiData(path);

  async function create(event) {
    event.preventDefault();
    await api.post(path, buildPayload(new FormData(event.currentTarget)));
    event.currentTarget.reset();
    state.reload();
  }

  return (
    <>
      <SectionHeader title={title} />
      <ApiState {...state} empty={!state.data.length}><DataTable columns={columns} rows={state.data} actions /></ApiState>
      {formFields && (
        <form className="surface mt-6 grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3" onSubmit={create}>
          {formFields}
          <button className="btn-primary w-fit"><FiPlus /> Add {title.slice(0, -1)}</button>
        </form>
      )}
    </>
  );
}

export function OwnerAttendance() {
  const state = useApiData("/owner/attendance", { todayCount: 0, recent: [] });
  const profile = useApiData("/owner/profile", {});
  const [qr, setQr] = useState("");

  const slug = profile.data?.slug;
  const checkinUrl = slug ? `${window.location.origin}/gym/${slug}/checkin` : "";

  useEffect(() => {
    if (checkinUrl) QRCode.toDataURL(checkinUrl, { width: 320, margin: 2 }).then(setQr);
  }, [checkinUrl]);

  const rows = (state.data.recent || []).map((r) => ({ ...r, checked_in_at: new Date(r.checked_in_at).toLocaleString() }));

  return (
    <>
      <SectionHeader title="Attendance" subtitle="Members check in by scanning your door QR." />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.6fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Checked in Today" value={state.data.todayCount ?? 0} meta="" />
          <StatCard label="Recent Check-ins" value={(state.data.recent || []).length} meta="last 100" />
        </div>
        <div className="surface p-5 text-center">
          <h3 className="font-bold dark:text-white">Door Check-in QR</h3>
          <p className="mt-1 text-xs text-slate-500 break-all">{checkinUrl || "Save your gym profile to generate this."}</p>
          {qr && <img className="mx-auto mt-3 h-40 w-40 rounded-md border border-slate-200 bg-white p-2" src={qr} alt="Check-in QR" />}
        </div>
      </div>
      <ApiState {...state} empty={!(state.data.recent || []).length}>
        <DataTable columns={attendanceColumns} rows={rows} />
      </ApiState>
    </>
  );
}

export const DietPlans = () => <PlanBuilder type="Diet" path="/owner/diet-plans" fields={<><input className="app-input" name="calories" placeholder="Calories" type="number" /><input className="app-input" name="meals" placeholder="Meals" /></>} />;
export const WorkoutPlans = () => <PlanBuilder type="Workout" path="/owner/workout-plans" fields={<input className="app-input" name="exercises" placeholder="Exercises" />} />;
export const Analytics = () => <><SectionHeader title="Analytics" /><div className="grid gap-4 xl:grid-cols-2"><ChartCard title="Revenue Chart" /><ChartCard title="Membership Growth Chart" type="bar" dataKey="members" /></div></>;
