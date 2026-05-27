-- Smart Habit Tracker Database Schema & Seeding Script

-- Run this script after creating and selecting the smart_habit_tracker database.
-- Example: psql -U postgres -d smart_habit_tracker -f schema.sql

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 2. Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    frequency_value VARCHAR(50),
    target_count INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_habit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_habit_user ON habits(user_id);

-- 3. Habit Logs Table (Track completions)
CREATE TABLE IF NOT EXISTS habit_logs (
    id BIGSERIAL PRIMARY KEY,
    habit_id BIGINT NOT NULL,
    completed_date DATE NOT NULL,
    completed_time TIME NOT NULL,
    mood VARCHAR(20),
    notes TEXT,
    CONSTRAINT fk_log_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    CONSTRAINT uq_habit_date UNIQUE (habit_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_log_habit_date ON habit_logs(habit_id, completed_date);

-- 4. Suggestions Table (AI rule-based system recommendations)
CREATE TABLE IF NOT EXISTS suggestions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    habit_id BIGINT,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_suggestion_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_suggestion_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_suggestion_user ON suggestions(user_id);

-- 5. Notifications Table (In-app and reminder feeds)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);

-- 6. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    daily_reminder_time TIME DEFAULT '20:00:00',
    enable_browser_notifications BOOLEAN DEFAULT TRUE,
    theme VARCHAR(10) DEFAULT 'DARK',
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- SEED DATA (Demo Account setup)
-- Default Demo User Credentials:
-- Username: demo
-- Password: password123 (Spring BCrypt encoded: $2a$10$JrauF1tRwcCr23IuRoo2kOLXmduhNPz9Clo2jfok5CDjpKqDBw.m.)
-- Email: demo@smarthabit.com
-- ============================================================================

INSERT INTO users (id, username, email, password, role)
VALUES (1, 'demo', 'demo@smarthabit.com', '$2a$10$JrauF1tRwcCr23IuRoo2kOLXmduhNPz9Clo2jfok5CDjpKqDBw.m.', 'USER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_settings (user_id, daily_reminder_time, enable_browser_notifications, theme)
VALUES (1, '20:00:00', TRUE, 'DARK')
ON CONFLICT (user_id) DO NOTHING;

-- Seed Habits for demo user (1)
-- Habit 1: Fitness
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (1, 1, 'Morning Workout', '30 minutes cardio and stretching', 'FITNESS', 'DAILY', NULL, 1, TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Habit 2: Study/Learning
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (2, 1, 'Read Book', 'Read at least 15 pages of technical book', 'STUDY', 'DAILY', NULL, 1, TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Habit 3: Health
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (3, 1, 'Drink Water', 'Drink 3 Liters of water throughout the day', 'HEALTH', 'DAILY', NULL, 1, TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Habit 4: Meditation/Mindfulness
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (4, 1, 'Evening Meditation', '10 minutes of deep breathing', 'HEALTH', 'DAILY', NULL, 1, TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Seed Completion Logs (Constructing history over last 14 days)
-- We will seed completions for 'Morning Workout' mostly in the morning, 'Read Book' at night, and 'Evening Meditation' mostly on positive moods.
-- This will trigger our smart rules.

-- Morning Workout: Highly consistent in the morning.
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(1, CURRENT_DATE - 14, '07:30:00', 'ENERGETIC', 'Felt great, fresh air'),
(1, CURRENT_DATE - 13, '07:45:00', 'HAPPY', 'Nice workout'),
(1, CURRENT_DATE - 12, '07:15:00', 'ENERGETIC', 'Early morning run'),
(1, CURRENT_DATE - 11, '08:00:00', 'NEUTRAL', 'Slightly sleepy'),
(1, CURRENT_DATE - 10, '07:30:00', 'ENERGETIC', 'Weight lifting session'),
(1, CURRENT_DATE - 8, '07:40:00', 'HAPPY', 'Fast run'),
(1, CURRENT_DATE - 7, '07:35:00', 'ENERGETIC', 'Felt active'),
(1, CURRENT_DATE - 6, '07:50:00', 'NEUTRAL', 'Slow run'),
(1, CURRENT_DATE - 4, '07:45:00', 'HAPPY', 'Full workout done'),
(1, CURRENT_DATE - 3, '07:20:00', 'ENERGETIC', 'Intense HIIT'),
(1, CURRENT_DATE - 2, '07:30:00', 'HAPPY', 'Good stretch'),
(1, CURRENT_DATE - 1, '07:40:00', 'ENERGETIC', 'Morning run completed')
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Read Book: Highly consistent at Night.
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(2, CURRENT_DATE - 14, '22:15:00', 'HAPPY', 'Read 20 pages of System Design'),
(2, CURRENT_DATE - 13, '22:30:00', 'NEUTRAL', 'Finished chapter 4'),
(2, CURRENT_DATE - 12, '22:45:00', 'HAPPY', 'Inspiring reading'),
(2, CURRENT_DATE - 11, '23:00:00', 'STRESSED', 'Read to calm down'),
(2, CURRENT_DATE - 10, '22:20:00', 'HAPPY', 'Very interesting concepts'),
(2, CURRENT_DATE - 9, '22:30:00', 'NEUTRAL', 'Read 15 pages'),
(2, CURRENT_DATE - 8, '23:15:00', 'NEUTRAL', 'Tired but finished reading'),
(2, CURRENT_DATE - 7, '22:40:00', 'HAPPY', 'Started chapter 5'),
(2, CURRENT_DATE - 4, '22:15:00', 'HAPPY', 'Read 20 pages'),
(2, CURRENT_DATE - 3, '22:35:00', 'NEUTRAL', 'Back on track'),
(2, CURRENT_DATE - 2, '22:50:00', 'HAPPY', 'Fascinating designs'),
(2, CURRENT_DATE - 1, '22:10:00', 'HAPPY', 'Completed daily pages')
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Drink Water: Highly consistent, almost 100%.
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(3, CURRENT_DATE - 14, '19:30:00', 'HAPPY', 'Completed all bottles'),
(3, CURRENT_DATE - 13, '20:00:00', 'HAPPY', 'Done'),
(3, CURRENT_DATE - 12, '20:15:00', 'NEUTRAL', 'Met target'),
(3, CURRENT_DATE - 11, '19:00:00', 'HAPPY', 'Hydrated'),
(3, CURRENT_DATE - 10, '19:45:00', 'HAPPY', 'Good hydration'),
(3, CURRENT_DATE - 9, '20:30:00', 'NEUTRAL', 'Done'),
(3, CURRENT_DATE - 8, '19:15:00', 'HAPPY', 'Done'),
(3, CURRENT_DATE - 7, '20:00:00', 'HAPPY', 'Great energy'),
(3, CURRENT_DATE - 6, '20:15:00', 'NEUTRAL', 'Done'),
(3, CURRENT_DATE - 5, '19:50:00', 'HAPPY', 'Kept bottle near me'),
(3, CURRENT_DATE - 4, '20:10:00', 'HAPPY', 'Done'),
(3, CURRENT_DATE - 3, '19:30:00', 'HAPPY', 'Great'),
(3, CURRENT_DATE - 2, '20:00:00', 'HAPPY', 'Done'),
(3, CURRENT_DATE - 1, '19:45:00', 'HAPPY', 'Completed target')
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Evening Meditation: Drops when feeling Stressed.
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(4, CURRENT_DATE - 14, '21:00:00', 'HAPPY', 'Deep relaxation'),
(4, CURRENT_DATE - 13, '21:15:00', 'HAPPY', 'Calm'),
(4, CURRENT_DATE - 12, '21:30:00', 'HAPPY', 'Peaceful mind'),
(4, CURRENT_DATE - 9, '21:05:00', 'HAPPY', 'Felt good'),
(4, CURRENT_DATE - 8, '21:00:00', 'HAPPY', 'Relaxed'),
(4, CURRENT_DATE - 4, '21:10:00', 'HAPPY', 'Mindful breathing'),
(4, CURRENT_DATE - 3, '21:15:00', 'HAPPY', 'Short session'),
(4, CURRENT_DATE - 2, '21:20:00', 'HAPPY', 'Very calm'),
(4, CURRENT_DATE - 1, '21:00:00', 'HAPPY', 'Done')
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Seed Suggestions
INSERT INTO suggestions (id, user_id, habit_id, content, type, is_read, created_at) VALUES
(1, 1, 1, 'You are highly consistent in the Morning! Try scheduling your workout routines before 9:00 AM for the best results.', 'TIME_ANALYSIS', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 1, 4, 'Your consistency for Evening Meditation drops when you report feeling STRESSED. Try doing a light 2-minute breathing exercise on busy days.', 'MOOD_CORRELATION', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Seed Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 1, 'Welcome to Smart Habit Tracker', 'Start building and tracking your habits. Check your suggestions feed for smart daily insights!', 'SYSTEM', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 1, 'Streak Alert: Drink Water', 'You are on a 14-day streak for Drink Water! Keep it going!', 'STREAK_ALERT', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;
