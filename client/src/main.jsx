import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRouter.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GymProvider } from "./context/GymContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./styles/index.css";

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <GymProvider>
          <Suspense fallback={<Loading />}>
            <RouterProvider router={router} />
          </Suspense>
        </GymProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
