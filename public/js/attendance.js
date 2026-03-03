let attendanceData = {};
let currentDate = getCurrentDate();
let dayOverride = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupUserInfo();
    document.getElementById('attendanceDate').value = currentDate;
    loadAttendance();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';
}

function setupUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.role;
        document.getElementById('userRole').classList.add(user.role);
    }
}

// Load attendance for selected date
async function loadAttendance() {
    const date = document.getElementById('attendanceDate').value || getCurrentDate();
    currentDate = date;
    
    try {
        const attendance = await api.getAttendance(date);
        attendanceData = {};
        
        // Initialize attendance data
        attendance.forEach(teacher => {
            attendanceData[teacher.id] = teacher.status;
        });
        
        updateAttendanceGrid(attendance);

        // Setup Day to Follow UI for Saturday
        await setupDayToFollowUI(date);
    } catch (error) {
        console.error('Error loading attendance:', error);
        document.getElementById('attendanceGrid').innerHTML = 
            '<div class="text-center">Error loading attendance data</div>';
    }
}

// Update attendance grid
function updateAttendanceGrid(teachers) {
    const grid = document.getElementById('attendanceGrid');
    
    if (teachers.length === 0) {
        grid.innerHTML = '<div class="text-center">No teachers found</div>';
        return;
    }
    
    grid.innerHTML = teachers.map(teacher => {
        const status = attendanceData[teacher.id] || 'Absent';
        const presentActive = status === 'Present' ? 'active present' : '';
        const absentActive = status === 'Absent' ? 'active absent' : '';
        
        return `
            <div class="attendance-card">
                <div class="teacher-info">
                    <h4>${teacher.name}</h4>
                    <p>${teacher.subject}</p>
                </div>
                <div class="attendance-toggle">
                    <button class="toggle-btn ${presentActive}" 
                            onclick="toggleAttendance(${teacher.id}, 'Present')">
                        Present
                    </button>
                    <button class="toggle-btn ${absentActive}" 
                            onclick="toggleAttendance(${teacher.id}, 'Absent')">
                        Absent
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle attendance status
function toggleAttendance(teacherId, status) {
    attendanceData[teacherId] = status;
    
    // Update UI
    const card = event.target.closest('.attendance-card');
    const buttons = card.querySelectorAll('.toggle-btn');
    
    buttons.forEach(btn => {
        btn.classList.remove('active', 'present', 'absent');
    });
    
    event.target.classList.add('active', status.toLowerCase());
}

// Submit attendance
async function submitAttendance() {
    const date = document.getElementById('attendanceDate').value || getCurrentDate();
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    // Convert attendance data to array format
    const attendanceArray = Object.keys(attendanceData).map(teacherId => ({
        teacher_id: parseInt(teacherId),
        status: attendanceData[teacherId]
    }));
    
    try {
        await api.markAttendance(date, attendanceArray);
        alert('Attendance submitted successfully!');
        
        // Reload to show updated data
        loadAttendance();
    } catch (error) {
        console.error('Error submitting attendance:', error);
        alert('Failed to submit attendance: ' + error.message);
    }
}

// Get day name from date
function getDayFromDate(dateStr) {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

async function setupDayToFollowUI(date) {
    const container = document.getElementById('dayToFollowContainer');
    const select = document.getElementById('dayToFollow');
    if (!container || !select) return;

    const dayName = getDayFromDate(date);
    if (dayName === 'Saturday') {
        container.style.display = 'block';
        try {
            const res = await api.getDayOverride(date);
            const override = res && res.override ? res.override.day_to_follow : '';
            dayOverride = override || null;
            select.value = override || '';
        } catch (e) {
            dayOverride = null;
            select.value = '';
        }
    } else {
        container.style.display = 'none';
        dayOverride = null;
        select.value = '';
    }
}

async function handleDayToFollowChange() {
    const select = document.getElementById('dayToFollow');
    const date = document.getElementById('attendanceDate').value || getCurrentDate();
    if (!select) return;
    const chosen = select.value;
    dayOverride = chosen || null;
    if (chosen) {
        try {
            await api.setDayOverride(date, chosen);
            alert(`Day to Follow set to ${chosen} for ${date}`);
        } catch (e) {
            alert('Failed to save Day to Follow');
        }
    }
}

// Assign substitutions for absent teachers
async function assignSubstitutionsForDate() {
    const date = document.getElementById('attendanceDate').value || getCurrentDate();
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    if (!confirm('Assign substitutions for absent teachers on this date?')) {
        return;
    }
    
    const actualDay = getDayFromDate(date);
    const day = dayOverride || actualDay;
    if (actualDay === 'Saturday' && !dayOverride) {
        alert('Please select "Day to Follow" for Saturday.');
        return;
    }
    
    try {
        const result = await api.assignSubstitutions(date, day);
        
        if (result.substitutions.length === 0) {
            alert('No absent teachers or no substitutions could be assigned.');
        } else {
            const message = `Successfully assigned ${result.substitutions.length} substitution(s)!`;
            alert(message);
        }
        
        // Reload attendance to refresh
        // Save last assigned date so substitutions view can pick it up and refresh
        try {
            localStorage.setItem('lastAssignedSubstitutionDate', date);
        } catch (e) {
            // ignore storage errors
        }

        loadAttendance();
    } catch (error) {
        console.error('Error assigning substitutions:', error);
        alert('Failed to assign substitutions: ' + error.message);
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
