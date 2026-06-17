# FitManager Backend

Production-style Express backend for the FitManager frontend.

## Stack

- Node.js + Express
- Neon PostgreSQL through `pg`
- JWT access and refresh tokens
- Bcrypt password hashing
- Role-based access control
- Tenant-aware gym data
- Helmet, CORS, rate limiting, HPP, compression
- Express Validator request validation

## Setup

```bash
cd server
npm install
copy .env.example .env
```

Add your Neon connection string to `.env`:

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

Run database setup:

```bash
npm run migrate
npm run seed
```

Start development server:

```bash
npm run dev
```

API health check:

```text
GET http://localhost:5000/health
```

## Roles

- `platform_admin`: manages gyms, users, subscriptions, revenue.
- `gym_owner`: manages one gym workspace.
- `trainer`: sees assigned members and plans for their gym.
- `member`: sees own membership, payments, diet, and workout plan.

## Auth Flow

Register a gym owner:

```text
POST /api/v1/auth/register
```

Login:

```text
POST /api/v1/auth/login
```

Use the returned access token:

```http
Authorization: Bearer <accessToken>
```

Refresh token:

```text
POST /api/v1/auth/refresh
```

## Project Shape

```text
src/
  app.js
  server.js
  config/
  controllers/
  db/
  middleware/
  routes/
  utils/
  validators/
```

The code is intentionally split by concern so future changes are easy: routes define endpoints, validators check input, controllers contain request logic, middleware handles auth/security, and `db` owns SQL access.
