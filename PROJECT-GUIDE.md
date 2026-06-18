# FitManager — Project Guide (what lives where)

A map of the whole codebase so you can confidently find, edit, or add things.

- **Frontend (`client/`)** — React + Vite. What users see in the browser.
- **Backend (`server/`)** — Express + PostgreSQL. The API + database.
- **They talk over HTTP:** the browser calls `…/api/v1/...`; the backend reads/writes Postgres (Neon).

> Rule of thumb: **screens, buttons, forms, layout → `client/`. Data, rules, login, money, the database → `server/`.** Most features touch both: a page in `client/` that calls a route in `server/`.

---

## 1. Top-level files

| File | What it's for |
|------|---------------|
| `HOW-TO-RUN.md` | How to run locally + production-readiness notes. |
| `DEPLOYMENT.md` | Deploy steps (Neon DB → Render API → Vercel web). |
| `.env.production.example` | Reference list of production env vars for the API. |
| `client/vercel.json` | Vercel build settings + SPA rewrite (so deep links don't 404). |
| `client/.env.production` | The API URL baked into the Vercel build (`VITE_API_URL`). |
| `.gitignore` | What git ignores (secrets, `node_modules`, `dist`). |

---

## 2. Frontend — `client/`

```
client/
├─ .env.production         # VITE_API_URL for production builds
├─ vite.config.js          # Vite build config
├─ tailwind.config.js      # Tailwind theme (brand colors, etc.)
└─ src/
   ├─ main.jsx             # App entry — mounts React + all context providers
   ├─ styles/index.css     # Global styles + the .app-input/.btn-primary/.surface classes
   ├─ routes/              # Which URL shows which page
   ├─ layouts/             # Page shells (sidebar, navbar, footer)
   ├─ pages/               # The actual screens
   ├─ components/          # Reusable UI pieces
   ├─ context/             # App-wide state (auth, theme, toasts)
   ├─ hooks/               # Reusable data/logic helpers
   ├─ services/            # The API client (axios)
   └─ utils/               # Small helpers (whatsapp link, status colors)
```

### `src/main.jsx`
App entry point. Wraps everything in providers (Theme → Auth → Gym → Feedback) and renders the router. **Add a new global provider here.**

### `src/routes/`
| File | What it does |
|------|--------------|
| `AppRouter.jsx` | **The URL map.** Every page and its path lives here, grouped by role (public / admin / owner / trainer / member). **Add a new page/route here.** |
| `ProtectedRoute.jsx` | Blocks a route unless the logged-in user has the right role. |

### `src/layouts/`
| File | What it does |
|------|--------------|
| `DashboardLayout.jsx` | The logged-in shell: **sidebar menu**, top bar, footer. Used by all 4 roles. **Add/rename a sidebar link here** (the `menus` object at the top). Also where the gym name/white-labeling lives. |
| `PublicLayout.jsx` | The marketing-site shell: top navbar + `SiteFooter`. Wraps Home/Pricing/About/Contact/Login/Register. |

### `src/pages/` — the screens
| File | What it does |
|------|--------------|
| `pages/auth/AuthPages.jsx` | Login, Register, Forgot/Reset password screens. |
| `pages/public/Home.jsx`, `Pricing.jsx`, `About.jsx`, `Contact.jsx` | Marketing pages. |
| `pages/public/LegalPages.jsx` | Terms / Privacy / Refund (edit the placeholder legal text here). |
| `pages/public/GymWebsite.jsx` | A gym's **public website** at `/gym/:slug` (hero, plans, trainers, footer). |
| `pages/CheckIn.jsx` | The door-QR check-in landing page (`/gym/:slug/checkin`). |
| `pages/dashboard/OwnerPages.jsx` | **Gym-owner dashboard — the biggest file.** Dashboard, Gym Profile, Plans, Trainers, Members, Renewals, Payments, Attendance, Diet/Workout plans. |
| `pages/dashboard/AdminPages.jsx` | Platform-admin screens: dashboard, Gyms, Subscriptions, Users, Revenue, Settings. |
| `pages/dashboard/MemberPages.jsx` | Member portal: dashboard, membership, payments, workout/diet plan. |
| `pages/dashboard/TrainerPages.jsx` | Trainer portal: dashboard, assigned members, plans. |
| `pages/dashboard/PlaceholderPage.jsx` | Generic "coming soon" + the 404 page. |

### `src/components/` — reusable UI
| File | What it does |
|------|--------------|
| `DataTable.jsx` | The standard table (with optional search + pagination + row actions). Used by Members, Payments, etc. |
| `TableControls.jsx` | The `SearchInput` and `Pagination` widgets. |
| `Modal.jsx` | The popup dialog shell (used by edit forms, confirm/prompt). |
| `PlanCard.jsx` | A membership-plan card with edit/delete. |
| `StatCard.jsx` | The little metric boxes on dashboards. |
| `ChartCard.jsx` | The revenue/growth charts (Recharts). |
| `SectionHeader.jsx` | The title + subtitle at the top of each page. |
| `SiteFooter.jsx` | The marketing-site footer (link columns). |
| `GymWebsiteCard.jsx` | "Your public website" preview card on the Gym Profile page. |
| `SubscriptionGate.jsx` | The owner's "pending activation — pay on WhatsApp" lock screen. |
| `MemberGate.jsx` | The member's "renew to continue" lock screen when expired. |

### `src/context/` — app-wide state
| File | What it does |
|------|--------------|
| `AuthContext.jsx` | Who's logged in; `login()` / `logout()` / `register()`; stores tokens. `roleHome` maps each role to its landing URL. |
| `ThemeContext.jsx` | Light/dark mode toggle. |
| `FeedbackContext.jsx` | **Toasts + confirm/prompt dialogs.** Use `useToast()`, `useConfirm()`, `usePrompt()` anywhere. |
| `GymContext.jsx` | Small shared data-fetch cache helper. |

### `src/hooks/`, `src/services/`, `src/utils/`
| File | What it does |
|------|--------------|
| `hooks/useApiData.jsx` | Loads data from an API path (`{ data, loading, error, reload }`) + the `<ApiState>` loading/error wrapper. **The standard way pages fetch data.** |
| `hooks/usePagedSearch.jsx` | Client-side search + pagination over a list. |
| `services/api.js` | **The axios client.** Base URL (`VITE_API_URL`), attaches the auth token, auto-refreshes on expiry. |
| `utils/whatsapp.js` | Builds `wa.me` deep links. |
| `utils/statusStyles.js` | Maps a status (active/expired/…) to a colored badge style. |
| `data/mockData.js` | Leftover sample data (not used by live screens). |

---

## 3. Backend — `server/`

```
server/
├─ .env.example            # Copy to .env; holds DB URL, secrets, admin, WhatsApp
└─ src/
   ├─ server.js            # Boots the API, starts the daily expiry job
   ├─ app.js               # Wires middleware + routes together
   ├─ config/              # Env validation, roles, plan limits
   ├─ routes/              # URL → controller mapping (per role)
   ├─ controllers/         # The actual logic for each route
   ├─ middleware/          # Auth, validation, security, errors
   ├─ validators/          # Input rules for each request
   ├─ db/                  # Database connection, schema, migrate, seed
   ├─ jobs/                # Scheduled background tasks
   └─ utils/               # Tokens, passwords, errors, slugs
```

### Entry & wiring
| File | What it does |
|------|--------------|
| `server.js` | Starts the server on the port, kicks off the membership-expiry job, handles graceful shutdown. |
| `app.js` | Builds the Express app: security middleware → `/health` → `/` → mounts `/api/v1` → error handlers. |

### `src/config/`
| File | What it does |
|------|--------------|
| `env.js` | Reads & **validates** `.env`. If a required var is missing, the server refuses to start. **Add a new env var here.** |
| `roles.js` | The four role names (`platform_admin`, `gym_owner`, `trainer`, `member`). |
| `plans.js` | **Subscription tiers + member limits.** Edit pricing/limits here. |

### `src/routes/` — URL → controller
`index.js` mounts everything under `/api/v1`: `/auth`, `/public`, `/admin`, `/owner`, `/trainer`, `/member`.

| File | Base path | Holds |
|------|-----------|-------|
| `authRoutes.js` | `/api/v1/auth` | register, login, refresh, logout, me, change-password. |
| `publicRoutes.js` | `/api/v1/public` | platform contact info, a gym's public page by slug. |
| `adminRoutes.js` | `/api/v1/admin` | platform dashboard, list/activate gyms, users, reset password, revenue. |
| `ownerRoutes.js` | `/api/v1/owner` | **everything the gym owner does** — profile, plans, trainers, members, renewals, payments, attendance, diet/workout plans. |
| `trainerRoutes.js` | `/api/v1/trainer` | trainer dashboard + read-only members/plans. |
| `memberRoutes.js` | `/api/v1/member` | member dashboard, membership, payments, check-in. |

> **To add a backend endpoint:** add a line in the right `*Routes.js` file → point it at a controller function.

### `src/controllers/` — the logic
| File | What it does |
|------|--------------|
| `authController.js` | Register (creates gym + owner + default plans), login, token refresh/rotation, change password. |
| `dashboardController.js` | Computes the stats for the owner & admin dashboards. |
| `gymController.js` | Gym profile read/update, public gym page, billing status, admin activate/suspend. |
| `resourceController.js` | **Generic create/list/update/delete** for plans, trainers, members, diet, workout, payments (config-driven). |
| `memberController.js` | Create a member (+ optional login), enforces the plan's member cap. |
| `paymentController.js` | Create/update a payment; a **success** payment assigns that plan to the member. |
| `renewalController.js` | The Renewals list + extend-a-membership logic. |
| `userController.js` | Create gym users, reset passwords (admin & owner). |
| `attendanceController.js` | Check-in (blocks expired members), attendance history, gym attendance view. |

### `src/middleware/`
| File | What it does |
|------|--------------|
| `auth.js` | `authenticate` (verifies token, loads the user + gym name), `authorize(role)`, `requireGymAccess`, `requireActiveSubscription`. |
| `validate.js` | Returns 400 with messages when input fails a validator. |
| `security.js` | Helmet, **CORS allowlist**, rate limiting, compression, request logging. |
| `errorHandler.js` | The 404 handler + the central error responder (hides stack traces in production). |

### `src/validators/`
| File | What it does |
|------|--------------|
| `authValidators.js` | Rules for register/login/refresh/password. |
| `gymValidators.js` | Rules for plans, trainers, members, payments, renewals, etc. **Edit field rules here.** |

### `src/db/`
| File | What it does |
|------|--------------|
| `schema.sql` | **The database structure** — every table and column. The source of truth for the data model. |
| `migrate.js` | Applies `schema.sql` to the database (runs on each deploy; safe to re-run). |
| `seed.js` | Creates the first platform-admin login (`npm run seed`). |
| `pool.js` | The Postgres connection + `query()` and `withTransaction()` helpers. |

### `src/jobs/` and `src/utils/`
| File | What it does |
|------|--------------|
| `jobs/expireMemberships.js` | Daily job that flips members past their expiry date to "expired". |
| `utils/tokens.js` | Sign/verify JWT access & refresh tokens. |
| `utils/password.js` | Hash & compare passwords (bcrypt). |
| `utils/crypto.js` | Hashing/date helpers for refresh tokens. |
| `utils/slug.js` | Generates the unique URL slug for a gym's public page. |
| `utils/httpError.js` | `badRequest()`, `notFound()`, `forbidden()`, etc. |
| `utils/asyncHandler.js` | Wraps async route handlers so errors reach the error handler. |

---

## 4. The database (`server/src/db/schema.sql`)

Main tables: **gyms**, **users** (logins), **members**, **trainers**,
**membership_plans**, **payments**, **attendance**, **diet_plans**,
**workout_plans**, **refresh_tokens**.

To change the data model: edit `schema.sql`, then run `npm run migrate` (it
applies new tables/columns). For an existing column change you may need a manual
`ALTER TABLE` — migrate won't drop/alter existing columns automatically.

---

## 5. "Where do I change X?" — quick cookbook

| I want to… | Go to |
|------------|-------|
| Add a new sidebar menu item | `client/src/layouts/DashboardLayout.jsx` (`menus`) + add the route in `client/src/routes/AppRouter.jsx` + the page in `client/src/pages/dashboard/…` |
| Add/change an owner screen (members, payments, etc.) | `client/src/pages/dashboard/OwnerPages.jsx` |
| Change brand colors / theme | `client/tailwind.config.js` + `client/src/styles/index.css` |
| Edit the marketing pages | `client/src/pages/public/…` |
| Edit the public gym website look | `client/src/pages/public/GymWebsite.jsx` |
| Change legal text | `client/src/pages/public/LegalPages.jsx` |
| Add a new API endpoint | add a route in `server/src/routes/<role>Routes.js` → a function in `server/src/controllers/…` |
| Change what a form accepts/validates | `server/src/validators/gymValidators.js` |
| Add a database table or column | `server/src/db/schema.sql` → `npm run migrate` |
| Change plan prices / member limits | `server/src/config/plans.js` |
| Change the API base URL the frontend calls | `client/.env.production` (prod) / `client/.env` (local) |
| Allow a new frontend domain (CORS) | `CORS_ORIGINS` env var on Render (and `server/src/middleware/security.js` for logic) |
| Add a new environment variable | `server/src/config/env.js` (declare it) + set it in `.env` / Render |
| Change membership-expiry behavior | `server/src/jobs/expireMemberships.js` + `server/src/controllers/renewalController.js` |
| Show a toast / confirm dialog | `useToast()` / `useConfirm()` from `client/src/context/FeedbackContext.jsx` |

---

## 6. Run & deploy (quick reference)

**Locally** (two terminals):
```
cd server && npm run dev      # API → http://localhost:5000
cd client && npm run dev      # Web → http://localhost:5173
```

**Deployed:** Neon (DB) → Render (API, root `server/`) → Vercel (web, root `client/`).
Full steps in `DEPLOYMENT.md`.
