// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;

    const user = auth.getCurrentUser();
    initProfile(user);
});

function initProfile(user) {
    // Set avatar initials
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('avatarInitials').textContent = initials;

    // Set user info
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;

    // Set role badge
    const roleBadge = document.getElementById('roleBadge');
    roleBadge.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (user.role === ROLES.ADMIN) {
        roleBadge.classList.add('admin');
    }

    // Set field badge
    const fieldInfo = getFieldInfo(user.field);
    if (fieldInfo) {
        document.getElementById('fieldBadge').textContent = `${fieldInfo.icon} ${fieldInfo.name}`;
    } else if (user.role === ROLES.ADMIN) {
        document.getElementById('fieldBadge').textContent = '👑 All Fields';
    }

    // Load stats
    loadProfileStats(user);

    // Show admin link if admin
    if (user.role === ROLES.ADMIN) {
        document.getElementById('adminLink').style.display = 'flex';
    }

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function loadProfileStats(user) {
    // Attendance count
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const userAttendance = attendance.filter(a => a.userId === user.id);
    document.getElementById('totalAttendance').textContent = userAttendance.length;

    // Work updates count
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    const userUpdates = updates.filter(u => u.userId === user.id);
    document.getElementById('totalUpdates').textContent = userUpdates.length;

    // Learning progress
    const progress = JSON.parse(localStorage.getItem('gf_learning_progress') || '{}');
    const fieldProgress = progress[user.field] || {};

    // Calculate percentage (simplified)
    const totalTopics = Object.keys(fieldProgress).length || 1;
    const completed = Object.values(fieldProgress).filter(v => v === 'completed').length;
    const percentage = Math.round((completed / Math.max(totalTopics, 1)) * 100);
    document.getElementById('learningPercent').textContent = percentage + '%';
}

function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        toast.info('Signing out...');
        setTimeout(() => {
            auth.logout();
        }, 500);
    }
}

function showAccountInfo() {
    const user = auth.getCurrentUser();
    alert(`Account Information\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nField: ${user.field || 'All Fields'}`);
}

function showAttendanceHistory() {
    window.location.href = 'attendance.html';
}

function exportData() {
    const user = auth.getCurrentUser();

    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]')
        .filter(a => a.userId === user.id);
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]')
        .filter(u => u.userId === user.id);
    const progress = JSON.parse(localStorage.getItem('gf_learning_progress') || '{}');

    const exportData = {
        user: { name: user.name, email: user.email, role: user.role, field: user.field },
        attendance: attendance.map(a => ({
            date: a.timestamp,
            location: a.location?.address
        })),
        workUpdates: updates,
        learningProgress: progress[user.field] || {},
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grofast-data-${user.name.replace(/\s/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully!');
}
