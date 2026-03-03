let currentEditId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupUserInfo();
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
        document.getElementById('addTeacherBtn').style.display = 'none';
    }
}

// Load all teachers
async function loadTeachers() {
    try {
        const teachers = await api.getTeachers();
        updateTeachersTable(teachers);
    } catch (error) {
        console.error('Error loading teachers:', error);
        document.getElementById('teachersTable').innerHTML = 
            '<tr><td colspan="8" class="text-center">Error loading teachers</td></tr>';
    }
}

// Update teachers table
function updateTeachersTable(teachers) {
    const tbody = document.getElementById('teachersTable');
    const user = JSON.parse(localStorage.getItem('user'));
    const canEdit = user.role === 'incharge';
    
    if (teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No teachers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = teachers.map(teacher => `
        <tr>
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.subject}</td>
            <td>${teacher.phone || '-'}</td>
            <td>${teacher.email || '-'}</td>
            <td>${teacher.max_substitution_limit}</td>
            <td>${teacher.current_substitution_count || 0}</td>
            <td>
                ${canEdit ? `
                    <button class="btn btn-primary" style="padding: 5px 10px; margin-right: 5px;" onclick="editTeacher(${teacher.id})">Edit</button>
                    <button class="btn btn-danger" style="padding: 5px 10px;" onclick="deleteTeacher(${teacher.id})">Delete</button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

// Open add teacher modal
function openAddTeacherModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add Teacher';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherId').value = '';
    document.getElementById('teacherModal').classList.add('active');
}

// Close teacher modal
function closeTeacherModal() {
    document.getElementById('teacherModal').classList.remove('active');
    currentEditId = null;
}

// Edit teacher
async function editTeacher(id) {
    try {
        const teacher = await api.getTeacher(id);
        currentEditId = id;
        
        document.getElementById('modalTitle').textContent = 'Edit Teacher';
        document.getElementById('teacherId').value = teacher.id;
        document.getElementById('teacherName').value = teacher.name;
        document.getElementById('teacherSubject').value = teacher.subject;
        document.getElementById('teacherPhone').value = teacher.phone || '';
        document.getElementById('teacherEmail').value = teacher.email || '';
        document.getElementById('teacherMaxLimit').value = teacher.max_substitution_limit;
        
        document.getElementById('teacherModal').classList.add('active');
    } catch (error) {
        console.error('Error loading teacher:', error);
        alert('Failed to load teacher details');
    }
}

// Save teacher (add or update)
async function saveTeacher(event) {
    event.preventDefault();
    
    const teacherData = {
        name: document.getElementById('teacherName').value,
        subject: document.getElementById('teacherSubject').value,
        phone: document.getElementById('teacherPhone').value || null,
        email: document.getElementById('teacherEmail').value || null,
        max_substitution_limit: parseInt(document.getElementById('teacherMaxLimit').value) || 3
    };
    
    try {
        if (currentEditId) {
            await api.updateTeacher(currentEditId, teacherData);
            alert('Teacher updated successfully!');
        } else {
            await api.createTeacher(teacherData);
            alert('Teacher added successfully!');
        }
        
        closeTeacherModal();
        loadTeachers();
    } catch (error) {
        console.error('Error saving teacher:', error);
        alert('Failed to save teacher: ' + error.message);
    }
}

// Delete teacher
async function deleteTeacher(id) {
    if (!confirm('Are you sure you want to delete this teacher? This will also delete their timetable and related records.')) {
        return;
    }
    
    try {
        await api.deleteTeacher(id);
        alert('Teacher deleted successfully!');
        loadTeachers();
    } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher: ' + error.message);
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('teacherModal');
    if (event.target === modal) {
        closeTeacherModal();
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}