# eLearning Platform (MERN)

Learning management system for **learners**, **faculty**, and **administrators**: courses, materials (uploads + links), enrollment requests, progress, ratings/feedback, and per-course **group chat**.

**Repository:** [github.com/Lithvinsky/elearning-platform](https://github.com/Lithvinsky/elearning-platform)

## Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React, Vite, React Router, Axios  |
| Backend  | Node.js, Express, JWT, Multer      |
| Database | MongoDB, Mongoose                  |

## Quick start

```bash
cd backend && cp .env.example .env  # set MONGO_URI, JWT_SECRET
cd backend && npm install && npm run seed && npm run dev
cd frontend && npm install && npm run dev
```

- API: `http://localhost:5000`
- App: `http://localhost:5173`
- Optional: `frontend/.env` → `VITE_API_URL=http://localhost:5000/api`

## Seed logins (after `npm run seed`)

| Role    | Email             | Password      |
|---------|-------------------|---------------|
| Admin   | `admin@lms.edu`   | `password123` |
| Faculty | `sarah@lms.edu`   | `password123` |
| Faculty | `james@lms.edu`   | `password123` |
| Learner | `learner@lms.edu` | `password123` |

## Layout

```
elearning/
├── backend/
├── frontend/
└── README.md
```

See inline API routes in `backend/routes/` and UI under `frontend/src/`.
