# FitManager — Production Deployment

This guide takes the app from "runs on my laptop" to a live, internet-facing
deployment. Two paths are covered:

- **Path A — Single VPS with Docker Compose** (most self-contained; good for an
  Indian VPS / AWS Mumbai `ap-south-1`).
- **Path B — Managed platforms** (Render for the API, Vercel/Netlify for the
  web app, Neon for Postgres). No server administration.

Both produce the same app. Pick one.

---

## Prerequisites

- A domain name (e.g. `fitmanager.in`).
- For Path A: a Linux VPS (2 vCPU / 2 GB RAM is plenty to start) with Docker and
  the Docker Compose plugin installed.
- Strong secrets. Generate each JWT secret with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

---

## Path A — Single VPS (Docker Compose)

### 1. Get the code onto the server
Copy the project to the VPS (`git clone`, `scp`, or rsync the folder).

### 2. Configure environment
```bash
cd gym-management
cp .env.production.example .env
nano .env          # fill in DATABASE_URL, the two JWT secrets, CORS_ORIGINS,
                   # admin credentials, and the DB password
```

### 3. Build and start
```bash
docker compose up -d --build
```
This starts three containers: `db` (Postgres), `server` (API, runs the schema
migration automatically on boot), and `client` (nginx serving the built React
app and proxying `/api` to the API).

### 4. Create the first platform admin (one time)
```bash
docker compose exec server npm run seed
```
Log in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.

### 5. Verify
```bash
# Open http://SERVER_IP/ in a browser — the marketing site should load.
docker compose exec server wget -qO- http://127.0.0.1:5000/health   # API health
docker compose ps                        # all services should be "healthy"/"running"
docker compose logs -f server            # tail API logs
```

### 6. Point DNS + add HTTPS
- Create an `A` record for your domain → the VPS public IP.
- The compose file serves plain HTTP on port 80. **Do not run production on
  bare HTTP** — JWTs would travel unencrypted. Put a TLS-terminating reverse
  proxy in front. The simplest is Caddy (automatic Let's Encrypt certs):

  ```
  # /etc/caddy/Caddyfile
  fitmanager.in {
      reverse_proxy localhost:80
  }
  ```
  Then change the compose `client` port mapping to `"8080:80"` so Caddy owns 80/443.

### Updating after code changes
```bash
docker compose up -d --build
```

### Backups (do this from day one)
```bash
docker compose exec db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F).sql
```
Schedule it with cron and copy backups off the server.

---

## Path B — Managed platforms (no servers to run)

### Database — Neon
1. Create a Neon project in the **AWS ap-south-1 (Mumbai)** region.
2. Copy the connection string (it already includes `?sslmode=require`).

### API — Render
1. New → **Web Service**, root directory `server`.
2. Build command `npm ci`, start command
   `node src/db/migrate.js && node src/server.js`.
3. Set env vars: `DATABASE_URL` (Neon string), `JWT_ACCESS_SECRET`,
   `JWT_REFRESH_SECRET`, `NODE_ENV=production`, and
   `CORS_ORIGINS=https://your-web-domain`.
4. After first deploy, run the seed once from the Render shell:
   `npm run seed`.

### Web — Vercel or Netlify
1. Import the repo, set the project root to `client`.
2. Build command `npm run build`, output directory `dist`.
3. Env var `VITE_API_URL=https://your-render-api.onrender.com/api/v1`.
   (On a managed host the API is a separate domain, so this is an absolute URL,
   not the `/api/v1` proxy path used in Path A.)
4. Make sure the API's `CORS_ORIGINS` includes this web domain.

---

## Post-deploy checklist

- [ ] HTTPS enabled (valid certificate, HTTP redirects to HTTPS).
- [ ] `CORS_ORIGINS` lists exactly your real frontend domain(s) — nothing else.
- [ ] JWT secrets are long and random (not the example values).
- [ ] `SEED_ADMIN_PASSWORD` changed from the default; admin login works.
- [ ] Database backups scheduled.
- [ ] You can register a gym owner, log in, and add a member end-to-end.

---

## Known gaps still ahead of a revenue-ready SaaS

Deployment makes the current product reachable. Before charging customers you
still need (see the conversation roadmap):

1. **Razorpay billing + subscription enforcement** — collect recurring revenue
   from gym owners and block expired/unpaid gyms.
2. **Legal pages** — Terms, Privacy, Refund policy (Razorpay requires these).
3. **Transactional email** — receipts, password reset, expiry reminders.
4. **Client token refresh** — currently users are logged out after 15 minutes.
