# Student Management System — MVP

A working end-to-end slice of the full SRS: **Auth & roles, Student records,
Notices, Subscription/Payment (simulated), and Attendance.**
Everything else in the SRS (parent-teacher messaging threads, teacher
reviews, full reporting/export) is left out of this MVP on purpose — the
goal here is one fully working vertical flow you can run, demo, and build
the rest on top of.

## Stack
- **Backend:** Node.js + Express + MySQL (via `mysql2`), JWT auth, bcrypt password hashing
- **Frontend:** React + Vite, React Router, Axios

## Folder structure
```
sms-mvp/
├── backend/
│   ├── config/db.js          # MySQL connection pool
│   ├── controllers/          # business logic per module
│   ├── middleware/auth.js    # JWT verify + role-based access
│   ├── routes/                # one file per module, wires routes -> controllers
│   ├── schema.sql            # run this to create the database + tables
│   ├── seed.js                # creates a demo admin, teacher, and subscription
│   ├── server.js             # app entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js       # pre-configured axios instance (attaches JWT)
    │   ├── context/AuthContext.jsx
    │   ├── components/        # Navbar, ProtectedRoute
    │   ├── pages/              # Login, Register, Dashboard, Students, Notices,
    │   │                        # Subscriptions, Attendance
    │   └── App.jsx
    └── .env.example
```

## Roles
`admin`, `teacher`, `student`, `parent`. Students and parents can self-register
from the app. Admin/teacher accounts are created once via `npm run seed`
(you'd normally add an admin-only "create staff account" screen later).

## Setup

### 1. Database
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # fill in your MySQL password + a JWT secret
npm install
npm run seed               # creates admin@school.com / teacher@school.com (password123)
npm run dev                 # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # points at http://localhost:5000/api by default
npm install
npm run dev                 # starts on http://localhost:5173
```

### 4. Try the full flow
1. Log in as `admin@school.com` / `password123` → open a subscription plan.
2. Register a new **student** account from the app.
3. As the student: go to Subscriptions → Subscribe & Pay (payment is
   simulated — swap the marked block in
   `backend/controllers/subscriptionController.js` for a real payment
   gateway call later).
4. Log in as `teacher@school.com` / `password123` → go to Students to set
   grade/status, go to Notices to publish one, go to Attendance to mark the
   student present/absent.
5. Log back in as the student to see the notice, their record, and their
   attendance history.

## Extending this MVP
Each module (students, notices, subscriptions, attendance) follows the same
pattern: a table in `schema.sql`, a controller, a route file, a page. The
remaining SRS modules (parent-teacher messaging, teacher reviews, reports)
can be added the same way without touching what's already here.
