// Work Updates JavaScript - Field-specific forms

const WORK_FIELDS = {
    video_editor: [
        { name: 'projectName', label: 'Project Name', type: 'text', required: true },
        { name: 'client', label: 'Client', type: 'text', required: true },
        { name: 'videoType', label: 'Video Type', type: 'select', options: ['Reel', 'YouTube', 'Ad', 'Documentary', 'Other'], required: true },
        { name: 'duration', label: 'Video Duration (minutes)', type: 'number', required: false },
        { name: 'status', label: 'Status', type: 'select', options: ['Started', 'In Progress', 'Review', 'Completed', 'Revision'], required: true },
        { name: 'tasks', label: 'Tasks Completed', type: 'textarea', required: true },
        { name: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
    ],
    gen_ai: [
        { name: 'projectName', label: 'Project/Task Name', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Prompt Engineering', 'RAG Development', 'AI Agent', 'Fine-tuning', 'Research', 'Documentation', 'Other'], required: true },
        { name: 'tools', label: 'Tools/Models Used', type: 'text', required: true },
        { name: 'tasks', label: 'Work Completed', type: 'textarea', required: true },
        { name: 'output', label: 'Output/Deliverable', type: 'text', required: false },
        { name: 'learnings', label: 'Key Learnings', type: 'textarea', required: false }
    ],
    automation: [
        { name: 'projectName', label: 'Project Name', type: 'text', required: true },
        { name: 'client', label: 'Client', type: 'text', required: true },
        { name: 'automationType', label: 'Automation Type', type: 'select', options: ['Lead Generation', 'Lead Management', 'Calendar', 'Finance', 'Community', 'Funnel', 'Other'], required: true },
        { name: 'platform', label: 'Platform/Tool', type: 'text', required: true },
        { name: 'tasks', label: 'Work Completed', type: 'textarea', required: true },
        { name: 'issues', label: 'Issues/Blockers', type: 'textarea', required: false }
    ],
    digital_marketing: [
        { name: 'campaign', label: 'Campaign Name', type: 'text', required: true },
        { name: 'client', label: 'Client', type: 'text', required: true },
        { name: 'platform', label: 'Platform', type: 'select', options: ['Meta Ads', 'Google Ads', 'LinkedIn', 'Content Marketing', 'Email', 'Other'], required: true },
        { name: 'adSpend', label: 'Ad Spend (₹)', type: 'number', required: false },
        { name: 'tasks', label: 'Work Completed', type: 'textarea', required: true },
        { name: 'metrics', label: 'Key Metrics', type: 'textarea', required: false }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;

    const user = auth.getCurrentUser();
    initWorkPage(user);
});

function initWorkPage(user) {
    // Set today's date
    document.getElementById('todayDate').textContent = formatDate(new Date());

    // Render form fields based on user's field
    renderFormFields(user.field);

    // Load updates
    loadWorkUpdates(user);

    // Event listeners
    document.getElementById('addWorkBtn').addEventListener('click', showForm);
    document.getElementById('closeFormBtn').addEventListener('click', hideForm);
    document.getElementById('workForm').addEventListener('submit', submitWork);
}

function renderFormFields(field) {
    const fields = WORK_FIELDS[field] || WORK_FIELDS.video_editor;
    const container = document.getElementById('formFields');

    container.innerHTML = fields.map(f => {
        const requiredMark = f.required ? '<span class="required">*</span>' : '';

        if (f.type === 'textarea') {
            return `
                <div class="form-group">
                    <label for="${f.name}">${f.label} ${requiredMark}</label>
                    <textarea id="${f.name}" name="${f.name}" class="form-textarea" 
                        placeholder="Enter ${f.label.toLowerCase()}" ${f.required ? 'required' : ''}></textarea>
                </div>
            `;
        } else if (f.type === 'select') {
            return `
                <div class="form-group">
                    <label for="${f.name}">${f.label} ${requiredMark}</label>
                    <select id="${f.name}" name="${f.name}" class="form-input form-select" ${f.required ? 'required' : ''}>
                        <option value="">Select ${f.label}</option>
                        ${f.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    <label for="${f.name}">${f.label} ${requiredMark}</label>
                    <input type="${f.type}" id="${f.name}" name="${f.name}" class="form-input" 
                        placeholder="Enter ${f.label.toLowerCase()}" ${f.required ? 'required' : ''}>
                </div>
            `;
        }
    }).join('');
}

function showForm() {
    document.getElementById('workFormSection').style.display = 'block';
    document.getElementById('addWorkBtn').style.display = 'none';
    document.querySelector('.work-form-section').scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
    document.getElementById('workFormSection').style.display = 'none';
    document.getElementById('addWorkBtn').style.display = 'flex';
    document.getElementById('workForm').reset();
}

async function submitWork(e) {
    e.preventDefault();

    const user = auth.getCurrentUser();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        if (value) data[key] = value;
    });

    const workUpdate = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        field: user.field,
        data: data,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    updates.unshift(workUpdate);
    localStorage.setItem('gf_work_updates', JSON.stringify(updates));

    // Send to webhook
    if (N8N_WEBHOOKS.workUpdate !== 'YOUR_N8N_WORK_UPDATE_WEBHOOK_URL') {
        try {
            await fetch(N8N_WEBHOOKS.workUpdate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workUpdate)
            });
        } catch (e) {
            console.log('Work webhook failed');
        }
    }

    toast.success('Work update submitted!');
    hideForm();
    loadWorkUpdates(user);
}

function loadWorkUpdates(user) {
    const updates = JSON.parse(localStorage.getItem('gf_work_updates') || '[]');
    const userUpdates = updates.filter(u => u.userId === user.id);

    // Count today's updates
    const today = new Date().toDateString();
    const todayUpdates = userUpdates.filter(u => new Date(u.timestamp).toDateString() === today);
    document.getElementById('updateCount').textContent = todayUpdates.length;

    const container = document.getElementById('workHistoryList');

    if (userUpdates.length === 0) {
        container.innerHTML = `
            <div class="no-updates">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>No work updates yet. Click + to add your first update.</p>
            </div>
        `;
        return;
    }

    // Group by date
    const grouped = {};
    userUpdates.forEach(update => {
        const date = new Date(update.timestamp).toDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(update);
    });

    let html = '';
    Object.entries(grouped).slice(0, 7).forEach(([date, items]) => {
        const displayDate = date === today ? 'Today' : formatDate(date);
        html += `<div class="date-separator">${displayDate}</div>`;

        items.forEach(item => {
            html += renderWorkItem(item);
        });
    });

    container.innerHTML = html;
}

function renderWorkItem(item) {
    const tags = [];
    if (item.data.videoType) tags.push(item.data.videoType);
    if (item.data.category) tags.push(item.data.category);
    if (item.data.automationType) tags.push(item.data.automationType);
    if (item.data.platform) tags.push(item.data.platform);
    if (item.data.status) tags.push(item.data.status);

    const title = item.data.projectName || item.data.campaign || 'Work Update';
    const client = item.data.client || '';
    const tasks = item.data.tasks || '';

    return `
        <div class="work-item">
            <div class="work-item-header">
                <div class="work-item-title">${title}</div>
                <div class="work-item-time">${formatTime(item.timestamp)}</div>
            </div>
            <div class="work-item-meta">
                ${tags.map(t => `<span class="work-item-tag">${t}</span>`).join('')}
            </div>
            <div class="work-item-content">
                ${client ? `<p><strong>Client:</strong> ${client}</p>` : ''}
                ${tasks ? `<p><strong>Tasks:</strong> ${tasks}</p>` : ''}
            </div>
        </div>
    `;
}
