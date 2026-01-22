# Troubleshooting Guide - "Failed to fetch" Error

## Problem
When submitting the onboarding form, you get a "Failed to fetch" error.

## Root Causes & Solutions

### 1. Backend Server Not Running ⚠️ MOST LIKELY CAUSE

**Check if backend is running:**
```bash
# Open browser and visit:
http://localhost:3000/health

# Should return: {"status":"ok","timestamp":"..."}
```

**Solution: Start the backend server**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
```

---

### 2. Database Not Connected

**Check database connection:**
```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check if database exists
psql -U postgres -l | grep sleep_coach_db
```

**Solution: Create database if missing**
```bash
# Create database
createdb sleep_coach_db

# Run schema
cd backend
psql sleep_coach_db < db/schema.sql
```

**Check .env file:**
```bash
cd backend
cat .env
```

Should contain:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/sleep_coach_db
OPENAI_API_KEY=your_key_here
USE_AI=false
PORT=3000
FRONTEND_URL=http://localhost:5173
```

---

### 3. CORS Issues

The backend is configured to allow `http://localhost:5173`. If your frontend runs on a different port, update:

**backend/server.js:**
```javascript
fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
});
```

Or update `.env`:
```env
FRONTEND_URL=http://localhost:YOUR_PORT
```

---

### 4. Port Already in Use

If port 3000 is already taken:

**Find what's using port 3000:**
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process or change backend port in .env
```

**Change port:**
```env
PORT=3001
```

Then update frontend URL in `OnboardingForm.jsx`:
```javascript
const response = await fetch('http://localhost:3001/api/profile', {
```

---

## Quick Diagnosis Steps

1. **Open browser console** (F12) when submitting the form
2. **Check the error message** in console - it will now show detailed logs
3. **Look for:**
   - `Submitting profile data:` - Shows what's being sent
   - `Response status:` - Shows server response code
   - `Fetch error:` - Shows the actual error

## Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `Failed to fetch` | Backend not running | Start backend with `npm run dev` |
| `Network error` | Wrong URL or CORS | Check backend URL and CORS config |
| `Server error: 500` | Database issue | Check database connection |
| `Server error: 404` | Route not found | Verify backend routes are registered |

---

## Step-by-Step Startup Process

**Terminal 1 - Backend:**
```bash
cd backend
npm install          # If not done yet
npm run dev          # Start backend
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install          # If not done yet
npm run dev          # Start frontend
```

**Verify:**
1. Backend: http://localhost:3000/health
2. Frontend: http://localhost:5173
3. Fill form and check browser console (F12) for logs

---

## Still Not Working?

Check backend logs for errors:
- Database connection errors
- Missing environment variables
- Port conflicts

The enhanced error handling in `OnboardingForm.jsx` will now show you exactly what's wrong in the browser console!
