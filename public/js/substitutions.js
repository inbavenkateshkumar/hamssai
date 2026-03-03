let viewAll = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupUserInfo();
    const dateInput = document.getElementById('substitutionDate');
    // If an assignment just happened, prefer that date so user sees updated substitutions
    try {
        const lastAssigned = localStorage.getItem('lastAssignedSubstitutionDate');
        if (lastAssigned) {
            dateInput.value = lastAssigned;
            // remove the flag now that we consumed it
            localStorage.removeItem('lastAssignedSubstitutionDate');
        } else {
            dateInput.value = getCurrentDate();
        }
    } catch (e) {
        dateInput.value = getCurrentDate();
    }

    loadSubstitutions();
});

// Refresh when another tab assigns substitutions
window.addEventListener('storage', (e) => {
    if (e.key === 'lastAssignedSubstitutionDate' && e.newValue) {
        const dateInput = document.getElementById('substitutionDate');
        if (dateInput) {
            dateInput.value = e.newValue;
            loadSubstitutions();
            // consume the value in this tab as well
            try { localStorage.removeItem('lastAssignedSubstitutionDate'); } catch (err) {}
        }
    }
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

// Load substitutions for selected date
async function loadSubstitutions() {
    viewAll = false;
    const date = document.getElementById('substitutionDate').value || getCurrentDate();
    
    try {
        const substitutions = await api.getSubstitutions(date);
        updateSubstitutionsTable(substitutions);
        document.getElementById('substitutionsTitle').textContent = `Substitutions - ${date}`;
    } catch (error) {
        console.error('Error loading substitutions:', error);
        document.getElementById('substitutionsTable').innerHTML = 
            '<tr><td colspan="9" class="text-center">Error loading substitutions</td></tr>';
    }
}

// View all substitutions
async function viewAllSubstitutions() {
    viewAll = true;
    
    try {
        const substitutions = await api.getAllSubstitutions();
        updateSubstitutionsTable(substitutions);
        document.getElementById('substitutionsTitle').textContent = 'All Substitutions';
    } catch (error) {
        console.error('Error loading all substitutions:', error);
        document.getElementById('substitutionsTable').innerHTML = 
            '<tr><td colspan="9" class="text-center">Error loading substitutions</td></tr>';
    }
}

// Update substitutions table
function updateSubstitutionsTable(substitutions) {
    const tbody = document.getElementById('substitutionsTable');
    const user = JSON.parse(localStorage.getItem('user'));
    const canDelete = user.role === 'incharge';
    
    if (substitutions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No substitutions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = substitutions.map(sub => {
        const date = new Date(sub.date).toISOString().split('T')[0];
        return `
            <tr>
                <td>${date}</td>
                <td>${sub.day}</td>
                <td>Period ${sub.period_number}</td>
                <td>${sub.class_name}</td>
                <td>${sub.subject}</td>
                <td>${sub.absent_teacher_name}</td>
                <td>${sub.substitute_teacher_name}</td>
                <td><span class="badge badge-primary">${sub.status}</span></td>
                <td>
                    ${canDelete ? `
                        <button class="btn btn-danger" style="padding: 5px 10px;" onclick="deleteSubstitution(${sub.id})">Delete</button>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

// Delete substitution
async function deleteSubstitution(id) {
    if (!confirm('Are you sure you want to delete this substitution record?')) {
        return;
    }
    
    try {
        await api.deleteSubstitution(id);
        alert('Substitution deleted successfully!');
        
        if (viewAll) {
            viewAllSubstitutions();
        } else {
            loadSubstitutions();
        }
    } catch (error) {
        console.error('Error deleting substitution:', error);
        alert('Failed to delete substitution: ' + error.message);
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}