let currentEditId = null;
let teachers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupUserInfo();
    loadTimetables();
    loadTeachers();
    checkRole();
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

function checkRole() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.role !== 'incharge') {
        document.getElementById('addTimetableBtn').style.display = 'none';
    }
}

// Load teachers for dropdown
async function loadTeachers() {
    try {
        teachers = await api.getTeachers();
        updateTeacherDropdown();
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

function updateTeacherDropdown() {
    const select = document.getElementById('timetableTeacher');
    select.innerHTML = '<option value="">Select teacher</option>' +
        teachers.map(t => `<option value="${t.id}">${t.name} - ${t.subject}</option>`).join('');
}

// Load all timetables
async function loadTimetables() {
    try {
        const timetables = await api.getTimetables();
        updateTimetablesTable(timetables);
    } catch (error) {
        console.error('Error loading timetables:', error);
        document.getElementById('timetablesTable').innerHTML = 
            '<tr><td colspan="6" class="text-center">Error loading timetables</td></tr>';
    }
}

// Update timetables table
function updateTimetablesTable(timetables) {
    const tbody = document.getElementById('timetablesTable');
    const user = JSON.parse(localStorage.getItem('user'));
    const canEdit = user.role === 'incharge';
    
    if (timetables.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No timetable entries found</td></tr>';
        return;
    }
    
    tbody.innerHTML = timetables.map(tt => `
        <tr>
            <td>${tt.teacher_name}</td>
            <td>${tt.day}</td>
            <td>Period ${tt.period_number}</td>
            <td>${tt.class_name}</td>
            <td>${tt.subject}</td>
            <td>
                ${canEdit ? `
                    <button class="btn btn-primary" style="padding: 5px 10px; margin-right: 5px;" onclick="editTimetable(${tt.id})">Edit</button>
                    <button class="btn btn-danger" style="padding: 5px 10px;" onclick="deleteTimetable(${tt.id})">Delete</button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

// Open add timetable modal
function openAddTimetableModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add Timetable Entry';
    document.getElementById('timetableForm').reset();
    document.getElementById('timetableId').value = '';
    updateTeacherDropdown();
    document.getElementById('timetableModal').classList.add('active');
}

// Close timetable modal
function closeTimetableModal() {
    document.getElementById('timetableModal').classList.remove('active');
    currentEditId = null;
}

// Edit timetable
async function editTimetable(id) {
    try {
        const timetables = await api.getTimetables();
        const timetable = timetables.find(tt => tt.id === id);
        
        if (!timetable) {
            alert('Timetable entry not found');
            return;
        }
        
        currentEditId = id;
        
        document.getElementById('modalTitle').textContent = 'Edit Timetable Entry';
        document.getElementById('timetableId').value = timetable.id;
        updateTeacherDropdown();
        document.getElementById('timetableTeacher').value = timetable.teacher_id;
        document.getElementById('timetableDay').value = timetable.day;
        document.getElementById('timetablePeriod').value = timetable.period_number;
        document.getElementById('timetableClass').value = timetable.class_name;
        document.getElementById('timetableSubject').value = timetable.subject;
        
        document.getElementById('timetableModal').classList.add('active');
    } catch (error) {
        console.error('Error loading timetable:', error);
        alert('Failed to load timetable details');
    }
}

// Save timetable
async function saveTimetable(event) {
    event.preventDefault();
    
    const timetableData = {
        teacher_id: parseInt(document.getElementById('timetableTeacher').value),
        day: document.getElementById('timetableDay').value,
        period_number: parseInt(document.getElementById('timetablePeriod').value),
        class_name: document.getElementById('timetableClass').value,
        subject: document.getElementById('timetableSubject').value
    };
    
    try {
        if (currentEditId) {
            await api.updateTimetable(currentEditId, timetableData);
            alert('Timetable entry updated successfully!');
        } else {
            await api.createTimetable(timetableData);
            alert('Timetable entry added successfully!');
        }
        
        closeTimetableModal();
        loadTimetables();
    } catch (error) {
        console.error('Error saving timetable:', error);
        alert('Failed to save timetable: ' + error.message);
    }
}

// Delete timetable
async function deleteTimetable(id) {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
        return;
    }
    
    try {
        await api.deleteTimetable(id);
        alert('Timetable entry deleted successfully!');
        loadTimetables();
    } catch (error) {
        console.error('Error deleting timetable:', error);
        alert('Failed to delete timetable: ' + error.message);
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('timetableModal');
    if (event.target === modal) {
        closeTimetableModal();
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}