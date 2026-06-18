import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { FiCheck, FiLoader, FiPlus, FiRefreshCw } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ChartCard } from "../../components/ChartCard";
import { DataTable } from "../../components/DataTable";
import { PlanCard } from "../../components/PlanCard";
import { SectionHeader } from "../../components/SectionHeader";
import { StatCard } from "../../components/StatCard";
import { GymWebsiteCard } from "../../components/GymWebsiteCard";
import { Modal } from "../../components/Modal";
import { SearchInput, Pagination } from "../../components/TableControls";
import { ApiState, useApiData } from "../../hooks/useApiData";
import { usePagedSearch } from "../../hooks/usePagedSearch";
import { useConfirm, usePrompt, useToast } from "../../context/FeedbackContext";
import { api } from "../../services/api";
import { waLink } from "../../utils/whatsapp";

const memberColumns = [{ key: "name", label: "Member Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "start_date", label: "Start Date" }, { key: "expiry_date", label: "Expiry Date" }, { key: "status", label: "Status" }];
const trainerColumns = [{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "specialization", label: "Specialization" }, { key: "status", label: "Status" }];
const paymentColumns = [{ key: "member_name", label: "Member" }, { key: "plan_name", label: "Plan" }, { key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "paid_at", label: "Date" }];
const attendanceColumns = [{ key: "member_name", label: "Member" }, { key: "member_email", label: "Email" }, { key: "checked_in_at", label: "Checked In" }];

// ---- Field schemas: one source of truth for create forms AND edit modals ----
const trainerFields = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone" },
  { name: "specialization", label: "Specialization" },
  { name: "status", label: "Status", type: "select", options: [["active", "Active"], ["inactive", "Inactive"]] }
];
const memberFields = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone" },
  { name: "startDate", label: "Start Date", type: "date", from: "start_date" },
  { name: "expiryDate", label: "Expiry Date", type: "date", from: "expiry_date" },
  { name: "status", label: "Status", type: "select", options: [["active", "Active"], ["pending", "Pending"], ["expired", "Expired"]] }
];
const planFields = [
  { name: "name", label: "Plan Name", required: true },
  { name: "price", label: "Price", type: "number", required: true },
  { name: "durationDays", label: "Duration (days)", type: "number", from: "duration_days", required: true },
  { name: "description", label: "Description", type: "textarea", full: true }
];
const dietFields = [
  { name: "title", label: "Title", required: true },
  { name: "calories", label: "Calories", type: "number" },
  { name: "meals", label: "Meals" },
  { name: "description", label: "Description", type: "textarea", full: true }
];
const workoutFields = [
  { name: "title", label: "Title", required: true },
  { name: "exercises", label: "Exercises" },
  { name: "description", label: "Description", type: "textarea", full: true }
];

// Format any DB date value into the YYYY-MM-DD a <input type="date"> expects.
function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toLocaleDateString();
}

// New expiry = later of (today, current expiry) + days, so renewing early keeps
// the unused days instead of throwing them away. Mirrors the server's logic.
function addDays(value, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const current = value ? new Date(value) : today;
  const start = Number.isNaN(current.getTime()) || current < today ? today : current;
  const result = new Date(start);
  result.setDate(result.getDate() + Number(days || 0));
  return result;
}

function renewalBadge(daysLeft) {
  if (daysLeft == null) return null;
  if (daysLeft < 0) return { text: `Expired ${Math.abs(daysLeft)}d ago`, cls: "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300" };
  if (daysLeft === 0) return { text: "Expires today", cls: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300" };
  if (daysLeft <= 7) return { text: `${daysLeft}d left`, cls: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300" };
  return { text: `${daysLeft}d left`, cls: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300" };
}

function FieldInput({ field, defaultValue }) {
  const cls = `app-input ${field.full ? "sm:col-span-2" : ""}`;
  if (field.type === "select") {
    return (
      <select className={cls} name={field.name} defaultValue={defaultValue ?? field.options[0][0]}>
        {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    );
  }
  if (field.type === "textarea") {
    return <textarea className={cls} name={field.name} placeholder={field.label} defaultValue={defaultValue ?? ""} />;
  }
  const value = field.type === "date" ? toDateInput(defaultValue) : (defaultValue ?? "");
  return <input className={cls} name={field.name} type={field.type || "text"} placeholder={field.label} defaultValue={value} required={field.required} />;
}

// Turn a submitted form into an API payload using the field schema (numbers
// coerced, blank optional fields sent as null so the server clears them).
function buildPayload(fields, form) {
  const payload = {};
  for (const field of fields) {
    const raw = (form.get(field.name) ?? "").toString().trim();
    if (field.type === "number") payload[field.name] = raw === "" ? null : Number(raw);
    else payload[field.name] = raw === "" ? (field.required ? "" : null) : raw;
  }
  return payload;
}

function SubmitButton({ busy, children, className = "" }) {
  return (
    <button className={`btn-primary disabled:cursor-not-allowed disabled:opacity-60 ${className}`} disabled={busy}>
      {busy ? <FiLoader className="animate-spin" /> : null}
      {children}
    </button>
  );
}

// Shared edit dialog driven by a field schema. `extra(row)` injects fields that
// aren't edited in the form but must be preserved (e.g. a member's plan/trainer
// links) so the update doesn't null them out.
function EditModal({ title, path, fields, row, extra, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...buildPayload(fields, new FormData(event.currentTarget)), ...(extra ? extra(row) : {}) };
      await api.put(`${path}/${row.id}`, payload);
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} locked={busy}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
        {fields.map((field) => (
          <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{field.label}</label>
            <FieldInput field={field} defaultValue={row[field.from || field.name]} />
          </div>
        ))}
        {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <SubmitButton busy={busy}>Save changes</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

// Delete-with-confirmation that tracks which row is mid-request (for spinners).
function useRowDelete(path, reload) {
  const [busyId, setBusyId] = useState(null);
  const confirm = useConfirm();
  const toast = useToast();
  async function remove(row, label) {
    const ok = await confirm({
      title: "Delete record",
      message: `Delete ${label || "this record"}? This can't be undone.`,
      confirmLabel: "Delete",
      danger: true
    });
    if (!ok) return;
    setBusyId(row.id);
    try {
      await api.delete(`${path}/${row.id}`);
      await reload();
      toast.success("Deleted successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete. Please try again.");
    } finally {
      setBusyId(null);
    }
  }
  return { busyId, remove };
}

// Submit helper: busy flag + error capture, with the form element captured
// before the await (currentTarget is cleared once the handler returns).
function useFormSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(event, action) {
    event.preventDefault();
    const formEl = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await action(new FormData(formEl), formEl);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, setError, run };
}

// Confirm dialog for extending a membership, with a live new-expiry preview and
// an option to log the renewal as a payment.
function RenewModal({ member, onClose, onDone }) {
  const [days, setDays] = useState(member.plan_duration_days || 30);
  const [recordPayment, setRecordPayment] = useState(member.plan_price != null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/owner/members/${member.id}/renew`, { days: Number(days), recordPayment });
      await onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not renew. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal title={`Renew — ${member.name}`} onClose={onClose} locked={busy}>
      <form className="grid gap-4" onSubmit={confirm}>
        <div className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
          <p className="text-slate-600 dark:text-slate-300">Current expiry: <strong>{formatDate(member.expiry_date)}</strong></p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Plan: <strong>{member.plan_name || "None"}</strong>{member.plan_price != null ? ` · Rs. ${member.plan_price}` : ""}</p>
        </div>
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Extend by (days)
          <input className="app-input mt-1" type="number" min="1" max="3650" value={days} onChange={(event) => setDays(event.target.value)} required />
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-300">New expiry date: <strong className="text-brand-600">{formatDate(addDays(member.expiry_date, days))}</strong></p>
        {member.plan_price != null && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={recordPayment} onChange={(event) => setRecordPayment(event.target.checked)} />
            Record a Rs. {member.plan_price} payment for this renewal
          </label>
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <SubmitButton busy={busy}><FiRefreshCw /> Confirm renewal</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

export function Renewals() {
  const state = useApiData("/owner/renewals");
  const profile = useApiData("/owner/profile", {});
  const [renewing, setRenewing] = useState(null);
  const gymName = profile.data?.name || "our gym";

  function reminderLink(member) {
    const expired = member.days_left < 0;
    const plan = member.plan_name ? ` Plan: ${member.plan_name}${member.plan_price != null ? ` (Rs. ${member.plan_price})` : ""}.` : "";
    const message = `Hi ${member.name}, your ${gymName} membership ${expired ? "expired on" : "expires on"} ${formatDate(member.expiry_date)}. Please renew to keep your access.${plan}`;
    return waLink(member.phone, message);
  }

  const expiredCount = state.data.filter((member) => member.days_left < 0).length;
  const soonCount = state.data.length - expiredCount;
  const paged = usePagedSearch(state.data, { keys: ["name", "phone", "plan_name"], pageSize: 9 });

  return (
    <>
      <SectionHeader title="Renewals" subtitle="Members expiring soon or already expired. Send a WhatsApp reminder or renew in one tap." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Expiring Soon" value={soonCount} meta="next 14 days" />
        <StatCard label="Already Expired" value={expiredCount} meta="" />
      </div>
      <ApiState {...state} empty={!state.data.length}>
        <div className="mb-4">
          <SearchInput value={paged.queryText} onChange={paged.setQueryText} placeholder="Search by member, phone, or plan…" />
        </div>
        {paged.total === 0 ? (
          <div className="surface p-6 text-sm text-slate-500 dark:text-slate-400">No results match your search.</div>
        ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paged.pageRows.map((member) => {
            const badge = renewalBadge(member.days_left);
            const link = reminderLink(member);
            return (
              <div className="surface flex flex-col gap-3 p-5" key={member.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-950 dark:text-white">{member.name}</h3>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{member.phone || "No phone on file"}</p>
                  </div>
                  {badge && <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ring-1 ${badge.cls}`}>{badge.text}</span>}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Expiry: <strong>{formatDate(member.expiry_date)}</strong></p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Plan: {member.plan_name || "—"}{member.plan_price != null ? ` · Rs. ${member.plan_price}` : ""}</p>
                <div className="mt-auto flex gap-2 pt-2">
                  {link ? (
                    <a className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700" href={link} target="_blank" rel="noreferrer"><FaWhatsapp /> Remind</a>
                  ) : (
                    <button className="btn-secondary flex-1" disabled title="Add a phone number to message this member">Remind</button>
                  )}
                  <button className="btn-secondary flex-1" onClick={() => setRenewing(member)}><FiRefreshCw /> Renew</button>
                </div>
              </div>
            );
          })}
        </div>
        )}
        {paged.totalPages > 1 && (
          <div className="surface mt-4">
            <Pagination page={paged.page} totalPages={paged.totalPages} onPage={paged.setPage} rangeStart={paged.rangeStart} rangeEnd={paged.rangeEnd} total={paged.total} />
          </div>
        )}
      </ApiState>
      {renewing && <RenewModal member={renewing} onClose={() => setRenewing(null)} onDone={state.reload} />}
    </>
  );
}

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
  const { busy, error, run } = useFormSubmit();
  const [saved, setSaved] = useState(false);

  function save(event) {
    return run(event, async (form) => {
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
      await state.reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
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
          {error && <p className="text-sm text-rose-600 lg:col-span-2">{error}</p>}
          <div className="flex items-center gap-3 lg:col-span-2">
            <SubmitButton busy={busy} className="w-fit">Save Gym Profile</SubmitButton>
            {saved && <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600"><FiCheck /> Saved</span>}
          </div>
        </form>
      </ApiState>
    </>
  );
}

export function MembershipPlans() {
  const state = useApiData("/owner/plans");
  const { busy, error, run } = useFormSubmit();
  const { busyId, remove } = useRowDelete("/owner/plans", state.reload);
  const [editing, setEditing] = useState(null);

  function createPlan(event) {
    return run(event, async (form, formEl) => {
      await api.post("/owner/plans", {
        name: form.get("name"),
        price: Number(form.get("price")),
        durationDays: Number(form.get("durationDays")),
        description: form.get("description")
      });
      formEl.reset();
      await state.reload();
    });
  }

  return (
    <>
      <SectionHeader title="Membership Plans" />
      <ApiState {...state} empty={!state.data.length}>
        <div className="grid gap-4 md:grid-cols-3">
          {state.data.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={{ ...plan, duration: `${plan.duration_days} Days`, price: `Rs. ${plan.price}` }}
              editable
              busy={busyId === plan.id}
              onEdit={() => setEditing(plan)}
              onDelete={() => remove(plan, plan.name)}
            />
          ))}
        </div>
      </ApiState>
      <form className="surface mt-6 grid gap-4 p-6 md:grid-cols-2" onSubmit={createPlan}>
        <input className="app-input" name="name" placeholder="Plan Name" required />
        <input className="app-input" name="price" placeholder="Price" type="number" required />
        <input className="app-input" name="durationDays" placeholder="Duration Days" type="number" required />
        <textarea className="app-input md:col-span-2" name="description" placeholder="Description" />
        {error && <p className="text-sm text-rose-600 md:col-span-2">{error}</p>}
        <SubmitButton busy={busy} className="w-fit"><FiPlus /> Create Plan</SubmitButton>
      </form>
      {editing && (
        <EditModal
          title="Edit Plan"
          path="/owner/plans"
          fields={planFields}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={state.reload}
        />
      )}
    </>
  );
}

export function Trainers() {
  return (
    <ResourceTable
      title="Trainers"
      path="/owner/trainers"
      columns={trainerColumns}
      fields={trainerFields}
      editTitle="Edit Trainer"
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
  const { busy, error, setError, run } = useFormSubmit();
  const { busyId, remove } = useRowDelete("/owner/members", state.reload);
  const prompt = usePrompt();
  const toast = useToast();
  const [createLogin, setCreateLogin] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [editing, setEditing] = useState(null);

  async function resetPassword(member) {
    const newPassword = await prompt({
      title: "Reset member password",
      message: `Set a new password for ${member.name} (${member.email}). Use 8+ characters with upper, lower, number, and symbol.`,
      placeholder: "New password",
      confirmLabel: "Reset password"
    });
    if (!newPassword) return;
    try {
      await api.post(`/owner/members/${member.id}/reset-password`, { newPassword });
      toast.success("Password reset. Share the new password with the member over WhatsApp.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password.");
    }
  }

  function create(event) {
    return run(event, async (form, formEl) => {
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
      formEl.reset();
      setCreateLogin(false);
      if (data.login) setCredentials(data.login);
      await state.reload();
    });
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
      <ApiState {...state} empty={!state.data.length}>
        <DataTable columns={memberColumns} rows={state.data} busyId={busyId} searchable pageSize={10} searchPlaceholder="Search members by name, email, phone…" onResetPassword={resetPassword} onEdit={setEditing} onDelete={(row) => remove(row, row.name)} />
      </ApiState>
      <form className="surface mt-6 grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3" onSubmit={create}>
        <input className="app-input" name="name" placeholder="Name" required />
        <input className="app-input" name="email" placeholder="Email" type="email" required />
        <input className="app-input" name="phone" placeholder="Phone" />
        <input className="app-input" name="startDate" type="date" />
        <input className="app-input" name="expiryDate" type="date" />
        <select className="app-input" name="status"><option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option></select>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 md:col-span-2 xl:col-span-3">
          <input type="checkbox" checked={createLogin} onChange={(e) => { setCreateLogin(e.target.checked); setError(""); }} />
          Create a login so this member can sign in (pay, check in, view plans)
        </label>
        {createLogin && (
          <input className="app-input md:col-span-2 xl:col-span-1" name="password" type="text" placeholder="Set a password (8+ chars, upper/lower/number/symbol)" required />
        )}
        {error && <p className="text-sm text-rose-600 md:col-span-2 xl:col-span-3">{error}</p>}
        <SubmitButton busy={busy} className="w-fit"><FiPlus /> Add Member</SubmitButton>
      </form>
      {editing && (
        <EditModal
          title="Edit Member"
          path="/owner/members"
          fields={memberFields}
          row={editing}
          extra={(row) => ({ membershipPlanId: row.membership_plan_id || null, trainerId: row.trainer_id || null })}
          onClose={() => setEditing(null)}
          onSaved={state.reload}
        />
      )}
    </>
  );
}

export function Payments() {
  const state = useApiData("/owner/payments");
  const members = useApiData("/owner/members");
  const plans = useApiData("/owner/plans");
  const { busy, error, run } = useFormSubmit();
  const { busyId, remove } = useRowDelete("/owner/payments", state.reload);
  const [editing, setEditing] = useState(null);
  // Controlled so picking a plan can auto-fill the amount.
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState("");

  const totalRevenue = state.data.filter((item) => item.status === "success").reduce((sum, item) => sum + Number(item.amount), 0);

  const memberOptions = [["", "— No member —"], ...members.data.map((m) => [m.id, m.name])];
  const planOptions = [["", "— No plan —"], ...plans.data.map((p) => [p.id, `${p.name} (Rs. ${p.price})`])];

  function onPlanChange(id) {
    setPlanId(id);
    const plan = plans.data.find((p) => p.id === id);
    if (plan) setAmount(String(plan.price));
  }

  function createPayment(event) {
    return run(event, async (form) => {
      await api.post("/owner/payments", {
        memberId: memberId || null,
        membershipPlanId: planId || null,
        amount: Number(amount),
        status: form.get("status")
      });
      setMemberId("");
      setPlanId("");
      setAmount("");
      event.currentTarget.reset();
      await state.reload();
    });
  }

  const paymentEditFields = [
    { name: "memberId", label: "Member", type: "select", from: "member_id", options: memberOptions },
    { name: "membershipPlanId", label: "Plan", type: "select", from: "membership_plan_id", options: planOptions },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "status", label: "Status", type: "select", options: [["success", "Success"], ["pending", "Pending"], ["failed", "Failed"]] }
  ];

  return (
    <>
      <SectionHeader title="Payments" subtitle="Record payments you receive over UPI / WhatsApp and attribute them to a member." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Revenue" value={`Rs. ${totalRevenue}`} meta="" />
        <StatCard label="Pending Payments" value={state.data.filter((item) => item.status === "pending").length} meta="" />
        <StatCard label="Successful Payments" value={state.data.filter((item) => item.status === "success").length} meta="" />
      </div>
      <ApiState {...state} empty={!state.data.length}>
        <DataTable columns={paymentColumns} rows={state.data} busyId={busyId} searchable pageSize={10} searchPlaceholder="Search by member, plan, status…" onEdit={setEditing} onDelete={(row) => remove(row, `payment of Rs. ${row.amount}`)} />
      </ApiState>
      <form className="surface mt-6 grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4" onSubmit={createPayment}>
        <select className="app-input" value={memberId} onChange={(event) => setMemberId(event.target.value)}>
          {memberOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="app-input" value={planId} onChange={(event) => onPlanChange(event.target.value)}>
          {planOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input className="app-input" placeholder="Amount" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        <select className="app-input" name="status" defaultValue="success"><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
        {error && <p className="text-sm text-rose-600 sm:col-span-2 xl:col-span-4">{error}</p>}
        <SubmitButton busy={busy} className="w-fit"><FiPlus /> Add Payment</SubmitButton>
      </form>
      {editing && (
        <EditModal
          title="Edit Payment"
          path="/owner/payments"
          fields={paymentEditFields}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={state.reload}
        />
      )}
    </>
  );
}

function PlanBuilder({ type, path, fields, editFields, extra }) {
  const state = useApiData(path);
  const { busy, error, run } = useFormSubmit();
  const { busyId, remove } = useRowDelete(path, state.reload);
  const [editing, setEditing] = useState(null);
  const isDiet = type === "Diet";

  function create(event) {
    return run(event, async (form, formEl) => {
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
      formEl.reset();
      await state.reload();
    });
  }

  return (
    <>
      <SectionHeader title={`${type} Plans`} subtitle={`Create and manage live ${type.toLowerCase()} plans.`} />
      <form className="surface grid gap-4 p-6 md:grid-cols-2" onSubmit={create}>
        <input className="app-input" name="title" placeholder="Title" required />
        {fields}
        <textarea className="app-input md:col-span-2" name="description" placeholder="Description" />
        {error && <p className="text-sm text-rose-600 md:col-span-2">{error}</p>}
        <SubmitButton busy={busy} className="w-fit">Create {type} Plan</SubmitButton>
      </form>
      <ApiState {...state} empty={!state.data.length}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {state.data.map((item) => (
            <div className="surface p-5" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold dark:text-white">{item.title}</h3>
                <div className="flex shrink-0 gap-2">
                  <button className="btn-secondary px-2 py-1 text-xs" disabled={busyId === item.id} onClick={() => setEditing(item)}>Edit</button>
                  <button className="btn-secondary px-2 py-1 text-xs text-rose-600" disabled={busyId === item.id} onClick={() => remove(item, item.title)}>
                    {busyId === item.id ? <FiLoader className="animate-spin" /> : "Delete"}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              <p className="mt-3 text-sm font-semibold text-brand-600">{isDiet ? `${item.calories || 0} calories · ${item.meals || ""}` : item.exercises}</p>
            </div>
          ))}
        </div>
      </ApiState>
      {editing && (
        <EditModal
          title={`Edit ${type} Plan`}
          path={path}
          fields={editFields}
          row={editing}
          extra={extra}
          onClose={() => setEditing(null)}
          onSaved={state.reload}
        />
      )}
    </>
  );
}

function ResourceTable({ title, path, columns, formFields, buildPayload, fields, editTitle }) {
  const state = useApiData(path);
  const { busy, error, run } = useFormSubmit();
  const { busyId, remove } = useRowDelete(path, state.reload);
  const [editing, setEditing] = useState(null);

  function create(event) {
    return run(event, async (form, formEl) => {
      await api.post(path, buildPayload(form));
      formEl.reset();
      await state.reload();
    });
  }

  return (
    <>
      <SectionHeader title={title} />
      <ApiState {...state} empty={!state.data.length}>
        <DataTable
          columns={columns}
          rows={state.data}
          busyId={busyId}
          searchable
          pageSize={10}
          searchPlaceholder={`Search ${title.toLowerCase()}…`}
          onEdit={fields ? setEditing : undefined}
          onDelete={(row) => remove(row, row.name || `this ${title.slice(0, -1).toLowerCase()}`)}
        />
      </ApiState>
      {formFields && (
        <form className="surface mt-6 grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3" onSubmit={create}>
          {formFields}
          {error && <p className="text-sm text-rose-600 md:col-span-2 xl:col-span-3">{error}</p>}
          <SubmitButton busy={busy} className="w-fit"><FiPlus /> Add {title.slice(0, -1)}</SubmitButton>
        </form>
      )}
      {editing && fields && (
        <EditModal
          title={editTitle || `Edit ${title.slice(0, -1)}`}
          path={path}
          fields={fields}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={state.reload}
        />
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
        <DataTable columns={attendanceColumns} rows={rows} searchable pageSize={15} searchPlaceholder="Search check-ins by member…" />
      </ApiState>
    </>
  );
}

export const DietPlans = () => <PlanBuilder type="Diet" path="/owner/diet-plans" editFields={dietFields} extra={(row) => ({ memberId: row.member_id || null, trainerId: row.trainer_id || null })} fields={<><input className="app-input" name="calories" placeholder="Calories" type="number" /><input className="app-input" name="meals" placeholder="Meals" /></>} />;
export const WorkoutPlans = () => <PlanBuilder type="Workout" path="/owner/workout-plans" editFields={workoutFields} extra={(row) => ({ memberId: row.member_id || null, trainerId: row.trainer_id || null })} fields={<input className="app-input" name="exercises" placeholder="Exercises" />} />;
export const Analytics = () => <><SectionHeader title="Analytics" /><div className="grid gap-4 xl:grid-cols-2"><ChartCard title="Revenue Chart" /><ChartCard title="Membership Growth Chart" type="bar" dataKey="members" /></div></>;
