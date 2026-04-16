# ServeX

ServeX is a multi-tenant restaurant operations platform with an Owner + Admin role model, real-time updates, AI chat, payments, and analytics. This repository contains a FastAPI backend and a Vite + React + TypeScript frontend.

## Project Structure

```
Lume/
  backend/    FastAPI, MongoDB, Redis, Razorpay, AI
  frontend/   Vite + React + TypeScript UI
```

## Roles

- Owner: registers a restaurant and has full access.
- Admin: operational access, seeded in the database.

## Prerequisites

- Python 3.11+ (3.13 works if your packages support it)
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (for rate limiting and analytics cache)

## Environment Setup

Backend example: [backend/.env.example](backend/.env.example)

Minimum backend env values:

```
APP_NAME=ServeX
ENV=dev
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
REDIS_URL=redis://localhost:6379/0
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

Frontend env (create `frontend/.env`):

```
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your_key
```

## Backend Setup

From the repo root:

```
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Run the backend:

```
uvicorn app.main:app --reload
```

### Seed the initial admin

If your database is empty, seed an admin + restaurant:

```
cd backend
.\.venv\Scripts\activate
python scripts/seed_admin.py
```

Optional seed env vars (set before running):

```
SEED_ADMIN_EMAIL=admin@servex.com
SEED_ADMIN_PASSWORD=Admin@12345
SEED_ADMIN_RESTAURANT_NAME=ServeX HQ
```

## Frontend Setup

From the repo root:

```
cd frontend
npm install
npm run dev
```

Open:

- http://localhost:3000

## App Routes

Public:

- `/` Landing
- `/login` Login
- `/register` Owner registration

Protected:

- `/owner/*` Owner dashboard and management
- `/admin/*` Admin operations
- `/chat` AI chat interface

## Common Workflows

Owner registration:

1. Open `/register` and create an owner account.
2. You will be redirected to `/owner`.

Admin login:

1. Seed the admin user with `scripts/seed_admin.py` if DB is empty.
2. Login at `/login` with the seeded credentials.

## Troubleshooting

- Redis error: ensure `REDIS_URL` is valid and Redis is reachable.
- Auth errors: confirm `JWT_SECRET` is set and consistent.
- Mongo errors: confirm `MONGODB_URI` points to a running MongoDB instance.
- Razorpay checkout: set `VITE_RAZORPAY_KEY_ID` in frontend env.

## Notes

- Backend roles are limited to Owner and Admin.
- Staff dashboards were removed in favor of a simplified role model.
