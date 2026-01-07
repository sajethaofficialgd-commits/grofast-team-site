// Grofast Digital - Configuration

const SUPABASE_URL = 'https://poatldvuvyhteenqrpka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYXRsZHZ1dnlodGVlbnFycGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NjcyNTgsImV4cCI6MjA4MzI0MzI1OH0.cLIjmSDzyzE-UY1CH7Yn16w6Ktb-oGyJ1TrPAlEPCSo';

const N8N_WEBHOOKS = {
    attendance: 'https://n8n.srv1163761.hstgr.cloud/webhook/grofast-master-backup',
    learning: 'https://n8n.srv1163761.hstgr.cloud/webhook/grofast-master-backup',
    workUpdate: 'https://n8n.srv1163761.hstgr.cloud/webhook/grofast-master-backup',
    event: 'https://n8n.srv1163761.hstgr.cloud/webhook/grofast-master-backup',
    mood: 'https://n8n.srv1163761.hstgr.cloud/webhook/grofast-master-backup',
    announcement: 'https://n8n.srv1163761.hstgr.cloud/webhook/grofast-master-backup',
    onboarding: 'https://n8n.srv1163761.hstgr.cloud/webhook/employee-welcome'
};

const APP_CONFIG = {
    name: 'Grofast Digital',
    version: '1.0.0',
    debug: false,
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

const DEMO_USERS = [
    {
        id: 1,
        employee_id: 'GD-ADM-001',
        email: 'grofastdigital@gmail.com',
        password: 'Grofast@123',
        name: 'Grofast Admin',
        role: 'admin',
        field: 'all',
        position: 'CEO & Founder',
        department: 'Management',
        phone: '+91 98765 43210'
    },
    {
        id: 2,
        employee_id: 'GD-SAJ-002',
        email: 'sajeth@grofast.com',
        password: 'password123',
        name: 'Sajeth Official',
        role: 'employee',
        field: 'digital_marketing',
        position: 'Digital Marketing Lead',
        department: 'Marketing',
        phone: '+91 98765 12345'
    },
    {
        id: 3,
        employee_id: 'GD-RAH-003',
        email: 'rahul@grofast.com',
        password: 'password123',
        name: 'Rahul Team',
        role: 'employee',
        field: 'video_editor',
        position: 'Senior Video Editor',
        department: 'Creative',
        phone: '+91 87654 32109'
    },
    {
        id: 4,
        employee_id: 'GD-PRI-004',
        email: 'priya@grofast.com',
        password: 'password123',
        name: 'Priya Sharma',
        role: 'senior',
        field: 'gen_ai',
        position: 'AI Solutions Architect',
        department: 'Technology',
        phone: '+91 76543 21098'
    },
    {
        id: 5,
        employee_id: 'GD-NAV-005',
        email: 'sajeethasiva6@gmail.com',
        password: 'Sara@1545',
        name: 'Naveena',
        role: 'employee',
        field: 'digital_marketing',
        position: 'Team Member',
        department: 'Marketing',
        phone: ''
    }
];

// Helper function to get field info
function getFieldInfo(fieldId) {
    for (const key in FIELDS) {
        if (FIELDS[key].id === fieldId) {
            return FIELDS[key];
        }
    }
    return null;
}
