# Setup From GitHub — Push, Clone & Run

This explains exactly what happens when you push FitManager to GitHub and clone it
onto a laptop, and how to get it running. Read Part 3 — that's the answer to
"will it work without any installation?" (Short version: **no — you run 3 steps**,
because secrets and libraries are intentionally not stored on GitHub.)

---

## Part 1 — What gets pushed to GitHub (and what doesn't)

A `.gitignore` file controls this. It's already set up.

| In the repo (pushed) ✅ | NOT in the repo (ignored) ❌ |
|-------------------------|------------------------------|
| All source code (`src/`, components, etc.) | `node_modules/` — the installed libraries (huge, re-downloaded) |
| `package.json` (the *list* of libraries) | `.env` — your secrets (DB URL, JWT keys) |
| `.env.example` (a blank template) | `dist/` — the built output (re-generated) |
| Config files, this documentation | logs, OS junk files |

**Why `.env` is excluded:** it holds your database password and security keys.
If it went to GitHub, anyone who sees the repo could access your database. So it
stays on your machine only, and you recreate it after cloning.

---

## Part 2 — Push to GitHub (one time)

```powershell
cd d:\Harshit\gym-management
git init
git add .
git commit -m "FitManager initial commit"
```
Then create an empty repository on github.com and run the two commands it shows you
(they look like):
```powershell
git remote add origin https://github.com/YOUR-NAME/gym-management.git
git branch -M main
git push -u origin main
```

> ✅ Because of `.gitignore`, your `.env` and `node_modules` are automatically left
> out. Double-check on GitHub that there is **no `.env` file** in the uploaded files.

---

## Part 3 — Clone onto a laptop and run it

### Step 0 — Install Node.js (one time per computer)
Download the **LTS** version from https://nodejs.org and install it. This is the
only true "installation" and it can't be skipped. Verify:
```powershell
node --version
```

### Step 1 — Clone the repo
```powershell
git clone https://github.com/YOUR-NAME/gym-management.git
cd gym-management
```

### Step 2 — Backend
```powershell
cd server
npm install                       # downloads the libraries (~1 min)
copy .env.example .env            # creates your secrets file from the template
notepad .env                      # fill in the real values (see below)
```
Fill these in `.env`:
```
DATABASE_URL=<your Neon connection string>
JWT_ACCESS_SECRET=<any long random text, 40+ chars>
JWT_REFRESH_SECRET=<a different long random text>
PLATFORM_WHATSAPP=919876543210
SEED_ADMIN_EMAIL=you@email.com
SEED_ADMIN_PASSWORD=YourStrong@Pass1
```
Then:
```powershell
npm run migrate     # ONLY if using a brand-new/empty database (skip if reusing Neon)
npm run seed        # creates your admin login (safe to run; skips if it exists)
npm run dev         # starts the API on http://localhost:5000
```

### Step 3 — Frontend (open a second terminal)
```powershell
cd gym-management\client
npm install
npm run dev         # starts the site on http://localhost:5173
```

### Step 4 — Open the app
Go to **http://localhost:5173** in your browser. Done.

---

## Two common situations

**A) Cloning onto a NEW laptop, reusing your existing Neon database**
- Do everything above. **Skip `npm run migrate`** (tables already exist in Neon).
- Your existing admin + gyms + members are all still there (data lives in Neon, not on the laptop).

**B) Cloning and wanting a FRESH/separate database**
- Create a new database (e.g. a new Neon project), put its URL in `.env`.
- Run `npm run migrate` (creates tables) then `npm run seed` (creates admin).

> Key idea: **your data is NOT in the code.** It lives in the Neon cloud database.
> The code is just the app. Point the code at a database via `DATABASE_URL`.

---

## Quick reference: what each command does

| Command | What it does |
|---------|--------------|
| `npm install` | Downloads the libraries listed in `package.json` into `node_modules/` |
| `npm run migrate` | Creates the database tables (run once per new database) |
| `npm run seed` | Creates the first platform-admin login |
| `npm run dev` | Runs the app in development mode (auto-reloads on code changes) |
| `npm run build` | (frontend) Produces the optimized files for production hosting |

---

## Troubleshooting

| Problem | Cause / Fix |
|---------|-------------|
| `'node' is not recognized` | Node.js isn't installed → install from nodejs.org. |
| `DATABASE_URL is required` | You didn't create `.env` or left it blank → copy `.env.example` and fill it. |
| Login fails / no data | Wrong/empty `DATABASE_URL`, or you forgot `npm run seed`. |
| `Cannot find module ...` | You skipped `npm install` in that folder. |
| Port 5000 or 5173 in use | Another copy is already running → stop it (`Get-Process node \| Stop-Process -Force`). |
| Pushed `.env` by accident | Remove it from the repo immediately and change all secrets (DB password + JWT keys). |
