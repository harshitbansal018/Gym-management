export function Contact() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">Contact</h1>
      <form className="surface mt-8 grid gap-4 p-6">
        <input className="app-input" placeholder="Name" />
        <input className="app-input" placeholder="Email" type="email" />
        <textarea className="app-input min-h-32" placeholder="Message" />
        <button className="btn-primary" type="button">Send Message</button>
      </form>
    </main>
  );
}
