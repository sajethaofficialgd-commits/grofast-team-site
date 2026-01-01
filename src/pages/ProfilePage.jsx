import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Mail,
    Phone,
    Building,
    Users,
    Camera,
    LogOut,
    Bell,
    Lock,
    ChevronRight,
    Shield,
    Moon,
    HelpCircle
} from 'lucide-react';

export default function ProfilePage() {
    const { user, logout, getRoleLabel, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveProfile = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const menuItems = [
        {
            icon: Bell,
            label: 'Notifications',
            description: 'Manage your notifications',
            action: () => { }
        },
        {
            icon: Lock,
            label: 'Change Password',
            description: 'Update your password',
            action: () => { }
        },
        {
            icon: Shield,
            label: 'Privacy',
            description: 'Manage privacy settings',
            action: () => { }
        },
        {
            icon: Moon,
            label: 'Appearance',
            description: 'Dark mode is enabled',
            action: () => { }
        },
        {
            icon: HelpCircle,
            label: 'Help & Support',
            description: 'Get help or report issues',
            action: () => { }
        }
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Profile</h1>
                <p className="page-subtitle">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        marginBottom: 'var(--space-5)'
                    }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                            <div className="avatar avatar-xl">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <button
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 32,
                                    height: 32,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--primary)',
                                    border: '3px solid var(--bg-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Camera size={14} color="white" />
                            </button>
                        </div>

                        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>
                            {user?.name || 'User'}
                        </h2>
                        <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>
                            {getRoleLabel(user?.role)}
                        </span>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                            {user?.team}
                        </p>
                    </div>

                    {/* Profile Info */}
                    {isEditing ? (
                        <div>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveProfile}
                                    style={{ flex: 1 }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Mail size={18} color="var(--text-muted)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                            Email
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)' }}>{user?.email}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Phone size={18} color="var(--text-muted)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                            Phone
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)' }}>{user?.phone || 'Not set'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Building size={18} color="var(--text-muted)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                            Department
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)' }}>{user?.department || 'N/A'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Users size={18} color="var(--text-muted)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                            Team
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)' }}>{user?.team}</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn btn-secondary btn-block"
                                onClick={() => setIsEditing(true)}
                                style={{ marginTop: 'var(--space-5)' }}
                            >
                                Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Menu */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body" style={{ padding: 0 }}>
                    {menuItems.map((item, index) => (
                        <button
                            key={item.label}
                            onClick={item.action}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-4)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: index < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--bg-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <item.icon size={18} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                                    {item.description}
                                </div>
                            </div>
                            <ChevronRight size={18} color="var(--text-muted)" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Logout */}
            <button
                className="btn btn-block"
                onClick={handleLogout}
                style={{
                    background: 'var(--error-bg)',
                    color: 'var(--error)',
                    padding: 'var(--space-4)'
                }}
            >
                <LogOut size={18} />
                Logout
            </button>

            {/* App Version */}
            <p style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--space-6)'
            }}>
                Grofast Team v1.0.0
            </p>
        </div>
    );
}
