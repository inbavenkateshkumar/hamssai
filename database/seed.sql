-- Sample data for testing

-- Note: Users should be created using the setup.js script for proper password hashing
-- Run: node setup.js after creating the database schema

-- Insert sample teachers
INSERT INTO teachers (name, subject, phone, email, max_substitution_limit) VALUES
('Dr. Rajesh Kumar', 'Mathematics', '9876543210', 'rajesh@school.com', 3),
('Mrs. Priya Sharma', 'English', '9876543211', 'priya@school.com', 4),
('Mr. Amit Singh', 'Science', '9876543212', 'amit@school.com', 3),
('Ms. Anjali Patel', 'Social Studies', '9876543213', 'anjali@school.com', 4),
('Dr. Vikram Reddy', 'Physics', '9876543214', 'vikram@school.com', 3),
('Mrs. Meera Nair', 'Chemistry', '9876543215', 'meera@school.com', 3),
('Mr. Suresh Kumar', 'Biology', '9876543216', 'suresh@school.com', 4);

-- Insert sample timetable for all days of the week
INSERT INTO timetables (teacher_id, day, period_number, class_name, subject) VALUES

-- ===== MONDAY =====
-- Dr. Rajesh Kumar - Monday
(1, 'Monday', 1, 'Class 10A', 'Mathematics'),
(1, 'Monday', 3, 'Class 9B', 'Mathematics'),
(1, 'Monday', 5, 'Class 11A', 'Mathematics'),

-- Mrs. Priya Sharma - Monday
(2, 'Monday', 2, 'Class 10A', 'English'),
(2, 'Monday', 4, 'Class 9B', 'English'),
(2, 'Monday', 6, 'Class 8A', 'English'),

-- Mr. Amit Singh - Monday
(3, 'Monday', 2, 'Class 10B', 'Science'),
(3, 'Monday', 4, 'Class 9A', 'Science'),
(3, 'Monday', 5, 'Class 11B', 'Science'),
(3, 'Monday', 6, 'Class 8B', 'Science'),

-- Ms. Anjali Patel - Monday
(4, 'Monday', 1, 'Class 10B', 'Social Studies'),
(4, 'Monday', 3, 'Class 9A', 'Social Studies'),
(4, 'Monday', 5, 'Class 11A', 'Social Studies'),
(4, 'Monday', 7, 'Class 8A', 'Social Studies'),

-- Dr. Vikram Reddy - Monday
(5, 'Monday', 3, 'Class 11A', 'Physics'),
(5, 'Monday', 4, 'Class 10A', 'Physics'),
(5, 'Monday', 6, 'Class 10B', 'Physics'),
(5, 'Monday', 7, 'Class 9A', 'Physics'),

-- Mrs. Meera Nair - Monday
(6, 'Monday', 4, 'Class 11B', 'Chemistry'),
(6, 'Monday', 5, 'Class 10A', 'Chemistry'),
(6, 'Monday', 6, 'Class 9B', 'Chemistry'),
(6, 'Monday', 7, 'Class 10B', 'Chemistry'),

-- Mr. Suresh Kumar - Monday
(7, 'Monday', 1, 'Class 11B', 'Biology'),
(7, 'Monday', 4, 'Class 10B', 'Biology'),
(7, 'Monday', 7, 'Class 9A', 'Biology'),
(7, 'Monday', 8, 'Class 8B', 'Biology'),

-- ===== TUESDAY =====
-- Dr. Rajesh Kumar - Tuesday
(1, 'Tuesday', 2, 'Class 10A', 'Mathematics'),
(1, 'Tuesday', 4, 'Class 9B', 'Mathematics'),
(1, 'Tuesday', 6, 'Class 11A', 'Mathematics'),

-- Mrs. Priya Sharma - Tuesday
(2, 'Tuesday', 1, 'Class 10A', 'English'),
(2, 'Tuesday', 3, 'Class 9B', 'English'),
(2, 'Tuesday', 5, 'Class 8A', 'English'),

-- Mr. Amit Singh - Tuesday
(3, 'Tuesday', 1, 'Class 10B', 'Science'),
(3, 'Tuesday', 3, 'Class 9A', 'Science'),
(3, 'Tuesday', 7, 'Class 11B', 'Science'),
(3, 'Tuesday', 8, 'Class 8B', 'Science'),

-- Ms. Anjali Patel - Tuesday
(4, 'Tuesday', 2, 'Class 10B', 'Social Studies'),
(4, 'Tuesday', 4, 'Class 9A', 'Social Studies'),
(4, 'Tuesday', 6, 'Class 11A', 'Social Studies'),

-- Dr. Vikram Reddy - Tuesday
(5, 'Tuesday', 1, 'Class 11A', 'Physics'),
(5, 'Tuesday', 2, 'Class 10A', 'Physics'),
(5, 'Tuesday', 5, 'Class 10B', 'Physics'),
(5, 'Tuesday', 8, 'Class 9A', 'Physics'),

-- Mrs. Meera Nair - Tuesday
(6, 'Tuesday', 1, 'Class 11B', 'Chemistry'),
(6, 'Tuesday', 3, 'Class 10A', 'Chemistry'),
(6, 'Tuesday', 5, 'Class 9B', 'Chemistry'),
(6, 'Tuesday', 8, 'Class 10B', 'Chemistry'),

-- Mr. Suresh Kumar - Tuesday
(7, 'Tuesday', 2, 'Class 11B', 'Biology'),
(7, 'Tuesday', 5, 'Class 10B', 'Biology'),
(7, 'Tuesday', 6, 'Class 9A', 'Biology'),

-- ===== WEDNESDAY =====
-- Dr. Rajesh Kumar - Wednesday
(1, 'Wednesday', 1, 'Class 10A', 'Mathematics'),
(1, 'Wednesday', 4, 'Class 9B', 'Mathematics'),
(1, 'Wednesday', 7, 'Class 11A', 'Mathematics'),

-- Mrs. Priya Sharma - Wednesday
(2, 'Wednesday', 2, 'Class 10A', 'English'),
(2, 'Wednesday', 5, 'Class 9B', 'English'),
(2, 'Wednesday', 8, 'Class 8A', 'English'),

-- Mr. Amit Singh - Wednesday
(3, 'Wednesday', 1, 'Class 10B', 'Science'),
(3, 'Wednesday', 2, 'Class 9A', 'Science'),
(3, 'Wednesday', 3, 'Class 11B', 'Science'),

-- Ms. Anjali Patel - Wednesday
(4, 'Wednesday', 3, 'Class 10B', 'Social Studies'),
(4, 'Wednesday', 5, 'Class 9A', 'Social Studies'),
(4, 'Wednesday', 7, 'Class 11A', 'Social Studies'),

-- Dr. Vikram Reddy - Wednesday
(5, 'Wednesday', 2, 'Class 11A', 'Physics'),
(5, 'Wednesday', 3, 'Class 10A', 'Physics'),
(5, 'Wednesday', 4, 'Class 10B', 'Physics'),
(5, 'Wednesday', 6, 'Class 9A', 'Physics'),

-- Mrs. Meera Nair - Wednesday
(6, 'Wednesday', 1, 'Class 11B', 'Chemistry'),
(6, 'Wednesday', 2, 'Class 10A', 'Chemistry'),
(6, 'Wednesday', 4, 'Class 9B', 'Chemistry'),
(6, 'Wednesday', 8, 'Class 10B', 'Chemistry'),

-- Mr. Suresh Kumar - Wednesday
(7, 'Wednesday', 3, 'Class 11B', 'Biology'),
(7, 'Wednesday', 6, 'Class 10B', 'Biology'),
(7, 'Wednesday', 7, 'Class 9A', 'Biology'),
(7, 'Wednesday', 8, 'Class 8B', 'Biology'),

-- ===== THURSDAY (TODAY - Jan 16, 2026) =====
-- Dr. Rajesh Kumar - Thursday
(1, 'Thursday', 1, 'Class 10A', 'Mathematics'),
(1, 'Thursday', 3, 'Class 9B', 'Mathematics'),
(1, 'Thursday', 5, 'Class 11A', 'Mathematics'),

-- Mrs. Priya Sharma - Thursday
(2, 'Thursday', 2, 'Class 10A', 'English'),
(2, 'Thursday', 4, 'Class 9B', 'English'),
(2, 'Thursday', 6, 'Class 8A', 'English'),

-- Mr. Amit Singh - Thursday
(3, 'Thursday', 2, 'Class 10B', 'Science'),
(3, 'Thursday', 4, 'Class 9A', 'Science'),
(3, 'Thursday', 5, 'Class 11B', 'Science'),
(3, 'Thursday', 6, 'Class 8B', 'Science'),

-- Ms. Anjali Patel - Thursday
(4, 'Thursday', 1, 'Class 10B', 'Social Studies'),
(4, 'Thursday', 3, 'Class 9A', 'Social Studies'),
(4, 'Thursday', 7, 'Class 11A', 'Social Studies'),

-- Dr. Vikram Reddy - Thursday
(5, 'Thursday', 1, 'Class 11A', 'Physics'),
(5, 'Thursday', 3, 'Class 10A', 'Physics'),
(5, 'Thursday', 6, 'Class 10B', 'Physics'),
(5, 'Thursday', 7, 'Class 9A', 'Physics'),

-- Mrs. Meera Nair - Thursday
(6, 'Thursday', 2, 'Class 11B', 'Chemistry'),
(6, 'Thursday', 5, 'Class 10A', 'Chemistry'),
(6, 'Thursday', 7, 'Class 9B', 'Chemistry'),
(6, 'Thursday', 8, 'Class 10B', 'Chemistry'),

-- Mr. Suresh Kumar - Thursday
(7, 'Thursday', 4, 'Class 11B', 'Biology'),
(7, 'Thursday', 5, 'Class 10B', 'Biology'),
(7, 'Thursday', 8, 'Class 9A', 'Biology'),

-- ===== FRIDAY =====
-- Dr. Rajesh Kumar - Friday
(1, 'Friday', 2, 'Class 10A', 'Mathematics'),
(1, 'Friday', 4, 'Class 9B', 'Mathematics'),
(1, 'Friday', 6, 'Class 11A', 'Mathematics'),

-- Mrs. Priya Sharma - Friday
(2, 'Friday', 1, 'Class 10A', 'English'),
(2, 'Friday', 3, 'Class 9B', 'English'),
(2, 'Friday', 5, 'Class 8A', 'English'),
(2, 'Friday', 7, 'Class 11B', 'English'),

-- Mr. Amit Singh - Friday
(3, 'Friday', 1, 'Class 10B', 'Science'),
(3, 'Friday', 2, 'Class 9A', 'Science'),
(3, 'Friday', 7, 'Class 11B', 'Science'),

-- Ms. Anjali Patel - Friday
(4, 'Friday', 2, 'Class 10B', 'Social Studies'),
(4, 'Friday', 4, 'Class 9A', 'Social Studies'),
(4, 'Friday', 6, 'Class 11A', 'Social Studies'),
(4, 'Friday', 8, 'Class 8A', 'Social Studies'),

-- Dr. Vikram Reddy - Friday
(5, 'Friday', 1, 'Class 11A', 'Physics'),
(5, 'Friday', 5, 'Class 10A', 'Physics'),
(5, 'Friday', 6, 'Class 10B', 'Physics'),
(5, 'Friday', 8, 'Class 9A', 'Physics'),

-- Mrs. Meera Nair - Friday
(6, 'Friday', 3, 'Class 11B', 'Chemistry'),
(6, 'Friday', 4, 'Class 10A', 'Chemistry'),
(6, 'Friday', 5, 'Class 9B', 'Chemistry'),
(6, 'Friday', 6, 'Class 10B', 'Chemistry'),

-- Mr. Suresh Kumar - Friday
(7, 'Friday', 1, 'Class 11B', 'Biology'),
(7, 'Friday', 3, 'Class 10B', 'Biology'),
(7, 'Friday', 7, 'Class 9A', 'Biology'),

-- ===== SATURDAY =====
-- Dr. Rajesh Kumar - Saturday
(1, 'Saturday', 1, 'Class 10A', 'Mathematics'),
(1, 'Saturday', 2, 'Class 9B', 'Mathematics'),

-- Mrs. Priya Sharma - Saturday
(2, 'Saturday', 3, 'Class 10A', 'English'),
(2, 'Saturday', 4, 'Class 9B', 'English'),

-- Mr. Amit Singh - Saturday
(3, 'Saturday', 1, 'Class 10B', 'Science'),
(3, 'Saturday', 5, 'Class 9A', 'Science'),

-- Ms. Anjali Patel - Saturday
(4, 'Saturday', 2, 'Class 10B', 'Social Studies'),
(4, 'Saturday', 6, 'Class 9A', 'Social Studies'),

-- Dr. Vikram Reddy - Saturday
(5, 'Saturday', 3, 'Class 11A', 'Physics'),
(5, 'Saturday', 7, 'Class 10A', 'Physics'),

-- Mrs. Meera Nair - Saturday
(6, 'Saturday', 4, 'Class 11B', 'Chemistry'),
(6, 'Saturday', 8, 'Class 10A', 'Chemistry'),

-- Mr. Suresh Kumar - Saturday
(7, 'Saturday', 5, 'Class 11B', 'Biology'),
(7, 'Saturday', 6, 'Class 10B', 'Biology');