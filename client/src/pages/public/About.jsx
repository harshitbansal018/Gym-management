export function About() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">About FitManager</h1>
      <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">FitManager is a frontend-ready SaaS experience for gym networks that need cleaner operations, faster member management, and analytics that owners can trust.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Platform Admin", "Gym Owner", "Trainer", "Member"].map((role) => <div className="surface p-5 font-bold dark:text-white" key={role}>{role}</div>)}
      </div>
    </main>
  );
}
