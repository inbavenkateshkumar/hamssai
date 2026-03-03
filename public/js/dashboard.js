// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupUserInfo();
    setupDateSelector();
    loadDashboard();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'index.html';
    }
}

// Setup user info in navbar
function setupUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.role;
        document.getElementById('userRole').classList.add(user.role);
    }
}

// Setup date selector (default to today)
function setupDateSelector() {
    const dateSelector = document.getElementById('dateSelector');
    dateSelector.value = getCurrentDate();
}

// Load dashboard data
async function loadDashboard() {
    const date = document.getElementById('dateSelector').value || getCurrentDate();
    
    try {
        showLoading();
        
        const data = await api.getDashboard(date);
        
        // Update statistics
        document.getElementById('totalTeachers').textContent = data.stats.total_teachers || 0;
        document.getElementById('presentCount').textContent = data.stats.present_count || 0;
        document.getElementById('absentCount').textContent = data.stats.absent_count || 0;
        document.getElementById('substitutionsCount').textContent = data.stats.substitutions_count || 0;
        document.getElementById('absentBadge').textContent = data.stats.absent_count || 0;
        
        // Update absent teachers table
        updateAbsentTeachersTable(data.absent_teachers || []);
        
        // Update substitutions table
        updateSubstitutionsTable(data.substitutions || []);
        
        // Update workload table
        updateWorkloadTable(data.workload || []);
        
        // Show/hide assign button based on role
        const user = JSON.parse(localStorage.getItem('user'));
        const assignBtn = document.getElementById('assignBtn');
        if (user.role !== 'incharge') {
            assignBtn.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

// Update absent teachers table
function updateAbsentTeachersTable(teachers) {
    const tbody = document.getElementById('absentTeachersTable');
    
    if (teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No absent teachers</td></tr>';
        return;
    }
    
    tbody.innerHTML = teachers.map(teacher => `
        <tr>
            <td>${teacher.name}</td>
            <td>${teacher.subject}</td>
            <td>${teacher.phone || '-'}</td>
            <td>${teacher.email || '-'}</td>
        </tr>
    `).join('');
}

// Update substitutions table
function updateSubstitutionsTable(substitutions) {
    const tbody = document.getElementById('substitutionsTable');
    
    if (substitutions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No substitutions assigned</td></tr>';
        return;
    }
    
    tbody.innerHTML = substitutions.map(sub => `
        <tr>
            <td>Period ${sub.period_number}</td>
            <td>${sub.class_name}</td>
            <td>${sub.subject}</td>
            <td>${sub.absent_teacher_name}</td>
            <td>${sub.substitute_teacher_name}</td>
            <td><span class="badge badge-primary">${sub.status}</span></td>
        </tr>
    `).join('');
}

// Update workload table
function updateWorkloadTable(workload) {
    const tbody = document.getElementById('workloadTable');
    
    if (workload.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No data available</td></tr>';
        return;
    }
    
    tbody.innerHTML = workload.map(teacher => {
        const status = teacher.today_substitutions >= teacher.max_substitution_limit 
            ? '<span class="badge badge-danger">At Limit</span>'
            : teacher.today_substitutions > 0
            ? '<span class="badge badge-warning">Assigned</span>'
            : '<span class="badge badge-success">Available</span>';
        
        return `
            <tr>
                <td>${teacher.name}</td>
                <td>${teacher.subject || '-'}</td>
                <td>${teacher.max_substitution_limit}</td>
                <td>${teacher.today_substitutions}</td>
                <td>${status}</td>
            </tr>
        `;
    }).join('');
}

// Assign substitutions
async function assignSubstitutions() {
    const date = document.getElementById('dateSelector').value || getCurrentDate();
    const day = getDayName(date);
    
    if (!confirm(`Assign substitutions for ${day}, ${date}?`)) {
        return;
    }
    
    try {
        const assignBtn = document.getElementById('assignBtn');
        assignBtn.disabled = true;
        assignBtn.textContent = 'Assigning...';
        
        const data = await api.assignSubstitutions(date, day);
        
        alert(`Substitutions assigned successfully!\n\n${data.substitutions.length} substitution(s) created.`);
        
        // Reload dashboard
        loadDashboard();
        
    } catch (error) {
        console.error('Error assigning substitutions:', error);
        alert('Failed to assign substitutions: ' + error.message);
    } finally {
        const assignBtn = document.getElementById('assignBtn');
        assignBtn.disabled = false;
        assignBtn.textContent = 'Assign Substitutions';
    }
}

// Show loading state
function showLoading() {
    const tables = ['absentTeachersTable', 'substitutionsTable', 'workloadTable'];
    tables.forEach(id => {
        const tbody = document.getElementById(id);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center loading"><div class="spinner"></div>Loading...</td></tr>';
        }
    });
}

// Show error message
function showError(message) {
    alert(message);
}

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}