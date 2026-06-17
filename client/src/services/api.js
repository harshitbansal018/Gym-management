import axios from "axios";

const ACCESS_KEY = "fitmanager_access_token";
const REFRESH_KEY = "fitmanager_refresh_token";
const USER_KEY = "fitmanager_user";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function forceLogout() {
  clearSession();
  // Let the app react (AuthContext clears user) and bounce to login once.
  window.dispatchEvent(new Event("fitmanager:logout"));
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login");
  }
}

// Single in-flight refresh shared by all queued 401s so we only refresh once.
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error("No refresh token");
  // Bare axios call so it skips our interceptors (no stale Authorization header).
  const { data } = await axios.post(
    `${api.defaults.baseURL}/auth/refresh`,
    { refreshToken },
    { timeout: 10000 }
  );
  const accessToken = data.data.accessToken;
  localStorage.setItem(ACCESS_KEY, accessToken);
  // The server rotates the refresh token on every refresh — store the new one.
  if (data.data.refreshToken) localStorage.setItem(REFRESH_KEY, data.data.refreshToken);
  if (data.data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
  return accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes("/auth/");

    // Try a one-time silent refresh on 401 (but never for auth endpoints themselves).
    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
        const token = await refreshPromise;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        forceLogout();
        return Promise.reject(error);
      }
    }

    if (status === 401 && !isAuthCall) forceLogout();
    return Promise.reject(error);
  }
);
