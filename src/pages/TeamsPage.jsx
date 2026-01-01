import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Users,
    Plus,
    UserPlus,
    Settings,
    ChevronRight,
    Crown,
    Building,
    Mail,
    Phone
} from 'lucide-react';

export default function TeamsPage() {
    const { user, getRoleLabel } = useAuth();
    const { teams, createTeam } = useData();

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        leadId: ''
    });

    const canManageTeams = user?.role === 'admin' || user?.role === 'md' || user?.role === 'senior';

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        await createTeam(formData);
        setFormData({ name: '', department: '', leadId: '' });
        setShowCreateForm(false);
    };

    // Team members mock data
    const getTeamMembers = (team) => {
        const members = [
            { id: 'emp-001', name: 'Ravi Kumar', role: 'employee', email: 'ravi@grofast.com' },
            { id: 'tl-001', name: 'Priya Sharma', role: 'team_lead', email: 'priya@grofast.com' }
        ];
        return members.filter(m => team.members?.includes(m.id));
    };

    if (selectedTeam) {
        const members = getTeamMembers(selectedTeam);

        return (
            <div className="animate-fade-in">
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setSelectedTeam(null)}
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="page-title">{selectedTeam.name}</h1>
                        <p className="page-subtitle">{selectedTeam.department}</p>
                    </div>
                </div>

                {/* Team Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                            {members.length}
                        </div>
                        <div className="stat-label">Members</div>
                    </div>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                            92%
                        </div>
                        <div className="stat-label">Attendance</div>
                    </div>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
                            4.2
                        </div>
                        <div className="stat-label">Avg Rating</div>
                    </div>
                </div>

                {/* Team Lead */}
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                    Team Lead
                </h3>
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="avatar avatar-lg" style={{
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                            }}>
                                <Crown size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>
                                    Priya Sharma
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                    Team Lead
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Members */}
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                    Members ({members.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {members.map(member => (
                        <div key={member.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div className="avatar">{member.name.charAt(0)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{member.name}</div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                            {getRoleLabel(member.role)}
                                        </div>
                                    </div>
                                    <span className="badge badge-success">Active</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                {canManageTeams && (
                    <button
                        className="btn btn-secondary btn-block"
                        style={{ marginTop: 'var(--space-6)' }}
                    >
                        <UserPlus size={18} />
                        Add Team Member
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Teams</h1>
                <p className="page-subtitle">Manage your teams and departments</p>
            </div>

            {/* Create Team Button */}
            {canManageTeams && (
                <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{ marginBottom: 'var(--space-6)' }}
                >
                    <Plus size={20} />
                    Create New Team
                </button>
            )}

            {/* Create Team Form */}
            {showCreateForm && (
                <div className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-body">
                        <h3 style={{ marginBottom: 'var(--space-5)' }}>Create Team</h3>

                        <form onSubmit={handleCreateTeam}>
                            <div className="form-group">
                                <label className="form-label">Team Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Digital Marketing"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <select
                                    className="form-select"
                                    value={formData.department}
                                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                    required
                                >
                                    <option value="">Select department...</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Tech">Tech</option>
                                    <option value="Design">Design</option>
                                    <option value="HR">HR</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateForm(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Teams List */}
            {teams.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {teams.map(team => (
                        <div
                            key={team.id}
                            className="card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedTeam(team)}
                        >
                            <div className="card-body">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'var(--primary-gradient)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Users size={24} color="white" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                                {team.name}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                    <Building size={14} />
                                                    {team.department}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                    <Users size={14} />
                                                    {team.members?.length || 0} members
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} color="var(--text-muted)" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Users size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">No Teams Yet</h3>
                    <p className="empty-state-description">
                        Create your first team to get started
                    </p>
                </div>
            )}
        </div>
    );
}
