# AI Sleep Coaching App - MVP

A simple, fast AI-powered sleep coaching app for students built with React, Fastify, PostgreSQL, and OpenAI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key (optional, can use fallback mode)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and OpenAI API key
```

Create the database:
```bash
createdb sleep_coach_db
psql sleep_coach_db < db/schema.sql
```

Start the server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
NawmAI/
├── backend/
│   ├── db/
│   │   └── schema.sql          # Database schema
│   ├── routes/
│   │   ├── profile.js          # User profile endpoints
│   │   ├── checkins.js         # Daily check-in endpoints
│   │   ├── feedback.js         # User feedback endpoints
│   │   └── admin.js            # Admin/export endpoints
│   ├── services/
│   │   └── reportGenerator.js  # AI weekly report generator
│   ├── server.js               # Fastify server (<100 lines)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── OnboardingForm.jsx  # 4-question onboarding
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🎯 Features

### ✅ Implemented
- **4-Question Onboarding**: Bedtime, wake time, main problem, phone usage
- **No Auth Complexity**: Client-side UUID + email only
- **Daily Check-ins**: Simple 3-field form (sleep hours, quality, phone usage)
- **AI Weekly Reports**: Pre-computed stats sent to OpenAI for personalized insights
- **Feedback Collection**: "Did this help?" + optional comment
- **Admin Export**: CSV export of feedback and sleep stats (for Enactus)
- **Feature Flag**: `USE_AI=true/false` for demo reliability

### 🔧 API Endpoints

**Profile**
- `POST /api/profile` - Create user profile
- `GET /api/profile/:user_id` - Get user profile

**Check-ins**
- `POST /api/checkins` - Create daily check-in
- `GET /api/checkins/:user_id` - Get user check-ins

**Feedback**
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/stats` - Get feedback statistics

**Admin**
- `GET /api/admin/export/feedback` - Export feedback as CSV
- `GET /api/admin/export/stats` - Export sleep stats as CSV
- `GET /api/admin/dashboard` - Get dashboard overview

## 🧠 AI Integration

The weekly report generator:
1. **Pre-computes stats** from 7 days of sleep data
2. Sends **summary stats** to OpenAI (not raw data)
3. Uses optimized prompt for friendly, non-medical advice
4. Falls back to template message if API unavailable

**Stats computed:**
- Average sleep hours
- Best/worst night
- Phone usage nights
- Sleep quality trend (improving/stable/declining)

## 🗄️ Database Schema

**4 tables (simplified for MVP):**
- `users` - UUID, email, created_at
- `sleep_profiles` - bedtime, wake_time, main_problem, phone_usage
- `sleep_checkins` - sleep_hours, sleep_quality, phone_before_bed
- `feedback` - helpful (boolean), comment

## 🎨 Design Principles

- **Simplicity**: No over-engineering, minimal features
- **Speed**: Built for 1-month MVP timeline
- **Production-ready**: Clean code, proper validation, error handling
- **Enactus-ready**: Feedback collection + CSV export for presentations

## 🔐 Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/sleep_coach_db
OPENAI_API_KEY=your_openai_api_key_here
USE_AI=true
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 📊 For Enactus Presentation

1. **User Feedback**: Export via `/api/admin/export/feedback`
2. **Sleep Stats**: Export via `/api/admin/export/stats`
3. **Dashboard**: View overview at `/api/admin/dashboard`
4. **Screenshots**: Capture onboarding flow, check-ins, weekly reports

## 🚧 Next Steps (Post-MVP)

- Add weekly report viewing in frontend
- Create daily check-in component
- Add user dashboard with sleep trends
- Implement push notifications for check-in reminders
- Add more sleep insights and tips

## 📝 License

MIT
