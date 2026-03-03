/**
 * Timetable Utilities
 * 
 * Helper functions for working with timetable data:
 * - Finding free periods for substitute detection
 * - Getting teacher schedule for a specific day
 * - Checking class-wise timetables
 * - Validating period conflicts
 */

const pool = require('../config/database');

// Day mapping helper
const dayMapping = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday'
};

const reverseDayMapping = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri'
};

/**
 * Get teacher's free periods for a specific day
 * @param {number} teacherId - Teacher ID
 * @param {string} day - Day name (e.g., 'Monday')
 * @returns {array} Array of free period numbers (1-8)
 */
async function getFreePeriods(teacherId, day) {
    try {
        const result = await pool.query(`
            SELECT period_number 
            FROM timetables 
            WHERE teacher_id = $1 AND day = $2
        `, [teacherId, day]);

        const scheduledPeriods = new Set(result.rows.map(row => row.period_number));
        const allPeriods = Array.from({length: 8}, (_, i) => i + 1);
        return allPeriods.filter(p => !scheduledPeriods.has(p));
    } catch (error) {
        console.error(`Error getting free periods for teacher ${teacherId}:`, error);
        return [];
    }
}

/**
 * Get teacher's full schedule for a specific day
 * @param {number} teacherId - Teacher ID
 * @param {string} day - Day name (e.g., 'Monday')
 * @returns {object} Object with period numbers as keys and class names as values
 */
async function getDaySchedule(teacherId, day) {
    try {
        const result = await pool.query(`
            SELECT period_number, class_name 
            FROM timetables 
            WHERE teacher_id = $1 AND day = $2
            ORDER BY period_number
        `, [teacherId, day]);

        const schedule = {};
        for (let i = 1; i <= 8; i++) {
            schedule[i] = null; // Initialize all periods as free
        }

        result.rows.forEach(row => {
            schedule[row.period_number] = row.class_name;
        });

        return schedule;
    } catch (error) {
        console.error(`Error getting schedule for teacher ${teacherId}:`, error);
        return {};
    }
}

/**
 * Get all teachers who are free during a specific period
 * @param {string} day - Day name (e.g., 'Monday')
 * @param {number} periodNumber - Period number (1-8)
 * @returns {array} Array of teacher IDs who are free
 */
async function getTeachersFreeDuring(day, periodNumber) {
    try {
        const result = await pool.query(`
            SELECT DISTINCT t.id 
            FROM teachers t
            WHERE t.id NOT IN (
                SELECT teacher_id 
                FROM timetables 
                WHERE day = $1 AND period_number = $2
            )
            ORDER BY t.id
        `, [day, periodNumber]);

        return result.rows.map(row => row.id);
    } catch (error) {
        console.error(`Error getting free teachers:`, error);
        return [];
    }
}

/**
 * Check if a teacher has a class during specific period
 * @param {number} teacherId - Teacher ID
 * @param {string} day - Day name
 * @param {number} periodNumber - Period number
 * @returns {object|null} Class info if scheduled, null if free
 */
async function getTeacherClass(teacherId, day, periodNumber) {
    try {
        const result = await pool.query(`
            SELECT class_name, subject 
            FROM timetables 
            WHERE teacher_id = $1 AND day = $2 AND period_number = $3
        `, [teacherId, day, periodNumber]);

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error(`Error checking teacher class:`, error);
        return null;
    }
}

/**
 * Get all classes for a specific class code and day
 * @param {string} classCode - Class code (e.g., '6A', '12C')
 * @param {string} day - Day name
 * @returns {array} Array of timetable entries for that class
 */
async function getClassTimetable(classCode, day) {
    try {
        const result = await pool.query(`
            SELECT t.teacher_id, te.name, t.period_number, t.class_name
            FROM timetables t
            JOIN teachers te ON t.teacher_id = te.id
            WHERE t.class_name = $1 AND t.day = $2
            ORDER BY t.period_number
        `, [classCode, day]);

        return result.rows;
    } catch (error) {
        console.error(`Error getting class timetable:`, error);
        return [];
    }
}

/**
 * Get full weekly schedule for a teacher
 * @param {number} teacherId - Teacher ID
 * @returns {object} Object with days as keys and period arrays as values
 */
async function getWeeklySchedule(teacherId) {
    try {
        const result = await pool.query(`
            SELECT day, period_number, class_name
            FROM timetables
            WHERE teacher_id = $1
            ORDER BY 
                CASE day 
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                END,
                period_number
        `, [teacherId]);

        const schedule = {
            'Monday': Array(8).fill(null),
            'Tuesday': Array(8).fill(null),
            'Wednesday': Array(8).fill(null),
            'Thursday': Array(8).fill(null),
            'Friday': Array(8).fill(null)
        };

        result.rows.forEach(row => {
            const dayIndex = row.period_number - 1;
            schedule[row.day][dayIndex] = row.class_name;
        });

        return schedule;
    } catch (error) {
        console.error(`Error getting weekly schedule:`, error);
        return {};
    }
}

/**
 * Get all classes taught by a teacher
 * @param {number} teacherId - Teacher ID
 * @returns {array} Array of unique class codes
 */
async function getTeacherClasses(teacherId) {
    try {
        const result = await pool.query(`
            SELECT DISTINCT class_name
            FROM timetables
            WHERE teacher_id = $1
            ORDER BY class_name
        `, [teacherId]);

        return result.rows.map(row => row.class_name);
    } catch (error) {
        console.error(`Error getting teacher classes:`, error);
        return [];
    }
}

/**
 * Validate if a teacher can teach a class (optional check)
 * @param {number} teacherId - Teacher ID
 * @param {string} classCode - Class code
 * @returns {boolean} True if teacher teaches this class
 */
async function teacherTeachesClass(teacherId, classCode) {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count
            FROM timetables
            WHERE teacher_id = $1 AND class_name = $2
        `, [teacherId, classCode]);

        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error(`Error validating teacher-class relationship:`, error);
        return false;
    }
}

/**
 * Get load distribution (classes per teacher)
 * @returns {array} Array of teachers with their class counts
 */
async function getTeacherLoadDistribution() {
    try {
        const result = await pool.query(`
            SELECT t.id, t.name, COUNT(*) as total_classes
            FROM teachers t
            LEFT JOIN timetables tt ON t.id = tt.teacher_id
            GROUP BY t.id, t.name
            ORDER BY total_classes DESC
        `);

        return result.rows;
    } catch (error) {
        console.error(`Error getting load distribution:`, error);
        return [];
    }
}

module.exports = {
    getFreePeriods,
    getDaySchedule,
    getTeachersFreeDuring,
    getTeacherClass,
    getClassTimetable,
    getWeeklySchedule,
    getTeacherClasses,
    teacherTeachesClass,
    getTeacherLoadDistribution,
    dayMapping,
    reverseDayMapping
};
