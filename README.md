# NawmAI

AI-powered sleep coaching app built with React + Fastify + PostgreSQL + Groq.

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** running locally

## Setup

### 1. Get a Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Go to **API Keys** and create a new key
4. Copy it — you'll need it in the next step

### 2. Configure the Server

```bash
cd server
cp .env.example .env
```

Open `.env` and fill in your values:

```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nawmai
GROQ_API_KEY=paste_your_groq_key_here
CLIENT_URL=http://localhost:5173
```

> Make sure the database URL matches your local PostgreSQL credentials.

### 3. Create the Database

Open your PostgreSQL shell and run:

```sql
CREATE DATABASE nawmai;
```

### 4. Install Dependencies

```bash
# server
cd server
npm install

# client
cd ../client
npm install
```

### 5. Run Database Migrations

```bash
cd server
npm run migrate
```

### 6. Start the App

In two separate terminals:

```bash
# Terminal 1 — server
cd server
npm run dev

# Terminal 2 — client
cd client
npm run dev
```

The client runs at **http://localhost:5173** and the server at **http://localhost:3001**.
