import { SectionHeader } from "../../components/SectionHeader";

export function PlaceholderPage({ title }) {
  return (
    <>
      <SectionHeader title={title} subtitle="This frontend-ready page is wired for future API data." />
      <div className="surface p-6 text-sm text-slate-600 dark:text-slate-300">Production UI shell, responsive layout, and theme styling are ready.</div>
    </>
  );
}
