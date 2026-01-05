// =============================================
// TEAM MANAGEMENT - DATA STORE
// Grofast Digital Team
// =============================================

// Company Roles - Employees can have multiple roles
const COMPANY_ROLES = [
    { id: 'video-editor', name: 'Video editor', icon: 'video' },
    { id: 'meta-ads', name: 'Meta ads', icon: 'target' },
    { id: 'script-writer', name: 'Script Writer', icon: 'file-text' },
    { id: 'ai-automation', name: 'Ai Automation', icon: 'brain' },
    { id: 'creative-design', name: 'Creative (Landing page, poster design)', icon: 'palette' },
    { id: 'cameraman', name: 'cameraman', icon: 'camera' },
    { id: 'client-executive', name: 'Client Executive', icon: 'user-check' },
    { id: 'software-management', name: 'Software Management', icon: 'code-2' }
];

// Get all company roles
function getCompanyRoles() {
    return COMPANY_ROLES;
}

// Employee Data - Add employees via Admin Panel
const employeesData = [];

// Helper function to get role names from role IDs
function getRoleNames(roleIds) {
    if (!roleIds || !Array.isArray(roleIds)) {
        // Handle legacy single role format
        return roleIds ? [roleIds] : [];
    }
    return roleIds.map(id => {
        const role = COMPANY_ROLES.find(r => r.id === id);
        return role ? role.name : id;
    });
}

// Helper function to format roles for display
function formatRolesDisplay(roleIds) {
    const names = getRoleNames(roleIds);
    if (names.length === 0) return 'No roles assigned';
    if (names.length === 1) return names[0];
    if (names.length === 2) return names.join(' & ');
    return names.slice(0, 2).join(', ') + ` +${names.length - 2} more`;
}

// Activity Log Data - Automatically populated
const activityLog = [];

// Get Employees from localStorage or use default
function getEmployees() {
    const stored = localStorage.getItem('employees');
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem('employees', JSON.stringify(employeesData));
    return employeesData;
}

// Save Employees to localStorage
function saveEmployees(employees) {
    localStorage.setItem('employees', JSON.stringify(employees));
}

// Get Activity Log from localStorage or use default
function getActivityLog() {
    const stored = localStorage.getItem('activityLog');
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    return activityLog;
}

// Save Activity Log to localStorage
function saveActivityLog(log) {
    localStorage.setItem('activityLog', JSON.stringify(log));
}

// Add new activity
function addActivity(type, employee, description) {
    const log = getActivityLog();
    const newActivity = {
        id: log.length + 1,
        type: type,
        employee: employee,
        description: description,
        timestamp: new Date().toISOString()
    };
    log.unshift(newActivity);
    saveActivityLog(log);
    return newActivity;
}

// Get unique departments
function getDepartments() {
    const employees = getEmployees();
    return [...new Set(employees.map(emp => emp.department))];
}

// Format time ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return date.toLocaleDateString();
}

// Get initials from name
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Generate random ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// =============================================
// PROJECTS DATA
// =============================================

const projectsData = [];

// Get Projects from localStorage
function getProjects() {
    const stored = localStorage.getItem('gf_projects');
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem('gf_projects', JSON.stringify(projectsData));
    return projectsData;
}

// Save Projects to localStorage
function saveProjects(projects) {
    localStorage.setItem('gf_projects', JSON.stringify(projects));
}

// Add new project
function addProject(project) {
    const projects = getProjects();
    const newProject = {
        id: generateId(),
        ...project,
        createdAt: new Date().toISOString(),
        status: project.status || 'active'
    };
    projects.push(newProject);
    saveProjects(projects);
    addActivity('project', 'Admin', `Created new project: ${project.name}`);
    return newProject;
}

// Get active projects count
function getActiveProjectsCount() {
    const projects = getProjects();
    return projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
}

// =============================================
// TASKS DATA
// =============================================

const tasksData = [];

// Task statuses
const TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    OVERDUE: 'overdue'
};

// Get Tasks from localStorage
function getTasks() {
    const stored = localStorage.getItem('gf_tasks');
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem('gf_tasks', JSON.stringify(tasksData));
    return tasksData;
}

// Save Tasks to localStorage
function saveTasks(tasks) {
    localStorage.setItem('gf_tasks', JSON.stringify(tasks));
}

// Add new task
function addTask(task) {
    const tasks = getTasks();
    const newTask = {
        id: generateId(),
        ...task,
        createdAt: new Date().toISOString(),
        status: task.status || TASK_STATUS.TODO
    };
    tasks.push(newTask);
    saveTasks(tasks);
    addActivity('task', 'Admin', `Created new task: ${task.title}`);
    return newTask;
}

// Get tasks completed today
function getTasksCompletedToday() {
    const tasks = getTasks();
    const today = new Date().toDateString();
    return tasks.filter(t => {
        if (t.status !== TASK_STATUS.COMPLETED || !t.completedAt) return false;
        return new Date(t.completedAt).toDateString() === today;
    }).length;
}

// Get pending tasks count
function getPendingTasksCount() {
    const tasks = getTasks();
    return tasks.filter(t => t.status === TASK_STATUS.TODO || t.status === TASK_STATUS.IN_PROGRESS).length;
}

// Get overdue tasks count
function getOverdueTasksCount() {
    const tasks = getTasks();
    const now = new Date();
    return tasks.filter(t => {
        if (t.status === TASK_STATUS.COMPLETED) return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < now;
    }).length;
}

// Get total tasks count
function getTotalTasksCount() {
    return getTasks().length;
}

// =============================================
// ATTENDANCE HELPERS
// =============================================

// Get today's attendance stats
function getTodayAttendanceStats() {
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const employees = getEmployees();
    const today = new Date().toDateString();

    const todayAttendance = attendance.filter(a =>
        new Date(a.timestamp).toDateString() === today
    );

    // Get unique employee IDs who marked attendance today
    const presentEmployeeIds = [...new Set(todayAttendance.map(a => a.userId))];

    const present = presentEmployeeIds.length;
    const total = employees.length;
    const absent = total - present;

    // For now, late and WFH are set to 0 (can be enhanced later)
    const late = 0;
    const wfh = 0;

    return {
        present,
        absent,
        late,
        wfh,
        total
    };
}

// Get total hours worked today (from work updates)
function getTotalHoursToday() {
    const workUpdates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    const today = new Date().toDateString();

    const todayUpdates = workUpdates.filter(w =>
        new Date(w.timestamp).toDateString() === today
    );

    // Estimate hours based on work updates (each update = ~1 hour of work)
    return todayUpdates.length;
}

