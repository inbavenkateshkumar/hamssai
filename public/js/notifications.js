let currentFilter = 'all';
let allNotifications = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupUserInfo();
    loadNotifications();
    // Refresh notifications every 5 seconds
    setInterval(loadNotifications, 5000);
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

// Load notifications
async function loadNotifications() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        let notifications = [];
        
        // Get notifications based on role
        if (user.role === 'incharge') {
            // Incharge gets notifications about all substitutions
            notifications = await api.getNotifications(null, user.id);
        } else {
            // Staff gets notifications about their substitutions
            // We need to get their teacher profile first
            notifications = await api.getNotifications(null, user.id);
        }
        
        allNotifications = notifications || [];
        displayNotifications();
    } catch (error) {
        console.error('Error loading notifications:', error);
        document.getElementById('notificationsList').innerHTML = 
            '<div class="text-center"><p>Error loading notifications</p></div>';
    }
}

// Display notifications
function displayNotifications() {
    const container = document.getElementById('notificationsList');
    
    // Filter notifications
    let toDisplay = allNotifications;
    
    if (currentFilter === 'unread') {
        toDisplay = allNotifications.filter(n => !n.read_status);
    } else if (currentFilter === 'read') {
        toDisplay = allNotifications.filter(n => n.read_status);
    }
    
    // Update unread count
    const unreadCount = allNotifications.filter(n => !n.read_status).length;
    document.getElementById('unreadCount').textContent = unreadCount;
    
    if (toDisplay.length === 0) {
        container.innerHTML = '<div class="text-center" style="padding: 40px;"><p>No notifications</p></div>';
        return;
    }
    
    container.innerHTML = toDisplay.map(notification => {
        const date = new Date(notification.created_at);
        const timeStr = formatTime(date);
        const isUnread = !notification.read_status;
        
        // Get icon based on notification type
        let icon = '📧';
        if (notification.type === 'substitution_assignment') {
            icon = '🔄';
        } else if (notification.type === 'substitution_completed') {
            icon = '✅';
        } else if (notification.type === 'substitution_cancelled') {
            icon = '❌';
        }
        
        return `
            <div class="notification-item ${isUnread ? 'unread' : 'read'}">
                <div class="notification-header">
                    <span style="font-size: 16px;">${icon}</span>
                    <span class="notification-type">${notification.type.replace(/_/g, ' ').toUpperCase()}</span>
                    <span class="notification-time">${timeStr}</span>
                </div>
                <div class="notification-message">
                    ${notification.message}
                </div>
                <div class="notification-actions">
                    ${isUnread ? `
                        <button class="btn btn-sm btn-primary" onclick="markAsRead(${notification.id})">
                            Mark as Read
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Filter notifications
function filterNotifications(filter) {
    currentFilter = filter;
    
    // Update button styles
    const buttons = document.querySelectorAll('.filter-buttons button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayNotifications();
}

// Mark notification as read
async function markAsRead(notificationId) {
    try {
        await api.markNotificationAsRead(notificationId);
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
        alert('Failed to mark notification as read');
    }
}

// Clear all read notifications
async function clearAllNotifications() {
    if (!confirm('Clear all read notifications? This action cannot be undone.')) {
        return;
    }
    
    try {
        const readNotifications = allNotifications.filter(n => n.read_status);
        // Note: You may want to add a bulk delete endpoint
        alert('Notification clearing feature coming soon');
    } catch (error) {
        console.error('Error clearing notifications:', error);
    }
}

// Format time
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
