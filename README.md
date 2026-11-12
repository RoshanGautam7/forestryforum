# PNG Forestry Forum Registration App

Event registration system for the PNG Forestry Forum, featuring:
- Attendee registration with photo upload
- ID-card PDF generation and email delivery
- Admin dashboard with registration, feedback, and survey tables
- Feedback and survey collection forms

## Stack

- **Backend**: Node.js / Express, Sequelize ORM, MySQL, PDFKit, Nodemailer
- **Frontend**: React (Vite), Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+
- MySQL — create a database named `id_card_generator`

### Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm start                   # or: node server.js
```

The server listens on `http://localhost:5000`.

> **Note:** `backend/uploads/photos` and `backend/uploads/pdfs` are created automatically at runtime but are excluded from the repo (personal attendee data).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server proxies `/api` requests to `http://localhost:5000`.

## Environment variables

See `backend/.env.example` for all required keys. Copy it to `backend/.env` and fill in real values before starting.
