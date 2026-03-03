/**
 * Frontend Timetable Display Helper
 * 
 * Utilities for rendering and formatting timetable data in the browser
 * Used by:
 * - Teacher timetable display
 * - Class timetable view
 * - Substitution planning dashboard
 */

/**
 * Convert database timetable data to display format
 * @param {array} dbTimetable - Database query results
 * @returns {object} Formatted schedule object
 */
function formatTimetableForDisplay(dbTimetable) {
    const schedule = {
        'Monday': Array(8).fill('FREE'),
        'Tuesday': Array(8).fill('FREE'),
        'Wednesday': Array(8).fill('FREE'),
        'Thursday': Array(8).fill('FREE'),
        'Friday': Array(8).fill('FREE')
    };

    dbTimetable.forEach(entry => {
        const dayIndex = entry.period_number - 1;
        schedule[entry.day][dayIndex] = entry.class_name;
    });

    return schedule;
}

/**
 * Convert array-based schedule to database format
 * @param {array} jsonSchedule - 5-day array of 8-period arrays
 * @param {number} teacherId - Teacher ID
 * @returns {array} Array of timetable objects for insertion
 */
function convertJsonScheduleToDbFormat(jsonSchedule, teacherId) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timetableEntries = [];

    jsonSchedule.forEach((daySchedule, dayIndex) => {
        const day = days[dayIndex];
        daySchedule.forEach((className, periodIndex) => {
            if (className !== null) {
                timetableEntries.push({
                    teacher_id: teacherId,
                    day: day,
                    period_number: periodIndex + 1,
                    class_name: className,
                    subject: 'General'
                });
            }
        });
    });

    return timetableEntries;
}

/**
 * Create HTML table for timetable display
 * @param {object} schedule - Schedule object with days and periods
 * @param {string} teacherName - Teacher name for header
 * @returns {string} HTML table
 */
function generateTimetableHTML(schedule, teacherName = 'Teacher') {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = Array.from({length: 8}, (_, i) => i + 1);

    let html = `
    <div class="timetable-container">
        <h3>${teacherName}'s Weekly Timetable</h3>
        <table class="timetable">
            <thead>
                <tr>
                    <th>Period</th>
                    ${days.map(day => `<th>${day}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    periods.forEach(period => {
        html += `<tr><td class="period-number">P${period}</td>`;
        days.forEach(day => {
            const className = schedule[day][period - 1];
            const cellClass = className === 'FREE' ? 'free-period' : 'scheduled';
            html += `<td class="${cellClass}">${className}</td>`;
        });
        html += `</tr>`;
    });

    html += `
            </tbody>
        </table>
    </div>
    `;

    return html;
}

/**
 * Calculate free periods for a schedule
 * @param {object} schedule - Schedule object
 * @returns {object} Free periods analysis
 */
function analyzeFreePeriods(schedule) {
    const days = Object.keys(schedule);
    const analysis = {
        total_free: 0,
        by_day: {},
        by_period: {},
        total_slots: days.length * 8
    };

    // By day analysis
    days.forEach(day => {
        const freePeriods = schedule[day].filter(p => p === 'FREE').length;
        analysis.by_day[day] = freePeriods;
        analysis.total_free += freePeriods;
    });

    // By period analysis
    for (let i = 0; i < 8; i++) {
        let freePeriodCount = 0;
        days.forEach(day => {
            if (schedule[day][i] === 'FREE') {
                freePeriodCount++;
            }
        });
        analysis.by_period[`Period ${i + 1}`] = freePeriodCount;
    }

    analysis.percentage = ((analysis.total_free / analysis.total_slots) * 100).toFixed(2);

    return analysis;
}

/**
 * Get substitution availability score (lower is better for substitution assignment)
 * @param {object} schedule - Schedule object
 * @param {number} currentSubstitutionCount - Current substitution count
 * @returns {number} Availability score (0-100)
 */
function calculateAvailabilityScore(schedule, currentSubstitutionCount) {
    const days = Object.keys(schedule);
    const totalSlots = days.length * 8;
    const freeSlots = days.reduce((count, day) => {
        return count + schedule[day].filter(p => p === 'FREE').length;
    }, 0);

    const availabilityPercent = (freeSlots / totalSlots) * 100;
    const substitutionPenalty = currentSubstitutionCount * 10; // 10 points per substitution

    return Math.max(0, 100 - substitutionPenalty - availabilityPercent);
}

/**
 * Generate comparison table for multiple teachers
 * @param {array} teachers - Array of {name, schedule, currentSubstitutions}
 * @returns {string} HTML comparison table
 */
function generateComparisonTable(teachers) {
    let html = `
    <div class="comparison-table-container">
        <h3>Teacher Availability Comparison</h3>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Teacher Name</th>
                    <th>Total Classes</th>
                    <th>Free Periods</th>
                    <th>Current Substitutions</th>
                    <th>Availability Score</th>
                </tr>
            </thead>
            <tbody>
    `;

    teachers.forEach(teacher => {
        const days = Object.keys(teacher.schedule);
        const totalSlots = days.length * 8;
        const totalClasses = days.reduce((count, day) => {
            return count + teacher.schedule[day].filter(p => p !== 'FREE').length;
        }, 0);
        const freePeriods = totalSlots - totalClasses;
        const score = calculateAvailabilityScore(teacher.schedule, teacher.currentSubstitutions);

        html += `
            <tr>
                <td>${teacher.name}</td>
                <td>${totalClasses}</td>
                <td>${freePeriods}</td>
                <td>${teacher.currentSubstitutions}</td>
                <td>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${score}%"></div>
                    </div>
                    ${score.toFixed(1)}
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    </div>
    `;

    return html;
}

/**
 * Create CSV export of timetable
 * @param {object} schedule - Schedule object
 * @param {string} teacherName - Teacher name
 * @returns {string} CSV content
 */
function exportTimetableAsCSV(schedule, teacherName) {
    const days = Object.keys(schedule);
    let csv = `Teacher,${teacherName}\n`;
    csv += `Period,${days.join(',')}\n`;

    for (let i = 0; i < 8; i++) {
        csv += `Period ${i + 1}`;
        days.forEach(day => {
            csv += `,${schedule[day][i] || 'FREE'}`;
        });
        csv += '\n';
    }

    return csv;
}

/**
 * Download timetable as CSV file
 * @param {object} schedule - Schedule object
 * @param {string} teacherName - Teacher name
 */
function downloadTimetableCSV(schedule, teacherName) {
    const csv = exportTimetableAsCSV(schedule, teacherName);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${teacherName}_timetable.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Validate schedule data
 * @param {object} schedule - Schedule object
 * @returns {object} Validation result {valid: boolean, errors: array}
 */
function validateScheduleData(schedule) {
    const errors = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Check all days present
    days.forEach(day => {
        if (!schedule[day]) {
            errors.push(`Missing day: ${day}`);
        } else if (!Array.isArray(schedule[day])) {
            errors.push(`${day} is not an array`);
        } else if (schedule[day].length !== 8) {
            errors.push(`${day} has ${schedule[day].length} periods (expected 8)`);
        }
    });

    // Check class codes format
    days.forEach(day => {
        if (schedule[day]) {
            schedule[day].forEach((className, index) => {
                if (className !== null && className !== 'FREE' && typeof className !== 'string') {
                    errors.push(`Invalid class code at ${day} Period ${index + 1}`);
                }
                // Optional: Validate class code format (e.g., digit + letter)
                if (className && className !== 'FREE' && !/^\d+[A-Z]$/.test(className)) {
                    errors.push(`Invalid class format at ${day} Period ${index + 1}: ${className}`);
                }
            });
        }
    });

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Find clash/conflict between two schedules
 * @param {object} schedule1 - First schedule
 * @param {object} schedule2 - Second schedule
 * @returns {array} Array of conflicts {day, period, class1, class2}
 */
function findScheduleClashes(schedule1, schedule2) {
    const clashes = [];
    const days = Object.keys(schedule1);

    days.forEach(day => {
        schedule1[day].forEach((class1, index) => {
            const class2 = schedule2[day][index];
            // Both have classes at same time (shouldn't happen for one teacher but useful for validation)
            if (class1 !== 'FREE' && class2 !== 'FREE') {
                clashes.push({
                    day: day,
                    period: index + 1,
                    class1: class1,
                    class2: class2
                });
            }
        });
    });

    return clashes;
}

/**
 * Generate statistics summary
 * @param {array} teachers - Array of teacher schedules
 * @returns {object} Statistics object
 */
function generateStatistics(teachers) {
    const stats = {
        total_teachers: teachers.length,
        total_periods: 0,
        average_load: 0,
        busiest_teacher: null,
        least_loaded_teacher: null,
        average_free_periods: 0
    };

    if (teachers.length === 0) return stats;

    let maxLoad = 0;
    let minLoad = 41; // Max possible
    let totalLoad = 0;
    let totalFree = 0;

    teachers.forEach(teacher => {
        const days = Object.keys(teacher.schedule);
        const load = days.reduce((count, day) => {
            return count + teacher.schedule[day].filter(p => p !== 'FREE').length;
        }, 0);

        totalLoad += load;
        totalFree += (days.length * 8) - load;

        if (load > maxLoad) {
            maxLoad = load;
            stats.busiest_teacher = {name: teacher.name, load: load};
        }
        if (load < minLoad) {
            minLoad = load;
            stats.least_loaded_teacher = {name: teacher.name, load: load};
        }
    });

    stats.total_periods = totalLoad;
    stats.average_load = (totalLoad / teachers.length).toFixed(2);
    stats.average_free_periods = (totalFree / teachers.length).toFixed(2);

    return stats;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTimetableForDisplay,
        convertJsonScheduleToDbFormat,
        generateTimetableHTML,
        analyzeFreePeriods,
        calculateAvailabilityScore,
        generateComparisonTable,
        exportTimetableAsCSV,
        downloadTimetableCSV,
        validateScheduleData,
        findScheduleClashes,
        generateStatistics
    };
}
