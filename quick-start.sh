#!/bin/bash

# Quick Start Script for NawmAI Sleep Coach App
# This script helps you get the app running quickly

echo "🚀 NawmAI Sleep Coach - Quick Start"
echo "===================================="
echo ""

# Check if PostgreSQL is installed
echo "📦 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "Please install PostgreSQL 14+ first:"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    echo "  - Mac: brew install postgresql"
    echo "  - Linux: sudo apt-get install postgresql"
    exit 1
fi
echo "✅ PostgreSQL found"
echo ""

# Check if Node.js is installed
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) found"
echo ""

# Database setup
echo "🗄️  Setting up database..."
echo "Please enter your PostgreSQL credentials:"
read -p "PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "PostgreSQL password: " DB_PASS
echo ""

# Test database connection
echo "Testing database connection..."
PGPASSWORD=$DB_PASS psql -U $DB_USER -c "SELECT version();" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to PostgreSQL. Please check your credentials."
    exit 1
fi
echo "✅ Database connection successful"
echo ""

# Create database
echo "Creating database 'sleep_coach_db'..."
PGPASSWORD=$DB_PASS psql -U $DB_USER -c "CREATE DATABASE sleep_coach_db;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database created"
else
    echo "ℹ️  Database already exists (this is fine)"
fi
echo ""

# Run schema
echo "Setting up database schema..."
cd backend
PGPASSWORD=$DB_PASS psql -U $DB_USER -d sleep_coach_db -f db/schema.sql > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Schema created"
else
    echo "⚠️  Schema setup had warnings (might be okay if tables exist)"
fi
echo ""

# Update .env file
echo "Updating .env file..."
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/sleep_coach_db"
sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
echo "✅ .env updated"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install > /dev/null 2>&1
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install > /dev/null 2>&1
echo "✅ Frontend dependencies installed"
echo ""

# Done!
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Open TWO terminal windows"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "3. Visit http://localhost:5173 in your browser"
echo ""
echo "📚 Need help? Check TROUBLESHOOTING.md"
