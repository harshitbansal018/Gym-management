import { DataTable } from "../../components/DataTable";
import { SectionHeader } from "../../components/SectionHeader";
import { StatCard } from "../../components/StatCard";
import { ApiState, useApiData } from "../../hooks/useApiData";

const memberColumns = [{ key: "name", label: "Member Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "status", label: "Status" }];

export function TrainerDashboard() {
  const { data, loading, error } = useApiData("/trainer/dashboard", {});
  const cards = [["Assigned Members", data.assignedMembers ?? 0, ""], ["Workout Plans", data.workoutPlans ?? 0, ""], ["Diet Plans", data.dietPlans ?? 0, ""]];
  return (
    <>
      <SectionHeader title="Trainer Dashboard" subtitle="Live assigned members and plan workload." />
      <ApiState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-3">{cards.map(([label, value, meta]) => <StatCard key={label} label={label} value={value} meta={meta} />)}</div>
      </ApiState>
    </>
  );
}

export function AssignedMembers() {
  const state = useApiData("/trainer/members");
  return <><SectionHeader title="Assigned Members" /><ApiState {...state} empty={!state.data.length}><DataTable columns={memberColumns} rows={state.data} /></ApiState></>;
}

export function TrainerDietPlans() {
  const state = useApiData("/trainer/diet-plans");
  return <PlanList title="Diet Plans" state={state} detail={(item) => `${item.calories || 0} calories · ${item.meals || ""}`} />;
}

export function TrainerWorkoutPlans() {
  const state = useApiData("/trainer/workout-plans");
  return <PlanList title="Workout Plans" state={state} detail={(item) => item.exercises} />;
}

function PlanList({ title, state, detail }) {
  return (
    <>
      <SectionHeader title={title} />
      <ApiState {...state} empty={!state.data.length}>
        <div className="grid gap-4 md:grid-cols-2">
          {state.data.map((item) => (
            <div className="surface p-5" key={item.id}>
              <h3 className="font-bold text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              <p className="mt-3 text-sm font-semibold text-brand-600">{detail(item)}</p>
            </div>
          ))}
        </div>
      </ApiState>
    </>
  );
}
