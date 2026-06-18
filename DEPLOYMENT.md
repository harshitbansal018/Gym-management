# FitManager — Production Deployment

This takes the app from "runs on my laptop" to a live deployment on **managed
platforms** — no servers to administer:

- **Database:** Neon (Postgres)
- **API:** Render (the `server/` folder)
- **Web app:** Vercel (the `client/` folder)

---

## Prerequisites

- A GitHub repo with this project pushed.
- (Optional) A custom domain — Render and Vercel both give you HTTPS URLs out of the box.
- Strong JWT secrets. Generate each with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

---

## 1. Database — Neon

1. Create a Neon project in the **AWS ap-south-1 (Mumbai)** region.
2. Copy the connection string (it already includes `?sslmode=require`). You'll
   paste it as `DATABASE_URL` on Render.

---

## 2. API — Render

1. **New → Web Service**, connect this repo, set **Root Directory** to `server`.
2. Build command `npm ci`; start command
   `node src/db/migrate.js && node src/server.js`; health check path `/health`.
3. Set env vars (see [`.env.production.example`](.env.production.example)):
   `NODE_ENV=production`, `DATABASE_URL`, `JWT_ACCESS_SECRET`,
   `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `PLATFORM_WHATSAPP`,
   `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.

The schema migration runs automatically on each deploy. After the **first**
deploy, create the platform admin once from the Render **Shell**:
```bash
npm run seed
```
Note your API URL, e.g. `https://fitmanager-api.onrender.com`.

> Render's free tier sleeps after inactivity, so the first request after idle is
> slow. Fine for a pilot; upgrade the instance for production traffic.

---

## 3. Web app — Vercel

1. **Add New → Project**, import the repo, set **Root Directory** to `client`.
2. Vercel auto-detects Vite (config is in [`client/vercel.json`](client/vercel.json):
   build `npm run build`, output `dist`, plus a SPA rewrite so React-Router deep
   links don't 404 on refresh).
3. Add one **Environment Variable**:
   `VITE_API_URL = https://fitmanager-api.onrender.com/api/v1`
   (your Render URL + `/api/v1`). This is read at **build time**, so redeploy
   after changing it.
4. Deploy, then copy your Vercel URL (e.g. `https://fitmanager.vercel.app`).

---

## 4. Connect the two (CORS)

On Render, set `CORS_ORIGINS` to your exact Vercel origin(s), comma-separated,
**no trailing slash** — e.g. `https://fitmanager.vercel.app`. Redeploy the API.
If you later add a custom domain on Vercel, add it here too.

---

## Post-deploy checklist

- [ ] `VITE_API_URL` points at the Render API (`…/api/v1`) and the site loads.
- [ ] `CORS_ORIGINS` lists exactly your real frontend domain(s) — nothing else.
- [ ] JWT secrets are long and random (not the example values).
- [ ] `SEED_ADMIN_PASSWORD` changed from the default; admin login works.
- [ ] Database backups enabled in Neon (point-in-time restore).
- [ ] You can register a gym owner, log in, and add a member end-to-end.

---

## Known gaps still ahead of a revenue-ready SaaS

Deployment makes the current product reachable. Before charging customers you
still need (see the conversation roadmap):

1. **Razorpay billing + subscription enforcement** — collect recurring revenue
   from gym owners and block expired/unpaid gyms.
2. **Legal pages** — fill in the Terms, Privacy, Refund placeholders.
3. **Transactional email** — receipts, password reset, expiry reminders.
