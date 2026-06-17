// Boilerplate legal pages. REVIEW AND EDIT before launch — replace the bracketed
// placeholders and have a professional check them for your jurisdiction (India).
const COMPANY = "[Your Company Name]";
const CONTACT_EMAIL = "[your-support-email]";
const LAST_UPDATED = "June 2026";

function LegalShell({ title, children }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-slate-950 dark:text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
      <div className="mt-8 grid gap-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </main>
  );
}

function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{heading}</h2>
      <div className="mt-2 grid gap-2">{children}</div>
    </section>
  );
}

export function Terms() {
  return (
    <LegalShell title="Terms of Service">
      <p>These Terms govern your use of FitManager (the "Service") operated by {COMPANY}. By creating an account or using the Service, you agree to these Terms.</p>
      <Section heading="1. The Service">
        <p>FitManager is gym-management software that lets gym owners manage members, plans, trainers, payments, and attendance, and publish a public gym page.</p>
      </Section>
      <Section heading="2. Accounts &amp; Subscriptions">
        <p>Gym owners subscribe to a plan. Access to features is enabled after your subscription payment is confirmed and your account is activated. You are responsible for keeping your login credentials secure and for all activity under your account.</p>
      </Section>
      <Section heading="3. Payments">
        <p>Subscription fees are paid as communicated at sign-up. Member-to-gym payments are arranged directly between the member and the gym; {COMPANY} is not a party to, and is not responsible for, those payments.</p>
      </Section>
      <Section heading="4. Acceptable Use">
        <p>You agree not to misuse the Service, attempt unauthorized access, or use it for unlawful purposes. We may suspend accounts that violate these Terms.</p>
      </Section>
      <Section heading="5. Data">
        <p>You retain ownership of the data you enter. We process it to provide the Service as described in our Privacy Policy.</p>
      </Section>
      <Section heading="6. Liability">
        <p>The Service is provided "as is". To the extent permitted by law, {COMPANY} is not liable for indirect or consequential damages, or for losses arising from gym–member transactions.</p>
      </Section>
      <Section heading="7. Changes &amp; Contact">
        <p>We may update these Terms; continued use means acceptance. Questions: {CONTACT_EMAIL}.</p>
      </Section>
    </LegalShell>
  );
}

export function Privacy() {
  return (
    <LegalShell title="Privacy Policy">
      <p>This policy explains how {COMPANY} collects and uses information when you use FitManager.</p>
      <Section heading="1. Information We Collect">
        <p>Account details (name, email), gym and member records you enter (names, contact details, membership and payment records, attendance), and basic technical logs.</p>
      </Section>
      <Section heading="2. How We Use It">
        <p>To provide and secure the Service, operate your gym workspace, and communicate with you about your account.</p>
      </Section>
      <Section heading="3. Sharing">
        <p>We do not sell your data. We share it only with infrastructure providers needed to run the Service (e.g. cloud hosting and database), and where required by law.</p>
      </Section>
      <Section heading="4. Security">
        <p>Passwords are stored hashed. We use access controls and encrypted connections. No system is perfectly secure, but we take reasonable measures to protect your data.</p>
      </Section>
      <Section heading="5. Retention &amp; Your Rights">
        <p>We keep data while your account is active. You may request access, correction, or deletion of your data by contacting {CONTACT_EMAIL}.</p>
      </Section>
      <Section heading="6. Contact">
        <p>For privacy questions, email {CONTACT_EMAIL}.</p>
      </Section>
    </LegalShell>
  );
}

export function Refund() {
  return (
    <LegalShell title="Refund &amp; Cancellation Policy">
      <Section heading="Subscriptions">
        <p>Gym-owner subscriptions to FitManager are billed per the plan you choose. You may cancel at any time; cancellation stops future renewals. Fees already paid for the current period are non-refundable unless required by law.</p>
      </Section>
      <Section heading="Member Payments">
        <p>Membership fees that members pay to a gym are handled directly by that gym. Refunds for those payments are at the discretion of the individual gym, not {COMPANY}.</p>
      </Section>
      <Section heading="Contact">
        <p>For billing questions about your FitManager subscription, email {CONTACT_EMAIL}.</p>
      </Section>
    </LegalShell>
  );
}
