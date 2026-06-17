import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ChartCard({ title, type = "area", dataKey = "revenue", data = [] }) {
  const Chart = type === "bar" ? BarChart : AreaChart;

  return (
    <div className="surface p-4">
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      {!data.length ? (
        <div className="flex h-72 items-center justify-center rounded-md bg-slate-50 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Chart data will appear after payments and memberships are created.
        </div>
      ) : (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            {type === "bar" ? (
              <Bar dataKey={dataKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
            ) : (
              <Area type="monotone" dataKey={dataKey} stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
