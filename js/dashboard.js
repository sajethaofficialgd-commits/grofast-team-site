// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Require authentication
    if (!auth.requireAuth()) return;

    const user = auth.getCurrentUser();
    initDashboard(user);
});

function initDashboard(user) {
    // Update greeting based on time
    updateGreeting();

    // Update user info
    document.getElementById('userName').textContent = user.name || 'User';

    // Update field badge
    const fieldInfo = getFieldInfo(user.field);
    if (fieldInfo) {
        document.getElementById('fieldBadge').innerHTML = `
            <span class="field-icon">${fieldInfo.icon}</span>
            <span class="field-name">${fieldInfo.name}</span>
        `;
    } else if (user.role === ROLES.ADMIN) {
        document.getElementById('fieldBadge').innerHTML = `
            <span class="field-icon">👑</span>
            <span class="field-name">Admin</span>
        `;
    }

    // Check today's attendance
    checkTodayAttendance();

    // Load learning progress
    loadLearningProgress(user.field);

    // Load work updates count
    loadWorkUpdatesCount();

    // Initialize charts
    initCharts(user);

    // Load month stats
    loadMonthStats(user);

    // Show admin section if admin
    if (user.role === ROLES.ADMIN) {
        showAdminSection();
    }

    // Update attendance action based on device
    updateAttendanceAction();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';

    if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'Good Evening';
    } else if (hour >= 21 || hour < 5) {
        greeting = 'Good Night';
    }

    document.getElementById('greeting').textContent = greeting + ' 👋';
}

function checkTodayAttendance() {
    const today = new Date().toDateString();
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const todayRecord = attendance.find(a => new Date(a.timestamp).toDateString() === today);

    const statusEl = document.getElementById('attendanceStatus');
    if (todayRecord) {
        statusEl.textContent = 'Marked ✓';
        statusEl.style.color = 'var(--accent-green)';

        // Update action card
        const actionCard = document.getElementById('attendanceAction');
        if (actionCard) {
            actionCard.querySelector('.action-title').textContent = 'Attendance Marked';
            actionCard.querySelector('.action-desc').textContent = formatTime(todayRecord.timestamp);
        }
    } else {
        statusEl.textContent = 'Not Marked';
        statusEl.style.color = 'var(--accent-orange)';
    }
}

function loadLearningProgress(field) {
    const progress = JSON.parse(localStorage.getItem('gf_learning_progress') || '{}');
    const fieldProgress = progress[field] || {};

    // Calculate overall progress
    const modules = getLearningModules(field);
    if (!modules) return;

    let completed = 0;
    let total = 0;

    modules.forEach(module => {
        module.topics.forEach(topic => {
            total++;
            if (fieldProgress[`${module.id}_${topic.id}`] === 'completed') {
                completed++;
            }
        });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('learningProgress').textContent = percentage + '%';
}

function loadWorkUpdatesCount() {
    const today = new Date().toDateString();
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    const todayUpdates = updates.filter(u => new Date(u.timestamp).toDateString() === today);

    document.getElementById('workUpdates').textContent = todayUpdates.length;
}

function initCharts(user) {
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        setTimeout(() => initCharts(user), 100);
        return;
    }

    initWeeklyChart();
    initLearningDonut(user.field);
}

function initWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    // Sample data for the week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');

    // Calculate weekly data
    const now = new Date();
    const weekData = days.map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay() + 1 + i); // Start from Monday
        const dateStr = d.toDateString();

        const hasAttendance = attendance.find(a => new Date(a.timestamp).toDateString() === dateStr);
        const dayUpdates = updates.filter(u => new Date(u.timestamp).toDateString() === dateStr);

        return {
            attendance: hasAttendance ? 1 : 0,
            updates: dayUpdates.length
        };
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Attendance',
                    data: weekData.map(d => d.attendance),
                    backgroundColor: 'rgba(220, 38, 38, 0.8)',
                    borderRadius: 6,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Work Updates',
                    data: weekData.map(d => d.updates),
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    borderRadius: 6,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: { size: 10 }
                    }
                },
                y: {
                    display: false,
                    beginAtZero: true
                }
            }
        }
    });
}

function initLearningDonut(field) {
    const ctx = document.getElementById('learningDonut');
    if (!ctx) return;

    const progress = JSON.parse(localStorage.getItem('gf_learning_progress') || '{}');
    const fieldProgress = progress[field] || {};
    const modules = getLearningModules(field) || [];

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    modules.forEach(module => {
        module.topics.forEach(topic => {
            const status = fieldProgress[`${module.id}_${topic.id}`] || 'not_started';
            if (status === 'completed') completed++;
            else if (status === 'in_progress') inProgress++;
            else notStarted++;
        });
    });

    const total = completed + inProgress + notStarted;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('donutValue').textContent = percentage + '%';

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [completed || 0, inProgress || 0, notStarted || 10],
                backgroundColor: [
                    '#10b981',
                    '#d4af37',
                    'rgba(82, 82, 91, 0.5)'
                ],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function loadMonthStats(user) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    const progress = JSON.parse(localStorage.getItem('gf_learning_progress') || '{}');

    // This month's stats
    const monthAttendance = attendance.filter(a =>
        a.userId === user.id && new Date(a.timestamp) >= monthStart
    ).length;

    const monthUpdates = updates.filter(u =>
        u.userId === user.id && new Date(u.timestamp) >= monthStart
    ).length;

    const fieldProgress = progress[user.field] || {};
    const completedTopics = Object.values(fieldProgress).filter(s => s === 'completed').length;

    // Update UI
    const dayOfMonth = now.getDate();

    document.getElementById('monthAttendance').textContent = monthAttendance;
    document.getElementById('attendanceFill').style.width = `${Math.min((monthAttendance / dayOfMonth) * 100, 100)}%`;

    document.getElementById('monthUpdates').textContent = monthUpdates;
    document.getElementById('updatesFill').style.width = `${Math.min((monthUpdates / 20) * 100, 100)}%`;

    document.getElementById('monthTopics').textContent = completedTopics;
    document.getElementById('topicsFill').style.width = `${Math.min((completedTopics / 10) * 100, 100)}%`;
}

function showAdminSection() {
    const main = document.querySelector('.main-content');
    const adminHTML = `
        <section class="admin-section">
            <h2 class="admin-title">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Admin Panel
            </h2>
            <div class="action-grid">
                <a href="admin/index.html" class="action-card glass-card-hover">
                    <div class="action-icon gradient-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div class="action-info">
                        <span class="action-title">Manage Team</span>
                        <span class="action-desc">View team members & activity</span>
                    </div>
                </a>
                <a href="admin/reports.html" class="action-card glass-card-hover">
                    <div class="action-icon gradient-accent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                    </div>
                    <div class="action-info">
                        <span class="action-title">View Reports</span>
                        <span class="action-desc">Attendance & work analytics</span>
                    </div>
                </a>
            </div>
        </section>
    `;
    main.insertAdjacentHTML('beforeend', adminHTML);
}

function updateAttendanceAction() {
    if (!isMobileDevice()) {
        const actionCard = document.getElementById('attendanceAction');
        if (actionCard) {
            actionCard.querySelector('.action-desc').textContent = 'Mobile device required';
            actionCard.style.opacity = '0.6';
        }
    }
}

function getLearningModules(field) {
    // Return null for now, will be populated from learning data
    return LEARNING_CONTENT[field] || null;
}

// Learning content structure (basic structure, full content in learning.js)
const LEARNING_CONTENT = {
    video_editor: [
        {
            id: 'm1', title: 'Module 1 – Composition & Camera Basics', topics: [
                { id: 't1', title: 'Introduction to Video Editing' },
                { id: 't2', title: 'Composition Basics' },
                { id: 't3', title: 'Rule of Thirds' },
                { id: 't4', title: 'Types of Shots' },
                { id: 't5', title: 'Camera Angles' },
                { id: 't6', title: 'Visual Framing' },
                { id: 't7', title: 'Shot Selection' },
                { id: 't8', title: 'Practical Composition' }
            ]
        },
        {
            id: 'm2', title: 'Module 2 – Primary Editing & Cuts', topics: [
                { id: 't1', title: 'Timeline Understanding' },
                { id: 't2', title: 'Basic Cuts' },
                { id: 't3', title: 'Jump Cuts' },
                { id: 't4', title: 'Match Cuts' }
            ]
        }
    ],
    gen_ai: [
        {
            id: 'w1', title: 'Week 1 – Gen AI Foundation', topics: [
                { id: 't1', title: 'AI Basics' },
                { id: 't2', title: 'AI vs ML vs DL vs Gen AI' }
            ]
        }
    ],
    automation: [
        { id: 'a1', title: 'Agency On-Boarding', topics: [{ id: 't1', title: 'Overview' }] }
    ],
    digital_marketing: [
        { id: 'd1', title: 'Mindset & Foundation', topics: [{ id: 't1', title: 'Introduction' }] }
    ]
};

