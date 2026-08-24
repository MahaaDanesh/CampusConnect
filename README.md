# CampusConnect — College Management & Community Platform

A production-quality, full-stack college portal for **Students**, **Faculty**, and **Admins** with role-based authentication, real CRUD operations, and a responsive, dark-mode-ready dashboard.

**Stack:** React + Vite · Node.js + Express · MongoDB + Mongoose · JWT + bcrypt

---

## ✨ Features

| Module | What it does |
|---|---|
| **Auth & Roles** | JWT login/register, bcrypt password hashing, role-based route protection (student / faculty / admin) |
| **Dashboards** | Role-aware home dashboard with live stats, recent announcements, upcoming events, quick actions |
| **Announcements** | Post, pin, filter by category/audience, full-text search |
| **Events** | Create events, register/cancel RSVP, capacity limits, attendee lists for organizers |
| **Clubs & Activities** | Browse clubs, join/leave, coordinator & admin management |
| **Complaints** | Submit (optionally anonymous), track status, threaded comments, staff triage (status/priority/assignee) |
| **Lost & Found** | Post lost/found items, search & filter, mark resolved |
| **Notes & Resources** | Share study material links, tag & search by subject/department/semester, download tracking |
| **Notifications** | In-app notification center, auto-generated on relevant actions, mark read/unread |
| **Profiles** | Edit personal info, avatar color, change password |
| **Admin Analytics** | Platform-wide stats and charts (complaints by category/status, signups over time, users by department) |
| **Search & Filtering** | Present across every module (MongoDB text indexes + query filters) |

Every module above is wired to real MongoDB persistence via REST APIs — there is no mock data or static UI.

---

## 🏗 Architecture

```
campusconnect/
├── backend/                 # Node.js + Express REST API
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # Mongoose schemas (User, Event, Complaint, ...)
│   ├── controllers/         # Business logic per resource
│   ├── routes/               # Express routers + validation chains
│   ├── middleware/          # JWT auth, role guard, error handler, validator
│   ├── utils/                # Token generation, notifications, DB seed script
│   ├── server.js             # App entrypoint
│   └── .env.example
│
└── frontend/                # React + Vite SPA
    ├── src/
    │   ├── api/               # Axios instance + typed endpoint modules
    │   ├── components/        # Reusable UI (Modal, Badge, StateViews, Toolbar, ...)
    │   ├── context/            # Auth & Theme (dark mode) providers
    │   ├── hooks/               # usePaginatedList, useDebounce
    │   ├── layouts/             # AppLayout (sidebar + topbar), ProtectedRoute
    │   ├── pages/                # One page per module + admin/ subfolder
    │   └── utils/                # Date/format helpers
    └── .env.example
```

**Design principles used throughout:**
- Every list page (`usePaginatedList`) handles **loading / empty / error** states consistently.
- All destructive actions go through a confirm dialog.
- Role permissions are enforced **both** in the UI (hide/disable) and in the API (middleware) — never trust the client alone.
- Dark mode uses Tailwind's `class` strategy and is persisted to `localStorage`.

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET at minimum
npm install
npm run seed   # creates a default admin account + sample data
npm run dev    # starts on http://localhost:5000
```

Default seeded admin (change these in `.env` before seeding in production):
```
email:    admin@campusconnect.edu
password: Admin@12345
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# edit .env: set VITE_API_URL to your backend's /api URL
npm install
npm run dev    # starts on http://localhost:5173
```

Open `http://localhost:5173`, register a student/faculty account (or log in as the seeded admin) and explore.

---

## 🔐 Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB Atlas / local connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Comma-separated list of allowed frontend origins (CORS) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used only by `npm run seed` |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the deployed backend API, e.g. `https://your-api.onrender.com/api` |

---

## ☁️ Deployment

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access from `0.0.0.0/0` (or your host's IP).
3. Copy the connection string into `MONGO_URI`.

### Backend → Render or Railway
1. Push this repo to GitHub.
2. On [Render](https://render.com) (or [Railway](https://railway.app)): New → Web Service → point at `backend/`.
   - Build command: `npm install`
   - Start command: `npm start`
   - Add all variables from `backend/.env.example` in the dashboard's environment settings.
3. After the first deploy, run the seed script once via the platform's shell/console: `npm run seed`.
4. Note the deployed URL, e.g. `https://campusconnect-api.onrender.com`.

### Frontend → Vercel
1. On [Vercel](https://vercel.com): New Project → import this repo → set **Root Directory** to `frontend/`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable `VITE_API_URL` = `https://campusconnect-api.onrender.com/api`.
4. Deploy. Once live, add the Vercel URL to `CLIENT_URL` in the backend's environment variables and redeploy the backend so CORS allows it.

---

## 🧪 API Overview

All endpoints are prefixed with `/api` and (except `/auth/register` & `/auth/login`) require an `Authorization: Bearer <token>` header.

```
POST   /api/auth/register              Public
POST   /api/auth/login                 Public
GET    /api/auth/me                    Any authenticated user

GET    /api/users                      Admin
POST   /api/users                      Admin
PUT    /api/users/:id                  Admin
DELETE /api/users/:id                  Admin
PUT    /api/users/me                   Self
PUT    /api/users/me/password          Self

GET    /api/announcements              Any
POST   /api/announcements              Faculty, Admin
PUT    /api/announcements/:id          Owner or Admin
DELETE /api/announcements/:id          Owner or Admin

GET    /api/events                     Any
POST   /api/events                     Faculty, Admin
POST   /api/events/:id/register        Any
DELETE /api/events/:id/register        Any
GET    /api/events/:id/attendees       Organizer or Admin

GET    /api/clubs                      Any
POST   /api/clubs/:id/join             Any
DELETE /api/clubs/:id/leave            Any

GET    /api/complaints                 Own (student) / All (faculty, admin)
POST   /api/complaints                 Any
PUT    /api/complaints/:id/status      Faculty, Admin
POST   /api/complaints/:id/comments    Any (participant)

GET    /api/lostfound                  Any
POST   /api/lostfound                  Any

GET    /api/notes                      Any
POST   /api/notes                      Any

GET    /api/notifications              Self
PUT    /api/notifications/read-all     Self

GET    /api/analytics/overview         Admin
```

---

## 🛡 Security Notes

- Passwords hashed with `bcryptjs` (10 salt rounds); raw passwords never stored or logged.
- JWTs signed with a server-side secret; protected routes verify token + re-fetch the user (so deactivated accounts are blocked immediately).
- `helmet` for secure headers, rate limiting on `/auth/login` and `/auth/register`, CORS restricted to configured origins.
- All mutating routes validate input server-side with `express-validator` — client-side validation is a UX convenience only, never the source of truth.

---

## 📄 License

Built as a learning/portfolio project. Free to use and adapt.
