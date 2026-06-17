import { Link, useParams } from "react-router-dom";
import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ApiState, useApiData } from "../../hooks/useApiData";
import { waLink } from "../../utils/whatsapp";

// Standalone, gym-branded navbar. Deliberately has NO FitManager marketing links
// (Home/Pricing/About) — this is the gym's own website for its customers.
function GymNavbar({ gym }) {
  const joinLink = waLink(gym.whatsapp, `Hi ${gym.name}, I'd like to join your gym.`);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="#top" className="flex items-center gap-2">
          {gym.logo_url && <img className="h-8 w-8 rounded-md object-cover" src={gym.logo_url} alt={gym.name} />}
          <span className="text-lg font-black text-slate-950 dark:text-white">{gym.name}</span>
        </a>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#plans" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">Plans</a>
          <a href="#trainers" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">Trainers</a>
          <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">Contact</a>
        </div>
        <div className="flex items-center gap-2">
          <Link className="btn-secondary" to="/login">Member Login</Link>
          {joinLink && <a className="btn-primary bg-emerald-600 hover:bg-emerald-700" href={joinLink} target="_blank" rel="noreferrer"><FaWhatsapp /> Join</a>}
        </div>
      </nav>
    </header>
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

            <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm text-slate-500 sm:flex-row">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{gym.name}</span>
                <span>{gym.address || ""}</span>
                <Link className="text-slate-400 hover:text-brand-600" to="/login">Member Login</Link>
              </div>
            </footer>
          </>
        )}
      </ApiState>
    </div>
  );
}
