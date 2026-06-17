import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { roleHome, useAuth } from "../../context/AuthContext";

function AuthShell({ title, children, footer }) {
  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12">
      <div className="surface w-full max-w-md p-6">
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h1>
        <div className="mt-6 grid gap-4">{children}</div>
        {footer && <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{footer}</p>}
      </div>
    </main>
  );
}

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const user = await login({
        email: form.get("email"),
        password: form.get("password")
      });
      const redirect = searchParams.get("redirect");
      navigate(redirect || roleHome[user.role] || "/owner");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your email and password.");
    }
  }

  return (
    <AuthShell title="Login" footer={<><Link className="text-brand-600" to="/forgot-password">Forgot password?</Link> · <Link className="text-brand-600" to="/register">Create account</Link></>}>
      <form className="grid gap-4" onSubmit={submit}>
        <input className="app-input" name="email" placeholder="Email" type="email" required />
        <input className="app-input" name="password" placeholder="Password" type="password" required />
        {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        <button className="btn-primary" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const user = await register({
        name: form.get("name"),
        gymName: form.get("gymName"),
        email: form.get("email"),
        password: form.get("password"),
        plan: form.get("plan")
      });
      navigate(roleHome[user.role] || "/owner");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  }

  return (
    <AuthShell title="Register" footer={<Link className="text-brand-600" to="/login">Already have an account?</Link>}>
      <form className="grid gap-4" onSubmit={submit}>
        <input className="app-input" name="name" placeholder="Full name" required />
        <input className="app-input" name="gymName" placeholder="Gym or company name" required />
        <input className="app-input" name="email" placeholder="Email" type="email" required />
        <input className="app-input" name="password" placeholder="Password" type="password" required />
        <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">At least 8 characters with an uppercase letter, a lowercase letter, a number, and a symbol (e.g. Iron@Gym2026).</p>
        <select className="app-input" name="plan">
          <option>Starter</option>
          <option>Professional</option>
          <option>Enterprise</option>
        </select>
        {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        <button className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
      </form>
    </AuthShell>
  );
}

export function ForgotPassword() {
  return (
    <AuthShell title="Forgot Password" footer={<Link className="text-brand-600" to="/login">Back to login</Link>}>
      <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
        <p>To get your password reset:</p>
        <p>• <strong>Gym members</strong> — contact your gym (on WhatsApp). They can reset your login from their dashboard.</p>
        <p>• <strong>Gym owners</strong> — contact FitManager support on WhatsApp and we'll reset it for you.</p>
        <p className="text-slate-500">Once you're logged in, you can change your own password any time from <strong>Settings</strong>.</p>
      </div>
    </AuthShell>
  );
}

export function ResetPassword() {
  return (
    <AuthShell title="Reset Password" footer={<Link className="text-brand-600" to="/login">Back to login</Link>}>
      <p className="text-sm text-slate-600 dark:text-slate-300">Log in with the password your gym or FitManager support gave you, then change it under <strong>Settings → Change Password</strong>.</p>
    </AuthShell>
  );
}
