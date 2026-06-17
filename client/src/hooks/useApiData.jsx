import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useApiData(path, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(path);
      setData(response.data.data ?? initialValue);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}

export function ApiState({ loading, error, empty, children }) {
  if (loading) return <div className="surface p-6 text-sm text-slate-500 dark:text-slate-300">Loading live data...</div>;
  if (error) return <div className="surface border-rose-200 p-6 text-sm text-rose-600">{error}</div>;
  if (empty) return <div className="surface p-6 text-sm text-slate-500 dark:text-slate-300">No records found yet.</div>;
  return children;
}
