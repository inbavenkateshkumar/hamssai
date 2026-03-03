// Dynamically get API base URL from current origin
// This works with localhost, IP addresses, domain names, or any deployed URL
const API_BASE_URL = `${window.location.origin}/api`;

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// API methods
const api = {
    // Dashboard
    getDashboard: (date) => apiRequest(`/dashboard?date=${date || ''}`),

    // Teachers
    getTeachers: () => apiRequest('/teachers'),
    getTeacher: (id) => apiRequest(`/teachers/${id}`),
    createTeacher: (data) => apiRequest('/teachers', { method: 'POST', body: JSON.stringify(data) }),
    updateTeacher: (id, data) => apiRequest(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTeacher: (id) => apiRequest(`/teachers/${id}`, { method: 'DELETE' }),
    resetSubstitutionCounts: () => apiRequest('/teachers/reset-counts', { method: 'POST' }),

    // Timetables
    getTimetables: () => apiRequest('/timetables'),
    getTimetableByTeacher: (teacherId) => apiRequest(`/timetables/teacher/${teacherId}`),
    getFreeTeachers: (day, periodNumber) => apiRequest(`/timetables/free-teachers?day=${day}&periodNumber=${periodNumber}`),
    createTimetable: (data) => apiRequest('/timetables', { method: 'POST', body: JSON.stringify(data) }),
    updateTimetable: (id, data) => apiRequest(`/timetables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTimetable: (id) => apiRequest(`/timetables/${id}`, { method: 'DELETE' }),

    // Attendance
    getAttendance: (date) => apiRequest(`/attendance?date=${date}`),
    markAttendance: (date, attendanceData) => apiRequest('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ date, attendance_data: attendanceData })
    }),
    updateTeacherAttendance: (teacherId, date, status) => apiRequest(`/attendance/teacher/${teacherId}`, {
        method: 'PUT',
        body: JSON.stringify({ date, status })
    }),

    // Substitutions
    assignSubstitutions: (date, day) => apiRequest('/substitutions/assign', {
        method: 'POST',
        body: JSON.stringify({ date, day })
    }),
    getSubstitutions: (date) => apiRequest(`/substitutions?date=${date}`),
    getAllSubstitutions: () => apiRequest('/substitutions/all'),
    deleteSubstitution: (id) => apiRequest(`/substitutions/${id}`, { method: 'DELETE' }),

    // Notifications
    getNotifications: (teacherId, userId) => {
        const params = new URLSearchParams();
        if (teacherId) params.append('teacherId', teacherId);
        if (userId) params.append('userId', userId);
        return apiRequest(`/notifications?${params.toString()}`);
    },
    markNotificationAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' })

    // Config (Day Override)
    ,setDayOverride: (date, dayToFollow) => apiRequest('/config/override', {
        method: 'POST',
        body: JSON.stringify({ date, day_to_follow: dayToFollow })
    })
    ,getDayOverride: (date) => apiRequest(`/config/override/${date}`)
};

// Helper function to get current date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Helper function to get day name from date
function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = new Date(date).getDay();
    return days[dayIndex];
}
