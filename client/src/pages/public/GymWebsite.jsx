import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiClock, FiMail, FiMapPin, FiMenu, FiPhone, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ApiState, useApiData } from "../../hooks/useApiData";
import { waLink } from "../../utils/whatsapp";

const sections = [["Plans", "#plans"], ["Trainers", "#trainers"], ["Contact", "#contact"]];

// Standalone, gym-branded navbar. Deliberately has NO FitManager marketing links
// (Home/Pricing/About) — this is the gym's own website for its customers.
function GymNavbar({ gym }) {
  const joinLink = waLink(gym.whatsapp, `Hi ${gym.name}, I'd like to join your gym.`);
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="#top" className="flex min-w-0 items-center gap-2">
          {gym.logo_url && <img className="h-8 w-8 shrink-0 rounded-md object-cover" src={gym.logo_url} alt={gym.name} />}
          <span className="truncate text-lg font-black text-slate-950 dark:text-white">{gym.name}</span>
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {sections.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link className="btn-secondary hidden sm:inline-flex" to="/login">Member Login</Link>
          {joinLink && <a className="btn-primary bg-emerald-600 hover:bg-emerald-700" href={joinLink} target="_blank" rel="noreferrer"><FaWhatsapp /> Join</a>}
          <button className="btn-secondary px-2 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          {sections.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">{label}</a>
          ))}
          <Link className="btn-secondary mt-2 w-full sm:hidden" to="/login" onClick={() => setOpen(false)}>Member Login</Link>
        </div>
      )}
    </header>
  );
}

// Gym-branded footer for the gym's own public site. Stays on-brand for the gym;
// FitManager only gets a subtle "Powered by" credit.
function GymFooter({ gym }) {
  const join = waLink(gym.whatsapp, `Hi ${gym.name}, I'd like to join your gym.`);
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              {gym.logo_url && <img className="h-8 w-8 rounded-md object-cover" src={gym.logo_url} alt={gym.name} />}
              <span className="text-lg font-black text-slate-950 dark:text-white">{gym.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">{gym.description || "A modern fitness studio. Train with us today."}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#plans" className="text-slate-500 hover:text-brand-600 dark:text-slate-400">Membership Plans</a></li>
              <li><a href="#trainers" className="text-slate-500 hover:text-brand-600 dark:text-slate-400">Trainers</a></li>
              <li><a href="#contact" className="text-slate-500 hover:text-brand-600 dark:text-slate-400">Contact</a></li>
              <li><Link to="/login" className="text-slate-500 hover:text-brand-600 dark:text-slate-400">Member Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Get in Touch</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              {gym.address && <li className="flex gap-2"><FiMapPin className="mt-0.5 shrink-0 text-brand-600" /> {gym.address}</li>}
              {gym.phone && <li className="flex gap-2"><FiPhone className="mt-0.5 shrink-0 text-brand-600" /> <a className="hover:text-brand-600" href={`tel:${gym.phone}`}>{gym.phone}</a></li>}
              {gym.email && <li className="flex gap-2"><FiMail className="mt-0.5 shrink-0 text-brand-600" /> <a className="hover:text-brand-600" href={`mailto:${gym.email}`}>{gym.email}</a></li>}
              {gym.working_hours && <li className="flex gap-2"><FiClock className="mt-0.5 shrink-0 text-brand-600" /> {gym.working_hours}</li>}
              {join && <li><a className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700" href={join} target="_blank" rel="noreferrer"><FaWhatsapp /> Chat on WhatsApp</a></li>}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
          <span>© {new Date().getFullYear()} {gym.name}. All rights reserved.</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">Powered by FitManager</span>
        </div>
      </div>
    </footer>
  );
}

export function GymWebsite() {
  const { slug } = useParams();
  const state = useApiData(`/public/gyms/${slug}`, null);
  const gym = state.data?.gym;
  const plans = state.data?.plans || [];
  const trainers = state.data?.trainers || [];

  return (
    <div id="top" className="min-h-screen scroll-smooth bg-slate-50 dark:bg-slate-950">
      <ApiState {...state} empty={!state.data}>
        {gym && (
          <>
            <GymNavbar gym={gym} />

            <section className="bg-white dark:bg-slate-950">
              <div className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  {gym.logo_url && <img className="mb-5 h-16 w-16 rounded-md object-cover" src={gym.logo_url} alt={gym.name} />}
                  <h1 className="text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-6xl">{gym.name}</h1>
                  <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{gym.description || "A modern fitness studio. Train with us today."}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {gym.whatsapp ? (
                      <a className="btn-primary bg-emerald-600 hover:bg-emerald-700" href={waLink(gym.whatsapp, `Hi ${gym.name}, I'd like to join your gym. Please share the details.`)} target="_blank" rel="noreferrer"><FaWhatsapp className="text-lg" /> Join on WhatsApp</a>
                    ) : (
                      <a className="btn-primary" href={`tel:${gym.phone || ""}`}>Join Now</a>
                    )}
                    <a className="btn-secondary" href="#plans">View Plans</a>
                  </div>
                </div>
                <div className="surface p-5">
                  <h2 className="text-lg font-bold dark:text-white">Gym Details</h2>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex gap-3"><FiMapPin className="mt-1 text-brand-600" /> {gym.address || "Address not added yet"}</p>
                    <p className="flex gap-3"><FiPhone className="mt-1 text-brand-600" /> {gym.phone || "Phone not added yet"}</p>
                    <p className="flex gap-3"><FiMail className="mt-1 text-brand-600" /> {gym.email || "Email not added yet"}</p>
                    <p className="flex gap-3"><FiClock className="mt-1 text-brand-600" /> {gym.working_hours || "Working hours not added yet"}</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="plans" className="mx-auto max-w-7xl px-4 py-16">
              <h2 className="text-3xl font-black text-slate-950 dark:text-white">Membership Plans</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {plans.length ? plans.map((plan) => (
                  <div className="surface p-6" key={plan.id}>
                    <h3 className="text-xl font-bold dark:text-white">{plan.name}</h3>
                    <p className="mt-4 text-3xl font-black text-brand-600">Rs. {plan.price}</p>
                    <p className="mt-1 text-sm text-slate-500">{plan.duration_days} days</p>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
                  </div>
                )) : <div className="surface p-6 text-sm text-slate-500">No membership plans added yet.</div>}
              </div>
            </section>

            <section id="trainers" className="bg-white py-16 dark:bg-slate-900">
              <div className="mx-auto max-w-7xl px-4">
                <h2 className="text-3xl font-black text-slate-950 dark:text-white">Trainers</h2>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {trainers.length ? trainers.map((trainer) => (
                    <div className="surface p-5" key={trainer.id}>
                      <h3 className="font-bold dark:text-white">{trainer.name}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{trainer.specialization || "Fitness Trainer"}</p>
                    </div>
                  )) : <div className="surface p-6 text-sm text-slate-500">No trainers added yet.</div>}
                </div>
              </div>
            </section>

            <section id="contact" className="mx-auto max-w-7xl px-4 py-16">
              <div className="rounded-lg bg-slate-950 px-6 py-10 text-center text-white">
                <h2 className="text-3xl font-black">Ready to join {gym.name}?</h2>
                <p className="mx-auto mt-3 max-w-2xl text-slate-300">Message us on WhatsApp and we'll get you started with a membership.</p>
                {gym.whatsapp ? (
                  <a className="btn-primary mt-6 inline-flex bg-emerald-600 hover:bg-emerald-700" href={waLink(gym.whatsapp, `Hi ${gym.name}, I'd like to join your gym.`)} target="_blank" rel="noreferrer"><FaWhatsapp className="text-lg" /> Message us on WhatsApp</a>
                ) : (
                  <a className="btn-primary mt-6 inline-flex" href={`mailto:${gym.email || ""}`}>Contact the gym</a>
                )}
              </div>
            </section>

            <GymFooter gym={gym} />
          </>
        )}
      </ApiState>
    </div>
  );
}
