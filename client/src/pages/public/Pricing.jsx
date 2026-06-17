import { Link } from "react-router-dom";

const pricingPlans = [
  { name: "Starter", price: "₹499", period: "/month" },
  { name: "Professional", price: "₹999", period: "/month" },
  { name: "Enterprise", price: "₹1999", period: "/month" }
];

export function Pricing() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">Pricing</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">Choose a plan that fits your gym network.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div className="surface p-6" key={plan.name}>
            <h2 className="text-xl font-bold dark:text-white">{plan.name}</h2>
            <p className="mt-4 text-3xl font-black text-slate-950 dark:text-white">{plan.price}<span className="text-sm text-slate-500">{plan.period}</span></p>
            <Link className="btn-primary mt-6 w-full" to="/register">Start Free Trial</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
