# NawmAI

**NawmAI** is an AI-powered sleep coaching app that helps users build better sleep habits through daily check-ins, personalized insights, and actionable missions. Built as part of an **Enactus** entrepreneurship project.

## What It Does

- **Onboarding** — Users set their sleep goals (bedtime, wake-up time) and select personal sleep challenges (phone use, stress, caffeine, etc.)
- **Daily Check-ins** — Log bedtime, wake-up time, sleep quality, mood, and optional notes each day
- **Sleep Score** — A calculated score (0–100) based on quality, mood, and consistency with goals
- **Dashboard** — View your current streak, weekly average score, sleep debt, trend chart, and recent check-in history
- **Daily Missions** — 3 personalized micro-tasks generated from your sleep profile to build better habits (persisted per day)
- **AI Weekly Report** — A detailed weekly analysis powered by **Groq AI** (LLaMA 3) with personalized recommendations
- **Feedback** — Users can submit feedback directly from the app

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **TailwindCSS 4** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **React Icons** | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| **Fastify** | Web server framework |
| **PostgreSQL** | Database |
| **Groq SDK** | AI-powered report generation (LLaMA 3) |
| **Node.js** | Runtime |
| **dotenv** | Environment configuration |
| **uuid** | Unique ID generation |

## Project Structure

```
NawmAI/
├── client/              # React frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components (Landing, Onboarding, Dashboard, Checkin, Report, Feedback)
│       ├── services/    # API client (Axios)
│       └── utils/       # Sleep score calculations, missions, trend data
├── server/              # Fastify backend
│   ├── routes/          # API endpoints (users, checkins, reports, feedback)
│   ├── db.js            # PostgreSQL connection
│   └── migrate.js       # Database schema migration
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** running locally

### 1. Get a Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Create a new API key under **API Keys**

### 2. Configure the Server

```bash
cd server
cp .env.example .env
```

Fill in your `.env`:

```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nawmai
GROQ_API_KEY=your_groq_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Create the Database

```sql
CREATE DATABASE nawmai;
```

### 4. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 5. Run Migrations

```bash
cd server
npm run migrate
```

### 6. Start the App

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:3001**
