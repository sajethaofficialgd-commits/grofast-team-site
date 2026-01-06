// =============================================
// EMPLOYEE DASHBOARD - MAIN SCRIPT
// =============================================

let currentEmployee = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedChatRecipient = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function () {
    lucide.createIcons();

    // Check if employee is logged in
    if (!sessionStorage.getItem('employeeLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Ensure Supabase is initialized
    if (typeof initSupabase === 'function') {
        initSupabase();
    }

    // Get employee data
    const employeeId = sessionStorage.getItem('employeeId');
    if (!employeeId) {
        logout();
        return;
    }

    // 1. Try to get latest data from Supabase
    if (typeof getEmployeeById === 'function' && supabaseClient) {
        try {
            const dbEmployee = await getEmployeeById(employeeId);
            if (dbEmployee) {
                currentEmployee = dbEmployee;
                // Update session storage with latest data
                sessionStorage.setItem('employeeData', JSON.stringify(dbEmployee));
                console.log('✅ Employee data refreshed from Supabase');
            }
        } catch (err) {
            console.error('Failed to fetch employee from Supabase:', err);
        }
    }

    // 2. Fallback to sessionStorage if Supabase fetch failed or didn't run
    if (!currentEmployee && sessionStorage.getItem('employeeData')) {
        try {
            currentEmployee = JSON.parse(sessionStorage.getItem('employeeData'));
            console.log('ℹ️ Using session-stored employee data');
        } catch (err) {
            console.error('Failed to parse session employee data');
        }
    }

    // 3. Last fallback to localStorage
    if (!currentEmployee) {
        const employees = getEmployees();
        currentEmployee = employees.find(emp => emp.id == employeeId);
    }

    if (!currentEmployee) {
        console.error('No employee data found. Logging out.');
        logout();
        return;
    }

    // Initialize dashboard
    await initDashboard();
});

// Initialize dashboard
async function initDashboard() {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', options);

    // Update sidebar user info
    const avatarEl = document.getElementById('sidebarAvatar');
    const nameEl = document.getElementById('sidebarName');
    const roleEl = document.getElementById('sidebarRole');

    if (avatarEl) avatarEl.textContent = getInitials(currentEmployee.name);
    if (nameEl) nameEl.textContent = currentEmployee.name;
    if (roleEl) roleEl.textContent = currentEmployee.role || currentEmployee.position;

    // Handle profile photo for sidebar if it exists
    if (currentEmployee.profile_photo || currentEmployee.photo) {
        const sidebarAvatarContainer = avatarEl.parentElement;
        sidebarAvatarContainer.innerHTML = `<img src="${currentEmployee.profile_photo || currentEmployee.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    }

    // Setup navigation
    setupNavigation();

    // Initialize all sections
    await initDashboardSection();
    await initProfileSection();
    await initAttendanceSection();
    await initWorkSection();
    await initLearningSection();
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
            const section = this.dataset.section;
            if (!section) return; // Allow normal navigation for items without data-section

            e.preventDefault();
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

async function initDashboardSection() {
    const attendance = await getEmployeeAttendance();
    const work = await getEmployeeWork();
    const courses = await getEmployeeCourses();
    const messages = await getUnreadMessages();

    // Update stats
    document.getElementById('attendanceCount').textContent = attendance.length;
    document.getElementById('tasksCompleted').textContent = work.filter(w => w.status === 'completed' || w.status === 'active').length;
    const progress = await calculateLearningProgress();
    document.getElementById('coursesProgress').textContent = progress + '%';
    document.getElementById('unreadMessages').textContent = messages;
    document.getElementById('chatBadge').textContent = messages;

    if (messages > 0) {
        document.getElementById('notificationDot').classList.add('active');
    }

    // Render today's schedule
    await renderTodaySchedule();

    // Render recent work
    await renderRecentWork();

    // Render team activity
    renderTeamActivity();
}

async function renderTodaySchedule() {
    const container = document.getElementById('todaySchedule');
    const events = (await getEmployeeEvents()).filter(e => {
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

async function renderRecentWork() {
    const container = document.getElementById('recentWork');
    const work = (await getEmployeeWork()).slice(0, 3);

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
                <h4>${w.activity || w.title}</h4>
                <p>${timeAgo(w.created_at || w.createdAt)}</p>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

async function renderTeamActivity() {
    const container = document.getElementById('teamActivity');
    if (!container) return;

    const activities = await getActivityLogFromDB(4);

    if (activities.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm text-center p-4">No recent activity</p>';
        return;
    }

    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-avatar">${getInitials(activity.employee_name || activity.employee)}</div>
            <div class="activity-content">
                <p class="activity-text">${activity.employee_name || activity.employee} ${activity.description}</p>
                <span class="activity-time">${timeAgo(activity.created_at || activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

// =============================================
// PROFILE SECTION
// =============================================

async function initProfileSection() {
    const avatarEl = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileName');
    const roleEl = document.getElementById('profileRole');
    const joinDateEl = document.getElementById('joinDate');
    const departmentEl = document.getElementById('department');

    if (nameEl) nameEl.textContent = currentEmployee.name;
    if (roleEl) roleEl.textContent = `${currentEmployee.role || currentEmployee.position} • ${currentEmployee.department}`;

    const joinDate = currentEmployee.join_date || currentEmployee.joinDate || currentEmployee.created_at || new Date().toISOString();
    if (joinDateEl) joinDateEl.textContent = new Date(joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    if (departmentEl) departmentEl.textContent = currentEmployee.department || 'General';

    // Form fields
    const bioEl = document.getElementById('editBio');
    const linkedinEl = document.getElementById('editLinkedin');

    if (bioEl) bioEl.value = currentEmployee.bio || '';
    if (linkedinEl) linkedinEl.value = currentEmployee.linkedin || '';

    document.getElementById('lastActive').textContent = 'Now';

    // Handle profile photo
    if (currentEmployee.profile_photo || currentEmployee.photo) {
        avatarEl.innerHTML = `<img src="${currentEmployee.profile_photo || currentEmployee.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        avatarEl.textContent = getInitials(currentEmployee.name);
    }

    // Form fields
    const editName = document.getElementById('editName');
    const editRole = document.getElementById('editRole');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');

    if (editName) editName.value = currentEmployee.name;
    if (editRole) editRole.value = currentEmployee.role || currentEmployee.position;
    if (editEmail) editEmail.value = currentEmployee.email;
    if (editPhone) editPhone.value = currentEmployee.phone;
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

async function initAttendanceSection() {
    await checkTodayAttendance();
    await renderAttendanceHistory();
    await updateAttendanceStats();
    await updateAttendanceTimer();

    // Update timer every minute
    setInterval(updateAttendanceTimer, 60000);
}

async function checkTodayAttendance() {
    const attendance = await getEmployeeAttendance();
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
    const modeSelection = document.querySelector('.work-mode-selection');

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
        if (modeSelection) modeSelection.style.display = 'none';
        cameraSection.classList.remove('active');
        infoDiv.style.display = 'block';

        document.getElementById('checkInTime').textContent = todayRecord.checkInTime || todayRecord.time;

        let locationDisplay = todayRecord.location || 'Office';
        if (todayRecord.workMode) {
            locationDisplay = `${todayRecord.workMode} (${locationDisplay})`;
        }
        document.getElementById('checkInLocation').textContent = locationDisplay;

        // Show attendance photo if available
        if (todayRecord.photo_url || todayRecord.photo) {
            document.getElementById('attendancePhoto').src = todayRecord.photo_url || todayRecord.photo;
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

        if (modeSelection) modeSelection.style.display = 'flex';
        checkoutBtn.style.display = 'none';
        timerDiv.style.display = 'none';
        infoDiv.style.display = 'none';
        lucide.createIcons();
    }
}

// Update work timer
async function updateAttendanceTimer() {
    const attendance = await getEmployeeAttendance();
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
async function confirmAttendance() {
    if (!capturedPhotoData) {
        showToast('Please capture a photo first.', 'warning');
        return;
    }

    // Show loading state
    const confirmBtn = document.getElementById('confirmAttendanceBtn');
    const originalHtml = confirmBtn.innerHTML;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> <span>Marking...</span>';
    lucide.createIcons();

    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = currentHour + (now.getMinutes() / 60);

    // Determine status
    let status = 'present';
    if (currentTime >= ATTENDANCE_CONFIG.checkInOnTime) {
        status = 'late';
    }

    // Capture location
    let location = 'Office';
    try {
        if (navigator.geolocation) {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            location = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        }
    } catch (err) {
        console.log('Location error:', err.message);
    }

    const selectedMode = document.querySelector('input[name="workMode"]:checked')?.value || 'Office';

    // Upload photo to Supabase Storage if possible
    let photoUrl = capturedPhotoData;
    try {
        if (typeof uploadFile === 'function') {
            const fileName = `attendance_${currentEmployee.id}_${Date.now()}.jpg`;
            // Convert dataURL to Blob
            const response = await fetch(capturedPhotoData);
            const blob = await response.blob();
            const uploadedUrl = await uploadFile(blob, fileName, 'attendance');
            if (uploadedUrl) photoUrl = uploadedUrl;
        }
    } catch (err) {
        console.error('Photo upload error:', err);
    }

    const newRecord = {
        employee_id: currentEmployee.id,
        date: now.toISOString(),
        check_in_time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: status,
        location: location,
        work_mode: selectedMode,
        photo_url: photoUrl
    };

    const result = await saveEmployeeAttendance(newRecord);

    addActivity('login', currentEmployee.name, `Checked in at ${newRecord.check_in_time}`);

    // Reset camera section
    document.getElementById('cameraSection').classList.remove('active');
    capturedPhotoData = null;

    await checkTodayAttendance();
    await renderAttendanceHistory();
    await updateAttendanceStats();
    await initDashboardSection();

    confirmBtn.disabled = false;
    confirmBtn.innerHTML = originalHtml;

    showToast(`Checked in at ${newRecord.check_in_time}! Work 8 hours for full day.`, 'success');
}

// Checkout function
async function checkOut() {
    const attendance = await getEmployeeAttendance();
    const today = new Date().toDateString();
    const todayRecord = attendance.find(a => new Date(a.date).toDateString() === today);

    if (!todayRecord) {
        showToast('No check-in record found for today.', 'error');
        return;
    }

    const now = new Date();
    const checkInTime = new Date(todayRecord.date);

    // Calculate hours worked
    const diffMs = now - checkInTime;
    const totalHoursNum = (diffMs / (1000 * 60 * 60));
    const totalHoursStr = totalHoursNum.toFixed(1) + ' hrs';

    // Determine final status
    let finalStatus = 'present';
    if (totalHoursNum >= ATTENDANCE_CONFIG.fullDayHours) {
        finalStatus = 'full-day';
    } else if (totalHoursNum >= ATTENDANCE_CONFIG.halfDayHours) {
        finalStatus = 'half-day';
    } else {
        finalStatus = 'partial';
    }

    // Update record in Supabase
    if (typeof supabaseClient !== 'undefined') {
        const { error } = await supabaseClient
            .from('attendance')
            .update({
                check_out_time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                total_hours: totalHoursStr,
                status: finalStatus
            })
            .eq('id', todayRecord.id);

        if (error) {
            console.error('Checkout error:', error);
            showToast('Failed to save checkout to database.', 'error');
            return;
        }
    }

    addActivity('update', currentEmployee.name, `Checked out after ${totalHoursStr}`);

    await checkTodayAttendance();
    await renderAttendanceHistory();
    await updateAttendanceStats();

    if (totalHoursNum >= ATTENDANCE_CONFIG.fullDayHours) {
        showToast(`Full day completed! Total: ${totalHoursStr} 🎉`, 'success');
    } else if (totalHoursNum >= ATTENDANCE_CONFIG.halfDayHours) {
        showToast(`Half day logged. Total: ${totalHoursStr}`, 'info');
    } else {
        showToast(`Checked out early. Total: ${totalHoursStr}`, 'warning');
    }
}

// Fallback: Mark attendance without photo
async function markAttendanceWithoutPhoto() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = currentHour + (now.getMinutes() / 60);

    // Check timing
    if (currentHour < ATTENDANCE_CONFIG.checkInStart || currentTime >= ATTENDANCE_CONFIG.checkInEnd) {
        showToast('Check-in is only available from 6 AM to 10:30 AM.', 'error');
        return;
    }

    const attendance = await getEmployeeAttendance();

    // Before 10 AM = present, 10:00-10:30 = late
    let status = 'present';
    if (currentTime >= ATTENDANCE_CONFIG.checkInOnTime) {
        status = 'late';
    }

    const newRecord = {
        employee_id: currentEmployee.id,
        date: now.toISOString(),
        check_in_time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: status,
        location: 'Office',
        work_mode: 'Office',
        photo_url: null
    };

    const result = await saveEmployeeAttendance(newRecord);

    if (result) {
        addActivity('login', currentEmployee.name, status === 'late' ? 'Checked in (Late)' : 'Checked in');

        await checkTodayAttendance();
        await renderAttendanceHistory();
        await updateAttendanceStats();
        await initDashboardSection();

        showToast(status === 'late' ? 'Checked in (Late)!' : 'Checked in successfully!', status === 'late' ? 'warning' : 'success');
    } else {
        showToast('Failed to save attendance', 'error');
    }
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

async function renderAttendanceHistory(filter = 'all') {
    const container = document.getElementById('attendanceList');
    let attendance = await getEmployeeAttendance();

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

        const photo = record.photo_url || record.photo;

        return `
        <div class="attendance-record">
            <div class="record-info">
                ${photo ? `<img src="${photo}" alt="Attendance" class="record-photo">` : ''}
                <div class="record-details">
                    <span class="record-date">${new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span class="record-time">
                        In: ${record.check_in_time || record.time}
                        ${record.check_out_time ? ` | Out: ${record.check_out_time}` : ''}
                    </span>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                        ${record.work_mode || record.workMode ? `
                            <span style="font-size: 0.7rem; color: var(--accent-cyan); background: rgba(0,212,255,0.1); padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i data-lucide="${(record.work_mode || record.workMode) === 'Office' ? 'building-2' : 'home'}" style="width: 10px; height: 10px;"></i>
                                ${record.work_mode || record.workMode}
                            </span>
                        ` : ''}
                        ${record.total_hours || record.totalHours ? `<span class="record-hours" style="margin:0;">${record.total_hours || record.totalHours}</span>` : ''}
                    </div>
                </div>
            </div>
            <span class="record-status ${statusClass}">${statusText}</span>
        </div>
    `}).join('');
    lucide.createIcons();
}

function filterAttendance() {
    const month = document.getElementById('attendanceMonth').value;
    renderAttendanceHistory(month);
}

async function updateAttendanceStats() {
    const attendance = await getEmployeeAttendance();
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

async function initWorkSection() {
    // Set today's date
    const today = new Date();
    document.getElementById('timelineDate').textContent = today.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    });

    populateTimeSelects();
    checkEditorFields();
    await renderTodayTimeline();
    await updateWorkSummary();
    renderWorkHistoryDays();
}

// Get today's timeline data from Supabase
async function getTodayTimeline() {
    const today = new Date().toISOString().split('T')[0];
    const updates = await getWorkUpdatesFromDB({ userId: currentEmployee.id });

    // Filter for today's updates and map to timeline format
    return updates
        .filter(u => u.date === today)
        .map(u => ({
            id: u.id,
            startTime: parseFloat(u.start_time),
            endTime: parseFloat(u.end_time),
            activity: u.activity,
            client: u.client,
            videoMins: u.video_mins,
            createdAt: u.created_at
        }));
}

// Add new time slot
async function addTimeSlot() {
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

    // Show loading
    const addBtn = document.querySelector('.slot-add-btn');
    const originalHtml = addBtn.innerHTML;
    addBtn.disabled = true;
    addBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i>';
    lucide.createIcons();

    const newUpdate = {
        employee_id: currentEmployee.id,
        date: new Date().toISOString().split('T')[0],
        start_time: startTime.toString(),
        end_time: endTime.toString(),
        activity: activity,
        client: client,
        video_mins: videoMins,
        status: 'completed'
    };

    const result = await addWorkUpdateToDB(newUpdate);

    if (result) {
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

        await renderTodayTimeline();
        await updateWorkSummary();

        addActivity('update', currentEmployee.name, `Logged: ${formatTime(startTime)} - ${formatTime(endTime)} → ${activity}`);
        showToast('Added to timeline!', 'success');
    } else {
        showToast('Failed to save update', 'error');
    }

    addBtn.disabled = false;
    addBtn.innerHTML = originalHtml;
    lucide.createIcons();
}

// Render today's timeline
async function renderTodayTimeline() {
    const container = document.getElementById('todayTimeline');
    const timeline = await getTodayTimeline();

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
            let durationText = '';
            const hours = Math.floor(duration);
            const mins = Math.round((duration % 1) * 60);
            if (hours > 0) durationText += `${hours}h `;
            if (mins > 0) durationText += `${mins}m`;

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
async function deleteTimeSlot(id) {
    if (!confirm('Delete this time slot?')) return;

    if (typeof supabaseClient !== 'undefined') {
        const { error } = await supabaseClient
            .from('work_updates')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete from database', 'error');
            return;
        }
    }

    await renderTodayTimeline();
    await updateWorkSummary();
    showToast('Time slot deleted', 'info');
}

// Update work summary
async function updateWorkSummary() {
    const timeline = await getTodayTimeline();

    // Total activities
    const totalSlots = timeline.length;

    // Total work hours
    const totalHours = timeline
        .reduce((sum, slot) => sum + (slot.endTime - slot.startTime), 0);

    const totalSlotsEl = document.getElementById('totalSlots');
    const totalWorkHoursEl = document.getElementById('totalWorkHours');
    const completedTasksEl = document.getElementById('completedTasks');

    if (totalSlotsEl) totalSlotsEl.textContent = totalSlots;
    if (totalWorkHoursEl) totalWorkHoursEl.textContent = `${totalHours.toFixed(1)}h`;
    if (completedTasksEl) completedTasksEl.textContent = totalSlots;
}

// Render work history (previous days)
async function renderWorkHistoryDays() {
    const container = document.getElementById('workHistoryList');
    if (!container) return;

    const updates = await getEmployeeWork();
    const days = parseInt(document.getElementById('historyDateFilter')?.value || 7);

    // Group by date
    const grouped = {};
    updates.forEach(u => {
        const dateStr = u.date; // already YYYY-MM-DD
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push({
            id: u.id,
            startTime: parseFloat(u.start_time),
            endTime: parseFloat(u.end_time),
            activity: u.activity
        });
    });

    const dates = Object.keys(grouped).sort().reverse();
    const today = new Date().toISOString().split('T')[0];

    // Filter out today and limit to requested days
    const historyDates = dates.filter(d => d !== today).slice(0, days);

    if (historyDates.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm text-center p-4">No previous work history</p>';
        return;
    }

    container.innerHTML = historyDates.map(dateStr => {
        const slots = grouped[dateStr];
        const totalHours = slots.reduce((sum, slot) => sum + (slot.endTime - slot.startTime), 0);
        const activities = slots.map(slot => slot.activity).join(' → ');

        return `
            <div class="history-day" onclick="viewDayTimeline('${dateStr}')">
                <div class="history-day-header">
                    <span class="history-date">${new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span class="history-hours">${totalHours.toFixed(1)}h • ${slots.length} activities</span>
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

function populateTimeSelects() {
    const startH = document.getElementById('slotStartHour');
    const startM = document.getElementById('slotStartMin');
    const endH = document.getElementById('slotEndHour');
    const endM = document.getElementById('slotEndMin');

    if (!startH) return;

    let hOptions = '';
    for (let i = 0; i < 24; i++) {
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
    endH.value = Math.min(now.getHours() + 1, 23);
}

// View specific day timeline
async function viewDayTimeline(dateStr) {
    const updates = await getEmployeeWork();
    const dayTimeline = updates.filter(u => u.date === dateStr);

    // Sort by start time
    dayTimeline.sort((a, b) => parseFloat(a.start_time) - parseFloat(b.start_time));

    const summary = dayTimeline.map(slot =>
        `${formatTime(parseFloat(slot.start_time))}-${formatTime(parseFloat(slot.end_time))}: ${slot.activity}`
    ).join('\n');

    alert(`Work Timeline for ${new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}:\n\n${summary}`);
}

// =============================================
// LEARNING SECTION
// =============================================

async function initLearningSection() {
    await renderLearningLogs();
    await renderCourses();
    populateLearningTimeSelects();
}

function populateLearningTimeSelects() {
    const startH = document.getElementById('manualLearnStartH');
    const startM = document.getElementById('manualLearnStartM');
    const endH = document.getElementById('manualLearnEndH');
    const endM = document.getElementById('manualLearnEndM');

    if (!startH) return;

    let hOptions = '';
    for (let i = 6; i <= 23; i++) {
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
    endH.value = Math.min(now.getHours() + 1, 23);
}

async function addManualLearningLog() {
    const topic = document.getElementById('manualLearnTopic').value.trim();
    const sH = document.getElementById('manualLearnStartH').value;
    const sM = document.getElementById('manualLearnStartM').value.padStart(2, '0');
    const eH = document.getElementById('manualLearnEndH').value;
    const eM = document.getElementById('manualLearnEndM').value.padStart(2, '0');

    if (!topic) {
        showToast('Please enter what you learned', 'warning');
        return;
    }

    const logData = {
        userId: currentEmployee.id,
        date: new Date().toISOString().split('T')[0],
        topic: topic,
        startTime: `${sH.padStart(2, '0')}:${sM}`,
        endTime: `${eH.padStart(2, '0')}:${eM}`
    };

    const result = await addLearningLogToDB(logData);

    if (result) {
        showToast('Learning activity logged manually! 📚', 'success');
        document.getElementById('manualLearnTopic').value = '';
        await renderLearningLogs();
        await initDashboardSection();
    } else {
        showToast('Failed to save learning log', 'error');
    }
}

async function renderLearningLogs() {
    const container = document.getElementById('learningLogsList');
    if (!container) return;

    const logs = await getLearningLogsFromDB(currentEmployee.id);

    if (logs.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm text-center p-4">No learning activity logged yet</p>';
        return;
    }

    // Show only today's logs or recently added
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date === today);

    if (todayLogs.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm text-center p-4">No learning activity logged today</p>';
        return;
    }

    container.innerHTML = todayLogs.map(log => `
        <div class="timeline-slot" style="margin-bottom: 10px; border-left-color: var(--accent-purple);">
            <div class="slot-time" style="min-width: 110px;">
                <span class="slot-time-range" style="font-size: 0.85rem;">${log.start_time || log.from} → ${log.end_time || log.to}</span>
            </div>
            <div class="slot-content">
                <div class="slot-activity" style="font-weight: 600;">${log.topic}</div>
            </div>
            <button class="slot-delete" onclick="deleteLearningLog(${log.id})" style="margin-left: 10px;">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

async function deleteLearningLog(id) {
    if (!confirm('Delete this learning log?')) return;
    const result = await deleteLearningLogFromDB(id);
    if (result) {
        showToast('Log deleted', 'info');
        await renderLearningLogs();
        await initDashboardSection();
    }
}

async function renderCourses() {
    const container = document.getElementById('coursesList');
    if (!container) return;

    const courses = await getEmployeeCourses();
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
    await updateLearningProgress();
}

async function updateLearningProgress() {
    const courses = await getEmployeeCourses();
    const completed = courses.filter(c => c.progress === 100).length;
    const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const total = courses.length;

    const avgProgress = total > 0
        ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / total)
        : 0;

    const compEl = document.getElementById('completedCourses');
    const inProgEl = document.getElementById('inProgressCourses');
    const totalEl = document.getElementById('totalCourses');
    const overallEl = document.getElementById('overallLearningProgress');

    if (compEl) compEl.textContent = completed;
    if (inProgEl) inProgEl.textContent = inProgress;
    if (totalEl) totalEl.textContent = total;
    if (overallEl) overallEl.textContent = avgProgress + '%';

    // Update circle progress
    const circle = document.getElementById('progressCircle');
    if (circle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (avgProgress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

async function calculateLearningProgress() {
    const courses = await getEmployeeCourses();
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length);
}

// Course Content Library - Field Specific
const COURSE_LIBRARY = {};

async function openCourse(id) {
    const courses = await getEmployeeCourses();
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

async function loadModuleContent(courseId, moduleIndex) {
    const courses = await getEmployeeCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.modules[moduleIndex]) return;
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

async function markModuleComplete(courseId, index) {
    const sH = document.getElementById('learnStartH').value;
    const sM = document.getElementById('learnStartM').value.padStart(2, '0');
    const eH = document.getElementById('learnEndH').value;
    const eM = document.getElementById('learnEndM').value.padStart(2, '0');

    // Fetch courses to get module info
    const courses = await getEmployeeCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.modules[index]) return;
    const module = course.modules[index];

    // 1. Create learning log
    const logData = {
        userId: currentEmployee.id,
        date: new Date().toISOString().split('T')[0],
        topic: `${course.title}: ${module.title}`,
        startTime: `${sH.padStart(2, '0')}:${sM}`,
        endTime: `${eH.padStart(2, '0')}:${eM}`
    };

    const logResult = await addLearningLogToDB(logData);

    // 2. Update progress in DB
    const progressPerModule = 100 / course.modules.length;
    const currentProgress = course.progress;
    const nextProgress = Math.min(Math.round(currentProgress + progressPerModule), 100);

    const progressResult = await updateLearningProgressInDB(currentEmployee.id, courseId, {
        progress: nextProgress,
        status: nextProgress === 100 ? 'completed' : 'in_progress'
    });

    if (logResult || progressResult) {
        showToast('Module completed and logged! 📚', 'success');
        await renderCourses();
        await renderLearningLogs();
        await initDashboardSection();

        // Refresh detail view
        loadModuleContent(courseId, index);
    } else {
        showToast('Failed to save completion status', 'error');
    }
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

async function initChatSection() {
    await renderTeamList();
    await renderMessages();

    // Subscribe to real-time updates
    if (typeof subscribeToMessages === 'function') {
        subscribeToMessages(() => {
            renderMessages();
            renderTeamList();
        });
    }
}

async function renderTeamList() {
    const container = document.getElementById('teamList');
    if (!container) return;

    // Fetch from Supabase
    let employees = [];
    if (typeof getEmployeesFromDB === 'function') {
        employees = await getEmployeesFromDB();
    } else {
        employees = getEmployees();
    }

    const messages = await getChatMessages();

    // Add admin
    const teamMembers = [
        { id: 0, name: 'Admin', role: 'Administrator', position: 'Administrator', department: 'Management', isAdmin: true }
    ];

    employees.forEach(emp => {
        if (emp.id !== currentEmployee.id) {
            // Unread logic (placeholder for now)
            const unread = 0;
            teamMembers.push({ ...emp, unread });
        }
    });

    container.innerHTML = teamMembers.map(member => `
        <div class="chat-item ${selectedChatRecipient === member.id ? 'active' : ''}" onclick="selectRecipient(${member.id}, '${member.name}')" 
             style="padding: 8px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s; position: relative;">
            <div class="member-avatar" style="width: 28px; height: 28px; background: ${member.isAdmin ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.7rem; color: white; position: relative;">
                ${getInitials(member.name)}
                ${member.status === 'active' || member.isAdmin ? '<span class="online-dot" style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; background: #34a853; border: 2px solid #0a1628; border-radius: 50%;"></span>' : ''}
            </div>
            <div class="member-info" style="flex: 1; overflow: hidden;">
                <div class="member-name" style="font-size: 0.85rem; color: ${selectedChatRecipient === member.id ? 'white' : 'rgba(255,255,255,0.7)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: ${member.unread > 0 ? '700' : '400'};">${member.name}</div>
            </div>
            ${member.unread > 0 ? `<span class="unread-badge" style="background: var(--accent-cyan); color: var(--bg-dark); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px;">${member.unread}</span>` : ''}
        </div>
    `).join('');
}

async function selectRecipient(id, name) {
    selectedChatRecipient = id;
    await renderTeamList();

    const header = document.getElementById('chatHeader');
    header.innerHTML = `
        <div class="recipient-meta" style="display: flex; align-items: center; gap: 12px;">
            <div class="recipient-avatar" style="width: 36px; height: 36px; background: ${id === null ? 'var(--gradient-primary)' : 'var(--gradient-accent)'}; border-radius: ${id === null ? '8px' : '50%'}; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; color: ${id === null ? 'white' : 'var(--bg-dark)'};">
                ${id === null ? '<i data-lucide="hash" style="width: 18px;"></i>' : getInitials(name)}
            </div>
            <div class="recipient-status">
                <h4 style="font-size: 1rem; color: #1f1f1f; font-weight: 500;">${name}</h4>
                <span style="font-size: 0.75rem; color: #5f6368; display: flex; align-items: center; gap: 4px;">${id === null ? 'Public Space' : (id === 0 ? 'Administrator' : 'Active now')}</span>
            </div>
        </div>
        <div class="header-actions" style="display: flex; gap: 16px; color: #5f6368;">
            <i data-lucide="video" style="width: 20px; cursor: pointer;"></i>
            <i data-lucide="star" style="width: 20px; cursor: pointer;"></i>
            <i data-lucide="more-vertical" style="width: 20px; cursor: pointer;"></i>
        </div>
    `;

    await renderMessages();
    lucide.createIcons();
}

async function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const messages = await getChatMessages();

    // Show team chat or specific conversation
    let filteredMessages;
    if (selectedChatRecipient === null) {
        filteredMessages = messages.filter(m => m.is_team_chat || m.isTeamChat);
    } else {
        filteredMessages = messages.filter(m =>
            (m.user_id == currentEmployee.id && m.recipient_id == selectedChatRecipient) ||
            (m.user_id == selectedChatRecipient && m.recipient_id == currentEmployee.id) ||
            (m.from == currentEmployee.id && m.to == selectedChatRecipient) ||
            (m.from == selectedChatRecipient && m.to == currentEmployee.id)
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
        const senderId = msg.user_id || msg.from;
        const senderName = msg.user_name || msg.userName || (senderId === 0 ? 'Admin' : 'User');
        const isSent = senderId == currentEmployee.id;

        const initials = getInitials(senderName);
        const content = msg.content || msg.text || '';
        const messageText = content.replace(/@(\w+)/g, '<span class="mention" style="color: #1a73e8; font-weight: 600; cursor: pointer;">@$1</span>');
        const timestamp = msg.created_at || msg.timestamp;

        return `
            <div class="message-group" style="display: flex; gap: 12px; ${isSent ? 'flex-direction: row-reverse;' : ''} margin-bottom: 15px;">
                <div class="user-avatar" style="width: 32px; height: 32px; background: ${isSent ? 'var(--gradient-accent)' : '#e8eaed'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: ${isSent ? 'var(--bg-dark)' : '#5f6368'}; flex-shrink: 0;">
                    ${initials}
                </div>
                <div class="message-bubble-wrapper" style="max-width: 70%; display: flex; flex-direction: column; gap: 4px; ${isSent ? 'align-items: flex-end;' : ''}">
                    <div class="message-meta" style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #3c4043;">${senderName}</span>
                        <span style="font-size: 0.7rem; color: #70757a;">${timeAgo(timestamp)}</span>
                    </div>
                    <div class="message-bubble" style="background: ${isSent ? '#e8f0fe' : '#ffffff'}; padding: 8px 16px; border-radius: 12px; border: 1px solid ${isSent ? '#d2e3fc' : '#dadce0'}; color: #1f1f1f; font-size: 0.9rem; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        ${messageText}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

async function filterTeamMembers() {
    const search = document.getElementById('chatSearch').value.toLowerCase();

    let employees = [];
    if (typeof getEmployeesFromDB === 'function') {
        employees = await getEmployeesFromDB();
    } else {
        employees = getEmployees();
    }

    const filtered = employees.filter(emp =>
        emp.id !== currentEmployee.id &&
        emp.name.toLowerCase().includes(search)
    );

    // Re-render filtered list (simplified)
    const container = document.getElementById('teamList');
    if (!container) return;

    container.innerHTML = filtered.map(emp => `
        <div class="chat-item ${selectedChatRecipient === emp.id ? 'active' : ''}" onclick="selectRecipient(${emp.id}, '${emp.name}')" 
             style="padding: 8px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <div class="member-avatar" style="width: 28px; height: 28px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: white;">
                ${getInitials(emp.name)}
            </div>
            <div class="member-info">
                <div class="member-name" style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">${emp.name}</div>
            </div>
        </div>
    `).join('');
}

async function checkMention() {
    const input = document.getElementById('messageInput');
    const suggestions = document.getElementById('mentionSuggestions');
    if (!input || !suggestions) return;

    const text = input.value;
    const mentionMatch = text.match(/@(\w*)$/);

    if (mentionMatch) {
        const query = mentionMatch[1].toLowerCase();

        let employees = [];
        if (typeof getEmployeesFromDB === 'function') {
            employees = await getEmployeesFromDB();
        } else {
            employees = getEmployees();
        }

        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(query) && emp.id !== currentEmployee.id
        );

        // Add admin
        const allMembers = [{ id: 0, name: 'Admin', role: 'Administrator' }, ...filtered];

        if (allMembers.length > 0) {
            suggestions.innerHTML = allMembers.map(m => `
                <div class="mention-item" onclick="insertMention('${m.name}')" style="display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer;">
                    <div class="member-avatar" style="width: 24px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem;">${getInitials(m.name)}</div>
                    <div class="member-info">
                        <span class="member-name" style="font-size: 0.8rem; display: block;">${m.name}</span>
                        <span class="member-role" style="font-size: 0.65rem; color: rgba(255,255,255,0.5);">${m.role || m.position || ''}</span>
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

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text) return;

    const messageData = {
        userId: currentEmployee.id,
        userName: currentEmployee.name,
        recipientId: selectedChatRecipient,
        content: text,
        isTeamChat: selectedChatRecipient === null,
        type: 'text'
    };

    const result = await saveChatMessages(messageData);

    if (result) {
        input.value = '';
        await renderMessages();

        // Check for mentions
        if (text.includes('@')) {
            addActivity('update', currentEmployee.name, `Mentioned team members in chat`);
        }
    } else {
        showToast('Failed to send message', 'error');
    }
}

function showEmoji() {
    showToast('Emoji picker coming soon!', 'info');
}

// =============================================
// FORM HANDLERS
// =============================================

function setupFormHandlers() {
    // Personal form
    const personalForm = document.getElementById('personalForm');
    if (personalForm) {
        personalForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const updatedData = {
                phone: document.getElementById('editPhone').value,
                bio: document.getElementById('editBio') ? document.getElementById('editBio').value : currentEmployee.bio
            };

            const result = await updateEmployeeInDB(currentEmployee.id, updatedData);

            if (result) {
                currentEmployee = { ...currentEmployee, ...updatedData };

                // Update session storage to persist across refresh
                sessionStorage.setItem('employeeData', JSON.stringify(currentEmployee));

                addActivity('profile', currentEmployee.name, 'Updated profile information');
                await initProfileSection();
                await initDashboard();
                showToast('Profile updated successfully!', 'success');
            } else {
                showToast('Failed to update profile', 'error');
            }
        });
    }

    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function (e) {
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

            const result = await updateEmployeeInDB(currentEmployee.id, { password: newPass });

            if (result) {
                currentEmployee.password = newPass;
                addActivity('profile', currentEmployee.name, 'Changed password');
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                showToast('Password updated successfully!', 'success');
            } else {
                showToast('Failed to update password', 'error');
            }
        });
    }

    // Work form
    const workForm = document.getElementById('workForm');
    if (workForm) {
        workForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const newWork = {
                userId: currentEmployee.id,
                title: document.getElementById('workTitle').value,
                description: document.getElementById('workDescription').value,
                category: document.getElementById('workCategory').value,
                status: document.getElementById('workStatus').value
            };

            const result = await addWorkUpdateToDB(newWork);

            if (result) {
                addActivity('update', currentEmployee.name, `Added work update: ${newWork.title}`);
                this.reset();
                await renderWorkHistory();
                await initDashboardSection();
                showToast('Work update added!', 'success');
            } else {
                showToast('Failed to save work update', 'error');
            }
        });
    }

    // Event form
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const newEvent = {
                userId: currentEmployee.id,
                title: document.getElementById('eventTitle').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                description: document.getElementById('eventDescription').value
            };

            // For now, save events to localStorage (or implement if common helper exists)
            const events = await getEmployeeEvents();
            events.push({ id: Date.now(), ...newEvent });
            saveEmployeeEvents(events);

            this.reset();
            if (typeof closeEventModal === 'function') closeEventModal();
            renderCalendar();
            renderEvents();
            await initDashboardSection();

            showToast('Event added!', 'success');
        });
    }
}

// =============================================
// DATA HELPERS (UPDATED TO USE SUPABASE)
// =============================================

async function getEmployeeAttendance() {
    return await getAttendanceFromDB({ userId: currentEmployee.id });
}

async function saveEmployeeAttendance(record) {
    // Note: JS helper already handles adding to DB
    return await addAttendanceToDB(record);
}

async function getEmployeeWork() {
    return await getWorkUpdatesFromDB({ userId: currentEmployee.id });
}

async function saveEmployeeWork(workUpdate) {
    return await addWorkUpdateToDB(workUpdate);
}

async function getEmployeeCourses() {
    if (!currentEmployee) return [];

    // 1. Get field-specific modules from LEARNING_DATA
    const field = currentEmployee.field || 'digital_marketing';
    const fieldData = LEARNING_DATA[field] || LEARNING_DATA.digital_marketing;

    // 2. Map to course structure
    const courses = fieldData.modules.map(m => ({
        id: m.id,
        title: m.title,
        description: (m.topics || []).map(t => t.title).slice(0, 3).join(', ') + '...',
        icon: m.icon || 'book-open',
        modules: (m.topics || []).map(t => ({ title: t.title, content: t.desc })),
        progress: 0
    }));

    // 3. Fetch progress from Supabase
    const dbProgress = await getLearningProgressFromDB(currentEmployee.id);

    // 4. Merge progress
    courses.forEach(course => {
        const p = dbProgress.find(dp => dp.module_id === course.id);
        if (p) course.progress = p.progress;
    });

    return courses;
}

async function getEmployeeEvents() {
    // For now, keep events in localStorage until we add events table to supabase helper
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

async function getChatMessages() {
    return await getMessagesFromDB(50);
}

async function saveChatMessages(messageData) {
    return await addMessageToDB(messageData);
}

async function getUnreadMessages() {
    const messages = await getChatMessages();
    // Simplified unread check for now
    return 0;
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

// =============================================
// PROFILE PHOTO & BIO FUNCTIONS
// =============================================

function triggerDashboardPhotoUpload() {
    document.getElementById('dashboardPhotoInput').click();
}

async function handleDashboardPhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showToast('Photo must be less than 2MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const base64 = e.target.result;

        // 1. Save to Supabase
        const result = await updateEmployeeInDB(currentEmployee.id, { profile_photo: base64 });

        if (result) {
            // 2. Save to localStorage fallback
            localStorage.setItem(`profile_photo_${currentEmployee.id}`, base64);
            currentEmployee.profile_photo = base64;

            // 3. Update display
            displayDashboardPhoto(base64);
            showToast('Profile photo updated!', 'success');
        } else {
            showToast('Failed to save photo to database', 'error');
        }
    };
    reader.readAsDataURL(file);
}

function displayDashboardPhoto(base64) {
    if (!base64) return;

    // 1. Profile Page / Main Area components
    const dashboardPhoto = document.getElementById('dashboardProfilePhoto');
    const avatarInitials = document.getElementById('avatarInitials');
    if (dashboardPhoto) {
        dashboardPhoto.src = base64;
        dashboardPhoto.style.display = 'block';
        if (avatarInitials) avatarInitials.style.display = 'none';
    }

    // 2. Sidebar Avatar
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) {
        sidebarAvatar.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        sidebarAvatar.style.background = 'transparent';
    }

    // 3. Header Avatar
    const headerAvatar = document.querySelector('.header-avatar');
    if (headerAvatar) {
        headerAvatar.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        headerAvatar.style.background = 'transparent';
    }

    // 4. Profile Section Large Avatar
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
}

function loadDashboardProfilePhoto() {
    if (!currentEmployee) return;

    const savedPhoto = localStorage.getItem(`profile_photo_${currentEmployee.id}`);
    if (savedPhoto) {
        displayDashboardPhoto(savedPhoto);
    }
}

function loadProfileData() {
    if (!currentEmployee) return;

    // Load saved profile data
    const savedProfile = JSON.parse(localStorage.getItem(`user_profile_${currentEmployee.id}`) || '{}');

    const bioEl = document.getElementById('editBio');
    const linkedinEl = document.getElementById('editLinkedin');
    const phoneEl = document.getElementById('editPhone');

    if (bioEl) bioEl.value = savedProfile.bio || '';
    if (linkedinEl) linkedinEl.value = savedProfile.linkedin || '';
    if (phoneEl && savedProfile.phone) phoneEl.value = savedProfile.phone;
}

// Add hover effect CSS
document.addEventListener('DOMContentLoaded', function () {
    const style = document.createElement('style');
    style.textContent = `
        .profile-avatar-large:hover .photo-overlay {
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);
});
