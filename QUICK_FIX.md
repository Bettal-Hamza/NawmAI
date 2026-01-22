# Quick Fix Guide - "Failed to fetch" Error

## The Problem
Your backend server is not running or cannot connect to the database.

## The Solution (3 Steps)

### Step 1: Fix Database Connection

Edit `backend/.env` and replace the placeholder credentials:

**Current (WRONG):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/sleep_coach_db
```

**Update to (CORRECT):**
```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/sleep_coach_db
```

Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password.

---

### Step 2: Create Database

Open a terminal and run:

```bash
# Create the database
createdb sleep_coach_db

# Run the schema
cd backend
psql sleep_coach_db < db/schema.sql
```

If you get "database already exists", that's fine! Just run the schema command.

---

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v... ready in ... ms
  ➜  Local:   http://localhost:5173/
```

---

## Test It

1. Visit http://localhost:5173
2. Fill out the onboarding form
3. Open browser console (F12) to see detailed logs
4. Submit the form

You should now see detailed console logs showing:
- `Submitting profile data:` - What's being sent
- `Response status: 200` - Success!
- `Success:` - The response from server

---

## Still Getting Errors?

### Error: "Cannot connect to server"
- **Cause:** Backend not running
- **Fix:** Make sure Terminal 1 shows "Server running on http://localhost:3000"

### Error: "Connection refused"
- **Cause:** Wrong port or backend crashed
- **Fix:** Check backend terminal for error messages

### Error: "Database connection failed"
- **Cause:** Wrong credentials in .env
- **Fix:** Double-check DATABASE_URL in backend/.env

### Error: "relation does not exist"
- **Cause:** Database schema not created
- **Fix:** Run `psql sleep_coach_db < db/schema.sql`

---

## Quick Checklist

- [ ] Updated `backend/.env` with correct PostgreSQL password
- [ ] Created database: `createdb sleep_coach_db`
- [ ] Ran schema: `psql sleep_coach_db < backend/db/schema.sql`
- [ ] Backend running: `cd backend && npm run dev`
- [ ] Frontend running: `cd frontend && npm run dev`
- [ ] Browser console open (F12) to see logs

---

## Common PostgreSQL Passwords

If you forgot your PostgreSQL password:

**Windows:**
- Default user: `postgres`
- Password: Set during installation (you chose this)

**Mac (Homebrew):**
- Default user: Your Mac username
- Password: Usually none (empty string)

**Reset PostgreSQL password:**
```bash
# Windows/Mac/Linux
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
```

---

## Need More Help?

Check `TROUBLESHOOTING.md` for detailed debugging steps!
