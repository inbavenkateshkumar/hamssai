-- Teacher Substitution Management System Database Schema

-- Users table for authentication (Incharge and Staff)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('incharge', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    max_substitution_limit INTEGER DEFAULT 3,
    current_substitution_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable table
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day VARCHAR(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    period_number INTEGER NOT NULL CHECK (period_number >= 1 AND period_number <= 8),
    class_name VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, day, period_number)
);

-- Attendance table (day-wise)
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent')),
    marked_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, date)
);

-- Substitutions table
CREATE TABLE IF NOT EXISTS substitutions (
    id SERIAL PRIMARY KEY,
    absent_teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    substitute_teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    period_number INTEGER NOT NULL,
    day VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    teacher_id INTEGER REFERENCES teachers(id),
    substitution_id INTEGER REFERENCES substitutions(id),
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timetables_teacher_day ON timetables(teacher_id, day);
CREATE INDEX IF NOT EXISTS idx_timetables_day_period ON timetables(day, period_number);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_substitutions_date ON substitutions(date);
CREATE INDEX IF NOT EXISTS idx_substitutions_substitute ON substitutions(substitute_teacher_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();