import { Link } from "react-router-dom";
import { FiActivity, FiArrowRight, FiBarChart2, FiCheckCircle, FiCreditCard, FiSettings, FiUsers } from "react-icons/fi";

const pricingPlans = [
  { name: "Starter", price: "₹499", period: "/month", featured: false, features: ["1 gym branch", "300 members", "Basic reports", "Email support"] },
  { name: "Professional", price: "₹999", period: "/month", featured: true, features: ["3 branches", "2,000 members", "Advanced analytics", "Priority support"] },
  { name: "Enterprise", price: "₹1999", period: "/month", featured: false, features: ["Unlimited branches", "Custom roles", "Revenue insights", "Dedicated success manager"] }
];

const testimonials = [
  "FitManager helped us replace spreadsheets with a real operating rhythm.",
  "Payments, renewals, and trainer plans are finally in one clean place.",
  "The dashboards give our owners instant clarity without extra admin work."
];

const ownerBenefits = [
  ["Create your gym profile", FiSettings, "Add your gym name, logo, working hours, contact details, gallery, and address."],
  ["Sell memberships online", FiCreditCard, "Create Basic, Premium, or Elite plans and track every payment from one dashboard."],
  ["Manage members faster", FiUsers, "See active, expired, pending, and expiring memberships without manual registers."],
  ["Assign trainers and plans", FiActivity, "Give trainers member lists, workout plans, and diet plans inside the same system."],
  ["Understand revenue", FiBarChart2, "Track daily revenue, monthly revenue, successful payments, and pending dues."],
  ["Run from any device", FiCheckCircle, "Use a clean responsive dashboard from reception, office, or mobile."]
];

const setupSteps = [
  "Choose your FitManager membership",
  "Create your gym profile",
  "Add trainers, members, and plans",
  "Start collecting payments and managing renewals"
];

export function Home() {
  return (
    <>
      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-600">For gym owners</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-6xl">
              Buy a FitManager plan and create your own gym dashboard.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Launch a professional gym management system for memberships, trainers, payments, workout plans, diet plans, and renewals without building software from scratch.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/register">Create My Gym <FiArrowRight /></Link>
              <Link className="btn-secondary" to="/pricing">See Membership Plans</Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
              <p><span className="font-bold text-slate-950 dark:text-white">10 min</span><br />to set up</p>
              <p><span className="font-bold text-slate-950 dark:text-white">4 roles</span><br />owner, trainer, member, admin</p>
              <p><span className="font-bold text-slate-950 dark:text-white">Rs. 499</span><br />starting monthly plan</p>
            </div>
          </div>
          <div className="surface overflow-hidden p-4">
            <div className="rounded-md bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold text-brand-100">Your gym after setup</p>
              <p className="mt-2 text-2xl font-black">Iron Core Fitness</p>
              <p className="mt-1 text-sm text-slate-300">Owner dashboard preview</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Active Members", "842"],
                ["Monthly Revenue", "Rs. 8.7L"],
                ["Pending Payments", "38"],
                ["Expiring Soon", "57"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-brand-600 p-5 text-white">
              <p className="text-sm font-semibold text-brand-100">Today</p>
              <p className="mt-2 text-2xl font-black">124 check-ins, 18 renewals, 6 new trial members</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Everything a gym owner needs after buying a plan</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">FitManager gives each gym owner their own workspace, so they can manage their gym, staff, members, payments, and plans in one place.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ownerBenefits.map(([title, Icon, body]) => (
            <div className="surface p-5" key={title}>
              <Icon className="text-2xl text-brand-600" />
              <h3 className="mt-4 font-bold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">How gym owners start</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">A simple path from subscription to a working gym dashboard.</p>
          </div>
          <div className="grid gap-3">
            {setupSteps.map((step, index) => (
              <div className="surface flex items-center gap-4 p-4" key={step}>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 font-black text-brand-700 dark:bg-brand-600/15 dark:text-brand-100">{index + 1}</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Membership plans for gym owners</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Pick a monthly plan, create your gym, and start managing members.</p>
          </div>
          <Link className="btn-secondary" to="/pricing">Compare Plans</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`surface p-6 ${plan.featured ? "ring-2 ring-brand-500" : ""}`}>
              <h3 className="text-xl font-bold dark:text-white">{plan.name}</h3>
              <p className="mt-4 text-3xl font-black text-slate-950 dark:text-white">{plan.price}<span className="text-sm font-medium text-slate-500">{plan.period}</span></p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <Link className="btn-primary mt-6 w-full" to="/register">Buy Plan & Create Gym</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Trusted by growing gym teams</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((quote) => <blockquote className="surface p-5 text-slate-700 dark:text-slate-200" key={quote}>{quote}</blockquote>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Can I create my own gym after buying a plan?", "Yes. After registration, the gym owner dashboard includes gym profile, membership plans, trainers, members, payments, diet plans, and workout plans."],
            ["Can I add trainers and members?", "Yes. You can add trainers, manage members, assign plans, and track membership status."],
            ["Can I manage renewals and expired memberships?", "Yes. The dashboard highlights active, pending, expired, and expiring memberships."],
            ["Is it ready for mobile use?", "Yes. The public website and dashboards are responsive for desktop, tablet, and mobile."]
          ].map(([q, answer]) => (
            <div className="surface p-5" key={q}>
              <h3 className="font-bold dark:text-white">{q}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-lg bg-slate-950 px-6 py-10 text-center text-white">
          <h2 className="text-3xl font-black">Ready to create your gym?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">Buy a FitManager membership and start managing your gym with a professional owner dashboard.</p>
          <Link className="btn-primary mt-6" to="/register">Create My Gym</Link>
        </div>
      </section>
    </>
  );
}
