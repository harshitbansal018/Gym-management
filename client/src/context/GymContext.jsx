import { createContext, useContext, useCallback, useMemo, useState } from "react";
import { api } from "../services/api";

const GymContext = createContext(null);

export function GymProvider({ children }) {
  const [cache, setCache] = useState({});

  const request = useCallback(async (method, path, body) => {
    const { data } = await api({ method, url: path, data: body });
    return data.data;
  }, []);

  const fetchResource = useCallback(async (key, path) => {
    const data = await request("get", path);
    setCache((current) => ({ ...current, [key]: data }));
    return data;
  }, [request]);

  const value = useMemo(() => ({
    cache,
    request,
    fetchResource
  }), [cache, request, fetchResource]);

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export const useGym = () => useContext(GymContext);
