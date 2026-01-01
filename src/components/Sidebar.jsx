import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    MessageCircle,
    Calendar,
    ClipboardList,
    BookOpen,
    TrendingUp,
    CalendarCheck,
    Palmtree,
    UserCircle,
    Settings,
    LogOut,
    UserCog,
    Building
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout, getRoleLabel } = useAuth();
    const location = useLocation();

    const mainNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Teams', path: '/teams' },
        { icon: MessageCircle, label: 'Chat', path: '/chat' },
        { icon: Calendar, label: 'Meetings', path: '/meetings' },
        { icon: ClipboardList, label: 'Daily Update', path: '/daily-update' },
        { icon: BookOpen, label: 'Learning', path: '/learning-board' },
        { icon: TrendingUp, label: 'Progression', path: '/progression-board' },
    ];

    const requestsNavItems = [
        { icon: CalendarCheck, label: 'Appointments', path: '/appointments' },
        { icon: Palmtree, label: 'Leave', path: '/leave' },
    ];

    const adminNavItems = [
        { icon: UserCog, label: 'Admin Panel', path: '/admin-panel' },
        { icon: Building, label: 'Reports', path: '/reports' },
    ];

    const showAdminNav = user?.role === 'admin' || user?.role === 'md';

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <img
                    src="/logo.png"
                    alt="Grofast Digital"
                    style={{ width: 40, height: 40 }}
                />
                <span className="sidebar-logo-text">GROFAST</span>
            </div>

            {/* Main Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Main</div>
                    {mainNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-title">Requests</div>
                    {requestsNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {showAdminNav && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Administration</div>
                        {adminNavItems.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? 'active' : ''}`
                    }
                >
                    <div className="avatar avatar-sm">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                            {user?.name || 'User'}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {getRoleLabel(user?.role)}
                        </div>
                    </div>
                </NavLink>

                <button
                    className="sidebar-link"
                    onClick={logout}
                    style={{ width: '100%', border: 'none', cursor: 'pointer', marginTop: 'var(--space-2)' }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
