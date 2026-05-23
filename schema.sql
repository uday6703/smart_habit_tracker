-- Smart Habit Tracker Database Schema & Seeding Script

CREATE DATABASE IF NOT EXISTS smart_habit_tracker;
USE smart_habit_tracker;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- FITNESS, STUDY, HEALTH, PRODUCTIVITY, MOOD, FINANCE, SOCIAL
    frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, CUSTOM
    frequency_value VARCHAR(50),    -- e.g. "MON,WED,FRI" for CUSTOM or "5" for 5 times a week
    target_count INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_habit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_habit_user ON habits(user_id);

-- 3. Habit Logs Table (Track completions)
CREATE TABLE IF NOT EXISTS habit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    habit_id BIGINT NOT NULL,
    completed_date DATE NOT NULL,
    completed_time TIME NOT NULL,
    mood VARCHAR(20),                -- HAPPY, NEUTRAL, SAD, STRESSED, ENERGETIC
    notes TEXT,
    CONSTRAINT fk_log_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    CONSTRAINT uq_habit_date UNIQUE (habit_id, completed_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_log_habit_date ON habit_logs(habit_id, completed_date);

-- 4. Suggestions Table (AI rule-based system recommendations)
CREATE TABLE IF NOT EXISTS suggestions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    habit_id BIGINT,                -- Nullable if recommendation applies to overall dashboard
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,       -- STREAK_WARNING, OPTIMIZATION, OVERLOAD, TIME_ANALYSIS, MOOD_CORRELATION, CONSISTENCY_DROP
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_suggestion_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_suggestion_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_suggestion_user ON suggestions(user_id);

-- 5. Notifications Table (In-app and reminder feeds)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,       -- REMINDER, STREAK_ALERT, WEEKLY_SUMMARY, SYSTEM
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notification_user ON notifications(user_id);

-- 6. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    daily_reminder_time TIME DEFAULT '20:00:00',
    enable_browser_notifications BOOLEAN DEFAULT TRUE,
    theme VARCHAR(10) DEFAULT 'DARK',
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA (Demo Account setup)
-- Default Demo User Credentials:
-- Username: demo
-- Password: password123 (Spring BCrypt encoded: $2a$10$JrauF1tRwcCr23IuRoo2kOLXmduhNPz9Clo2jfok5CDjpKqDBw.m.)
-- Email: demo@smarthabit.com
-- ============================================================================

INSERT INTO users (id, username, email, password, role)
VALUES (1, 'demo', 'demo@smarthabit.com', '$2a$10$JrauF1tRwcCr23IuRoo2kOLXmduhNPz9Clo2jfok5CDjpKqDBw.m.', 'USER')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO user_settings (user_id, daily_reminder_time, enable_browser_notifications, theme)
VALUES (1, '20:00:00', TRUE, 'DARK')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Seed Habits for demo user (1)
-- Habit 1: Fitness
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (1, 1, 'Morning Workout', '30 minutes cardio and stretching', 'FITNESS', 'DAILY', NULL, 1, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- Habit 2: Study/Learning
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (2, 1, 'Read Book', 'Read at least 15 pages of technical book', 'STUDY', 'DAILY', NULL, 1, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- Habit 3: Health
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (3, 1, 'Drink Water', 'Drink 3 Liters of water throughout the day', 'HEALTH', 'DAILY', NULL, 1, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- Habit 4: Meditation/Mindfulness
INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_value, target_count, is_active, created_at)
VALUES (4, 1, 'Evening Meditation', '10 minutes of deep breathing', 'HEALTH', 'DAILY', NULL, 1, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY))
ON DUPLICATE KEY UPDATE id=id;

-- Seed Completion Logs (Constructing history over last 14 days)
-- We will seed completions for 'Morning Workout' mostly in the morning, 'Read Book' at night, and 'Evening Meditation' mostly on positive moods.
-- This will trigger our smart rules.

-- Morning Workout: Highly consistent in the morning.
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '07:30:00', 'ENERGETIC', 'Felt great, fresh air'),
(1, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '07:45:00', 'HAPPY', 'Nice workout'),
(1, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '07:15:00', 'ENERGETIC', 'Early morning run'),
(1, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '08:00:00', 'NEUTRAL', 'Slightly sleepy'),
(1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '07:30:00', 'ENERGETIC', 'Weight lifting session'),
-- Missed 9 days ago
(1, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '07:40:00', 'HAPPY', 'Fast run'),
(1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '07:35:00', 'ENERGETIC', 'Felt active'),
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '07:50:00', 'NEUTRAL', 'Slow run'),
-- Missed 5 days ago
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '07:45:00', 'HAPPY', 'Full workout done'),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '07:20:00', 'ENERGETIC', 'Intense HIIT'),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '07:30:00', 'HAPPY', 'Good stretch'),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:40:00', 'ENERGETIC', 'Morning run completed')
ON DUPLICATE KEY UPDATE habit_id=habit_id;

-- Read Book: Highly consistent at Night.
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(2, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '22:15:00', 'HAPPY', 'Read 20 pages of System Design'),
(2, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '22:30:00', 'NEUTRAL', 'Finished chapter 4'),
(2, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '22:45:00', 'HAPPY', 'Inspiring reading'),
(2, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '23:00:00', 'STRESSED', 'Read to calm down'),
(2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '22:20:00', 'HAPPY', 'Very interesting concepts'),
(2, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '22:30:00', 'NEUTRAL', 'Read 15 pages'),
(2, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '23:15:00', 'NEUTRAL', 'Tired but finished reading'),
(2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '22:40:00', 'HAPPY', 'Started chapter 5'),
-- Missed 6 and 5 days ago
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '22:15:00', 'HAPPY', 'Read 20 pages'),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '22:35:00', 'NEUTRAL', 'Back on track'),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '22:50:00', 'HAPPY', 'Fascinating designs'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '22:10:00', 'HAPPY', 'Completed daily pages')
ON DUPLICATE KEY UPDATE habit_id=habit_id;

-- Drink Water: Highly consistent, almost 100%.
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(3, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '19:30:00', 'HAPPY', 'Completed all bottles'),
(3, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '20:00:00', 'HAPPY', 'Done'),
(3, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '20:15:00', 'NEUTRAL', 'Met target'),
(3, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '19:00:00', 'HAPPY', 'Hydrated'),
(3, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '19:45:00', 'HAPPY', 'Good hydration'),
(3, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '20:30:00', 'NEUTRAL', 'Done'),
(3, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '19:15:00', 'HAPPY', 'Done'),
(3, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '20:00:00', 'HAPPY', 'Great energy'),
(3, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '20:15:00', 'NEUTRAL', 'Done'),
(3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '19:50:00', 'HAPPY', 'Kept bottle near me'),
(3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '20:10:00', 'HAPPY', 'Done'),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '19:30:00', 'HAPPY', 'Great'),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '20:00:00', 'HAPPY', 'Done'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:45:00', 'HAPPY', 'Completed target')
ON DUPLICATE KEY UPDATE habit_id=habit_id;

-- Evening Meditation: Drops when feeling Stressed. (Only logs on HAPPY/NEUTRAL/ENERGETIC).
INSERT INTO habit_logs (habit_id, completed_date, completed_time, mood, notes) VALUES
(4, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '21:00:00', 'HAPPY', 'Deep relaxation'),
(4, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '21:15:00', 'HAPPY', 'Calm'),
(4, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '21:30:00', 'HAPPY', 'Peaceful mind'),
-- Missed 11, 10 days ago (Stressed days)
(4, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '21:05:00', 'HAPPY', 'Felt good'),
(4, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '21:00:00', 'HAPPY', 'Relaxed'),
-- Missed 7, 6, 5 days ago (Overloaded/Stressed)
(4, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '21:10:00', 'HAPPY', 'Mindful breathing'),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '21:15:00', 'HAPPY', 'Short session'),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '21:20:00', 'HAPPY', 'Very calm'),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '21:00:00', 'HAPPY', 'Done')
ON DUPLICATE KEY UPDATE habit_id=habit_id;

-- Seed Suggestions
INSERT INTO suggestions (user_id, habit_id, content, type, is_read, created_at) VALUES
(1, 1, 'You are highly consistent in the Morning! Try scheduling your workout routines before 9:00 AM for the best results.', 'TIME_ANALYSIS', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 4, 'Your consistency for Evening Meditation drops when you report feeling STRESSED. Try doing a light 2-minute breathing exercise on busy days.', 'MOOD_CORRELATION', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR))
ON DUPLICATE KEY UPDATE id=id;

-- Seed Notifications
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(1, 'Welcome to Smart Habit Tracker', 'Start building and tracking your habits. Check your suggestions feed for smart daily insights!', 'SYSTEM', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'Streak Alert: Drink Water', 'You are on a 14-day streak for Drink Water! Keep it going!', 'STREAK_ALERT', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR))
ON DUPLICATE KEY UPDATE id=id;
