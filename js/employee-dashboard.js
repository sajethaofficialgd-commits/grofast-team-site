// =============================================
// EMPLOYEE DASHBOARD - MAIN SCRIPT
// =============================================

let currentEmployee = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedChatRecipient = null;

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

    // Initialize dashboard
    initDashboard();
});

// Initialize dashboard
function initDashboard() {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', options);

    // Update sidebar user info
    document.getElementById('sidebarAvatar').textContent = getInitials(currentEmployee.name);
    document.getElementById('sidebarName').textContent = currentEmployee.name;
    document.getElementById('sidebarRole').textContent = currentEmployee.role;

    // Setup navigation
    setupNavigation();

    // Initialize all sections
    initDashboardSection();
    initProfileSection();
    initAttendanceSection();
    initWorkSection();
    initLearningSection();
    initCalendarSection();
    initChatSection();

    // Setup form handlers
    setupFormHandlers();

    lucide.createIcons();
}

// =============================================
// NAVIGATION
// =============================================

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
}

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const sectionId = sectionName + 'Section';
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Update page title
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Welcome back!' },
        profile: { title: 'My Profile', subtitle: 'Manage your personal information' },
        attendance: { title: 'Attendance', subtitle: 'Track your attendance' },
        work: { title: 'Work Updates', subtitle: 'Log your daily work' },
        learning: { title: 'Learning', subtitle: 'Continue your growth' },
        calendar: { title: 'Calendar', subtitle: 'View your schedule' },
        chat: { title: 'Team Chat', subtitle: 'Stay connected with your team' }
    };

    if (titles[sectionName]) {
        document.getElementById('pageTitle').textContent = titles[sectionName].title;
        document.getElementById('pageSubtitle').textContent = titles[sectionName].subtitle;
    }

    // Update nav item
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.dataset.section === sectionName) {
            nav.classList.add('active');
        }
    });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// =============================================
// DASHBOARD SECTION
// =============================================

function initDashboardSection() {
    const attendance = getEmployeeAttendance();
    const work = getEmployeeWork();
    const courses = getEmployeeCourses();
    const messages = getUnreadMessages();

    // Update stats
    document.getElementById('attendanceCount').textContent = attendance.length;
    document.getElementById('tasksCompleted').textContent = work.filter(w => w.status === 'completed').length;
    document.getElementById('coursesProgress').textContent = calculateLearningProgress() + '%';
    document.getElementById('unreadMessages').textContent = messages;
    document.getElementById('chatBadge').textContent = messages;

    if (messages > 0) {
        document.getElementById('notificationDot').classList.add('active');
    }

    // Render today's schedule
    renderTodaySchedule();

    // Render recent work
    renderRecentWork();

    // Render team activity
    renderTeamActivity();
}

function renderTodaySchedule() {
    const container = document.getElementById('todaySchedule');
    const events = getEmployeeEvents().filter(e => {
        const eventDate = new Date(e.date);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    });

    if (events.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm">No events scheduled for today</p>';
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="schedule-item">
            <span class="schedule-time">${event.time || '00:00'}</span>
            <span class="schedule-title">${event.title}</span>
        </div>
    `).join('');
}

function renderRecentWork() {
    const container = document.getElementById('recentWork');
    const work = getEmployeeWork().slice(0, 3);

    if (work.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm">No work updates yet</p>';
        return;
    }

    container.innerHTML = work.map(w => `
        <div class="work-item-preview">
            <div class="work-icon">
                <i data-lucide="briefcase"></i>
            </div>
            <div class="work-details">
                <h4>${w.title}</h4>
                <p>${timeAgo(w.createdAt)}</p>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function renderTeamActivity() {
    const container = document.getElementById('teamActivity');
    const activities = getActivityLog().slice(0, 4);

    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-avatar">${getInitials(activity.employee)}</div>
            <div class="activity-content">
                <p class="activity-text">${activity.employee} ${activity.description}</p>
                <span class="activity-time">${timeAgo(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

// =============================================
// PROFILE SECTION
// =============================================

function initProfileSection() {
    document.getElementById('profileAvatar').textContent = getInitials(currentEmployee.name);
    document.getElementById('profileName').textContent = currentEmployee.name;
    document.getElementById('profileRole').textContent = `${currentEmployee.role} • ${currentEmployee.department}`;

    document.getElementById('joinDate').textContent = new Date(currentEmployee.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    document.getElementById('department').textContent = currentEmployee.department;
    document.getElementById('lastActive').textContent = 'Now';

    // Form fields
    document.getElementById('editName').value = currentEmployee.name;
    document.getElementById('editRole').value = currentEmployee.role;
    document.getElementById('editEmail').value = currentEmployee.email;
    document.getElementById('editPhone').value = currentEmployee.phone;
}

// =============================================
// ATTENDANCE SECTION
// =============================================

let cameraStream = null;
let capturedPhotoData = null;

// Attendance timing configuration
const ATTENDANCE_CONFIG = {
    checkInStart: 6,        // 6:00 AM - Check-in opens
    checkInOnTime: 10,      // Before 10:00 AM - On-time
    checkInLate: 10.5,      // 10:00 AM - 10:30 AM - Late window
    checkInEnd: 10.5,       // 10:30 AM - Check-in closes
    fullDayHours: 8,        // 8 hours for full day
    halfDayHours: 4         // 4 hours for half day
};

function initAttendanceSection() {
    checkTodayAttendance();
    renderAttendanceHistory();
    updateAttendanceStats();
    updateAttendanceTimer();

    // Update timer every minute
    setInterval(updateAttendanceTimer, 60000);
}

function checkTodayAttendance() {
    const attendance = getEmployeeAttendance();
    const today = new Date().toDateString();
    const todayRecord = attendance.find(a => new Date(a.date).toDateString() === today);

    const statusIcon = document.querySelector('.status-icon');
    const statusText = document.getElementById('attendanceStatusText');
    const markBtn = document.getElementById('markAttendanceBtn');
    const confirmBtn = document.getElementById('confirmAttendanceBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cameraSection = document.getElementById('cameraSection');
    const infoDiv = document.getElementById('attendanceInfo');
    const timerDiv = document.getElementById('workTimer');

    const now = new Date();
    const currentHour = now.getHours();

    // Check if within check-in window
    const canCheckIn = currentHour >= ATTENDANCE_CONFIG.checkInStart && currentHour < ATTENDANCE_CONFIG.checkInEnd;

    if (todayRecord) {
        // Already checked in
        statusIcon.className = 'status-icon marked';
        statusIcon.innerHTML = '<i data-lucide="check-circle"></i>';
        markBtn.style.display = 'none';
        confirmBtn.style.display = 'none';
        cameraSection.classList.remove('active');
        infoDiv.style.display = 'block';

        document.getElementById('checkInTime').textContent = todayRecord.checkInTime || todayRecord.time;
        document.getElementById('checkInLocation').textContent = todayRecord.location || 'Office';

        // Show attendance photo if available
        if (todayRecord.photo) {
            document.getElementById('attendancePhoto').src = todayRecord.photo;
            document.getElementById('attendancePhotoPreview').style.display = 'block';
        }

        // Check if already checked out
        if (todayRecord.checkOutTime) {
            statusText.textContent = `Checked out at ${todayRecord.checkOutTime}`;
            checkoutBtn.style.display = 'none';
            timerDiv.style.display = 'none';

            // Show total hours
            document.getElementById('totalHours').textContent = todayRecord.totalHours || '-';
            document.getElementById('totalHoursDiv').style.display = 'flex';
        } else {
            statusText.textContent = 'Checked in! Working...';
            checkoutBtn.style.display = 'inline-flex';
            timerDiv.style.display = 'block';
        }

        lucide.createIcons();
    } else {
        // Not checked in yet
        const currentTime = currentHour + (now.getMinutes() / 60); // e.g., 10:30 = 10.5

        if (currentTime >= ATTENDANCE_CONFIG.checkInStart && currentTime < ATTENDANCE_CONFIG.checkInOnTime) {
            // On-time window: 6 AM - 10 AM
            statusIcon.className = 'status-icon pending';
            statusIcon.innerHTML = '<i data-lucide="clock"></i>';
            statusText.textContent = 'Check-in available (On-time)';
            markBtn.style.display = 'inline-flex';
            markBtn.disabled = false;
            markBtn.innerHTML = '<i data-lucide="camera"></i> Check-In with Photo';
        } else if (currentTime >= ATTENDANCE_CONFIG.checkInOnTime && currentTime < ATTENDANCE_CONFIG.checkInLate) {
            // Late window: 10:00 AM - 10:30 AM
            statusIcon.className = 'status-icon late';
            statusIcon.innerHTML = '<i data-lucide="alert-triangle"></i>';
            statusText.textContent = 'Late check-in (10:00 - 10:30 AM)';
            markBtn.style.display = 'inline-flex';
            markBtn.disabled = false;
            markBtn.innerHTML = '<i data-lucide="camera"></i> Check-In (Late)';
        } else if (currentHour < ATTENDANCE_CONFIG.checkInStart) {
            // Too early
            statusIcon.className = 'status-icon pending';
            statusIcon.innerHTML = '<i data-lucide="clock"></i>';
            statusText.textContent = `Check-in opens at ${ATTENDANCE_CONFIG.checkInStart}:00 AM`;
            markBtn.style.display = 'inline-flex';
            markBtn.disabled = true;
            markBtn.innerHTML = '<i data-lucide="lock"></i> Too Early';
        } else {
            // Closed: After 10:30 AM
            statusIcon.className = 'status-icon late';
            statusIcon.innerHTML = '<i data-lucide="x-circle"></i>';
            statusText.textContent = 'Check-in closed (after 10:30 AM)';
            markBtn.style.display = 'none';
        }

        checkoutBtn.style.display = 'none';
        timerDiv.style.display = 'none';
        infoDiv.style.display = 'none';
        lucide.createIcons();
    }
}

// Update work timer
function updateAttendanceTimer() {
    const attendance = getEmployeeAttendance();
    const today = new Date().toDateString();
    const todayRecord = attendance.find(a => new Date(a.date).toDateString() === today);

    if (!todayRecord || todayRecord.checkOutTime) return;

    const checkInTime = new Date(todayRecord.date);
    const now = new Date();
    const diffMs = now - checkInTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = `${diffHours}h ${diffMins}m`;

        // Update timer color based on progress
        const progress = diffHours / ATTENDANCE_CONFIG.fullDayHours;
        if (progress >= 1) {
            timerDisplay.className = 'timer-display full-day';
        } else if (progress >= 0.5) {
            timerDisplay.className = 'timer-display half-day';
        } else {
            timerDisplay.className = 'timer-display in-progress';
        }
    }

    // Update progress bar
    const progressBar = document.getElementById('workProgress');
    if (progressBar) {
        const percentage = Math.min((diffHours / ATTENDANCE_CONFIG.fullDayHours) * 100, 100);
        progressBar.style.width = percentage + '%';
    }

    // Calculate expected checkout time
    const expectedCheckout = new Date(checkInTime.getTime() + (ATTENDANCE_CONFIG.fullDayHours * 60 * 60 * 1000));
    const expectedCheckoutDisplay = document.getElementById('expectedCheckout');
    if (expectedCheckoutDisplay) {
        expectedCheckoutDisplay.textContent = expectedCheckout.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
}

// Open camera for attendance
async function openCamera() {
    // Check if within check-in window
    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = currentHour + (now.getMinutes() / 60); // e.g., 10:30 = 10.5

    if (currentHour < ATTENDANCE_CONFIG.checkInStart) {
        showToast(`Check-in opens at ${ATTENDANCE_CONFIG.checkInStart}:00 AM`, 'warning');
        return;
    }

    if (currentTime >= ATTENDANCE_CONFIG.checkInEnd) {
        showToast('Check-in closed. Check-in is available from 6 AM to 10:30 AM.', 'error');
        return;
    }

    const cameraSection = document.getElementById('cameraSection');
    const video = document.getElementById('cameraVideo');
    const markBtn = document.getElementById('markAttendanceBtn');

    try {
        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // Front camera for selfie
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        video.srcObject = cameraStream;
        cameraSection.classList.add('active');
        markBtn.style.display = 'none';

        showToast('Camera ready! Position your face in the frame.', 'info');
        lucide.createIcons();

    } catch (error) {
        console.error('Camera error:', error);
        showToast('Could not access camera. Please allow camera permission.', 'error');

        // Fallback - mark without photo
        if (confirm('Camera not available. Mark attendance without photo?')) {
            markAttendanceWithoutPhoto();
        }
    }
}

// Capture photo from camera
function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const capturedPhoto = document.getElementById('capturedPhoto');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const confirmBtn = document.getElementById('confirmAttendanceBtn');
    const cameraContainer = document.getElementById('cameraContainer');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas (mirrored)
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    // Convert to data URL
    capturedPhotoData = canvas.toDataURL('image/jpeg', 0.8);

    // Show captured photo
    capturedPhoto.src = capturedPhotoData;
    capturedPhoto.style.display = 'block';
    cameraContainer.style.display = 'none';

    // Update buttons
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-flex';
    confirmBtn.style.display = 'inline-flex';

    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }

    showToast('Photo captured! Click Confirm to mark attendance.', 'success');
    lucide.createIcons();
}

// Retake photo
function retakePhoto() {
    const capturedPhoto = document.getElementById('capturedPhoto');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const confirmBtn = document.getElementById('confirmAttendanceBtn');
    const cameraContainer = document.getElementById('cameraContainer');

    capturedPhotoData = null;
    capturedPhoto.style.display = 'none';
    cameraContainer.style.display = 'block';
    captureBtn.style.display = 'inline-flex';
    retakeBtn.style.display = 'none';
    confirmBtn.style.display = 'none';

    // Restart camera
    openCamera();
    lucide.createIcons();
}

// Confirm attendance with photo (Check-In)
function confirmAttendance() {
    if (!capturedPhotoData) {
        showToast('Please capture a photo first.', 'warning');
        return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = currentHour + (now.getMinutes() / 60); // e.g., 10:30 = 10.5
    const attendance = getEmployeeAttendance();

    // Determine status: before 10 AM = present, 10:00-10:30 = late
    let status = 'present';
    if (currentTime >= ATTENDANCE_CONFIG.checkInOnTime) {
        status = 'late';
    }

    // Get location
    let location = 'Office';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                location = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
            },
            () => {
                location = 'Office';
            }
        );
    }

    const newRecord = {
        id: Date.now(),
        employeeId: currentEmployee.id,
        date: now.toISOString(),
        checkInTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), // Legacy
        checkOutTime: null,
        totalHours: null,
        status: status,
        location: location,
        photo: capturedPhotoData
    };

    attendance.unshift(newRecord);
    saveEmployeeAttendance(attendance);

    addActivity('login', currentEmployee.name, `Checked in at ${newRecord.checkInTime}`);

    // Reset camera section
    document.getElementById('cameraSection').classList.remove('active');
    capturedPhotoData = null;

    checkTodayAttendance();
    renderAttendanceHistory();
    updateAttendanceStats();
    initDashboardSection();

    showToast(`Checked in at ${newRecord.checkInTime}! Work 8 hours for full day.`, 'success');
    lucide.createIcons();
}

// Checkout function
function checkOut() {
    const attendance = getEmployeeAttendance();
    const today = new Date().toDateString();
    const todayIndex = attendance.findIndex(a => new Date(a.date).toDateString() === today);

    if (todayIndex === -1) {
        showToast('No check-in record found for today.', 'error');
        return;
    }

    const todayRecord = attendance[todayIndex];
    const now = new Date();
    const checkInTime = new Date(todayRecord.date);

    // Calculate hours worked
    const diffMs = now - checkInTime;
    const totalHours = (diffMs / (1000 * 60 * 60)).toFixed(1);

    // Determine final status based on hours worked
    let finalStatus = 'present';
    if (parseFloat(totalHours) >= ATTENDANCE_CONFIG.fullDayHours) {
        finalStatus = 'full-day';
    } else if (parseFloat(totalHours) >= ATTENDANCE_CONFIG.halfDayHours) {
        finalStatus = 'half-day';
    } else {
        finalStatus = 'partial';
    }

    // Update record with check-out info
    attendance[todayIndex] = {
        ...todayRecord,
        checkOutTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        totalHours: totalHours + ' hrs',
        status: finalStatus
    };

    saveEmployeeAttendance(attendance);

    addActivity('update', currentEmployee.name, `Checked out after ${totalHours} hours`);

    checkTodayAttendance();
    renderAttendanceHistory();
    updateAttendanceStats();

    if (parseFloat(totalHours) >= ATTENDANCE_CONFIG.fullDayHours) {
        showToast(`Full day completed! Total: ${totalHours} hours 🎉`, 'success');
    } else if (parseFloat(totalHours) >= ATTENDANCE_CONFIG.halfDayHours) {
        showToast(`Half day logged. Total: ${totalHours} hours`, 'info');
    } else {
        showToast(`Checked out early. Total: ${totalHours} hours`, 'warning');
    }
}

// Fallback: Mark attendance without photo
function markAttendanceWithoutPhoto() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = currentHour + (now.getMinutes() / 60);

    // Check timing
    if (currentHour < ATTENDANCE_CONFIG.checkInStart || currentTime >= ATTENDANCE_CONFIG.checkInEnd) {
        showToast('Check-in is only available from 6 AM to 10:30 AM.', 'error');
        return;
    }

    const attendance = getEmployeeAttendance();

    // Before 10 AM = present, 10:00-10:30 = late
    let status = 'present';
    if (currentTime >= ATTENDANCE_CONFIG.checkInOnTime) {
        status = 'late';
    }

    const newRecord = {
        id: Date.now(),
        employeeId: currentEmployee.id,
        date: now.toISOString(),
        checkInTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        checkOutTime: null,
        totalHours: null,
        status: status,
        location: 'Office',
        photo: null
    };

    attendance.unshift(newRecord);
    saveEmployeeAttendance(attendance);

    addActivity('login', currentEmployee.name, status === 'late' ? 'Checked in (Late)' : 'Checked in');

    checkTodayAttendance();
    renderAttendanceHistory();
    updateAttendanceStats();
    initDashboardSection();

    showToast(status === 'late' ? 'Checked in (Late)!' : 'Checked in successfully!', status === 'late' ? 'warning' : 'success');
}

// Legacy function for quick action button
function markAttendance() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = currentHour + (now.getMinutes() / 60);

    if (currentHour < ATTENDANCE_CONFIG.checkInStart) {
        showToast(`Check-in opens at ${ATTENDANCE_CONFIG.checkInStart}:00 AM`, 'warning');
        return;
    }

    if (currentTime >= ATTENDANCE_CONFIG.checkInEnd) {
        showToast('Check-in closed (after 10:30 AM)', 'error');
        return;
    }

    showSection('attendance');
    setTimeout(() => {
        openCamera();
    }, 300);
}

function renderAttendanceHistory(filter = 'all') {
    const container = document.getElementById('attendanceList');
    let attendance = getEmployeeAttendance();

    if (filter !== 'all') {
        attendance = attendance.filter(a => new Date(a.date).getMonth() === parseInt(filter));
    }

    if (attendance.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm text-center p-4">No attendance records</p>';
        return;
    }

    container.innerHTML = attendance.slice(0, 20).map(record => {
        const statusClass = record.status === 'full-day' ? 'present' :
            record.status === 'half-day' ? 'late' :
                record.status === 'partial' ? 'absent' :
                    record.status;
        const statusText = record.status === 'full-day' ? 'Full Day' :
            record.status === 'half-day' ? 'Half Day' :
                record.status === 'partial' ? 'Partial' :
                    record.status.charAt(0).toUpperCase() + record.status.slice(1);

        return `
        <div class="attendance-record">
            <div class="record-info">
                ${record.photo ? `<img src="${record.photo}" alt="Attendance" class="record-photo">` : ''}
                <div class="record-details">
                    <span class="record-date">${new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span class="record-time">
                        In: ${record.checkInTime || record.time}
                        ${record.checkOutTime ? ` | Out: ${record.checkOutTime}` : ''}
                    </span>
                    ${record.totalHours ? `<span class="record-hours">${record.totalHours}</span>` : ''}
                </div>
            </div>
            <span class="record-status ${statusClass}">${statusText}</span>
        </div>
    `}).join('');
}

function filterAttendance() {
    const month = document.getElementById('attendanceMonth').value;
    renderAttendanceHistory(month);
}

function updateAttendanceStats() {
    const attendance = getEmployeeAttendance();
    const thisMonth = attendance.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
    });

    // Count different status types
    const fullDays = thisMonth.filter(a => a.status === 'full-day' || a.status === 'present').length;
    const halfDays = thisMonth.filter(a => a.status === 'half-day').length;
    const late = thisMonth.filter(a => a.status === 'late').length;
    const totalDays = thisMonth.length;
    const workDays = new Date().getDate();

    document.getElementById('presentDays').textContent = fullDays;
    document.getElementById('absentDays').textContent = halfDays;
    document.getElementById('lateDays').textContent = late;
    document.getElementById('attendancePercentage').textContent = workDays > 0
        ? Math.round((totalDays / workDays) * 100) + '%'
        : '0%';
}

// =============================================
// WORK SECTION - TIMELINE
// =============================================

function initWorkSection() {
    // Set today's date
    const today = new Date();
    document.getElementById('timelineDate').textContent = today.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    });

    populateTimeSelects();
    checkEditorFields();
    renderTodayTimeline();
    updateWorkSummary();
    renderWorkHistoryDays();
}

function checkEditorFields() {
    const isEditor = currentEmployee && (
        currentEmployee.roles?.includes('video-editor') ||
        currentEmployee.role?.toLowerCase()?.includes('video')
    );
    const editorRow = document.getElementById('editorFieldsRow');
    if (editorRow) {
        editorRow.style.display = isEditor ? 'flex' : 'none';
    }
}

function populateTimeSelects() {
    const startH = document.getElementById('slotStartHour');
    const startM = document.getElementById('slotStartMin');
    const endH = document.getElementById('slotEndHour');
    const endM = document.getElementById('slotEndMin');

    if (!startH) return;

    // Hours (6 AM to 7 PM - 24h: 6 to 19)
    let hOptions = '';
    for (let i = 6; i <= 19; i++) {
        const displayH = i > 12 ? i - 12 : (i === 0 ? 12 : i);
        const ampm = i >= 12 ? 'PM' : 'AM';
        const label = `${displayH.toString().padStart(2, '0')} ${ampm}`;
        hOptions += `<option value="${i}">${label}</option>`;
    }
    startH.innerHTML = hOptions;
    endH.innerHTML = hOptions;

    // Minutes (0-59)
    let mOptions = '';
    for (let i = 0; i < 60; i++) {
        const m = i.toString().padStart(2, '0');
        mOptions += `<option value="${i}">${m}</option>`;
    }
    startM.innerHTML = mOptions;
    endM.innerHTML = mOptions;

    // Default values (9:00 AM to 10:00 AM)
    startH.value = "9";
    endH.value = "10";
}

// Get today's timeline data
function getTodayTimeline() {
    const allTimelines = JSON.parse(localStorage.getItem('workTimelines') || '{}');
    const today = new Date().toDateString();
    return allTimelines[today] || [];
}

// Save today's timeline
function saveTodayTimeline(slots) {
    const allTimelines = JSON.parse(localStorage.getItem('workTimelines') || '{}');
    const today = new Date().toDateString();
    allTimelines[today] = slots;
    localStorage.setItem('workTimelines', JSON.stringify(allTimelines));
}

// Format time (decimal hour to 12h string)
function formatTime(hour) {
    if (hour === 0 || hour === 24) return '12:00 AM';

    const h = Math.floor(hour);
    const m = Math.round((hour % 1) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);

    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Convert "HH:MM" string to decimal hour
function timeToFloat(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m / 60);
}

// Convert decimal hour to "HH:MM" string (for input value)
function floatToTimeStr(f) {
    const h = Math.floor(f);
    const m = Math.round((f % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Add new time slot
function addTimeSlot() {
    const sH = parseInt(document.getElementById('slotStartHour').value);
    const sM = parseInt(document.getElementById('slotStartMin').value);
    const eH = parseInt(document.getElementById('slotEndHour').value);
    const eM = parseInt(document.getElementById('slotEndMin').value);

    const startTime = sH + (sM / 60);
    const endTime = eH + (eM / 60);
    const activity = document.getElementById('slotActivity').value.trim();
    const client = document.getElementById('slotClient')?.value?.trim() || '';
    const videoMins = document.getElementById('slotVideoMins')?.value?.trim() || '';

    if (!activity) {
        showToast('Please enter what you worked on', 'warning');
        return;
    }

    if (endTime <= startTime) {
        showToast('End time must be after start time', 'warning');
        return;
    }

    const timeline = getTodayTimeline();

    const newSlot = {
        id: Date.now(),
        startTime,
        endTime,
        activity,
        client,
        videoMins,
        createdAt: new Date().toISOString()
    };

    timeline.push(newSlot);

    // Sort by start time
    timeline.sort((a, b) => a.startTime - b.startTime);

    saveTodayTimeline(timeline);

    // Clear form
    document.getElementById('slotActivity').value = '';
    if (document.getElementById('slotClient')) document.getElementById('slotClient').value = '';
    if (document.getElementById('slotVideoMins')) document.getElementById('slotVideoMins').value = '';

    // Auto-update next start time
    document.getElementById('slotStartHour').value = eH;
    document.getElementById('slotStartMin').value = eM;

    // Suggest 1 hour later for end
    const nextEndH = Math.min(eH + 1, 23);
    document.getElementById('slotEndHour').value = nextEndH;
    document.getElementById('slotEndMin').value = eM;

    renderTodayTimeline();
    updateWorkSummary();

    addActivity('update', currentEmployee.name, `Logged: ${formatTime(startTime)} - ${formatTime(endTime)} → ${activity}`);
    showToast('Added to timeline!', 'success');
    lucide.createIcons();
}

// Render today's timeline
function renderTodayTimeline() {
    const container = document.getElementById('todayTimeline');
    const timeline = getTodayTimeline();

    // Work day range (6 AM to 7 PM)
    const workStart = 6; // 6 AM
    const workEnd = 19;  // 7 PM

    let html = '';
    let currentH = workStart;

    // Sort timeline
    const sortedTimeline = [...timeline].sort((a, b) => a.startTime - b.startTime);

    while (currentH < workEnd) {
        // Find if any logged activity covers this time
        const activeSlot = sortedTimeline.find(s => s.startTime <= currentH && s.endTime > currentH);

        if (activeSlot) {
            const duration = activeSlot.endTime - activeSlot.startTime;
            const durationText = duration >= 1
                ? `${Math.floor(duration)}h ${duration % 1 === 0.75 ? '45m' : (duration % 1 === 0.5 ? '30m' : '')}`
                : `${Math.round(duration * 60)}m`;

            const extraInfo = [];
            if (activeSlot.client) extraInfo.push(`Client: ${activeSlot.client}`);
            if (activeSlot.videoMins) extraInfo.push(`Len: ${activeSlot.videoMins}m`);

            const extraHtml = extraInfo.length > 0
                ? `<div class="slot-extra" style="font-size: 0.8rem; color: var(--accent-cyan); margin-top: 5px; font-weight: 500; opacity: 0.9;">
                    <i data-lucide="info" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
                    ${extraInfo.join(' • ')}
                   </div>`
                : '';

            html += `
                <div class="timeline-slot">
                    <div class="slot-time">
                        <span class="slot-time-range">${formatTime(activeSlot.startTime)} → ${formatTime(activeSlot.endTime)}</span>
                        <span class="slot-duration">${durationText.trim()}</span>
                    </div>
                    <div class="slot-content">
                        <div class="slot-activity">${activeSlot.activity}</div>
                        ${extraHtml}
                    </div>
                    <button class="slot-delete" onclick="deleteTimeSlot(${activeSlot.id})" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            // Jump to end of this slot
            currentH = activeSlot.endTime;
        } else {
            // Find next activity to determine gap size
            const nextSlot = sortedTimeline.find(s => s.startTime > currentH);
            const nextH = nextSlot ? nextSlot.startTime : workEnd;

            const duration = nextH - currentH;
            const durationText = duration >= 1
                ? `${Math.floor(duration)}h ${duration % 1 === 0.75 ? '45m' : (duration % 1 === 0.5 ? '30m' : '')}`
                : `${Math.round(duration * 60)}m`;

            html += `
                <div class="timeline-slot empty-slot" style="background: rgba(255,255,255,0.02); border-left-color: rgba(0, 212, 255, 0.1); opacity: 0.6; border-left-style: dashed;">
                    <div class="slot-time">
                        <span class="slot-time-range" style="color: var(--text-muted);">${formatTime(currentH)} → ${formatTime(nextH)}</span>
                        <span class="slot-duration">${durationText.trim()}</span>
                    </div>
                    <div class="slot-content">
                        <div class="slot-activity" style="color: var(--text-muted); font-style: italic; font-weight: 400;">No activity logged</div>
                    </div>
                </div>
            `;
            currentH = nextH;
        }
    }

    container.innerHTML = html;
    lucide.createIcons();
}

// Delete time slot
function deleteTimeSlot(id) {
    if (!confirm('Delete this time slot?')) return;

    let timeline = getTodayTimeline();
    timeline = timeline.filter(slot => slot.id !== id);
    saveTodayTimeline(timeline);

    renderTodayTimeline();
    updateWorkSummary();
    showToast('Time slot deleted', 'info');
}

// Update work summary
function updateWorkSummary() {
    const timeline = getTodayTimeline();

    // Total activities
    const totalSlots = timeline.length;

    // Total work hours
    const totalHours = timeline
        .reduce((sum, slot) => sum + (slot.endTime - slot.startTime), 0);

    document.getElementById('totalSlots').textContent = totalSlots;
    document.getElementById('totalWorkHours').textContent = `${totalHours.toFixed(1)}h`;
    document.getElementById('completedTasks').textContent = totalSlots; // All added are considered done
}

// Render work history (previous days)
function renderWorkHistoryDays() {
    const container = document.getElementById('workHistoryList');
    const allTimelines = JSON.parse(localStorage.getItem('workTimelines') || '{}');
    const days = parseInt(document.getElementById('historyDateFilter')?.value || 7);

    const today = new Date();
    const historyDays = [];

    for (let i = 1; i <= days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        if (allTimelines[dateStr] && allTimelines[dateStr].length > 0) {
            historyDays.push({
                date: dateStr,
                timeline: allTimelines[dateStr]
            });
        }
    }

    if (historyDays.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm text-center p-4">No previous work history</p>';
        return;
    }

    container.innerHTML = historyDays.map(day => {
        const totalHours = day.timeline
            .reduce((sum, slot) => sum + (slot.endTime - slot.startTime), 0);

        const activities = day.timeline.map(slot => slot.activity).join(' → ');

        return `
            <div class="history-day" onclick="viewDayTimeline('${day.date}')">
                <div class="history-day-header">
                    <span class="history-date">${new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span class="history-hours">${totalHours.toFixed(1)}h • ${day.timeline.length} activities</span>
                </div>
                <p class="history-activities">${activities}</p>
            </div>
        `;
    }).join('');
}

// Filter work history
function filterWorkHistory() {
    renderWorkHistoryDays();
}

// View specific day timeline (modal or expand)
function viewDayTimeline(dateStr) {
    const allTimelines = JSON.parse(localStorage.getItem('workTimelines') || '{}');
    const dayTimeline = allTimelines[dateStr] || [];

    // For now, show a summary in a toast
    const summary = dayTimeline.map(slot =>
        `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}: ${slot.activity}`
    ).join('\n');

    alert(`Work Timeline for ${new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}:\n\n${summary}`);
}

// =============================================
// LEARNING SECTION
// =============================================

function initLearningSection() {
    renderCourses();
    updateLearningProgress();
    renderLearningLogs();
    populateLearningTimeSelects();
}

function populateLearningTimeSelects() {
    const startH = document.getElementById('manualLearnStartH');
    const startM = document.getElementById('manualLearnStartM');
    const endH = document.getElementById('manualLearnEndH');
    const endM = document.getElementById('manualLearnEndM');

    if (!startH) return;

    let hOptions = '';
    for (let i = 6; i <= 21; i++) {
        const displayH = i > 12 ? i - 12 : (i === 0 ? 12 : i);
        const ampm = i >= 12 ? 'PM' : 'AM';
        hOptions += `<option value="${i}">${displayH.toString().padStart(2, '0')} ${ampm}</option>`;
    }

    let mOptions = '';
    for (let i = 0; i < 60; i += 5) {
        mOptions += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
    }

    startH.innerHTML = hOptions;
    endH.innerHTML = hOptions;
    startM.innerHTML = mOptions;
    endM.innerHTML = mOptions;

    // Set defaults
    const now = new Date();
    startH.value = now.getHours();
    endH.value = Math.min(now.getHours() + 1, 21);
}

function addManualLearningLog() {
    const topic = document.getElementById('manualLearnTopic').value.trim();
    const sH = document.getElementById('manualLearnStartH').value;
    const sM = document.getElementById('manualLearnStartM').value.padStart(2, '0');
    const eH = document.getElementById('manualLearnEndH').value;
    const eM = document.getElementById('manualLearnEndM').value.padStart(2, '0');
    const videoMins = document.getElementById('manualLearnVideoMins').value || '0';

    if (!topic) {
        showToast('Please enter what you learned', 'warning');
        return;
    }

    const log = {
        date: new Date().toISOString(),
        course: 'Manual Entry',
        topic: topic,
        from: `${sH.padStart(2, '0')}:${sM}`,
        to: `${eH.padStart(2, '0')}:${eM}`,
        videoMins: videoMins
    };

    const key = `learning_logs_${currentEmployee.id}`;
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    logs.push(log);
    localStorage.setItem(key, JSON.stringify(logs));

    showToast('Learning activity logged manually! 📚', 'success');

    // Reset topic
    document.getElementById('manualLearnTopic').value = '';

    renderLearningLogs();
}

function renderLearningLogs() {
    const container = document.getElementById('learningLogsList');
    if (!container) return;

    const key = `learning_logs_${currentEmployee.id}`;
    const logs = JSON.parse(localStorage.getItem(key) || '[]');

    if (logs.length === 0) {
        container.innerHTML = '<p class=\"text-muted text-sm text-center p-4\">No learning activity logged today</p>';
        return;
    }

    // Show only today's logs
    const today = new Date().toDateString();
    const todayLogs = logs.filter(l => new Date(l.date).toDateString() === today);

    if (todayLogs.length === 0) {
        container.innerHTML = '<p class=\"text-muted text-sm text-center p-4\">No learning activity logged today</p>';
        return;
    }

    container.innerHTML = todayLogs.map(log => `
        <div class="timeline-slot" style="margin-bottom: 10px; border-left-color: var(--accent-purple);">
            <div class="slot-time" style="min-width: 140px;">
                <span class="slot-time-range">${log.from} → ${log.to}</span>
                <span class="slot-duration" style="color: var(--accent-purple);">${log.videoMins}m video</span>
            </div>
            <div class="slot-content">
                <div class="slot-activity" style="font-weight: 600;">${log.topic}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${log.course}</div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function renderCourses() {
    const container = document.getElementById('coursesList');
    const courses = getEmployeeCourses();
    if (!container) return;
    if (courses.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,212,255,0.05); border-radius: 12px; border: 1px dashed rgba(0,212,255,0.2);">
                <i data-lucide="book-open" style="width: 40px; height: 40px; color: var(--accent-cyan); margin-bottom: 15px; opacity: 0.5;"></i>
                <h4 style="color: var(--text-primary); margin-bottom: 10px;">No Courses Assigned</h4>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Please contact admin to assign learning modules to your role.</p>
            </div>
        `;
    } else {
        container.innerHTML = courses.map(course => `
            <div class="course-card" onclick="openCourse('${course.id}')">
                <div class="course-icon">
                    <i data-lucide="${course.icon || 'book-open'}"></i>
                </div>
                <h4>${course.title}</h4>
                <p>${course.description}</p>
                <div class="course-progress">
                    <div class="course-progress-bar" style="width: ${course.progress}%"></div>
                </div>
                <span class="course-progress-text">${course.progress}% Complete</span>
            </div>
        `).join('');
    }

    lucide.createIcons();
}

function updateLearningProgress() {
    const courses = getEmployeeCourses();
    const completed = courses.filter(c => c.progress === 100).length;
    const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const total = courses.length;

    const avgProgress = total > 0
        ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / total)
        : 0;

    document.getElementById('completedCourses').textContent = completed;
    document.getElementById('inProgressCourses').textContent = inProgress;
    document.getElementById('totalCourses').textContent = total;
    document.getElementById('progressText').textContent = avgProgress + '%';

    // Update circle progress
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (avgProgress / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function calculateLearningProgress() {
    const courses = getEmployeeCourses();
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length);
}

// Course Content Library - Field Specific
const COURSE_LIBRARY = {
    'video-editor': [
        {
            id: 've1', title: 'High-Energy Social Editing', description: 'Master the art of fast-paced social media video editing.', icon: 'video', modules: [
                { title: 'The Hook Strategy', content: 'The first 3 seconds are everything. Learn how to stop the scroll with dynamic openers, kinetic typography, and sound triggers.' },
                { title: 'Rhythmic Cutting', content: 'Cutting to the beat of trending audio. Techniques for punchy transitions and maintaining high viewer engagement throughout the video.' },
                { title: 'Color Grading for Emotions', content: 'Using color to set the mood. Learn our signature "vibrant-professional" look for Grofast client videos.' }
            ]
        },
        { id: 've2', title: 'Adobe Premiere Speedrunning', description: 'Workflow optimizations for 3x faster delivery.', icon: 'zap' }
    ],
    'meta-ads': [
        {
            id: 'ma1', title: 'The Winning Ad Blueprint', description: 'Deep dive into Meta Ads structure for maximum ROAS.', icon: 'target', modules: [
                { title: 'Audience Research', content: 'How to use Meta libraries and competitor research to find high-intent audiences for our specific niches.' },
                { title: 'Creative Testing Framework', content: 'The 3:2:2 testing method explained. How to find winning ad creatives without wasting client budget.' }
            ]
        }
    ],
    'script-writer': [
        {
            id: 'sw1', title: 'Irresistible Ad Scripting', description: 'The psychology of high-converting video scripts.', icon: 'file-text', modules: [
                { title: 'The AIDA Framework', content: 'Applying Attention, Interest, Desire, and Action to short-form video scripts.' },
                { title: 'Visual Hooks', content: 'Writing scripts that tell the editor exactly what to show on screen for maximum impact.' }
            ]
        }
    ],
    'ai-automation': [
        {
            id: 'ai1', title: 'n8n Workflow Mastery', description: 'Building advanced automations for business growth.', icon: 'brain', modules: [
                { title: 'Trigger & Action Logic', content: 'Understanding webhooks, schedule triggers, and node-to-node data mapping in n8n.' },
                { title: 'AI Node Integration', content: 'Connecting OpenAI and Anthropic nodes to process business data automatically.' }
            ]
        }
    ],
    'software-management': [
        {
            id: 'sm1', title: 'Product Management for Teams', description: 'Managing the dev lifecycle efficiently.', icon: 'code-2', modules: [
                { title: 'Agile & Sprints', content: 'How to run weekly sprints and manage the Grofast product roadmap using Kanban.' },
                { title: 'Bug Reporting & QA', content: 'The proper way to document technical issues for the engineering team.' }
            ]
        }
    ]
};

function openCourse(id) {
    const courses = getEmployeeCourses();
    const course = courses.find(c => c.id === id);
    if (!course) return;

    const modal = document.getElementById('courseModal');
    document.getElementById('courseModalTitle').textContent = course.title;
    document.getElementById('courseModalDesc').textContent = course.description;

    // Set icon
    const iconContainer = document.getElementById('courseModalIcon');
    iconContainer.innerHTML = `<i data-lucide="${course.icon || 'book-open'}"></i>`;

    renderModules(course);

    modal.classList.remove('hidden');
    lucide.createIcons();
}

function renderModules(course) {
    const container = document.getElementById('courseModulesList');
    const contentArea = document.getElementById('moduleContent');

    if (!course.modules || course.modules.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm">No modules available for this course.</p>';
        return;
    }

    container.innerHTML = course.modules.map((m, index) => `
        <div class="module-item" onclick="loadModuleContent('${course.id}', ${index})">
            <div class="module-num">${index + 1}</div>
            <span class="module-title">${m.title}</span>
        </div>
    `).join('');

    // Reset content area
    contentArea.innerHTML = `
        <div class="empty-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); gap: 15px; opacity: 0.5;">
            <i data-lucide="circle-play" style="width: 60px; height: 60px;"></i>
            <p>Select a module from the left to start learning</p>
        </div>
    `;
    lucide.createIcons();
}

function loadModuleContent(courseId, moduleIndex) {
    const courses = getEmployeeCourses();
    const course = courses.find(c => c.id === courseId);
    const module = course.modules[moduleIndex];

    const contentArea = document.getElementById('moduleContent');

    // Generate Hour/Min options
    let hOptions = '';
    for (let i = 6; i <= 21; i++) {
        const displayH = i > 12 ? i - 12 : (i === 0 ? 12 : i);
        const ampm = i >= 12 ? 'PM' : 'AM';
        hOptions += `<option value="${i}">${displayH.toString().padStart(2, '0')} ${ampm}</option>`;
    }

    let mOptions = '';
    for (let i = 0; i < 60; i += 5) {
        mOptions += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
    }

    contentArea.innerHTML = `
        <div class="content-body" style="animation: fadeIn 0.3s ease;">
            <h2 style="color: var(--accent-cyan); margin-bottom: 20px; font-size: 1.8rem;">${module.title}</h2>
            <div style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 12px; border-left: 4px solid var(--accent-cyan); line-height: 1.8; color: var(--text-primary); font-size: 1.1rem; margin-bottom: 30px;">
                ${module.content}
            </div>
            
            <div class="learning-log-form" style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1);">
                <h4 style="font-size: 0.9rem; color: var(--accent-cyan); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="clock" style="width: 16px;"></i> Log Study Time
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label class="form-label" style="font-size: 0.7rem;">From</label>
                        <div style="display: flex; gap: 4px;">
                            <select id="learnStartH" class="form-input" style="height: 35px; font-size: 0.8rem;">${hOptions}</select>
                            <select id="learnStartM" class="form-input" style="height: 35px; font-size: 0.8rem;">${mOptions}</select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size: 0.7rem;">To</label>
                        <div style="display: flex; gap: 4px;">
                            <select id="learnEndH" class="form-input" style="height: 35px; font-size: 0.8rem;">${hOptions}</select>
                            <select id="learnEndM" class="form-input" style="height: 35px; font-size: 0.8rem;">${mOptions}</select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size: 0.7rem;">Video Length (min)</label>
                        <input type="number" id="learnVideoMins" class="form-input" style="height: 35px; font-size: 0.8rem;" placeholder="e.g. 15">
                    </div>
                </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; border-top: 1px solid rgba(0,212,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted); font-size: 0.9rem;">Course: ${course.title}</span>
                <button class="btn btn-primary" onclick="markModuleComplete('${courseId}', ${moduleIndex})">
                    <i data-lucide="check"></i> Mark as Completed & Log
                </button>
            </div>
        </div>
    `;

    // Defaults
    document.getElementById('learnStartH').value = new Date().getHours();
    document.getElementById('learnEndH').value = new Date().getHours();

    // Update active state in sidebar
    document.querySelectorAll('.module-item').forEach((el, idx) => {
        if (idx === moduleIndex) el.classList.add('active');
        else el.classList.remove('active');
    });

    lucide.createIcons();
}

function markModuleComplete(courseId, index) {
    const sH = document.getElementById('learnStartH').value;
    const sM = document.getElementById('learnStartM').value.padStart(2, '0');
    const eH = document.getElementById('learnEndH').value;
    const eM = document.getElementById('learnEndM').value.padStart(2, '0');
    const videoMins = document.getElementById('learnVideoMins').value || '0';

    const courses = getEmployeeCourses();
    const course = courses.find(c => c.id === courseId);
    const module = course.modules[index];

    // Create log entry
    const log = {
        date: new Date().toISOString(),
        course: course.title,
        topic: module.title,
        from: `${sH.padStart(2, '0')}:${sM}`,
        to: `${eH.padStart(2, '0')}:${eM}`,
        videoMins: videoMins
    };

    const key = `learning_logs_${currentEmployee.id}`;
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    logs.push(log);
    localStorage.setItem(key, JSON.stringify(logs));

    // Update progress in course data
    course.progress = Math.min(course.progress + (100 / course.modules.length), 100);
    const coursesKey = `courses_${currentEmployee.id}`;
    localStorage.setItem(coursesKey, JSON.stringify(courses));

    showToast('Progress saved and activity logged! 👏', 'success');

    closeCourseModal();
    renderCourses();
    updateLearningProgress();
    renderLearningLogs();
}

function closeCourseModal() {
    document.getElementById('courseModal').classList.add('hidden');
}

// =============================================
// CALENDAR SECTION
// =============================================

function initCalendarSection() {
    renderCalendar();
    renderEvents();
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    const events = getEmployeeEvents();
    const eventDates = events.map(e => new Date(e.date).toDateString());

    let html = '';

    // Previous month days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="cal-day other-month">${prevMonthDays - i}</div>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        const hasEvent = eventDates.includes(date.toDateString());

        html += `<div class="cal-day${isToday ? ' today' : ''}${hasEvent ? ' has-event' : ''}" onclick="selectDate(${day})">${day}</div>`;
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="cal-day other-month">${i}</div>`;
    }

    document.getElementById('calendarDays').innerHTML = html;
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function selectDate(day) {
    const selectedDate = new Date(currentYear, currentMonth, day);
    document.getElementById('eventDate').value = selectedDate.toISOString().split('T')[0];
    showAddEvent();
}

function renderEvents() {
    const container = document.getElementById('eventsList');
    const events = getEmployeeEvents().sort((a, b) => new Date(a.date) - new Date(b.date));

    if (events.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm text-center p-4">No upcoming events</p>';
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="event-item">
            <span class="event-date">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ${event.time || ''}</span>
            <h4 class="event-title">${event.title}</h4>
            <p class="event-desc">${event.description || ''}</p>
        </div>
    `).join('');
}

function showAddEvent() {
    document.getElementById('eventModal').classList.remove('hidden');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.add('hidden');
}

// =============================================
// CHAT SECTION
// =============================================

function initChatSection() {
    renderTeamList();
    renderMessages();
}

function renderTeamList() {
    const container = document.getElementById('teamList');
    const employees = getEmployees();
    const messages = getChatMessages();

    // Add admin
    const teamMembers = [
        { id: 0, name: 'Admin', role: 'Administrator', isAdmin: true }
    ];

    employees.forEach(emp => {
        if (emp.id !== currentEmployee.id) {
            const unread = messages.filter(m => m.from === emp.id && !m.read && m.to === currentEmployee.id).length;
            teamMembers.push({ ...emp, unread });
        }
    });

    container.innerHTML = teamMembers.map(member => `
        <div class="team-member ${selectedChatRecipient === member.id ? 'active' : ''}" onclick="selectRecipient(${member.id}, '${member.name}')">
            <div class="member-avatar">
                ${getInitials(member.name)}
                ${member.status === 'active' || member.isAdmin ? '<span class="online-dot"></span>' : ''}
            </div>
            <div class="member-info">
                <span class="member-name">${member.name}</span>
                <span class="member-role">${member.role}</span>
            </div>
            ${member.unread > 0 ? `<span class="member-badge">${member.unread}</span>` : ''}
        </div>
    `).join('');
}

function selectRecipient(id, name) {
    selectedChatRecipient = id;
    renderTeamList();

    const header = document.getElementById('chatHeader');
    header.innerHTML = `
        <div class="chat-recipient">
            <div class="recipient-avatar">${getInitials(name)}</div>
            <div class="recipient-info">
                <h4>${name}</h4>
                <span>${id === 0 ? 'Administrator' : 'Team Member'}</span>
            </div>
        </div>
    `;

    renderMessages();
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    const messages = getChatMessages();

    // Show team chat or specific conversation
    let filteredMessages;
    if (selectedChatRecipient === null) {
        filteredMessages = messages.filter(m => m.isTeamChat);
    } else {
        filteredMessages = messages.filter(m =>
            (m.from === currentEmployee.id && m.to === selectedChatRecipient) ||
            (m.from === selectedChatRecipient && m.to === currentEmployee.id) ||
            m.isTeamChat
        );
    }

    if (filteredMessages.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-8">
                <i data-lucide="message-circle" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>No messages yet. Start a conversation!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = filteredMessages.map(msg => {
        const isSent = msg.from === currentEmployee.id;
        const senderName = msg.from === currentEmployee.id
            ? currentEmployee.name
            : msg.from === 0
                ? 'Admin'
                : getEmployees().find(e => e.id === msg.from)?.name || 'Unknown';

        // Parse mentions
        const messageText = msg.text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');

        return `
            <div class="message ${isSent ? 'sent' : ''}">
                <div class="message-avatar">${getInitials(senderName)}</div>
                <div class="message-content">
                    <span class="message-sender">${senderName}</span>
                    <p class="message-text">${messageText}</p>
                    <span class="message-time">${timeAgo(msg.timestamp)}</span>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function filterTeamMembers() {
    const search = document.getElementById('chatSearch').value.toLowerCase();
    const employees = getEmployees().filter(emp =>
        emp.id !== currentEmployee.id &&
        emp.name.toLowerCase().includes(search)
    );

    // Re-render filtered list
    const container = document.getElementById('teamList');
    container.innerHTML = employees.map(emp => `
        <div class="team-member" onclick="selectRecipient(${emp.id}, '${emp.name}')">
            <div class="member-avatar">
                ${getInitials(emp.name)}
                ${emp.status === 'active' ? '<span class="online-dot"></span>' : ''}
            </div>
            <div class="member-info">
                <span class="member-name">${emp.name}</span>
                <span class="member-role">${emp.role}</span>
            </div>
        </div>
    `).join('');
}

function checkMention() {
    const input = document.getElementById('messageInput');
    const suggestions = document.getElementById('mentionSuggestions');
    const text = input.value;

    // Check if typing a mention
    const mentionMatch = text.match(/@(\w*)$/);

    if (mentionMatch) {
        const query = mentionMatch[1].toLowerCase();
        const employees = getEmployees().filter(emp =>
            emp.name.toLowerCase().includes(query) && emp.id !== currentEmployee.id
        );

        // Add admin
        const allMembers = [{ id: 0, name: 'Admin', role: 'Administrator' }, ...employees];
        const filtered = allMembers.filter(m => m.name.toLowerCase().includes(query));

        if (filtered.length > 0) {
            suggestions.innerHTML = filtered.map(m => `
                <div class="mention-item" onclick="insertMention('${m.name}')">
                    <div class="member-avatar">${getInitials(m.name)}</div>
                    <div class="member-info">
                        <span class="member-name">${m.name}</span>
                        <span class="member-role">${m.role}</span>
                    </div>
                </div>
            `).join('');
            suggestions.classList.add('active');
        } else {
            suggestions.classList.remove('active');
        }
    } else {
        suggestions.classList.remove('active');
    }
}

function insertMention(name) {
    const input = document.getElementById('messageInput');
    const text = input.value;
    const newText = text.replace(/@\w*$/, `@${name.replace(' ', '')} `);
    input.value = newText;
    input.focus();
    document.getElementById('mentionSuggestions').classList.remove('active');
}

function handleMessageKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text) return;

    const messages = getChatMessages();

    // Check for mentions and create notifications
    const mentions = text.match(/@(\w+)/g) || [];
    const mentionedUsers = [];

    mentions.forEach(mention => {
        const name = mention.slice(1); // Remove @
        const employees = getEmployees();
        const mentioned = employees.find(e => e.name.replace(' ', '').toLowerCase() === name.toLowerCase());
        if (mentioned) {
            mentionedUsers.push(mentioned.id);
        }
        if (name.toLowerCase() === 'admin') {
            mentionedUsers.push(0);
        }
    });

    const newMessage = {
        id: Date.now(),
        from: currentEmployee.id,
        to: selectedChatRecipient,
        text: text,
        timestamp: new Date().toISOString(),
        isTeamChat: selectedChatRecipient === null,
        mentions: mentionedUsers,
        read: false
    };

    messages.push(newMessage);
    saveChatMessages(messages);

    // Add activity for mentions
    if (mentionedUsers.length > 0) {
        addActivity('update', currentEmployee.name, `Mentioned team members in chat`);
    }

    input.value = '';
    renderMessages();

    showToast('Message sent!', 'success');
}

function showEmoji() {
    showToast('Emoji picker coming soon!', 'info');
}

// =============================================
// FORM HANDLERS
// =============================================

function setupFormHandlers() {
    // Personal form
    document.getElementById('personalForm').addEventListener('submit', function (e) {
        e.preventDefault();

        currentEmployee.name = document.getElementById('editName').value;
        currentEmployee.email = document.getElementById('editEmail').value;
        currentEmployee.phone = document.getElementById('editPhone').value;

        const employees = getEmployees();
        const index = employees.findIndex(emp => emp.id === currentEmployee.id);
        if (index !== -1) {
            employees[index] = currentEmployee;
            saveEmployees(employees);
        }

        addActivity('profile', currentEmployee.name, 'Updated profile information');
        initProfileSection();
        initDashboard();

        showToast('Profile updated successfully!', 'success');
    });

    // Password form
    document.getElementById('passwordForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;

        if (currentPass !== currentEmployee.password) {
            showToast('Current password is incorrect', 'error');
            return;
        }

        if (newPass.length < 6) {
            showToast('New password must be at least 6 characters', 'warning');
            return;
        }

        currentEmployee.password = newPass;
        const employees = getEmployees();
        const index = employees.findIndex(emp => emp.id === currentEmployee.id);
        if (index !== -1) {
            employees[index] = currentEmployee;
            saveEmployees(employees);
        }

        addActivity('profile', currentEmployee.name, 'Changed password');

        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';

        showToast('Password updated successfully!', 'success');
    });

    // Work form
    document.getElementById('workForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const work = getEmployeeWork();
        const newWork = {
            id: Date.now(),
            employeeId: currentEmployee.id,
            title: document.getElementById('workTitle').value,
            description: document.getElementById('workDescription').value,
            category: document.getElementById('workCategory').value,
            status: document.getElementById('workStatus').value,
            createdAt: new Date().toISOString()
        };

        work.unshift(newWork);
        saveEmployeeWork(work);

        addActivity('update', currentEmployee.name, `Added work update: ${newWork.title}`);

        this.reset();
        renderWorkHistory();
        initDashboardSection();

        showToast('Work update added!', 'success');
    });

    // Event form
    document.getElementById('eventForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const events = getEmployeeEvents();
        const newEvent = {
            id: Date.now(),
            employeeId: currentEmployee.id,
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            description: document.getElementById('eventDescription').value
        };

        events.push(newEvent);
        saveEmployeeEvents(events);

        this.reset();
        closeEventModal();
        renderCalendar();
        renderEvents();
        initDashboardSection();

        showToast('Event added!', 'success');
    });
}

// =============================================
// DATA HELPERS
// =============================================

function getEmployeeAttendance() {
    const key = `attendance_${currentEmployee.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

function saveEmployeeAttendance(attendance) {
    const key = `attendance_${currentEmployee.id}`;
    localStorage.setItem(key, JSON.stringify(attendance));
}

function getEmployeeWork() {
    const key = `work_${currentEmployee.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

function saveEmployeeWork(work) {
    const key = `work_${currentEmployee.id}`;
    localStorage.setItem(key, JSON.stringify(work));
}

function getEmployeeCourses() {
    const key = `courses_${currentEmployee.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) return parsed;
    }

    // We want to serve role-specific courses if possible
    const myRoles = currentEmployee.roles || [currentEmployee.role?.toLowerCase()?.replace(' ', '-')];
    let customCourses = [];

    myRoles.forEach(roleId => {
        if (COURSE_LIBRARY[roleId]) {
            // Clone the library items to avoid modifying the reference
            const roleCourses = COURSE_LIBRARY[roleId].map(c => ({ ...c, progress: 0 }));
            customCourses = [...customCourses, ...roleCourses];
        }
    });

    // If no role-specific courses found, add a few generic ones
    if (customCourses.length === 0) {
        customCourses = [
            { id: 'ai-intro', title: 'Introduction to AI', description: 'Learn the basics of Artificial Intelligence', progress: 0, icon: 'cpu', modules: [{ title: 'What is AI?', content: 'AI is the simulation of human intelligence by machines...' }, { title: 'Future of AI', content: 'AI is evolving rapidly with LLMs...' }] },
            { id: 'comm-skills', title: 'Communication Skills', description: 'Effective workplace communication', progress: 0, icon: 'message-square', modules: [{ title: 'Active Listening', content: 'Listening is key...' }, { title: 'Email Etiquette', content: 'Professional emails should...' }] }
        ];
    }

    localStorage.setItem(key, JSON.stringify(customCourses));
    return customCourses;
}

function getEmployeeEvents() {
    const key = `events_${currentEmployee.id}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);

    // Default events
    const today = new Date();
    const defaultEvents = [
        { id: 1, title: 'Team Meeting', date: today.toISOString().split('T')[0], time: '10:00', description: 'Weekly team sync' },
        { id: 2, title: 'Project Review', date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '14:00', description: 'Q1 project review' }
    ];

    localStorage.setItem(key, JSON.stringify(defaultEvents));
    return defaultEvents;
}

function saveEmployeeEvents(events) {
    const key = `events_${currentEmployee.id}`;
    localStorage.setItem(key, JSON.stringify(events));
}

function getChatMessages() {
    const stored = localStorage.getItem('chatMessages');
    if (stored) return JSON.parse(stored);

    // Default messages
    const defaultMessages = [
        { id: 1, from: 0, to: null, text: 'Welcome to the team chat! Feel free to discuss and collaborate here.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isTeamChat: true, read: true },
        { id: 2, from: 2, to: null, text: 'Good morning everyone! 🌟', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isTeamChat: true, read: true }
    ];

    localStorage.setItem('chatMessages', JSON.stringify(defaultMessages));
    return defaultMessages;
}

function saveChatMessages(messages) {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function getUnreadMessages() {
    const messages = getChatMessages();
    return messages.filter(m => !m.read && (m.to === currentEmployee.id || m.mentions?.includes(currentEmployee.id))).length;
}

// =============================================
// UTILITIES
// =============================================

function logout() {
    sessionStorage.removeItem('employeeLoggedIn');
    sessionStorage.removeItem('employeeId');
    sessionStorage.removeItem('employeeName');
    window.location.href = '../index.html';
}

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
