// Learning Page JavaScript

let currentTopic = null;
let userProgress = {};

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;

    const user = auth.getCurrentUser();
    initLearning(user);
});

function initLearning(user) {
    // Load user's field data
    const fieldData = LEARNING_DATA[user.field];

    if (!fieldData) {
        document.getElementById('modulesList').innerHTML = `
            <div class="no-content">
                <p>No learning content available for your field.</p>
            </div>
        `;
        return;
    }

    // Update field indicator
    document.getElementById('fieldIndicator').innerHTML = `
        <span>${fieldData.icon}</span>
        <span>${fieldData.name}</span>
    `;

    // Load progress
    userProgress = JSON.parse(localStorage.getItem('gf_learning_progress') || '{}');
    if (!userProgress[user.field]) {
        userProgress[user.field] = {};
    }

    // Render modules
    renderModules(fieldData.modules, user.field);

    // Update progress stats
    updateProgressStats(fieldData.modules, user.field);

    // Modal event listeners
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('topicModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

function renderModules(modules, field) {
    const container = document.getElementById('modulesList');

    container.innerHTML = modules.map(module => {
        const moduleProgress = calculateModuleProgress(module, field);

        return `
            <div class="module-card" data-module="${module.id}">
                <div class="module-header" onclick="toggleModule('${module.id}')">
                    <div class="module-icon">${module.icon}</div>
                    <div class="module-info">
                        <div class="module-title">${module.title}</div>
                        <div class="module-meta">
                            <span>${module.topics.length} topics</span>
                        </div>
                    </div>
                    <div class="module-progress">
                        <span class="module-progress-text">${moduleProgress}%</span>
                    </div>
                    <svg class="module-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="topics-list">
                    ${module.topics.map(topic => renderTopic(module.id, topic, field)).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderTopic(moduleId, topic, field) {
    const status = userProgress[field]?.[`${moduleId}_${topic.id}`] || 'not_started';
    const statusClass = status.replace('_', '-');

    return `
        <div class="topic-item" onclick="openTopic('${moduleId}', '${topic.id}')">
            <div class="topic-status ${statusClass}">
                ${status === 'completed' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
            <span class="topic-title">${topic.title}</span>
            <svg class="topic-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </div>
    `;
}

function toggleModule(moduleId) {
    const card = document.querySelector(`[data-module="${moduleId}"]`);
    card.classList.toggle('expanded');
}

function openTopic(moduleId, topicId) {
    const user = auth.getCurrentUser();
    const fieldData = LEARNING_DATA[user.field];
    const module = fieldData.modules.find(m => m.id === moduleId);
    const topic = module.topics.find(t => t.id === topicId);

    currentTopic = { moduleId, topicId, field: user.field };

    document.getElementById('modalTitle').textContent = topic.title;
    document.getElementById('modalBody').innerHTML = `
        <p>${topic.desc}</p>
        <div class="topic-module-info">
            <small style="color: var(--text-muted);">Part of: ${module.title}</small>
        </div>
    `;

    const currentStatus = userProgress[user.field]?.[`${moduleId}_${topicId}`] || 'not_started';

    document.getElementById('statusButtons').innerHTML = `
        <button class="status-btn not-started ${currentStatus === 'not_started' ? 'active' : ''}" 
                onclick="updateTopicStatus('not_started')">
            Not Started
        </button>
        <button class="status-btn in-progress ${currentStatus === 'in_progress' ? 'active' : ''}" 
                onclick="updateTopicStatus('in_progress')">
            In Progress
        </button>
        <button class="status-btn completed ${currentStatus === 'completed' ? 'active' : ''}" 
                onclick="updateTopicStatus('completed')">
            Completed
        </button>
    `;

    document.getElementById('topicModal').classList.add('active');
}

function closeModal() {
    document.getElementById('topicModal').classList.remove('active');
    currentTopic = null;
}

function updateTopicStatus(status) {
    if (!currentTopic) return;

    const { moduleId, topicId, field } = currentTopic;
    const key = `${moduleId}_${topicId}`;

    if (!userProgress[field]) {
        userProgress[field] = {};
    }

    userProgress[field][key] = status;
    localStorage.setItem('gf_learning_progress', JSON.stringify(userProgress));

    // Send to webhook
    sendProgressToWebhook(moduleId, topicId, status);

    // Update UI
    document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.status-btn.${status.replace('_', '-')}`).classList.add('active');

    // Re-render
    const user = auth.getCurrentUser();
    const fieldData = LEARNING_DATA[user.field];
    renderModules(fieldData.modules, user.field);
    updateProgressStats(fieldData.modules, user.field);

    toast.success('Progress updated!');
}

function calculateModuleProgress(module, field) {
    const completed = module.topics.filter(t =>
        userProgress[field]?.[`${module.id}_${t.id}`] === 'completed'
    ).length;

    return Math.round((completed / module.topics.length) * 100);
}

function updateProgressStats(modules, field) {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let total = 0;

    modules.forEach(module => {
        module.topics.forEach(topic => {
            total++;
            const status = userProgress[field]?.[`${module.id}_${topic.id}`] || 'not_started';
            if (status === 'completed') completed++;
            else if (status === 'in_progress') inProgress++;
            else notStarted++;
        });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('overallProgress').textContent = percentage + '%';
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('notStartedCount').textContent = notStarted;
}

async function sendProgressToWebhook(moduleId, topicId, status) {
    if (N8N_WEBHOOKS.learning === 'YOUR_N8N_LEARNING_WEBHOOK_URL') return;

    const user = auth.getCurrentUser();

    try {
        await fetch(N8N_WEBHOOKS.learning, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                userName: user.name,
                field: user.field,
                moduleId,
                topicId,
                status,
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.log('Learning webhook failed');
    }
}
