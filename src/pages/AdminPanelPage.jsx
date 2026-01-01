import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Settings,
    Users,
    Shield,
    Database,
    Download,
    RefreshCw,
    User,
    ChevronRight,
    Plus,
    Trash2,
    Edit,
    CheckCircle2,
    XCircle,
    Bell,
    Link as LinkIcon
} from 'lucide-react';

export default function AdminPanelPage() {
    const { user, getRoleLabel } = useAuth();
    const { teams, leaveRequests, workUpdates, learning, attendance, sendToWebhook } = useData();

    const [activeTab, setActiveTab] = useState('users');
    const [webhookUrl, setWebhookUrl] = useState('https://your-n8n-instance.com/webhook');

    // Mock users data
    const allUsers = [
        { id: 'emp-001', name: 'Ravi Kumar', email: 'ravi@grofast.com', role: 'employee', team: 'Digital Marketing', status: 'active' },
        { id: 'tl-001', name: 'Priya Sharma', email: 'priya@grofast.com', role: 'team_lead', team: 'Digital Marketing', status: 'active' },
        { id: 'senior-001', name: 'Arun Patel', email: 'arun@grofast.com', role: 'senior', team: 'Operations', status: 'active' },
        { id: 'md-001', name: 'Vikram Raghunathan', email: 'vikram@grofast.com', role: 'md', team: 'Management', status: 'active' },
        { id: 'admin-001', name: 'Admin User', email: 'admin@grofast.com', role: 'admin', team: 'Administration', status: 'active' }
    ];

    const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.status === 'active').length,
        totalTeams: teams.length,
        pendingLeaves: leaveRequests.filter(l => l.status === 'pending').length,
        todayAttendance: attendance.filter(a =>
            a.date === new Date().toISOString().split('T')[0] && a.status === 'present'
        ).length,
        todayUpdates: workUpdates.filter(u =>
            u.date === new Date().toISOString().split('T')[0]
        ).length
    };

    const handleTestWebhook = async () => {
        const result = await sendToWebhook('test', {
            type: 'test',
            message: 'Test webhook from Grofast Team Platform',
            timestamp: new Date().toISOString()
        });
        alert(result.success ? 'Webhook test sent!' : 'Webhook test failed');
    };

    const handleExportData = () => {
        const data = {
            exportDate: new Date().toISOString(),
            users: allUsers,
            teams: teams,
            attendance: attendance,
            leaveRequests: leaveRequests,
            workUpdates: workUpdates,
            learning: learning
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grofast-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (user?.role !== 'admin' && user?.role !== 'md') {
        return (
            <div className="animate-fade-in">
                <div className="empty-state">
                    <Shield size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">Access Denied</h3>
                    <p className="empty-state-description">
                        You don't have permission to access this page
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Admin Panel</h1>
                <p className="page-subtitle">Manage users, system settings, and data</p>
            </div>

            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
            }}>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                        {stats.totalUsers}
                    </div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                        {stats.totalTeams}
                    </div>
                    <div className="stat-label">Teams</div>
                </div>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                        {stats.pendingLeaves}
                    </div>
                    <div className="stat-label">Pending</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
                <button
                    className={`tab ${activeTab === 'webhooks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('webhooks')}
                >
                    Webhooks
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <>
                    <button
                        className="btn btn-primary btn-block btn-lg"
                        style={{ marginBottom: 'var(--space-5)' }}
                    >
                        <Plus size={20} />
                        Add New User
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {allUsers.map(u => (
                            <div key={u.id} className="card">
                                <div className="card-body">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div className="avatar">{u.name.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                    {u.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <span className="badge badge-info">{getRoleLabel(u.role)}</span>
                                            <button className="btn btn-ghost btn-sm">
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>General Settings</h4>

                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value="Grofast Digital"
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Attendance Cutoff Time</label>
                                <select className="form-select" defaultValue="11:00">
                                    <option value="09:00">9:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Daily Update Cutoff Time</label>
                                <select className="form-select" defaultValue="11:00">
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                </select>
                            </div>

                            <button className="btn btn-primary">Save Settings</button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>Data Management</h4>

                            <button
                                className="btn btn-secondary btn-block"
                                onClick={handleExportData}
                                style={{ marginBottom: 'var(--space-3)' }}
                            >
                                <Download size={18} />
                                Export All Data (JSON)
                            </button>

                            <button className="btn btn-secondary btn-block">
                                <RefreshCw size={18} />
                                Sync with Google Sheets
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>n8n Webhook Configuration</h4>

                            <div className="form-group">
                                <label className="form-label">Base Webhook URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://your-n8n-instance.com/webhook"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                />
                                <p className="form-hint">
                                    Enter your n8n webhook base URL. Endpoints will be appended automatically.
                                </p>
                            </div>

                            <button
                                className="btn btn-secondary"
                                onClick={handleTestWebhook}
                            >
                                <LinkIcon size={18} />
                                Test Connection
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>Webhook Endpoints</h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {[
                                    { name: 'Attendance', endpoint: '/attendance', description: 'Triggered on check-in/check-out' },
                                    { name: 'Leave Request', endpoint: '/leave-request', description: 'Triggered on new leave application' },
                                    { name: 'Leave Status', endpoint: '/leave-status-update', description: 'Triggered on approval/rejection' },
                                    { name: 'Work Update', endpoint: '/work-update', description: 'Triggered on daily update submission' },
                                    { name: 'Learning', endpoint: '/learning-progress', description: 'Triggered on learning log' },
                                    { name: 'Appointment', endpoint: '/appointment', description: 'Triggered on booking' }
                                ].map(hook => (
                                    <div
                                        key={hook.endpoint}
                                        style={{
                                            padding: 'var(--space-3)',
                                            background: 'var(--bg-elevated)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 'var(--space-1)'
                                        }}>
                                            <span style={{ fontWeight: 500 }}>{hook.name}</span>
                                            <code style={{
                                                fontSize: 'var(--text-xs)',
                                                padding: 'var(--space-1) var(--space-2)',
                                                background: 'var(--bg-card)',
                                                borderRadius: 'var(--radius-sm)'
                                            }}>
                                                {hook.endpoint}
                                            </code>
                                        </div>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                            {hook.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <div className="card-body">
                            <h4 style={{ color: 'var(--info)', marginBottom: 'var(--space-3)' }}>
                                Google Sheets Structure
                            </h4>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                Create these sheets in your Google Spreadsheet:
                            </p>
                            <ul style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                listStyle: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-2)'
                            }}>
                                <li>• Attendance_Log</li>
                                <li>• Daily_Work_Updates</li>
                                <li>• Learning_Progress</li>
                                <li>• Leave_Requests</li>
                                <li>• Appointments</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
