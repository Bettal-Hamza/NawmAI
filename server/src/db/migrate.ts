import pool from './pool';

// Database migration — creates all tables if they don't exist
const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Sleep profiles (onboarding data)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sleep_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        bedtime_goal VARCHAR(10),
        wakeup_goal VARCHAR(10),
        sleep_challenges TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Daily sleep check-ins
    await client.query(`
      CREATE TABLE IF NOT EXISTS sleep_checkins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        checkin_date DATE NOT NULL,
        bedtime VARCHAR(10),
        wakeup_time VARCHAR(10),
        sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
        mood INTEGER CHECK (mood BETWEEN 1 AND 5),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, checkin_date)
      );
    `);

    // User feedback
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        message TEXT NOT NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Weekly AI reports (saved per generation)
    await client.query(`
      CREATE TABLE IF NOT EXISTS weekly_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        report_text TEXT NOT NULL,
        stats JSONB NOT NULL,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ── Column additions (safe to re-run) ──
    await client.query(`
      ALTER TABLE sleep_checkins
        ADD COLUMN IF NOT EXISTS phone_before_bed BOOLEAN DEFAULT false;
    `);
    await client.query(`
      ALTER TABLE sleep_checkins
        ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC(4,2);
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
