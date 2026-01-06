document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat Initializing...');
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (e) {
        console.error('Lucide error:', e);
    }
    initChat();
});

let currentRecipient = { id: 'team-general', name: 'General Team Chat', type: 'space' };
let currentUser = null;

function initChat() {
    console.log('--- Chat System Check ---');

    // 1. Check Auth Status
    if (!sessionStorage.getItem('employeeLoggedIn')) {
        console.warn('User not logged in, redirecting...');
        window.location.href = 'login.html';
        return;
    }

    // 2. Load User Data
    try {
        const employeeId = parseInt(sessionStorage.getItem('employeeId'));
        if (typeof getEmployees === 'function') {
            const employees = getEmployees();
            currentUser = employees.find(emp => emp.id === employeeId);
        }

        if (!currentUser) {
            console.error('Current user session lost');
            window.location.href = 'login.html';
            return;
        }
        console.log('Logged in as:', currentUser.name);
    } catch (e) {
        console.error('Auth check error:', e);
        window.location.href = 'login.html';
        return;
    }

    // Update UI with User Info
    const railAvatar = document.getElementById('railUserAvatar');
    if (railAvatar) railAvatar.textContent = getInitials(currentUser.name);

    // 3. Populate Team List
    populateTeamList();

    // 3.5 Render Custom Spaces
    renderCustomSpaces();

    // 4. Setup Listeners
    setupListeners();

    // 5. Initial Render
    switchToSpace('team-general');

    console.log('Chat System Ready.');
    showChatToast('Welcome back, ' + currentUser.name + '!');
}

function clearChatHistory() {
    if (confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
        localStorage.removeItem('chatMessages');
        renderMessages();
        showChatToast('Chat history cleared.');
    }
}

function getInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().substring(0, 2);
}

function populateTeamList() {
    const dmList = document.getElementById('dm-list');
    if (!dmList) return;

    let employees = [];
    try {
        if (typeof getEmployees === 'function') {
            employees = getEmployees();
        }
    } catch (e) {
        console.error('Failed to get employees:', e);
    }

    // Fallback: If no employees found, create some defaults for demo
    if (!employees || employees.length === 0) {
        employees = [
            { id: 101, name: 'Sajeth Official', department: 'Management' },
            { id: 102, name: 'Rahul Team', department: 'Operations' },
            { id: 103, name: 'Admin Support', department: 'IT' }
        ];
        if (typeof saveEmployees === 'function') saveEmployees(employees);
    }

    if (!currentUser) {
        // Safe check if we somehow lost currentUser session but didn't redirect
        currentUser = employees[0] || { id: 999, name: 'Guest' };
    }

    // Filter out current user
    const otherTeamWork = employees.filter(emp => String(emp.id) !== String(currentUser.id));

    if (otherTeamWork.length === 0) {
        dmList.innerHTML = '<div class="list-item">Working alone today</div>';
        return;
    }

    dmList.innerHTML = otherTeamWork.map(emp => {
        // Sanitize name for JS string
        const safeName = emp.name.replace(/'/g, "\\'");
        return `
            <div class="list-item" onclick="switchToUser(${emp.id}, '${safeName}')" id="user-${emp.id}">
                <div class="item-avatar" style="background-color: ${stringToColor(emp.name)}">${getInitials(emp.name)}</div>
                <span class="item-name">${emp.name}</span>
            </div>
        `;
    }).join('');
}

function setupListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const emojiTrigger = document.getElementById('emojiTrigger');
    const emojiPicker = document.getElementById('emojiPicker');
    const addMoreTrigger = document.getElementById('addMoreTrigger');
    const addMoreMenu = document.getElementById('addMoreMenu');

    // Create Space Button
    const createSpaceBtn = document.getElementById('createSpaceBtn');
    if (createSpaceBtn) {
        createSpaceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Create space button clicked');
            openCreateGroup();
        });
    }

    // Header Actions
    const headerVideoBtn = document.getElementById('headerVideoBtn');
    if (headerVideoBtn) {
        headerVideoBtn.addEventListener('click', () => handleMoreAction('video'));
    }

    const headerAddUserBtn = document.getElementById('headerAddUserBtn');
    if (headerAddUserBtn) {
        headerAddUserBtn.addEventListener('click', () => showChatToast('Add to space feature coming soon!'));
    }

    const headerSearchBtn = document.getElementById('headerSearchBtn');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('chatSearch');
            if (searchInput) searchInput.focus();
        });
    }

    const headerMoreBtn = document.getElementById('headerMoreBtn');
    if (headerMoreBtn) {
        headerMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearChatHistory();
        });
    }

    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (emojiTrigger && emojiPicker) {
        emojiTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (addMoreMenu) addMoreMenu.classList.add('hidden');
            const isHidden = emojiPicker.classList.contains('hidden');
            emojiPicker.style.display = isHidden ? 'grid' : 'none'; // Force grid on show
            emojiPicker.classList.toggle('hidden', !isHidden);
        });

        document.addEventListener('click', () => {
            emojiPicker.classList.add('hidden');
        });

        emojiPicker.addEventListener('click', (e) => e.stopPropagation());
    }

    if (addMoreTrigger && addMoreMenu) {
        addMoreTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (emojiPicker) emojiPicker.classList.add('hidden');
            const isHidden = addMoreMenu.classList.contains('hidden');
            addMoreMenu.classList.toggle('hidden', !isHidden);
        });

        document.addEventListener('click', () => {
            addMoreMenu.classList.add('hidden');
        });

        addMoreMenu.addEventListener('click', (e) => e.stopPropagation());
    }
}

function handleMoreAction(type) {
    console.log('Action triggered:', type);
    const menu = document.getElementById('addMoreMenu');
    if (menu) menu.classList.add('hidden');

    if (type === 'video') {
        // Use Google Meet's direct "new meeting" URL
        sendMessage({ uploadType: 'system', name: 'Created a new Google Meet', link: 'https://meet.google.com/new' });
        showChatToast("Meeting link shared!");
        return;
    }

    if (type === 'calendar') {
        // Show the scheduler modal
        openScheduler();
        return;
    }

    if (type === 'task') {
        // Show the task modal
        openTaskModal();
        return;
    }
}

function openTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        // Reset form
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskPriority').value = 'medium';

        // Set default due date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('taskDueDate').value = tomorrow.toISOString().split('T')[0];

        // Populate assignee dropdown
        populateTaskAssignees();

        // Re-render icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function populateTaskAssignees() {
    const select = document.getElementById('taskAssignee');
    if (!select) return;

    let employees = [];
    try {
        if (typeof getEmployees === 'function') {
            employees = getEmployees();
        }
    } catch (e) {
        console.error('Failed to get employees:', e);
    }

    select.innerHTML = '<option value="">Select member...</option>';

    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = emp.name;
        select.appendChild(option);
    });
}

function assignTask() {
    const title = document.getElementById('taskTitle')?.value.trim();
    const description = document.getElementById('taskDescription')?.value.trim();
    const assigneeId = document.getElementById('taskAssignee')?.value;
    const priority = document.getElementById('taskPriority')?.value || 'medium';
    const dueDate = document.getElementById('taskDueDate')?.value;

    if (!title) {
        showChatToast('Please enter a task title');
        return;
    }

    // Get assignee name
    let assigneeName = 'Team';
    if (assigneeId) {
        try {
            const employees = getEmployees();
            const assignee = employees.find(e => e.id == assigneeId);
            if (assignee) assigneeName = assignee.name;
        } catch (e) { }
    }

    // Format priority icon
    const priorityIcons = { low: '🟢', medium: '🟡', high: '🔴' };
    const priorityIcon = priorityIcons[priority] || '🟡';

    // Format due date
    let dueDateText = '';
    if (dueDate) {
        const d = new Date(dueDate);
        dueDateText = ` • Due: ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    // Create task message
    const taskMessage = `${priorityIcon} Task: ${title}\n📋 Assigned to: ${assigneeName}${dueDateText}${description ? '\n📝 ' + description : ''}`;

    // Close modal
    closeTaskModal();

    // Send message
    sendMessage({
        uploadType: 'system',
        name: taskMessage,
        link: ''
    });

    showChatToast(`Task assigned to ${assigneeName}!`);
}

function openScheduler() {
    const modal = document.getElementById('schedulerModal');
    if (modal) {
        modal.classList.remove('hidden');

        // Set default date to today
        const today = new Date();
        const dateInput = document.getElementById('meetingDate');
        if (dateInput) {
            dateInput.value = today.toISOString().split('T')[0];
        }

        // Set default time to next hour
        const timeInput = document.getElementById('meetingTime');
        if (timeInput) {
            const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
            timeInput.value = nextHour.toTimeString().substring(0, 5);
        }

        // Re-render icons in modal
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function closeScheduler() {
    const modal = document.getElementById('schedulerModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function bookMeeting() {
    const title = document.getElementById('meetingTitle')?.value || 'Team Meeting';
    const date = document.getElementById('meetingDate')?.value;
    const time = document.getElementById('meetingTime')?.value;
    const duration = parseInt(document.getElementById('meetingDuration')?.value || '60');

    if (!date || !time) {
        showChatToast('Please select date and time');
        return;
    }

    // Create start and end times
    const startDate = new Date(`${date}T${time}`);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    // Format for Google Calendar URL (YYYYMMDDTHHMMSS)
    const formatGCalDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const startStr = formatGCalDate(startDate);
    const endStr = formatGCalDate(endDate);

    // Build Google Calendar URL
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent('Meeting scheduled via Grofast Team Chat')}&add=${encodeURIComponent(currentRecipient.name)}`;

    // Close modal
    closeScheduler();

    // Send message to chat
    const formattedDate = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formattedTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    sendMessage({
        uploadType: 'system',
        name: `📅 ${title} - ${formattedDate} at ${formattedTime}`,
        link: calendarUrl
    });

    // Open Google Calendar in new tab
    window.open(calendarUrl, '_blank');
    showChatToast("Meeting scheduled!");
}

// =============================================
// GROUP/SPACE CREATION
// =============================================

let selectedGroupIcon = 'hash';

function openCreateGroup() {
    console.log('openCreateGroup called');
    const modal = document.getElementById('createGroupModal');
    console.log('Modal found:', modal);

    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Force display

        // Reset form
        const nameInput = document.getElementById('groupName');
        if (nameInput) nameInput.value = '';
        selectedGroupIcon = 'hash';

        // Populate members list
        populateMembersList();

        // Re-render icons
        if (typeof lucide !== 'undefined') lucide.createIcons();

        console.log('Modal should be visible now');
    } else {
        console.error('Create group modal not found!');
        showChatToast('Error: Could not open create space dialog');
    }
}

function closeCreateGroup() {
    const modal = document.getElementById('createGroupModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function selectGroupIcon(icon) {
    selectedGroupIcon = icon;

    // Update UI
    document.querySelectorAll('.icon-choice').forEach(btn => {
        if (btn.dataset.icon === icon) {
            btn.style.border = '2px solid #1a73e8';
            btn.style.background = '#e8f0fe';
        } else {
            btn.style.border = '1px solid #dadce0';
            btn.style.background = 'white';
        }
    });
}

function populateMembersList() {
    const container = document.getElementById('membersList');
    if (!container) return;

    let employees = [];
    try {
        if (typeof getEmployees === 'function') {
            employees = getEmployees();
        }
    } catch (e) {
        console.error('Failed to get employees:', e);
    }

    if (!employees || employees.length === 0) {
        container.innerHTML = '<div style="padding: 8px; color: #5f6368;">No team members found</div>';
        return;
    }

    container.innerHTML = employees.map(emp => `
        <label style="display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" 
               onmouseover="this.style.background='#f1f3f4'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" name="groupMember" value="${emp.id}" style="width: 16px; height: 16px; accent-color: #1a73e8;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${stringToColor(emp.name)}; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 600;">${getInitials(emp.name)}</div>
            <span style="font-size: 14px; color: #3c4043;">${emp.name}</span>
        </label>
    `).join('');
}

function createGroup() {
    const nameInput = document.getElementById('groupName');
    const name = nameInput?.value.trim();

    if (!name) {
        showChatToast('Please enter a space name');
        return;
    }

    // Get selected members
    const checkboxes = document.querySelectorAll('input[name="groupMember"]:checked');
    const memberIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    // Always include current user as a member
    if (currentUser && !memberIds.includes(currentUser.id)) {
        memberIds.push(currentUser.id);
    }

    // Create group object
    const newGroup = {
        id: 'custom-' + Date.now(),
        name: name,
        icon: selectedGroupIcon,
        members: memberIds,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id
    };

    // Save to localStorage
    const groups = JSON.parse(localStorage.getItem('chatGroups') || '[]');
    groups.push(newGroup);
    localStorage.setItem('chatGroups', JSON.stringify(groups));

    // Close modal
    closeCreateGroup();

    // Refresh spaces list
    renderCustomSpaces();

    // Switch to new group
    switchToSpace(newGroup.id);

    showChatToast(`Space "${name}" created!`);
}

function renderCustomSpaces() {
    const container = document.getElementById('custom-spaces-list');
    if (!container) return;

    const allGroups = JSON.parse(localStorage.getItem('chatGroups') || '[]');

    // Filter groups - only show spaces where current user is a member or creator
    const myGroups = allGroups.filter(group => {
        // User is the creator
        if (group.createdBy === currentUser?.id) return true;

        // User is in the members list
        if (group.members && group.members.includes(currentUser?.id)) return true;

        return false;
    });

    if (myGroups.length === 0) {
        container.innerHTML = '';
        return;
    }

    const colors = ['#1a73e8', '#1e8e3e', '#a142f4', '#ea4335', '#fbbc04'];

    container.innerHTML = myGroups.map((group, index) => `
        <div class="list-item" onclick="switchToSpace('${group.id}')" id="space-${group.id}">
            <div class="item-icon-box" style="background-color: ${colors[index % colors.length]};">
                <i data-lucide="${group.icon || 'hash'}"></i>
            </div>
            <span class="item-name">${group.name}</span>
        </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showChatToast(text) {
    // Remove existing toast if any
    const oldToast = document.querySelector('.chat-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'chat-toast';
    toast.textContent = text;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleSection(id) {
    const el = document.getElementById(id);
    if (el && el.parentElement) {
        el.parentElement.classList.toggle('collapsed');
    }
}

function addEmoji(emoji) {
    const input = document.getElementById('messageInput');
    if (input) {
        input.value += emoji;
        input.focus();
    }
}

function handleFileUpload(input, type) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            content: e.target.result,
            uploadType: type
        };
        sendMessage(fileData);
        input.value = ''; // Reset input
    };

    if (type === 'image') {
        reader.readAsDataURL(file);
    } else {
        // For files, we just store the name and a dummy "attached" state for demo
        sendMessage({ name: file.name, uploadType: 'file' });
        input.value = '';
    }
}

function switchToSpace(id) {
    const defaultSpaces = {
        'team-general': 'General Team Chat',
        'announcements': 'Announcements',
        'projects': 'Active Projects'
    };

    let spaceName = defaultSpaces[id];

    // Check if it's a custom group
    if (!spaceName && id.startsWith('custom-')) {
        const groups = JSON.parse(localStorage.getItem('chatGroups') || '[]');
        const group = groups.find(g => g.id === id);
        if (group) {
            spaceName = group.name;
        }
    }

    currentRecipient = { id, name: spaceName || 'Space', type: 'space' };
    updateActiveState();
    updateHeader();
    renderMessages();
}

let viewingProfileUser = null;
let isEditingProfile = false;

function switchToUser(id, name) {
    // Show profile modal instead of directly switching
    openProfileModal(id, name);
}

function openProfileModal(userId, userName) {
    console.log('Opening profile modal for:', userId, userName);
    const modal = document.getElementById('profileModal');

    if (!modal) {
        console.error('Profile modal not found!');
        // Fallback to direct chat
        currentRecipient = { id: userId, name: userName, type: 'user' };
        updateActiveState();
        updateHeader();
        renderMessages();
        return;
    }

    // Get employee data
    let employees = [];
    try {
        if (typeof getEmployees === 'function') {
            employees = getEmployees();
        }
    } catch (e) { }

    const employee = employees.find(e => e.id == userId) || { id: userId, name: userName };
    viewingProfileUser = employee;

    // Load saved profile data
    const savedProfile = JSON.parse(localStorage.getItem(`user_profile_${userId}`) || '{}');

    // Set modal data
    document.getElementById('profileModalName').textContent = employee.name || 'Unknown';
    document.getElementById('profileModalPosition').textContent = savedProfile.position || employee.position || 'Team Member';
    document.getElementById('profileModalEmail').textContent = employee.email || 'Not provided';
    document.getElementById('profileModalPhone').textContent = savedProfile.phone || employee.phone || 'Not provided';
    document.getElementById('profileModalBio').textContent = savedProfile.bio || 'No bio added yet.';

    // Set initials
    const initials = (employee.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('profileModalInitials').textContent = initials;

    // Load photo if exists
    const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
    const photoEl = document.getElementById('profileModalPhoto');
    const initialsEl = document.getElementById('profileModalInitials');
    if (savedPhoto) {
        photoEl.src = savedPhoto;
        photoEl.style.display = 'block';
        initialsEl.style.display = 'none';
    } else {
        photoEl.style.display = 'none';
        initialsEl.style.display = 'block';
    }

    // Set social links
    const linkedin = document.getElementById('socialLinkedin');
    const twitter = document.getElementById('socialTwitter');
    const instagram = document.getElementById('socialInstagram');

    if (linkedin) linkedin.href = savedProfile.linkedin || '#';
    if (twitter) twitter.href = savedProfile.twitter || '#';
    if (instagram) instagram.href = savedProfile.instagram || '#';

    // Show/hide edit button based on if viewing own profile
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.style.display = (currentUser && currentUser.id == userId) ? 'flex' : 'none';
    }

    // Reset edit mode
    isEditingProfile = false;
    showViewMode();

    // Show modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
    isEditingProfile = false;
}

function startChatWith() {
    if (viewingProfileUser) {
        closeProfileModal();
        currentRecipient = { id: viewingProfileUser.id, name: viewingProfileUser.name, type: 'user' };
        updateActiveState();
        updateHeader();
        renderMessages();
    }
}

function toggleEditProfile() {
    isEditingProfile = !isEditingProfile;
    if (isEditingProfile) {
        showEditMode();
    } else {
        showViewMode();
    }
}

function showEditMode() {
    const savedProfile = JSON.parse(localStorage.getItem(`user_profile_${viewingProfileUser.id}`) || '{}');

    // Hide view elements, show edit elements
    document.getElementById('profileModalBio').style.display = 'none';
    document.getElementById('profileModalBioEdit').style.display = 'block';
    document.getElementById('profileModalBioEdit').value = savedProfile.bio || '';

    document.getElementById('profileModalPhone').style.display = 'none';
    document.getElementById('profileModalPhoneEdit').style.display = 'block';
    document.getElementById('profileModalPhoneEdit').value = savedProfile.phone || '';

    const linkedinView = document.getElementById('linkedinView');
    const linkedinEdit = document.getElementById('linkedinEdit');
    const editLinkedin = document.getElementById('editLinkedin');
    if (linkedinView) linkedinView.style.display = 'none';
    if (linkedinEdit) linkedinEdit.style.display = 'block';
    if (editLinkedin) editLinkedin.value = savedProfile.linkedin || '';

    document.getElementById('profileViewActions').style.display = 'none';
    document.getElementById('profileEditActions').style.display = 'flex';
}

function showViewMode() {
    document.getElementById('profileModalBio').style.display = 'block';
    document.getElementById('profileModalBioEdit').style.display = 'none';

    document.getElementById('profileModalPhone').style.display = 'block';
    document.getElementById('profileModalPhoneEdit').style.display = 'none';

    const linkedinView = document.getElementById('linkedinView');
    const linkedinEdit = document.getElementById('linkedinEdit');
    if (linkedinView) linkedinView.style.display = 'flex';
    if (linkedinEdit) linkedinEdit.style.display = 'none';

    document.getElementById('profileViewActions').style.display = 'flex';
    document.getElementById('profileEditActions').style.display = 'none';
}

function cancelEditProfile() {
    isEditingProfile = false;
    showViewMode();
}

function saveProfileChanges() {
    if (!viewingProfileUser) return;

    const editLinkedin = document.getElementById('editLinkedin');
    const profileData = {
        bio: document.getElementById('profileModalBioEdit').value.trim(),
        phone: document.getElementById('profileModalPhoneEdit').value.trim(),
        linkedin: editLinkedin ? editLinkedin.value.trim() : '',
        position: document.getElementById('profileModalPosition').textContent
    };

    // Save to localStorage
    localStorage.setItem(`user_profile_${viewingProfileUser.id}`, JSON.stringify(profileData));

    // Update display
    document.getElementById('profileModalBio').textContent = profileData.bio || 'No bio added yet.';
    document.getElementById('profileModalPhone').textContent = profileData.phone || 'Not provided';

    const linkedinBtn = document.getElementById('socialLinkedin');
    if (linkedinBtn) linkedinBtn.href = profileData.linkedin || '#';

    // Exit edit mode
    isEditingProfile = false;
    showViewMode();

    showChatToast('Profile updated!');
}

function triggerProfilePhotoUpload() {
    // Only allow if viewing own profile
    if (currentUser && viewingProfileUser && currentUser.id == viewingProfileUser.id) {
        document.getElementById('profilePhotoInput').click();
    }
}

function handleProfilePhotoUpload(input) {
    const file = input.files[0];
    if (!file || !viewingProfileUser) return;

    if (!file.type.startsWith('image/')) {
        showChatToast('Please select an image file');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showChatToast('Photo must be less than 2MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;

        // Save to localStorage
        localStorage.setItem(`profile_photo_${viewingProfileUser.id}`, base64);

        // Update display
        const photoEl = document.getElementById('profileModalPhoto');
        const initialsEl = document.getElementById('profileModalInitials');
        photoEl.src = base64;
        photoEl.style.display = 'block';
        initialsEl.style.display = 'none';

        showChatToast('Photo updated!');
    };
    reader.readAsDataURL(file);
}

function updateHeader() {
    const nameEl = document.getElementById('recipientName');
    const headerAvatar = document.getElementById('headerAvatar');
    const statusEl = document.getElementById('recipientStatus');

    if (nameEl) nameEl.textContent = currentRecipient.name;

    if (headerAvatar) {
        if (currentRecipient.type === 'space') {
            headerAvatar.innerHTML = '<i data-lucide="hash"></i>';
            headerAvatar.style.borderRadius = '8px';
            headerAvatar.style.backgroundColor = '#a142f4';
            if (statusEl) statusEl.textContent = 'Public Space';
        } else {
            headerAvatar.innerHTML = getInitials(currentRecipient.name);
            headerAvatar.style.borderRadius = '50%';
            headerAvatar.style.backgroundColor = '#1a73e8';
            if (statusEl) statusEl.textContent = 'Active now';
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateActiveState() {
    // Remove all active classes
    document.querySelectorAll('.list-item').forEach(item => item.classList.remove('active'));

    // Add active to current
    if (currentRecipient.type === 'space') {
        const spaceItems = document.querySelectorAll('#spaces-list .list-item');
        spaceItems.forEach(item => {
            const itemName = item.querySelector('.item-name');
            if (itemName && itemName.textContent.trim() === currentRecipient.name) {
                item.classList.add('active');
            }
        });
    } else {
        const userItem = document.getElementById(`user-${currentRecipient.id}`);
        if (userItem) userItem.classList.add('active');
    }
}

function autoExpand(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

function sendMessage(attachment = null) {
    console.log('Attempting to send message...', { attachment });
    const input = document.getElementById('messageInput');
    if (!input && !attachment) {
        console.error('No input found and no attachment provided');
        return;
    }

    const text = input ? input.value.trim() : '';
    if (!text && !attachment) {
        console.warn('Empty message, ignoring');
        return;
    }

    try {
        if (!currentUser) {
            console.error('No current user, cannot send message');
            return;
        }

        const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        const newMessage = {
            id: Date.now(),
            from: currentUser.id,
            fromName: currentUser.name,
            to: currentRecipient.id,
            text: text,
            attachment: attachment,
            timestamp: new Date().toISOString(),
            isTeamChat: currentRecipient.type === 'space'
        };

        console.log('Saving message to storage:', newMessage);
        messages.push(newMessage);
        localStorage.setItem('chatMessages', JSON.stringify(messages));

        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }

        console.log('Message sent successfully, re-rendering...');
        renderMessages();
    } catch (e) {
        console.error('FATAL: Failed to send message:', e);
        alert('Failed to send message. Please check storage permission.');
    }
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    let allMessages = [];
    try {
        const stored = localStorage.getItem('chatMessages');
        if (stored) {
            allMessages = JSON.parse(stored);
        } else {
            // First time use? Let's add a welcome message from the system
            allMessages = [{
                id: 1,
                from: 'system',
                fromName: 'Grofast Bot',
                to: 'team-general',
                text: 'Welcome to the Grofast Digital Team Chat! 🚀 How can I help you today?',
                timestamp: new Date().toISOString(),
                isTeamChat: true
            }];
            localStorage.setItem('chatMessages', JSON.stringify(allMessages));
        }
    } catch (e) {
        console.error('Storage corruption detected, resetting chat history');
        allMessages = [];
        localStorage.setItem('chatMessages', '[]');
    }

    // Filter messages for current conversation
    let conversation;
    if (currentRecipient.type === 'space') {
        conversation = allMessages.filter(m => m.isTeamChat && m.to === currentRecipient.id);
    } else {
        conversation = allMessages.filter(m =>
            !m.isTeamChat &&
            ((m.from == currentUser.id && m.to == currentRecipient.id) ||
                (m.from == currentRecipient.id && m.to == currentUser.id))
        );
    }

    if (conversation.length === 0) {
        container.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.8; text-align: center; padding: 40px; color: var(--google-text-muted);">
                <div style="background: #f1f3f4; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <i data-lucide="message-square" style="width: 40px; height: 40px; color: #1a73e8;"></i>
                </div>
                <h3 style="margin-bottom: 8px; color: #3c4043;">No messages here yet</h3>
                <p style="margin-bottom: 24px;">Be the first to start the conversation in ${currentRecipient.name}</p>
                <div style="display: flex; gap: 12px;">
                    <button onclick="addEmoji('👋')" style="padding: 8px 16px; border: 1px solid #dadce0; border-radius: 18px; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s;">Send 👋</button>
                    <button onclick="handleMoreAction('video')" style="padding: 8px 16px; border: 1px solid #dadce0; border-radius: 18px; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s;">Start Call 🎥</button>
                </div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let lastDate = null;
    let html = '<div class="messages-container">';

    conversation.forEach((msg, index) => {
        const msgDate = new Date(msg.timestamp).toDateString();
        if (msgDate !== lastDate) {
            const displayDate = msgDate === new Date().toDateString() ? 'Today' :
                (msgDate === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' :
                    new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
            html += `<div class="date-separator"><span>${displayDate}</span></div>`;
            lastDate = msgDate;
        }

        const isSent = msg.from === currentUser.id;
        const prevMsg = conversation[index - 1];
        const isGrouped = prevMsg && prevMsg.from === msg.from &&
            (new Date(msg.timestamp) - new Date(prevMsg.timestamp) < 300000) &&
            (new Date(msg.timestamp).toDateString() === new Date(prevMsg.timestamp).toDateString());

        let attachmentHtml = '';
        if (msg.attachment) {
            if (msg.attachment.uploadType === 'image') {
                attachmentHtml = `<div class="msg-attachment-img"><img src="${msg.attachment.content}" style="max-width: 200px; border-radius: 8px; margin-top: 5px;"></div>`;
            } else if (msg.attachment.uploadType === 'file') {
                attachmentHtml = `<div class="msg-attachment-file" style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.05); padding: 8px; border-radius: 8px; margin-top: 5px; font-size: 13px;">
                    <i data-lucide="file" style="width: 16px;"></i>
                    <span>${msg.attachment.name}</span>
                </div>`;
            } else if (msg.attachment.uploadType === 'system') {
                const systemIcons = { 'video': 'video', 'meeting': 'calendar', 'task': 'check-square' };
                let systemIcon = 'info';
                if (msg.attachment.name.includes('video')) systemIcon = 'video';
                if (msg.attachment.name.includes('meeting')) systemIcon = 'calendar';
                if (msg.attachment.name.includes('task')) systemIcon = 'check-square';

                attachmentHtml = `
                    <div class="msg-attachment-system" style="display: flex; flex-direction: column; gap: 10px; background: #e8f0fe; color: #1a73e8; padding: 10px 14px; border-radius: 12px; margin-top: 5px; font-weight: 500; border: 1px solid #d2e3fc; min-width: 220px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="${systemIcon}" style="width: 18px;"></i>
                            <span>${msg.attachment.name}</span>
                        </div>
                        ${msg.attachment.link ? `
                            <a href="${msg.attachment.link}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #1a73e8; color: white; padding: 8px; border-radius: 8px; text-decoration: none; margin-top: 5px; font-size: 13px; transition: all 0.2s;">
                                <i data-lucide="external-link" style="width: 14px;"></i>
                                Join Meeting
                            </a>
                        ` : ''}
                    </div>
                `;
            }
        }

        html += `
            <div class="message-row ${isSent ? 'sent' : ''} ${isGrouped ? 'grouped' : ''}" style="margin-top: ${isGrouped ? '2px' : '16px'}">
                ${!isSent && !isGrouped ? `
                    <div class="msg-avatar" style="background-color: ${stringToColor(msg.fromName || 'Unknown')}">${getInitials(msg.fromName)}</div>
                ` : (!isSent ? '<div style="width: 32px; flex-shrink: 0;"></div>' : '')}
                
                <div class="msg-content-wrapper">
                    ${!isGrouped ? `
                        <div class="msg-meta">
                            ${!isSent ? `<span class="sender-name">${msg.fromName || 'Unknown'}</span>` : ''}
                            <span class="send-time">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ` : ''}
                    <div class="msg-bubbles">
                        <div class="msg-bubble ${isSent ? 'blue-bubble' : 'grey-bubble'}">
                            ${msg.text ? `<div>${msg.text}</div>` : ''}
                            ${attachmentHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}
