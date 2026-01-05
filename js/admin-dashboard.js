// =============================================
// ADMIN DASHBOARD - MAIN SCRIPT
// =============================================

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    // Check if admin is logged in
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Set admin name
    const adminUser = sessionStorage.getItem('adminUser') || 'Admin';
    document.getElementById('adminName').textContent = adminUser;

    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', options);

    // Initialize dashboard
    initDashboard();

    // Setup navigation
    setupNavigation();

    // Setup form handlers
    setupFormHandlers();

    // Setup mobile menu
    setupMobileMenu();
});

// Initialize dashboard data
function initDashboard() {
    updateStats();
    renderActivityList();
    renderEmployeesPreview();
    renderEmployeesTable();
    renderUpdatesTimeline();
    populateEmployeeSelect();
}

// Update statistics
function updateStats() {
    const employees = getEmployees();

    // Row 1: Team Stats
    document.getElementById('totalEmployees').textContent = employees.length;

    // Present Today
    const attendanceStats = getTodayAttendanceStats();
    const presentTodayEl = document.getElementById('presentToday');
    if (presentTodayEl) presentTodayEl.textContent = attendanceStats.present;

    // Active Projects
    const activeProjectsEl = document.getElementById('activeProjects');
    if (activeProjectsEl) activeProjectsEl.textContent = getActiveProjectsCount();

    // Total Tasks
    const totalTasksEl = document.getElementById('totalTasks');
    if (totalTasksEl) totalTasksEl.textContent = getTotalTasksCount();

    // Row 2: Productivity Stats
    const tasksCompletedEl = document.getElementById('tasksCompletedToday');
    if (tasksCompletedEl) tasksCompletedEl.textContent = getTasksCompletedToday();

    const pendingTasksEl = document.getElementById('pendingTasks');
    if (pendingTasksEl) pendingTasksEl.textContent = getPendingTasksCount();

    const overdueTasksEl = document.getElementById('overdueTasks');
    if (overdueTasksEl) overdueTasksEl.textContent = getOverdueTasksCount();

    const totalHoursEl = document.getElementById('totalHoursToday');
    if (totalHoursEl) totalHoursEl.textContent = getTotalHoursToday() + 'h';

    // Update Attendance Widget
    updateAttendanceWidget(attendanceStats);
}

// Update Attendance Widget
function updateAttendanceWidget(stats) {
    // Update counts
    const presentEl = document.getElementById('attendancePresent');
    const absentEl = document.getElementById('attendanceAbsent');
    const lateEl = document.getElementById('attendanceLate');
    const wfhEl = document.getElementById('attendanceWfh');

    if (presentEl) presentEl.textContent = stats.present;
    if (absentEl) absentEl.textContent = stats.absent;
    if (lateEl) lateEl.textContent = stats.late;
    if (wfhEl) wfhEl.textContent = stats.wfh;

    // Update bar chart
    const total = stats.total || 1; // Avoid division by zero
    const barPresent = document.getElementById('barPresent');
    const barAbsent = document.getElementById('barAbsent');
    const barLate = document.getElementById('barLate');
    const barWfh = document.getElementById('barWfh');

    if (barPresent) barPresent.style.width = ((stats.present / total) * 100) + '%';
    if (barAbsent) barAbsent.style.width = ((stats.absent / total) * 100) + '%';
    if (barLate) barLate.style.width = ((stats.late / total) * 100) + '%';
    if (barWfh) barWfh.style.width = ((stats.wfh / total) * 100) + '%';
}

// Render activity list (dashboard preview)
function renderActivityList() {
    const container = document.getElementById('activityList');
    const activities = getActivityLog().slice(0, 5);

    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i data-lucide="${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-info">
                <p class="activity-text"><strong>${activity.employee}</strong> ${activity.description}</p>
                <span class="activity-time">${timeAgo(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Render employees preview (dashboard) - Enhanced with status
function renderEmployeesPreview() {
    const container = document.getElementById('employeesPreview');
    const employees = getEmployees().slice(0, 5);
    const tasks = getTasks();
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const today = new Date().toDateString();

    container.innerHTML = employees.map(emp => {
        const rolesDisplay = emp.roles ? formatRolesDisplay(emp.roles) : (emp.role || 'No role');

        // Check if employee is present today
        const isPresentToday = attendance.some(a =>
            a.userId == emp.id && new Date(a.timestamp).toDateString() === today
        );

        // Get current task for employee
        const currentTask = tasks.find(t =>
            t.assignedTo == emp.id && (t.status === 'in_progress' || t.status === 'todo')
        );

        const statusClass = isPresentToday ? 'online' : 'offline';
        const statusText = isPresentToday ? '🟢 Available' : '⚫ Away';
        const taskText = currentTask ? currentTask.title : 'No active task';

        return `
        <div class="employee-item" onclick="viewEmployee(${emp.id})">
            <div class="employee-avatar">${getInitials(emp.name)}</div>
            <div class="employee-info">
                <p class="employee-name">${emp.name}</p>
                <p class="employee-role">${rolesDisplay}</p>
                <p class="employee-task">📋 ${taskText}</p>
            </div>
            <div class="employee-status-badge ${statusClass}">${statusText}</div>
        </div>
    `;
    }).join('');
}

// Render employees table
function renderEmployeesTable(filter = '') {
    const container = document.getElementById('employeesTableBody');
    let employees = getEmployees();

    if (filter) {
        filter = filter.toLowerCase();
        employees = employees.filter(emp => {
            const rolesText = emp.roles ? getRoleNames(emp.roles).join(' ').toLowerCase() : (emp.role || '').toLowerCase();
            return emp.name.toLowerCase().includes(filter) ||
                emp.email.toLowerCase().includes(filter) ||
                emp.department.toLowerCase().includes(filter) ||
                rolesText.includes(filter);
        });
    }

    container.innerHTML = employees.map(emp => {
        const rolesDisplay = emp.roles ? formatRolesDisplay(emp.roles) : (emp.role || 'No role');
        return `
        <tr>
            <td>
                <div class="table-employee">
                    <div class="table-avatar">${getInitials(emp.name)}</div>
                    <div>
                        <span>${emp.name}</span>
                        <p class="employee-role-subtitle">${rolesDisplay}</p>
                    </div>
                </div>
            </td>
            <td>${emp.department}</td>
            <td>${emp.email}</td>
            <td>${emp.phone}</td>
            <td>
                <span class="status-badge ${emp.status}">${emp.status === 'active' ? 'Active' : 'Inactive'}</span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" onclick="viewEmployee(${emp.id})" title="View">
                        <i data-lucide="eye"></i>
                    </button>
                    <button class="action-btn" onclick="editEmployee(${emp.id})" title="Edit">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteEmployee(${emp.id})" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join('');

    lucide.createIcons();
}

// Render updates timeline
function renderUpdatesTimeline(filter = 'all') {
    const container = document.getElementById('updatesTimeline');
    let activities = getActivityLog();

    if (filter !== 'all') {
        activities = activities.filter(a => a.type === filter);
    }

    container.innerHTML = activities.map(activity => `
        <div class="update-item">
            <div class="update-icon ${activity.type === 'login' ? 'stat-icon green' : activity.type === 'profile' ? 'stat-icon blue' : 'stat-icon cyan'}">
                <i data-lucide="${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="update-content">
                <div class="update-header">
                    <span class="update-title">${activity.employee}</span>
                    <span class="update-time">${timeAgo(activity.timestamp)}</span>
                </div>
                <p class="update-description">${activity.description}</p>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Get activity icon
function getActivityIcon(type) {
    switch (type) {
        case 'login': return 'log-in';
        case 'profile': return 'user';
        case 'update': return 'plus-circle';
        case 'task': return 'check-square';
        case 'project': return 'folder-kanban';
        case 'attendance': return 'calendar-check';
        case 'time': return 'timer';
        case 'work': return 'briefcase';
        case 'complete': return 'check-circle-2';
        default: return 'zap';
    }
}

// Filter employees
function filterEmployees() {
    const searchTerm = document.getElementById('searchInput').value;
    renderEmployeesTable(searchTerm);
}

// View employee details
function viewEmployee(id) {
    const employees = getEmployees();
    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    const container = document.getElementById('employeeDetails');
    const roleNames = emp.roles ? getRoleNames(emp.roles) : (emp.role ? [emp.role] : []);
    const rolesHtml = roleNames.map(name => `<span class="role-tag">${name}</span>`).join('');

    container.innerHTML = `
        <div class="employee-detail-header">
            <div class="detail-avatar">${getInitials(emp.name)}</div>
            <div>
                <h2 class="detail-name">${emp.name}</h2>
                <p class="detail-role">${emp.department}</p>
            </div>
        </div>
        <div class="employee-roles-section">
            <p class="detail-label">Roles</p>
            <div class="role-tags">${rolesHtml || '<span class="text-muted">No roles assigned</span>'}</div>
        </div>
        <div class="employee-detail-grid">
            <div class="detail-item">
                <p class="detail-label">Email</p>
                <p class="detail-value">${emp.email}</p>
            </div>
            <div class="detail-item">
                <p class="detail-label">Phone</p>
                <p class="detail-value">${emp.phone}</p>
            </div>
            <div class="detail-item">
                <p class="detail-label">Department</p>
                <p class="detail-value">${emp.department}</p>
            </div>
            <div class="detail-item">
                <p class="detail-label">Status</p>
                <p class="detail-value"><span class="status-badge ${emp.status}">${emp.status === 'active' ? 'Active' : 'Inactive'}</span></p>
            </div>
            <div class="detail-item">
                <p class="detail-label">Join Date</p>
                <p class="detail-value">${new Date(emp.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="detail-item">
                <p class="detail-label">Last Login</p>
                <p class="detail-value">${emp.lastLogin ? timeAgo(emp.lastLogin) : 'Never'}</p>
            </div>
        </div>
        <div class="employee-detail-actions" style="margin-top: var(--space-6); display: flex; justify-content: flex-end; gap: var(--space-3);">
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button class="btn btn-primary" onclick="closeModal(); editEmployee(${emp.id})">
                <i data-lucide="edit-2"></i>
                Edit Member
            </button>
        </div>
    `;

    document.getElementById('employeeModal').classList.remove('hidden');
    lucide.createIcons();
}

// Close modal
function closeModal() {
    document.getElementById('employeeModal').classList.add('hidden');
}

// Delete employee
function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    let employees = getEmployees();
    const emp = employees.find(e => e.id === id);
    employees = employees.filter(e => e.id !== id);
    saveEmployees(employees);

    addActivity('update', 'Admin', `Removed team member: ${emp.name}`);

    initDashboard();
    showToast('Team member deleted successfully', 'success');
}

// Edit employee
function editEmployee(id) {
    const employees = getEmployees();
    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    // Populate modal fields
    document.getElementById('editEmpId').value = emp.id;
    document.getElementById('editEmpName').value = emp.name;
    document.getElementById('editEmpEmail').value = emp.email;
    document.getElementById('editEmpPhone').value = emp.phone || '';
    document.getElementById('editEmpDepartment').value = emp.department || '';
    document.getElementById('editEmpStatus').value = emp.status || 'active';
    document.getElementById('editEmpPassword').value = ''; // Password field starts empty

    // Populate roles
    document.querySelectorAll('input[name="editEmpRoles"]').forEach(checkbox => {
        checkbox.checked = emp.roles && emp.roles.includes(checkbox.value);
    });

    // Show modal
    document.getElementById('editEmployeeModal').classList.remove('hidden');
    lucide.createIcons();
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editEmployeeModal').classList.add('hidden');
}

// Setup navigation
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);

            // Update active state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Close sidebar on mobile
            document.getElementById('sidebar').classList.remove('open');
        });
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderUpdatesTimeline(this.dataset.filter);
        });
    });
}

// Show section
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Convert hyphenated names to camelCase (e.g., 'add-employee' -> 'addEmployee')
    const camelCaseName = sectionName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    const sectionId = camelCaseName + 'Section';
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Update nav item
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.dataset.section === sectionName) {
            nav.classList.add('active');
        }
    });
}

// Setup form handlers
function setupFormHandlers() {
    document.getElementById('addEmployeeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect selected roles
        const selectedRoles = [];
        document.querySelectorAll('input[name="empRoles"]:checked').forEach(checkbox => {
            selectedRoles.push(checkbox.value);
        });

        // Validate at least one role is selected
        if (selectedRoles.length === 0) {
            showToast('Please select at least one role', 'error');
            return;
        }

        const employees = getEmployees();
        const newEmployee = {
            id: Date.now(), // Use timestamp for unique ID
            name: document.getElementById('empName').value.trim(),
            email: document.getElementById('empEmail').value.trim(),
            phone: document.getElementById('empPhone').value.trim(),
            department: document.getElementById('empDepartment').value,
            roles: selectedRoles,
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: null,
            password: document.getElementById('empPassword').value.trim()
        };

        employees.push(newEmployee);
        saveEmployees(employees);

        addActivity('update', 'Admin', `Added new team member: ${newEmployee.name}`);

        // Reset form
        this.reset();

        // Reinitialize icons after form reset
        lucide.createIcons();

        // Refresh data
        initDashboard();
        showSection('employees');

        showToast('Team member added successfully!', 'success');

        // Send Email and Message notifications
        notifyNewMember(newEmployee);
    });

    // Edit Employee Form
    const editForm = document.getElementById('editEmployeeForm');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const id = document.getElementById('editEmpId').value;
            const employees = getEmployees();
            const index = employees.findIndex(emp => emp.id == id);

            if (index === -1) {
                showToast('Employee not found', 'error');
                return;
            }

            // Collect selected roles
            const selectedRoles = [];
            document.querySelectorAll('input[name="editEmpRoles"]:checked').forEach(checkbox => {
                selectedRoles.push(checkbox.value);
            });

            if (selectedRoles.length === 0) {
                showToast('Please select at least one role', 'error');
                return;
            }

            // Update employee data
            const updatedEmp = {
                ...employees[index],
                name: document.getElementById('editEmpName').value.trim(),
                email: document.getElementById('editEmpEmail').value.trim(),
                phone: document.getElementById('editEmpPhone').value.trim(),
                department: document.getElementById('editEmpDepartment').value,
                status: document.getElementById('editEmpStatus').value,
                roles: selectedRoles
            };

            // Update password if provided
            const newPassword = document.getElementById('editEmpPassword').value.trim();
            if (newPassword.trim() !== '') {
                updatedEmp.password = newPassword;
            }

            // Save updates
            employees[index] = updatedEmp;
            saveEmployees(employees);

            // Log activity
            addActivity('update', 'Admin', `Updated team member profile: ${updatedEmp.name}`);

            // Refresh data and close modal
            initDashboard();
            closeEditModal();
            showToast('Team member updated successfully!', 'success');
        });
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');

    // Add mobile menu button
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.innerHTML = '<i data-lucide="menu"></i>';
    mobileBtn.onclick = () => sidebar.classList.toggle('open');
    document.body.appendChild(mobileBtn);

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    lucide.createIcons();
}

// Logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    window.location.href = '../index.html';
}

// Toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
        success: 'check-circle',
        error: 'alert-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${iconMap[type]}"></i>
        </div>
        <div class="toast-content">
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// =============================================
// TEAM REPORTS FUNCTIONS
// =============================================

let currentReportPeriod = 'today';
let currentReportEmployeeId = null;

// Populate employee dropdown for reports
function populateEmployeeSelect() {
    const select = document.getElementById('reportEmployeeSelect');
    if (!select) return;

    const employees = getEmployees();

    select.innerHTML = '<option value="">-- Select an Employee --</option>';
    employees.forEach(emp => {
        select.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
    });
}

// Change report period
function changeReportPeriod(period) {
    currentReportPeriod = period;

    // Update active tab
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.period === period) {
            tab.classList.add('active');
        }
    });

    // Reload report if employee is selected
    if (currentReportEmployeeId) {
        loadEmployeeReport();
    }
}

// Load employee report
function loadEmployeeReport() {
    const select = document.getElementById('reportEmployeeSelect');
    const employeeId = select.value;

    if (!employeeId) {
        document.getElementById('reportContent').innerHTML = `
            <div class="no-report-selected">
                <div class="empty-state-icon">
                    <i data-lucide="user-search"></i>
                </div>
                <h3>Select an Employee</h3>
                <p>Choose an employee from the dropdown above to view their detailed report</p>
            </div>
        `;
        lucide.createIcons();
        currentReportEmployeeId = null;
        return;
    }

    currentReportEmployeeId = employeeId;

    const employees = getEmployees();
    const employee = employees.find(e => e.id == employeeId);

    if (!employee) return;

    // Get date range based on period
    const { startDate, endDate, periodLabel } = getDateRange(currentReportPeriod);

    // Get employee data
    const attendanceData = getEmployeeAttendance(employee.id, startDate, endDate);
    const workData = getEmployeeWorkUpdates(employee.id, startDate, endDate);
    const learningData = getEmployeeLearningProgress(employee.id);

    // Calculate stats
    const totalAttendance = attendanceData.length;
    const totalWorkUpdates = workData.length;
    const learningPercentage = learningData.percentage || 0;

    // Get roles display
    const rolesDisplay = employee.roles ? formatRolesDisplay(employee.roles) : (employee.role || 'No role');

    // Render report
    document.getElementById('reportContent').innerHTML = `
        <!-- Employee Header -->
        <div class="report-employee-header">
            <div class="report-avatar">${getInitials(employee.name)}</div>
            <div class="report-employee-info">
                <h2>${employee.name}</h2>
                <div class="report-meta">
                    <span>${rolesDisplay}</span>
                    <span>•</span>
                    <span>${employee.department}</span>
                    <span class="report-period-badge">
                        <i data-lucide="calendar"></i>
                        ${periodLabel}
                    </span>
                </div>
            </div>
        </div>

        <!-- Stats Summary -->
        <div class="report-stats-grid">
            <div class="report-stat-card">
                <div class="report-stat-value green">${totalAttendance}</div>
                <div class="report-stat-label">Days Present</div>
            </div>
            <div class="report-stat-card">
                <div class="report-stat-value cyan">${totalWorkUpdates}</div>
                <div class="report-stat-label">Work Updates</div>
            </div>
            <div class="report-stat-card">
                <div class="report-stat-value purple">${learningPercentage}%</div>
                <div class="report-stat-label">Learning Progress</div>
            </div>
            <div class="report-stat-card">
                <div class="report-stat-value">${employee.status === 'active' ? '✓' : '✗'}</div>
                <div class="report-stat-label">Status: ${employee.status}</div>
            </div>
        </div>

        <!-- Report Cards -->
        <div class="report-cards-grid">
            <!-- Attendance Card -->
            <div class="report-card">
                <div class="report-card-header">
                    <div class="report-card-icon attendance">
                        <i data-lucide="calendar-check"></i>
                    </div>
                    <h3 class="report-card-title">Attendance Records</h3>
                </div>
                <div class="report-card-body">
                    ${renderAttendanceList(attendanceData)}
                </div>
            </div>

            <!-- Work Updates Card -->
            <div class="report-card">
                <div class="report-card-header">
                    <div class="report-card-icon work">
                        <i data-lucide="briefcase"></i>
                    </div>
                    <h3 class="report-card-title">Work Updates</h3>
                </div>
                <div class="report-card-body">
                    ${renderWorkUpdatesList(workData)}
                </div>
            </div>

            <!-- Learning Progress Card -->
            <div class="report-card full-width">
                <div class="report-card-header">
                    <div class="report-card-icon learning">
                        <i data-lucide="book-open"></i>
                    </div>
                    <h3 class="report-card-title">Learning Progress</h3>
                </div>
                <div class="report-card-body">
                    ${renderLearningProgress(learningData)}
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
}

// Get date range based on period
function getDateRange(period) {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    let periodLabel = '';

    switch (period) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            periodLabel = 'Today';
            break;
        case '7days':
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            periodLabel = 'Last 7 Days';
            break;
        case '30days':
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            periodLabel = 'Last 30 Days';
            break;
    }

    return { startDate, endDate, periodLabel };
}

// Get employee attendance within date range
function getEmployeeAttendance(employeeId, startDate, endDate) {
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    return attendance.filter(a => {
        const recordDate = new Date(a.timestamp);
        return a.userId == employeeId && recordDate >= startDate && recordDate <= endDate;
    });
}

// Get employee work updates within date range
function getEmployeeWorkUpdates(employeeId, startDate, endDate) {
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    return updates.filter(u => {
        const recordDate = new Date(u.timestamp);
        return u.userId == employeeId && recordDate >= startDate && recordDate <= endDate;
    });
}

// Get employee learning progress
function getEmployeeLearningProgress(employeeId) {
    const progress = JSON.parse(localStorage.getItem('gf_learning_progress') || '{}');

    // Count completed topics
    let completed = 0;
    let inProgress = 0;
    let total = 0;

    Object.values(progress).forEach(fieldProgress => {
        Object.values(fieldProgress).forEach(status => {
            total++;
            if (status === 'completed') completed++;
            else if (status === 'in_progress') inProgress++;
        });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        completed,
        inProgress,
        total,
        percentage,
        raw: progress
    };
}

// Render attendance list
function renderAttendanceList(attendanceData) {
    if (attendanceData.length === 0) {
        return `
            <div class="report-empty">
                <i data-lucide="calendar-x"></i>
                <p>No attendance records for this period</p>
            </div>
        `;
    }

    return `
        <div class="report-list">
            ${attendanceData.map(record => {
        const date = new Date(record.timestamp);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const location = record.location ? `${record.location.city || ''}, ${record.location.state || ''}` : 'Location not available';

        return `
                    <div class="report-list-item">
                        <div class="report-item-date">
                            <span class="report-item-day">${day}</span>
                            <span class="report-item-month">${month}</span>
                        </div>
                        <div class="report-item-content">
                            <div class="report-item-title">Check-in at ${time}</div>
                            <div class="report-item-details">${location}</div>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

// Render work updates list
function renderWorkUpdatesList(workData) {
    if (workData.length === 0) {
        return `
            <div class="report-empty">
                <i data-lucide="file-x"></i>
                <p>No work updates for this period</p>
            </div>
        `;
    }

    return `
        <div class="report-list">
            ${workData.map(update => {
        const date = new Date(update.timestamp);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        // Get project name or first field
        const projectName = update.data?.projectName || update.data?.client || 'Work Update';
        const details = Object.entries(update.data || {})
            .filter(([key]) => key !== 'projectName')
            .slice(0, 2)
            .map(([key, value]) => `${key}: ${String(value).substring(0, 50)}...`)
            .join(' | ');

        return `
                    <div class="report-list-item">
                        <div class="report-item-date">
                            <span class="report-item-day">${day}</span>
                            <span class="report-item-month">${month}</span>
                        </div>
                        <div class="report-item-content">
                            <div class="report-item-title">${projectName}</div>
                            <div class="report-item-details">${details || 'No additional details'}</div>
                            <div class="report-item-time">${time}</div>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

// Render learning progress
function renderLearningProgress(learningData) {
    if (learningData.total === 0) {
        return `
            <div class="report-empty">
                <i data-lucide="book-x"></i>
                <p>No learning progress recorded yet</p>
            </div>
        `;
    }

    return `
        <div class="learning-summary">
            <div class="report-stats-grid" style="margin-bottom: 0;">
                <div class="report-stat-card">
                    <div class="report-stat-value green">${learningData.completed}</div>
                    <div class="report-stat-label">Completed</div>
                </div>
                <div class="report-stat-card">
                    <div class="report-stat-value cyan">${learningData.inProgress}</div>
                    <div class="report-stat-label">In Progress</div>
                </div>
                <div class="report-stat-card">
                    <div class="report-stat-value">${learningData.total - learningData.completed - learningData.inProgress}</div>
                    <div class="report-stat-label">Not Started</div>
                </div>
                <div class="report-stat-card">
                    <div class="report-stat-value purple">${learningData.percentage}%</div>
                    <div class="report-stat-label">Overall Progress</div>
                </div>
            </div>
            <div class="learning-progress-bar" style="margin-top: 20px;">
                <div class="learning-progress-fill" style="width: ${learningData.percentage}%;"></div>
            </div>
        </div>
    `;
}

// =============================================
// PROJECTS MANAGEMENT FUNCTIONS
// =============================================

let currentProjectFilter = 'all';

// Render projects
function renderProjects(filter = 'all') {
    const grid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('projectsEmptyState');
    if (!grid) return;

    let projects = getProjects();

    // Apply filter
    if (filter !== 'all') {
        projects = projects.filter(p => p.status === filter);
    }

    // Update stats
    updateProjectStats();

    if (projects.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    const employees = getEmployees();

    grid.innerHTML = projects.map(project => {
        // Get team members
        const teamMembers = (project.team || []).map(id =>
            employees.find(e => e.id == id)
        ).filter(Boolean);

        const teamAvatars = teamMembers.slice(0, 3).map(member =>
            `<div class="project-team-avatar">${getInitials(member.name)}</div>`
        ).join('');

        const moreMembers = teamMembers.length > 3 ?
            `<span class="project-team-more">+${teamMembers.length - 3}</span>` : '';

        // Format deadline
        let deadlineHtml = '';
        if (project.deadline) {
            const deadline = new Date(project.deadline);
            const now = new Date();
            const isOverdue = deadline < now && project.status !== 'completed';
            deadlineHtml = `
                <div class="project-deadline ${isOverdue ? 'overdue' : ''}">
                    <i data-lucide="calendar"></i>
                    ${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
            `;
        }

        // Priority label
        const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

        return `
            <div class="project-card">
                <div class="project-card-header">
                    <div>
                        <div class="project-card-title">${project.name}</div>
                        <div class="project-card-client">${project.client}</div>
                    </div>
                    <span class="project-status-badge ${project.status}">${project.status.replace('_', ' ')}</span>
                </div>
                <div class="project-priority">
                    <span class="priority-dot ${project.priority || 'medium'}"></span>
                    ${priorityLabels[project.priority || 'medium']} Priority
                </div>
                <p class="project-card-description">${project.description || 'No description available.'}</p>
                <div class="project-card-meta">
                    <div class="project-team">
                        ${teamAvatars || '<span class="project-team-more">No team</span>'}
                        ${moreMembers}
                    </div>
                    ${deadlineHtml}
                </div>
                <div class="project-card-actions">
                    <button class="project-action-btn edit" onclick="editProject('${project.id}')">
                        <i data-lucide="edit-2"></i>
                        Edit
                    </button>
                    <button class="project-action-btn delete" onclick="deleteProject('${project.id}')">
                        <i data-lucide="trash-2"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// Update project stats
function updateProjectStats() {
    const projects = getProjects();

    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on_hold').length;

    const totalEl = document.getElementById('projectsTotal');
    const activeEl = document.getElementById('projectsActive');
    const completedEl = document.getElementById('projectsCompleted');
    const onHoldEl = document.getElementById('projectsOnHold');

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (completedEl) completedEl.textContent = completed;
    if (onHoldEl) onHoldEl.textContent = onHold;
}

// Filter projects
function filterProjects(filter) {
    currentProjectFilter = filter;

    // Update active tab
    document.querySelectorAll('#projectsSection .filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        }
    });

    renderProjects(filter);
}

// Open project modal
function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const titleEl = document.getElementById('projectModalTitle');
    const submitTextEl = document.getElementById('projectSubmitText');
    const form = document.getElementById('projectForm');

    // Populate team checkboxes
    populateTeamCheckboxes();

    if (projectId) {
        // Edit mode
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId);

        if (project) {
            titleEl.textContent = 'Edit Project';
            submitTextEl.textContent = 'Save Changes';

            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name || '';
            document.getElementById('projectClient').value = project.client || '';
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStartDate').value = project.startDate || '';
            document.getElementById('projectDeadline').value = project.deadline || '';
            document.getElementById('projectStatus').value = project.status || 'active';
            document.getElementById('projectPriority').value = project.priority || 'medium';

            // Set team checkboxes
            (project.team || []).forEach(memberId => {
                const checkbox = document.querySelector(`input[name="projectTeam"][value="${memberId}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } else {
        // Create mode
        titleEl.textContent = 'New Project';
        submitTextEl.textContent = 'Create Project';
        form.reset();
        document.getElementById('projectId').value = '';
        document.getElementById('projectStartDate').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// Close project modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.add('hidden');
}

// Populate team checkboxes
function populateTeamCheckboxes() {
    const container = document.getElementById('projectTeamCheckboxes');
    if (!container) return;

    const employees = getEmployees();

    container.innerHTML = employees.map(emp => `
        <label class="team-checkbox">
            <input type="checkbox" name="projectTeam" value="${emp.id}">
            <span class="team-checkbox-name">${emp.name}</span>
        </label>
    `).join('');

    if (employees.length === 0) {
        container.innerHTML = '<p class="text-muted">No team members available. Add employees first.</p>';
    }
}

// Save project
function saveProject(e) {
    e.preventDefault();

    const projectId = document.getElementById('projectId').value;
    const isEdit = !!projectId;

    // Get selected team members
    const selectedTeam = [];
    document.querySelectorAll('input[name="projectTeam"]:checked').forEach(cb => {
        selectedTeam.push(cb.value);
    });

    const projectData = {
        name: document.getElementById('projectName').value,
        client: document.getElementById('projectClient').value,
        description: document.getElementById('projectDescription').value,
        startDate: document.getElementById('projectStartDate').value,
        deadline: document.getElementById('projectDeadline').value,
        status: document.getElementById('projectStatus').value,
        priority: document.getElementById('projectPriority').value,
        team: selectedTeam
    };

    let projects = getProjects();

    if (isEdit) {
        // Update existing
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...projectData };
            saveProjects(projects);
            addActivity('project', 'Admin', `Updated project: ${projectData.name}`);
            showToast('Project updated successfully!', 'success');
        }
    } else {
        // Create new
        const newProject = {
            id: generateId(),
            ...projectData,
            createdAt: new Date().toISOString()
        };
        projects.push(newProject);
        saveProjects(projects);
        addActivity('project', 'Admin', `Created project: ${projectData.name}`);
        showToast('Project created successfully!', 'success');
    }

    closeProjectModal();
    renderProjects(currentProjectFilter);
    updateStats(); // Update dashboard stats
}

// Edit project
function editProject(projectId) {
    openProjectModal(projectId);
}

// Delete project
function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }

    let projects = getProjects();
    const project = projects.find(p => p.id === projectId);

    if (project) {
        projects = projects.filter(p => p.id !== projectId);
        saveProjects(projects);
        addActivity('project', 'Admin', `Deleted project: ${project.name}`);
        showToast('Project deleted successfully!', 'success');
        renderProjects(currentProjectFilter);
        updateStats();
    }
}

// Initialize projects when section is shown
const originalShowSection = showSection;
showSection = function (sectionName) {
    originalShowSection(sectionName);

    if (sectionName === 'projects') {
        renderProjects(currentProjectFilter);
    } else if (sectionName === 'tasks') {
        renderKanbanBoard();
    } else if (sectionName === 'attendance') {
        filterAttendance();
    } else if (sectionName === 'time-tracking') {
        renderTimeTracking();
    } else if (sectionName === 'settings') {
        renderSettingsPage();
    }
};

// =============================================
// TASKS/KANBAN MANAGEMENT FUNCTIONS  
// =============================================

let currentTaskProjectFilter = 'all';

// Render Kanban Board
function renderKanbanBoard(projectFilter = 'all') {
    let tasks = getTasks();
    const employees = getEmployees();
    const projects = getProjects();

    // Update project filter dropdown
    const projectFilterEl = document.getElementById('taskProjectFilter');
    if (projectFilterEl) {
        projectFilterEl.innerHTML = '<option value="all">All Projects</option>' +
            projects.map(p => `<option value="${p.id}" ${projectFilter === p.id ? 'selected' : ''}>${p.name}</option>`).join('');
    }

    // Apply project filter
    if (projectFilter !== 'all') {
        tasks = tasks.filter(t => t.projectId === projectFilter);
    }

    // Group tasks by status
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const reviewTasks = tasks.filter(t => t.status === 'review');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Update counts
    const todoCount = document.getElementById('todoCount');
    const inProgressCount = document.getElementById('inProgressCount');
    const reviewCount = document.getElementById('reviewCount');
    const completedCount = document.getElementById('completedCount');

    if (todoCount) todoCount.textContent = todoTasks.length;
    if (inProgressCount) inProgressCount.textContent = inProgressTasks.length;
    if (reviewCount) reviewCount.textContent = reviewTasks.length;
    if (completedCount) completedCount.textContent = completedTasks.length;

    // Render tasks in columns
    renderTasksInColumn('todoTasks', todoTasks, employees, projects);
    renderTasksInColumn('inProgressTasks', inProgressTasks, employees, projects);
    renderTasksInColumn('reviewTasks', reviewTasks, employees, projects);
    renderTasksInColumn('completedTasks', completedTasks, employees, projects);

    lucide.createIcons();
}

// Render tasks in a specific column
function renderTasksInColumn(containerId, tasks, employees, projects) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center;padding:20px;opacity:0.5;">No tasks</p>';
        return;
    }

    container.innerHTML = tasks.map(task => {
        const assignee = employees.find(e => e.id == task.assignedTo);
        const project = projects.find(p => p.id === task.projectId);

        // Format due date
        let dueDateHtml = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            let dueDateClass = '';
            if (diffDays < 0 && task.status !== 'completed') dueDateClass = 'overdue';
            else if (diffDays <= 2 && diffDays >= 0) dueDateClass = 'due-soon';

            dueDateHtml = `
                <div class="task-due-date ${dueDateClass}">
                    <i data-lucide="calendar"></i>
                    ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
            `;
        }

        return `
            <div class="task-card" draggable="true" ondragstart="dragTask(event, '${task.id}')" data-task-id="${task.id}">
                <div class="task-card-header">
                    <div class="task-card-title">${task.title}</div>
                    <span class="task-priority-badge ${task.priority || 'medium'}"></span>
                </div>
                ${project ? `<div class="task-card-project">📁 ${project.name}</div>` : ''}
                <div class="task-card-meta">
                    <div class="task-assignee">
                        ${assignee ? `
                            <div class="task-assignee-avatar">${getInitials(assignee.name)}</div>
                            <span class="task-assignee-name">${assignee.name}</span>
                        ` : '<span class="task-assignee-name">Unassigned</span>'}
                    </div>
                    ${dueDateHtml}
                </div>
                <div class="task-card-actions">
                    <button class="task-action-btn edit" onclick="editTask('${task.id}')">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="task-action-btn delete" onclick="deleteTask('${task.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Drag and Drop functions
function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function dragTask(event, taskId) {
    event.dataTransfer.setData('taskId', taskId);
    event.target.classList.add('dragging');
}

function dropTask(event, newStatus) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const taskId = event.dataTransfer.getData('taskId');
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        const oldStatus = tasks[taskIndex].status;
        tasks[taskIndex].status = newStatus;

        // Set completion time if moved to completed
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            tasks[taskIndex].completedAt = new Date().toISOString();
            addActivity('complete', 'Admin', `Completed task: ${tasks[taskIndex].title}`);
        }

        saveTasks(tasks);
        renderKanbanBoard(currentTaskProjectFilter);
        updateStats();
    }

    // Remove dragging class from all cards
    document.querySelectorAll('.task-card.dragging').forEach(el => el.classList.remove('dragging'));
}

// Remove drag-over on drag leave
document.addEventListener('dragleave', function (e) {
    if (e.target.classList && e.target.classList.contains('kanban-tasks')) {
        e.target.classList.remove('drag-over');
    }
});

// Filter tasks by project
function filterTasksByProject() {
    const filter = document.getElementById('taskProjectFilter').value;
    currentTaskProjectFilter = filter;
    renderKanbanBoard(filter);
}

// Open task modal
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const titleEl = document.getElementById('taskModalTitle');
    const submitTextEl = document.getElementById('taskSubmitText');
    const form = document.getElementById('taskForm');

    // Populate project dropdown
    const projectSelect = document.getElementById('taskProject');
    const projects = getProjects();
    projectSelect.innerHTML = '<option value="">No Project</option>' +
        projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    // Populate assignee dropdown
    const assigneeSelect = document.getElementById('taskAssignee');
    const employees = getEmployees();
    assigneeSelect.innerHTML = '<option value="">Unassigned</option>' +
        employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

    if (taskId) {
        // Edit mode
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            titleEl.textContent = 'Edit Task';
            submitTextEl.textContent = 'Save Changes';

            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskProject').value = task.projectId || '';
            document.getElementById('taskAssignee').value = task.assignedTo || '';
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority || 'medium';
            document.getElementById('taskStatus').value = task.status || 'todo';
            document.getElementById('taskEstimatedHours').value = task.estimatedHours || '';
        }
    } else {
        // Create mode
        titleEl.textContent = 'New Task';
        submitTextEl.textContent = 'Create Task';
        form.reset();
        document.getElementById('taskId').value = '';
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// Close task modal
function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
}

// Save task
function saveTask(e) {
    e.preventDefault();

    const taskId = document.getElementById('taskId').value;
    const isEdit = !!taskId;

    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        projectId: document.getElementById('taskProject').value,
        assignedTo: document.getElementById('taskAssignee').value,
        dueDate: document.getElementById('taskDueDate').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        estimatedHours: document.getElementById('taskEstimatedHours').value
    };

    let tasks = getTasks();

    if (isEdit) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
            saveTasks(tasks);
            addActivity('task', 'Admin', `Updated task: ${taskData.title}`);
            showToast('Task updated successfully!', 'success');
        }
    } else {
        const newTask = {
            id: generateId(),
            ...taskData,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        saveTasks(tasks);
        addActivity('task', 'Admin', `Created task: ${taskData.title}`);
        showToast('Task created successfully!', 'success');
    }

    closeTaskModal();
    renderKanbanBoard(currentTaskProjectFilter);
    updateStats();
}

// Edit task
function editTask(taskId) {
    openTaskModal(taskId);
}

// Delete task
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    let tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
        addActivity('task', 'Admin', `Deleted task: ${task.title}`);
        showToast('Task deleted successfully!', 'success');
        renderKanbanBoard(currentTaskProjectFilter);
        updateStats();
    }
}

// =============================================
// ATTENDANCE MANAGEMENT FUNCTIONS
// =============================================

// Render Attendance Table
function renderAttendanceTable(dateFilter = '', employeeFilter = 'all') {
    const tableBody = document.getElementById('attendanceTableBody');
    const emptyState = document.getElementById('attendanceEmptyState');
    const tableContainer = document.querySelector('#attendanceSection .table-container');

    if (!tableBody) return;

    let attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const employees = getEmployees();

    // Populate employee filter
    const employeeFilterEl = document.getElementById('attendanceEmployeeFilter');
    if (employeeFilterEl && employeeFilterEl.options.length <= 1) {
        employees.forEach(emp => {
            employeeFilterEl.add(new Option(emp.name, emp.id));
        });
    }

    // Set date filter to today if not set
    const dateFilterEl = document.getElementById('attendanceDateFilter');
    if (dateFilterEl && !dateFilterEl.value) {
        dateFilterEl.value = new Date().toISOString().split('T')[0];
        dateFilter = dateFilterEl.value;
    }

    // Apply filters
    if (dateFilter) {
        attendance = attendance.filter(a => {
            const recordDate = new Date(a.timestamp).toISOString().split('T')[0];
            return recordDate === dateFilter;
        });
    }

    if (employeeFilter !== 'all') {
        attendance = attendance.filter(a => a.userId == employeeFilter);
    }

    // Update stats
    updateAttendanceStats(attendance);

    if (attendance.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (tableContainer) tableContainer.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = attendance.map(record => {
        const employee = employees.find(e => e.id == record.userId);
        const checkInTime = new Date(record.timestamp);
        const isLate = checkInTime.getHours() >= 10; // Consider late if after 10 AM

        const location = record.location ?
            `${record.location.city || 'Unknown'}, ${record.location.state || ''}` :
            'Location not available';

        return `
            <tr>
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar small">${employee ? getInitials(employee.name) : '?'}</div>
                        <span>${employee ? employee.name : record.userName || 'Unknown'}</span>
                    </div>
                </td>
                <td>${checkInTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>${checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${location}</td>
                <td>
                    ${record.photo ? `<img src="${record.photo}" class="attendance-photo" onclick="viewAttendancePhoto('${record.photo}')">` : '<span class="text-muted">No photo</span>'}
                </td>
                <td>
                    <span class="status-badge ${isLate ? 'late' : 'on-time'}">${isLate ? 'Late' : 'On Time'}</span>
                </td>
            </tr>
        `;
    }).join('');
}

// Update attendance stats
function updateAttendanceStats(records) {
    const total = records.length;
    const late = records.filter(r => new Date(r.timestamp).getHours() >= 10).length;
    const onTime = total - late;

    const totalEl = document.getElementById('attTotalRecords');
    const presentEl = document.getElementById('attPresentCount');
    const lateEl = document.getElementById('attLateCount');
    const onTimeEl = document.getElementById('attOnTimeCount');

    if (totalEl) totalEl.textContent = total;
    if (presentEl) presentEl.textContent = total;
    if (lateEl) lateEl.textContent = late;
    if (onTimeEl) onTimeEl.textContent = onTime;
}

// Filter attendance
function filterAttendance() {
    const dateFilter = document.getElementById('attendanceDateFilter').value;
    const employeeFilter = document.getElementById('attendanceEmployeeFilter').value;
    renderAttendanceTable(dateFilter, employeeFilter);
}

// View attendance photo
function viewAttendancePhoto(photoSrc) {
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="photo-modal-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="photo-modal-content">
            <img src="${photoSrc}" alt="Attendance Photo">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
}

// Update showSection for attendance, time tracking, settings
const _originalShowSection = showSection;
showSection = function (sectionName) {
    _originalShowSection(sectionName);

    if (sectionName === 'attendance') {
        renderAttendanceTable();
    }

    if (sectionName === 'timeTracking') {
        renderTimeTracking();
    }

    if (sectionName === 'settings') {
        renderSettingsPage();
    }

    if (sectionName === 'add-employee') {
        updateIllustrationStats();
    }
};

function updateIllustrationStats() {
    const teamCountEl = document.getElementById('illustrationTeamCount');
    if (teamCountEl) {
        const employees = getEmployees();
        teamCountEl.textContent = employees.length;
    }
}

// =============================================
// TIME TRACKING FUNCTIONS
// =============================================

function renderTimeTracking() {
    const tableBody = document.getElementById('timeTrackingTableBody');
    const emptyState = document.getElementById('timeTrackingEmptyState');
    const tableContainer = document.querySelector('#timeTrackingSection .table-container');

    if (!tableBody) return;

    const period = document.getElementById('timeTrackingPeriod')?.value || 'week';
    let workUpdates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    const employees = getEmployees();
    const projects = getProjects();

    // Filter by period
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let filterDate;
    switch (period) {
        case 'today': filterDate = startOfDay; break;
        case 'week': filterDate = startOfWeek; break;
        case 'month': filterDate = startOfMonth; break;
        default: filterDate = startOfWeek;
    }

    workUpdates = workUpdates.filter(w => new Date(w.timestamp) >= filterDate);

    // Calculate stats
    const totalHours = workUpdates.length; // Each update ~1 hour
    const uniqueEmployees = [...new Set(workUpdates.map(w => w.userId))].length;
    const days = period === 'today' ? 1 : (period === 'week' ? 7 : 30);
    const avgHours = days > 0 ? Math.round(totalHours / days) : 0;

    // Update stats
    const totalHoursEl = document.getElementById('timeTotalHours');
    const workUpdatesEl = document.getElementById('timeWorkUpdates');
    const employeesActiveEl = document.getElementById('timeEmployeesActive');
    const avgHoursEl = document.getElementById('timeAvgHours');

    if (totalHoursEl) totalHoursEl.textContent = totalHours + 'h';
    if (workUpdatesEl) workUpdatesEl.textContent = workUpdates.length;
    if (employeesActiveEl) employeesActiveEl.textContent = uniqueEmployees;
    if (avgHoursEl) avgHoursEl.textContent = avgHours + 'h';

    if (workUpdates.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (tableContainer) tableContainer.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = workUpdates.map(entry => {
        const employee = employees.find(e => e.id == entry.userId);
        const project = projects.find(p => p.id === entry.projectId);
        const entryDate = new Date(entry.timestamp);

        return `
            <tr>
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar small">${employee ? getInitials(employee.name) : '?'}</div>
                        <span>${employee ? employee.name : entry.userName || 'Unknown'}</span>
                    </div>
                </td>
                <td>${entryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                <td>${project ? project.name : entry.category || 'General'}</td>
                <td>${entry.activity || entry.description || 'Work update'}</td>
                <td><span class="hours-badge">1h</span></td>
            </tr>
        `;
    }).join('');
}

// =============================================
// SETTINGS FUNCTIONS
// =============================================

function renderSettingsPage() {
    renderSettingsRoles();
    lucide.createIcons();
}

function renderSettingsRoles() {
    const container = document.getElementById('settingsRolesList');
    if (!container) return;

    const roles = getCompanyRoles();

    container.innerHTML = roles.map(role => `
        <div class="role-item">
            <div class="role-icon">
                <i data-lucide="${role.icon}"></i>
            </div>
            <span class="role-name">${role.name}</span>
        </div>
    `).join('');

    lucide.createIcons();
}

function exportAllData() {
    const data = {
        employees: getEmployees(),
        projects: getProjects(),
        tasks: getTasks(),
        attendance: JSON.parse(localStorage.getItem('gf_attendance') || '[]'),
        workUpdates: JSON.parse(localStorage.getItem('gf_work_updates') || '[]'),
        activityLog: getActivityLog(),
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grofast-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Data exported successfully!', 'success');
}

function clearAllData() {
    if (!confirm('⚠️ WARNING: This will delete ALL data including employees, projects, tasks, and attendance records. This action cannot be undone!\n\nAre you sure you want to continue?')) {
        return;
    }

    if (!confirm('This is your LAST CHANCE. All data will be permanently deleted. Continue?')) {
        return;
    }

    // Clear all localStorage
    localStorage.removeItem('employees');
    localStorage.removeItem('gf_projects');
    localStorage.removeItem('gf_tasks');
    localStorage.removeItem('gf_attendance');
    localStorage.removeItem('gf_work_updates');
    localStorage.removeItem('activityLog');

    showToast('All data has been cleared', 'success');

    // Refresh the page
    setTimeout(() => location.reload(), 1000);
}

// =============================================
// ONBOARDING NOTIFICATIONS
// =============================================

/**
 * Sends welcome notifications to a new team member
 * @param {Object} employee The member data
 */
function notifyNewMember(employee) {
    const companyName = APP_CONFIG.name || 'Grofast Digital';
    const loginUrl = window.location.origin + '/employee/login.html';

    // 1. Prepare Message Content
    const welcomeSubject = `Welcome to the ${companyName} Team!`;
    const welcomeBody = `Hi ${employee.name},\n\n` +
        `Welcome to the team! Your portal account has been created.\n\n` +
        `Portal Login: ${loginUrl}\n` +
        `Email: ${employee.email}\n` +
        `Temporary Password: ${employee.password}\n\n` +
        `Please log in and update your profile.\n\n` +
        `Best regards,\n${companyName} Admin`;

    // 2. Trigger Email (opens mail client)
    const mailtoLink = `mailto:${employee.email}?subject=${encodeURIComponent(welcomeSubject)}&body=${encodeURIComponent(welcomeBody)}`;

    // 3. Trigger WhatsApp (if phone exists)
    let whatsappLink = null;
    if (employee.phone) {
        // Clean phone number (remove non-digits)
        const cleanPhone = employee.phone.replace(/\D/g, '');
        // Ensure it has country code (default to 91 if 10 digits)
        const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;

        const waText = `*Welcome to ${companyName}!* 🚀\n\n` +
            `Hi ${employee.name}, your account is ready.\n\n` +
            `*Login:* ${loginUrl}\n` +
            `*User:* ${employee.email}\n` +
            `*Pass:* ${employee.password}\n\n` +
            `See you on the dashboard!`;

        whatsappLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`;
    }

    // 4. Hit Webhook for Automation (n8n)
    if (N8N_WEBHOOKS.onboarding && N8N_WEBHOOKS.onboarding !== 'YOUR_N8N_ONBOARDING_WEBHOOK_URL') {
        fetch(N8N_WEBHOOKS.onboarding, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'team_member_created',
                employee: employee,
                timestamp: new Date().toISOString()
            })
        }).catch(err => console.error('Onboarding webhook failed:', err));
    }

    // 5. Show a choice to the admin
    showOnboardingOptions(mailtoLink, whatsappLink);
}

/**
 * Shows an Overlay/Modal with quick action buttons to send messages
 */
function showOnboardingOptions(emailLink, waLink) {
    // Check if modal already exists, else create
    let modal = document.getElementById('onboardingNotifyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'onboardingNotifyModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.classList.add('hidden')"></div>
            <div class="modal-content glass-card" style="max-width: 400px; text-align: center;">
                <div class="success-icon" style="color: var(--accent-green); font-size: 3rem; margin-bottom: var(--space-4);">
                    <i data-lucide="party-popper"></i>
                </div>
                <h2 style="margin-bottom: var(--space-2);">Notifications Sent!</h2>
                <p class="text-secondary" style="margin-bottom: var(--space-6);">Choose a quick action to share credentials with the new member.</p>
                <div class="btn-group-vertical" style="gap: var(--space-3);">
                    <a id="onboardMailBtn" href="#" class="btn btn-primary" target="_blank">
                        <i data-lucide="mail"></i> Send Welcome Email
                    </a>
                    ${waLink ? `<a id="onboardWABtn" href="#" class="btn btn-success" target="_blank" style="background: #25D366; border-color: #25D366; color: white;">
                        <i data-lucide="message-circle"></i> Send WhatsApp
                    </a>` : ''}
                    <button class="btn btn-secondary" onclick="document.getElementById('onboardingNotifyModal').classList.add('hidden')">
                        Done
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update links
    document.getElementById('onboardMailBtn').href = emailLink;
    const waBtn = document.getElementById('onboardWABtn');
    if (waBtn && waLink) waBtn.href = waLink;

    modal.classList.remove('hidden');
    lucide.createIcons();
}
