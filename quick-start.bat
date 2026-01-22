@echo off
REM Quick Start Script for NawmAI Sleep Coach App (Windows)

echo ========================================
echo NawmAI Sleep Coach - Quick Start
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo [OK] Node.js found
echo.

REM Check PostgreSQL
echo Checking PostgreSQL...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL is not installed or not in PATH!
    echo Please install PostgreSQL 14+ from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)
echo [OK] PostgreSQL found
echo.

echo ========================================
echo IMPORTANT: Database Setup Required
echo ========================================
echo.
echo You need to update the DATABASE_URL in backend\.env
echo.
echo Current: DATABASE_URL=postgresql://username:password@localhost:5432/sleep_coach_db
echo.
echo Replace 'username' and 'password' with your actual PostgreSQL credentials
echo.
echo Example: DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/sleep_coach_db
echo.
pause

REM Create database (manual step)
echo.
echo ========================================
echo Creating Database
echo ========================================
echo.
echo Please run these commands in a separate terminal:
echo.
echo   createdb sleep_coach_db
echo   cd backend
echo   psql sleep_coach_db ^< db\schema.sql
echo.
pause

REM Install dependencies
echo.
echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

cd ..

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Update backend\.env with your PostgreSQL credentials
echo 2. Create database: createdb sleep_coach_db
echo 3. Run schema: psql sleep_coach_db ^< backend\db\schema.sql
echo.
echo Then start the servers:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Visit http://localhost:5173 in your browser
echo.
echo Need help? Check TROUBLESHOOTING.md
echo.
pause
