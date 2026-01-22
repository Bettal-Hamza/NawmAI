-- AI Sleep Coaching App - Database Schema
-- Simplified schema for MVP

-- Users table (minimal, no auth)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sleep profiles table (only data that affects AI output)
CREATE TABLE sleep_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  main_problem TEXT NOT NULL,
  phone_usage TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sleep check-ins table (simplified fields)
CREATE TABLE sleep_checkins (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sleep_hours NUMERIC(3,1) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  phone_before_bed BOOLEAN NOT NULL,
  created_at DATE DEFAULT CURRENT_DATE
);

-- Feedback table (critical for Enactus)
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sleep_checkins_user_id ON sleep_checkins(user_id);
CREATE INDEX idx_sleep_checkins_created_at ON sleep_checkins(created_at);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Prevent duplicate check-ins on same day
CREATE UNIQUE INDEX idx_unique_checkin_per_day ON sleep_checkins(user_id, created_at);
