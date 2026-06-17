import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const roleHome = {
  platform_admin: "/admin",
  gym_owner: "/owner",
  trainer: "/trainer",
  member: "/member"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("fitmanager_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem("fitmanager_user", JSON.stringify(user));
    else localStorage.removeItem("fitmanager_user");
  }, [user]);

  // The API layer fires this when a token refresh fails (session truly expired).
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("fitmanager:logout", onLogout);
    return () => window.removeEventListener("fitmanager:logout", onLogout);
  }, []);

  async function login(credentials) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("fitmanager_access_token", data.data.accessToken);
      localStorage.setItem("fitmanager_refresh_token", data.data.refreshToken);
      setUser(data.data.user);
      return data.data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("fitmanager_access_token", data.data.accessToken);
      localStorage.setItem("fitmanager_refresh_token", data.data.refreshToken);
      setUser(data.data.user);
      return data.data.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const refreshToken = localStorage.getItem("fitmanager_refresh_token");
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // Local logout should still complete if the server is unavailable.
    }
    localStorage.removeItem("fitmanager_access_token");
    localStorage.removeItem("fitmanager_refresh_token");
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    roleHome
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
