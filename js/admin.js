// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;

    const user = auth.getCurrentUser();
    if (user.role !== ROLES.ADMIN) {
        toast.error('Access denied. Admin only.');
        setTimeout(() => window.location.href = '../dashboard.html', 1500);
        return;
    }

    initAdmin();
});

async function initAdmin() {
    // 1. Initial load from local
    loadAdminStats();
    loadTeamMembers();
    loadTodayActivity();
    setupFilters();

    // 2. Sync from Supabase
    if (typeof initSupabase === 'function') {
        initSupabase();
        await syncSupabaseData();

        // 3. Reload with fresh data
        loadAdminStats();
        loadTeamMembers();
        loadTodayActivity();
    }
}

async function syncSupabaseData() {
    if (typeof getAttendanceFromDB !== 'function') return;

    try {
        console.log('🔄 Syncing admin data from Supabase...');

        // 1. Sync Employees
        if (typeof getEmployeesFromDB === 'function') {
            const employees = await getEmployeesFromDB();
            if (employees && employees.length > 0) {
                localStorage.setItem('employees', JSON.stringify(employees));
            }
        }

        // 2. Sync Attendance
        const attendance = await getAttendanceFromDB();
        if (attendance) {
            const mapped = attendance.map(a => ({
                ...a,
                userId: a.user_id,
                userName: a.user_name,
                timestamp: a.created_at || new Date(a.date).toISOString()
            }));
            localStorage.setItem('gf_attendance', JSON.stringify(mapped));
        }

        // 3. Sync Work Updates
        if (typeof getWorkUpdatesFromDB === 'function') {
            const updates = await getWorkUpdatesFromDB();
            if (updates) {
                const mapped = updates.map(u => ({
                    ...u,
                    userId: u.user_id,
                    userName: u.user_name,
                    timestamp: u.created_at || new Date(u.date).toISOString()
                }));
                localStorage.setItem('gf_work_updates', JSON.stringify(mapped));
            }
        }

        // 4. Sync Activity Log
        if (typeof getActivityLogFromDB === 'function') {
            const logs = await getActivityLogFromDB(50);
            if (logs && logs.length > 0) {
                const mappedLogs = logs.map(l => ({
                    ...l,
                    employee: l.employee_name,
                    timestamp: l.created_at
                }));
                localStorage.setItem('activityLog', JSON.stringify(mappedLogs));
            }
        }
    } catch (err) {
        console.warn('Admin sync failed:', err);
    }
}

function loadAdminStats() {
    // Total users (demo)
    document.getElementById('totalUsers').textContent = DEMO_USERS.length;

    // Today's attendance
    const today = new Date().toDateString();
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const todayAttendance = attendance.filter(a => new Date(a.timestamp).toDateString() === today);
    document.getElementById('todayAttendance').textContent = todayAttendance.length;

    // Today's work updates
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    const todayUpdates = updates.filter(u => new Date(u.timestamp).toDateString() === today);
    document.getElementById('todayUpdates').textContent = todayUpdates.length;
}

function loadTeamMembers(filterField = 'all') {
    const container = document.getElementById('teamList');
    const today = new Date().toDateString();
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');

    let users = DEMO_USERS.filter(u => u.role !== ROLES.ADMIN);

    if (filterField !== 'all') {
        users = users.filter(u => u.field === filterField);
    }

    container.innerHTML = users.map(user => {
        const hasAttendance = attendance.find(a =>
            a.userId === user.id && new Date(a.timestamp).toDateString() === today
        );
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const fieldInfo = getFieldInfo(user.field);

        return `
            <div class="team-member">
                <div class="member-avatar">${initials}</div>
                <div class="member-info">
                    <div class="member-name">${user.name} ${user.employee_id ? `<span class="id-badge">${user.employee_id}</span>` : ''}</div>
                    <div class="member-meta">
                        <span class="member-field">${fieldInfo?.icon || ''} ${fieldInfo?.name || user.field}</span>
                        <span class="member-status ${hasAttendance ? '' : 'absent'}"></span>
                        <span>${hasAttendance ? 'Present' : 'Absent'}</span>
                    </div>
                </div>
                <div class="member-actions">
                    <button class="member-action-btn" onclick="viewMember('${user.id}')" title="View">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (users.length === 0) {
        container.innerHTML = '<div class="no-activity">No team members in this field.</div>';
    }
}

function loadTodayActivity() {
    const container = document.getElementById('todayActivity');
    const today = new Date().toDateString();

    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]')
        .filter(a => new Date(a.timestamp).toDateString() === today);
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]')
        .filter(u => new Date(u.timestamp).toDateString() === today);

    const activities = [
        ...attendance.map(a => ({
            type: 'check-in',
            name: a.userName,
            action: 'checked in',
            time: a.timestamp
        })),
        ...updates.map(u => ({
            type: 'work',
            name: u.userName,
            action: 'submitted work update',
            time: u.timestamp
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    if (activities.length === 0) {
        container.innerHTML = '<div class="no-activity">No activity today yet.</div>';
        return;
    }

    container.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-entry">
            <div class="activity-icon ${activity.type}">
                ${activity.type === 'check-in'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
        }
            </div>
            <div class="activity-text">
                <strong>${activity.name}</strong> ${activity.action}
            </div>
            <div class="activity-time">${formatTime(activity.time)}</div>
        </div>
    `).join('');
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadTeamMembers(btn.dataset.field);
        });
    });
}

function viewMember(userId) {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (!user) return;

    const fieldInfo = getFieldInfo(user.field);
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]')
        .filter(a => a.userId === userId);
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]')
        .filter(u => u.userId === userId);

    alert(`User Details\n\nName: ${user.name}\nID: ${user.employee_id || 'N/A'}\nEmail: ${user.email}\nRole: ${user.role}\nField: ${fieldInfo?.name || 'N/A'}\n\nTotal Attendance: ${attendance.length}\nTotal Work Updates: ${updates.length}`);
}
