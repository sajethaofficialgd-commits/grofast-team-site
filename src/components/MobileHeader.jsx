import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Menu,
    Bell,
    X,
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
    Building
} from 'lucide-react';

export default function MobileHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, getRoleLabel } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Teams', path: '/teams' },
        { icon: MessageCircle, label: 'Chat', path: '/chat' },
        { icon: Calendar, label: 'Meetings', path: '/meetings' },
        { icon: ClipboardList, label: 'Daily Update', path: '/daily-update' },
        { icon: BookOpen, label: 'Learning Board', path: '/learning-board' },
        { icon: TrendingUp, label: 'Progression', path: '/progression-board' },
        { icon: CalendarCheck, label: 'Appointments', path: '/appointments' },
        { icon: Palmtree, label: 'Leave', path: '/leave' },
        { icon: UserCircle, label: 'Profile', path: '/profile' },
    ];

    return (
        <>
            {/* Mobile Header */}
            <header className="mobile-only" style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setIsMenuOpen(true)}
                    aria-label="Menu"
                >
                    <Menu size={24} />
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <img
                        src="/logo.png"
                        alt="Grofast Digital"
                        style={{ width: 32, height: 32 }}
                    />
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'var(--text-lg)',
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        GROFAST
                    </span>
                </div>

                <button className="btn btn-ghost btn-icon" aria-label="Notifications">
                    <Bell size={24} />
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 200,
                        animation: 'fadeIn 150ms ease'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                background: 'var(--bg-secondary)',
                zIndex: 201,
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 300ms ease',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-5)'
            }}>
                {/* Menu Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-6)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)'
                    }}>
                        <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                                {getRoleLabel(user?.role)}
                            </div>
                        </div>
                    </div>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav style={{ flex: 1, overflow: 'auto' }}>
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3)',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-1)',
                                transition: 'all 150ms ease'
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        color: 'var(--error)',
                        background: 'var(--error-bg)',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: 'var(--text-base)'
                    }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );
}
