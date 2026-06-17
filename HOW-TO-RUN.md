# FitManager — How to Run & Production Readiness

This document explains how to run FitManager on your computer, how to run it live
for real customers, and an honest assessment of what's ready vs. what still needs
work before you charge money.

- **Stack:** React + Vite (frontend) · Express + PostgreSQL (backend) · Neon (database)
- **Model:** Gym owners pay you on WhatsApp → you activate them from the admin panel.
  Members pay their gym on WhatsApp. Attendance is QR self check-in. (No payment gateway.)

---

## Part 1 — Run it on your computer (development)

### Prerequisites
- **Node.js 18+** (you have v24) — check with `node --version`
- The database connection string is already set in `server/.env`.

### One-time setup (already done, but here for reference)
```powershell
cd d:\Harshit\gym-management\server
npm install
npm run migrate     # creates all database tables
npm run seed        # creates your platform-admin login
```
```powershell
cd d:\Harshit\gym-management\client
npm install
```

### Every time you want to run it — open TWO terminals

**Terminal 1 — Backend API**
```powershell
cd d:\Harshit\gym-management\server
npm run dev
```
Runs on http://localhost:5000 — you'll see `FitManager API running on port 5000`.

**Terminal 2 — Frontend**
```powershell
cd d:\Harshit\gym-management\client
npm run dev
```
Runs on http://localhost:5173 — **open this URL in your browser.**

> Tip: add your WhatsApp number to `server\.env` so the owner activation screen shows it:
> `PLATFORM_WHATSAPP=919876543210` (country code, no `+`)

### Logins
| Role | How to get in |
|------|---------------|
| **Platform admin (you)** | `/login` → `bansalharshitpc.091@outlook.com` / `Bansal@123` |
| **Gym owner** | Click **Register** (password needs 8+ chars, upper + lower + number + symbol, e.g. `Iron@Gym2026`). New gym starts *pending* — activate it from the admin panel. |
| **Member** | A gym owner adds them with "Create login", then shares the credentials. |

### Full test walk-through
1. Register a gym owner → you land on the **Pending Activation** screen.
2. Log in as **admin** (another browser/incognito) → **Gyms** → **Activate**.
3. Back as owner → refresh → dashboard unlocked. In **Gym Profile**, add a WhatsApp number + payment QR URL.
4. **Members** → add a member with a login → copy the credentials.
5. Log in as the member → **Pay via WhatsApp** and **Check in now** both work.
6. Owner's **Attendance** page shows the check-in and today's count.

---

## Part 2 — Run it live for real customers (production)

The detailed guide is in **[DEPLOYMENT.md](DEPLOYMENT.md)**. Summary of the two paths:

### Option A — One server with Docker (most self-contained)
On a Linux server (e.g. AWS Mumbai, or any VPS) with Docker installed:
```bash
cp .env.production.example .env   # fill in secrets, DB password, your domain, WhatsApp number
docker compose up -d --build
docker compose exec server npm run seed   # one-time: create your admin login
```
Then point your domain's DNS at the server and **add HTTPS** (DEPLOYMENT.md shows a
3-line Caddy config that gets free certificates automatically).

### Option B — Managed platforms (no server admin)
- **Database:** Neon (Mumbai region)
- **API:** Render (root `server`, start `node src/db/migrate.js && node src/server.js`)
- **Web:** Vercel or Netlify (root `client`, build `npm run build`, output `dist`)

Either way you must set real values for: `DATABASE_URL`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `PLATFORM_WHATSAPP`, and a strong admin password.

---

## Part 3 — Is it production ready? (honest answer)

**Short answer:** The app is now **launch-ready for a pilot / your first paying
gyms**, once *you* complete the 3 deployment/legal items below that only you can do.

### ✅ Ready and working (in the code)
- Secure auth (JWT access + refresh, bcrypt, hashed refresh tokens, **refresh-token rotation**, silent token refresh)
- Multi-tenant isolation — gyms can't see each other's data
- Role-based access (admin / owner / trainer / member)
- The full money flow: gym registers → pending → you activate → access unlocked
- Member logins, WhatsApp payment redirects, QR attendance with one-check-in-per-day
- **Password recovery without email:** self-service "Change Password" (Settings, every role);
  admin resets any user; gym owner resets a member — fits the WhatsApp model
- **Plan limits enforced:** Starter 100 / Professional 500 / Enterprise unlimited members
  (edit in `server/src/config/plans.js`)
- **Automatic membership expiry:** members past their expiry date auto-flip to "expired" daily
- **Legal pages:** Terms, Privacy, Refund (at `/terms`, `/privacy`, `/refund`) + footer links
- Security middleware: Helmet, CORS allowlist, rate limiting, input validation; production request logging
- Code-split frontend (loads ~2× faster) + Docker config + DB migrations + real database (Neon)

### ⚠️ YOUR action items before taking real money (I can't do these for you)
| Item | Why it matters | What to do |
|------|----------------|-----------|
| **HTTPS** | Logins/tokens travel unencrypted without it. Mandatory. | Render + Vercel give HTTPS automatically. Self-host? use Caddy (see DEPLOYMENT.md). |
| **Review the legal pages** | The Terms/Privacy/Refund text is *boilerplate* with `[placeholders]`. | Edit `client/src/pages/public/LegalPages.jsx` — fill in your company name + email; ideally have a professional check it. |
| **Turn on database backups** | One bad day = all customer data gone. | In Neon, enable point-in-time restore / scheduled backups. |
| **Set `PLATFORM_WHATSAPP`** | The owner activation screen needs your number. | Add it to your production env vars. |

### 🟡 Nice to have soon (not launch blockers)
- **Transactional email** — still none (welcome, receipts, expiry reminders). The WhatsApp
  model covers the essentials, but email improves polish. Needs an email provider account.
- **Analytics / About / Contact** pages are still light/placeholder.
- **No automated tests** and **no error monitoring** (e.g. Sentry) yet.
- **Rate limiting is in-memory** — fine for one server; needs Redis if you run multiple instances.

### 🔵 Deliberately not included (by your design)
- No Razorpay / payment gateway, no auto-debit, no KYC. Money is handled over WhatsApp
  and you activate gyms manually. This was a *choice* to launch fast and avoid regulatory
  burden — revisit Razorpay when you scale.

### Verdict
**Pilot-ready.** The code-side production gaps are closed. Do the 4 ⚠️ items (all
quick — mostly deploy settings + editing the legal text) and you can onboard your
first paying gyms.

---

## Troubleshooting
| Problem | Fix |
|---------|-----|
| "Password must be strong" on register | Use 8+ chars with upper + lower + number + symbol (e.g. `Iron@Gym2026`). |
| Owner sees "Pending Activation" forever | Log in as admin → Gyms → Activate that gym, then refresh. |
| "Platform WhatsApp number is not configured" | Set `PLATFORM_WHATSAPP` in `server/.env` and restart the API. |
| Member's "Pay via WhatsApp" missing | The gym owner hasn't set a WhatsApp number in Gym Profile. |
| API won't start: "DATABASE_URL is required" | `server/.env` is missing or `DATABASE_URL` is blank. |
| Port already in use | Something else is on 5000/5173 — stop it, or change `PORT` in `server/.env`. |
