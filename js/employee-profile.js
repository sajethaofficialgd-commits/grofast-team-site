// =============================================
// EMPLOYEE PROFILE - MAIN SCRIPT
// =============================================

let currentEmployee = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    // Check if employee is logged in
    if (!sessionStorage.getItem('employeeLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Get employee data
    const employeeId = parseInt(sessionStorage.getItem('employeeId'));
    const employees = getEmployees();
    currentEmployee = employees.find(emp => emp.id === employeeId);

    if (!currentEmployee) {
        logout();
        return;
    }

    // Initialize profile
    renderProfile();
    renderActivityLog();
    setupFormHandlers();
});

// Render profile data
function renderProfile() {
    // Avatar
    document.getElementById('profileAvatar').textContent = getInitials(currentEmployee.name);

    // Basic Info
    document.getElementById('profileName').textContent = currentEmployee.name;
    document.getElementById('profileRole').textContent = `${currentEmployee.role} • ${currentEmployee.department}`;

    // Badge
    const badge = document.getElementById('profileBadge');
    if (currentEmployee.status === 'active') {
        badge.innerHTML = '<i data-lucide="check-circle"></i> Active';
        badge.classList.remove('inactive');
    } else {
        badge.innerHTML = '<i data-lucide="x-circle"></i> Inactive';
        badge.classList.add('inactive');
    }

    // Stats
    document.getElementById('joinDate').textContent = new Date(currentEmployee.joinDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    document.getElementById('department').textContent = currentEmployee.department;
    document.getElementById('lastLogin').textContent = currentEmployee.lastLogin ? timeAgo(currentEmployee.lastLogin) : 'Now';

    // Form fields
    document.getElementById('editName').value = currentEmployee.name;
    document.getElementById('editRole').value = currentEmployee.role;
    document.getElementById('editEmail').value = currentEmployee.email;
    document.getElementById('editPhone').value = currentEmployee.phone;

    lucide.createIcons();
}

// Render activity log
function renderActivityLog() {
    const container = document.getElementById('activityList');
    const allActivities = getActivityLog();

    // Filter activities for this employee
    const myActivities = allActivities.filter(activity =>
        activity.employee === currentEmployee.name
    ).slice(0, 10);

    if (myActivities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="inbox"></i>
                <p>No recent activity</p>
            </div>
        `;
    } else {
        container.innerHTML = myActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i data-lucide="${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.description}</p>
                    <span class="activity-time">${timeAgo(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    lucide.createIcons();
}

// Get activity icon
function getActivityIcon(type) {
    switch (type) {
        case 'login': return 'log-in';
        case 'profile': return 'user';
        case 'update': return 'edit';
        default: return 'activity';
    }
}

// Toggle edit mode
function toggleEdit(section) {
    const actionsId = section + 'Actions';
    const actions = document.getElementById(actionsId);

    if (section === 'personal') {
        const nameInput = document.getElementById('editName');
        const roleInput = document.getElementById('editRole');

        if (nameInput.disabled) {
            nameInput.disabled = false;
            roleInput.disabled = false;
            actions.classList.remove('hidden');
            nameInput.focus();
        }
    } else if (section === 'contact') {
        const emailInput = document.getElementById('editEmail');
        const phoneInput = document.getElementById('editPhone');

        if (emailInput.disabled) {
            emailInput.disabled = false;
            phoneInput.disabled = false;
            actions.classList.remove('hidden');
            emailInput.focus();
        }
    }
}

// Cancel edit
function cancelEdit(section) {
    const actionsId = section + 'Actions';
    const actions = document.getElementById(actionsId);

    if (section === 'personal') {
        document.getElementById('editName').value = currentEmployee.name;
        document.getElementById('editRole').value = currentEmployee.role;
        document.getElementById('editName').disabled = true;
        document.getElementById('editRole').disabled = true;
    } else if (section === 'contact') {
        document.getElementById('editEmail').value = currentEmployee.email;
        document.getElementById('editPhone').value = currentEmployee.phone;
        document.getElementById('editEmail').disabled = true;
        document.getElementById('editPhone').disabled = true;
    }

    actions.classList.add('hidden');
}

// Setup form handlers
function setupFormHandlers() {
    // Personal form
    document.getElementById('personalForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const newName = document.getElementById('editName').value;
        const newRole = document.getElementById('editRole').value;

        // Update employee
        currentEmployee.name = newName;
        currentEmployee.role = newRole;

        saveEmployeeChanges('Updated personal information');

        document.getElementById('editName').disabled = true;
        document.getElementById('editRole').disabled = true;
        document.getElementById('personalActions').classList.add('hidden');
    });

    // Contact form
    document.getElementById('contactForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const newEmail = document.getElementById('editEmail').value;
        const newPhone = document.getElementById('editPhone').value;

        // Update employee
        currentEmployee.email = newEmail;
        currentEmployee.phone = newPhone;

        saveEmployeeChanges('Updated contact information');

        document.getElementById('editEmail').disabled = true;
        document.getElementById('editPhone').disabled = true;
        document.getElementById('contactActions').classList.add('hidden');
    });

    // Security form
    document.getElementById('securityForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;

        if (!currentPass || !newPass) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        if (currentPass !== currentEmployee.password) {
            showToast('Current password is incorrect', 'error');
            return;
        }

        if (newPass.length < 6) {
            showToast('New password must be at least 6 characters', 'warning');
            return;
        }

        // Update password
        currentEmployee.password = newPass;
        saveEmployeeChanges('Changed password');

        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';

        showToast('Password updated successfully!', 'success');
    });
}

// Save employee changes
function saveEmployeeChanges(activityDescription) {
    const employees = getEmployees();
    const index = employees.findIndex(e => e.id === currentEmployee.id);

    if (index !== -1) {
        employees[index] = currentEmployee;
        saveEmployees(employees);

        // Add activity
        addActivity('profile', currentEmployee.name, activityDescription);

        // Update UI
        renderProfile();
        renderActivityLog();

        showToast('Changes saved successfully!', 'success');
    }
}

// Logout
function logout() {
    sessionStorage.removeItem('employeeLoggedIn');
    sessionStorage.removeItem('employeeId');
    sessionStorage.removeItem('employeeName');
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
