// Grofast Digital - Configuration

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const N8N_WEBHOOKS = {
    attendance: 'YOUR_N8N_ATTENDANCE_WEBHOOK_URL',
    learning: 'YOUR_N8N_LEARNING_WEBHOOK_URL',
    workUpdate: 'YOUR_N8N_WORK_UPDATE_WEBHOOK_URL',
    onboarding: 'https://n8n.srv1163761.hstgr.cloud/webhook/employee-welcome'
};

const APP_CONFIG = {
    name: 'Grofast Digital',
    version: '1.0.0',
    debug: true,
    session: { timeout: 8 * 60 * 60 * 1000, rememberMeDuration: 30 * 24 * 60 * 60 * 1000 },
    attendance: { mobileOnly: true, requirePhoto: true, requireLocation: true, photoQuality: 0.8 },
    learningStatuses: { NOT_STARTED: 'not_started', IN_PROGRESS: 'in_progress', COMPLETED: 'completed' }
};

const ROLES = { EMPLOYEE: 'employee', SENIOR: 'senior', ADMIN: 'admin' };

const FIELDS = {
    VIDEO_EDITOR: { id: 'video_editor', name: 'Video Editor', icon: '🎬', color: '#ef4444' },
    GEN_AI: { id: 'gen_ai', name: 'Gen AI / AI Tech', icon: '🤖', color: '#8b5cf6' },
    AUTOMATION: { id: 'automation', name: 'Automation', icon: '⚙️', color: '#06b6d4' },
    DIGITAL_MARKETING: { id: 'digital_marketing', name: 'Digital Marketing', icon: '📢', color: '#10b981' }
};

const DEMO_USERS = [];
