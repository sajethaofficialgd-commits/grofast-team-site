import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Camera,
    ClipboardList,
    BookOpen,
    TrendingUp,
    Calendar,
    Palmtree,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    AlertTriangle,
    Flame,
    Target,
    Award
} from 'lucide-react';

export default function DashboardPage() {
    const { user, getRoleLabel } = useAuth();
    const { getDashboardStats, attendance, leaveRequests, workUpdates, meetings, appointments } = useData();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        setStats(getDashboardStats());
    }, [getDashboardStats]);

    const today = new Date().toISOString().split('T')[0];

    // Get today's data
    const todayAttendance = attendance.find(a => a.date === today && a.employeeId === user?.id);
    const todayUpdate = workUpdates.find(u => u.date === today && u.employeeId === user?.id);
    const upcomingMeetings = meetings.filter(m => m.date >= today && m.attendees?.includes(user?.id)).slice(0, 3);
    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
    const pendingAppointments = appointments.filter(a => a.status === 'pending');

    // Quick action cards data
    const quickActions = [
        {
            icon: Camera,
            title: 'Mark Attendance',
            description: todayAttendance?.status === 'present' ? 'Already marked' : 'Tap to mark',
            status: todayAttendance?.status === 'present' ? 'completed' : 'pending',
            path: '/attendance',
            color: '#10B981'
        },
        {
            icon: ClipboardList,
            title: 'Daily Update',
            description: todayUpdate ? 'Submitted' : 'Submit your update',
            status: todayUpdate ? 'completed' : 'pending',
            path: '/daily-update',
            color: '#3B82F6'
        },
        {
            icon: BookOpen,
            title: 'Learning',
            description: `${stats?.learningStreak || 0} day streak`,
            status: stats?.learningStreak > 0 ? 'completed' : 'pending',
            path: '/learning-board',
            color: '#8B5CF6'
        },
        {
            icon: TrendingUp,
            title: 'Progression',
            description: 'View your growth',
            status: 'info',
            path: '/progression-board',
            color: '#F59E0B'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--success)';
            case 'pending': return 'var(--warning)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}!</h1>
                <p className="page-subtitle">
                    {getRoleLabel(user?.role)} • {user?.team}
                </p>
            </div>

            {/* Today's Status Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-4)'
                    }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 'var(--radius-full)',
                            background: todayAttendance?.status === 'present'
                                ? 'var(--success-bg)'
                                : 'var(--warning-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {todayAttendance?.status === 'present' ? (
                                <CheckCircle2 size={28} color="var(--success)" />
                            ) : (
                                <Clock size={28} color="var(--warning)" />
                            )}
                        </div>
                        <div>
                            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>
                                {todayAttendance?.status === 'present' ? 'You\'re Checked In' : 'Attendance Pending'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                {todayAttendance?.checkIn
                                    ? `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString()}`
                                    : 'Mark your attendance for today'
                                }
                            </p>
                        </div>
                    </div>

                    {!todayAttendance?.status && (
                        <Link to="/attendance" className="btn btn-primary btn-block">
                            <Camera size={20} />
                            Mark Attendance Now
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
            }}>
                {quickActions.map((action) => (
                    <Link
                        key={action.title}
                        to={action.path}
                        className="card"
                        style={{
                            textDecoration: 'none',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="card-body">
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 'var(--radius-lg)',
                                background: `${action.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <action.icon size={22} color={action.color} />
                            </div>
                            <h4 style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 600,
                                marginBottom: 'var(--space-1)'
                            }}>
                                {action.title}
                            </h4>
                            <p style={{
                                fontSize: 'var(--text-xs)',
                                color: getStatusColor(action.status)
                            }}>
                                {action.description}
                            </p>

                            {action.status === 'completed' && (
                                <CheckCircle2
                                    size={16}
                                    color="var(--success)"
                                    style={{
                                        position: 'absolute',
                                        top: 'var(--space-3)',
                                        right: 'var(--space-3)'
                                    }}
                                />
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
            }}>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--warning-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-2)'
                    }}>
                        <Flame size={20} color="var(--warning)" />
                    </div>
                    <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>
                        {stats?.learningStreak || 0}
                    </div>
                    <div className="stat-label" style={{ fontSize: 'var(--text-xs)' }}>
                        Day Streak
                    </div>
                </div>

                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--info-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-2)'
                    }}>
                        <Calendar size={20} color="var(--info)" />
                    </div>
                    <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>
                        {stats?.upcomingMeetings || 0}
                    </div>
                    <div className="stat-label" style={{ fontSize: 'var(--text-xs)' }}>
                        Meetings
                    </div>
                </div>

                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--success-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-2)'
                    }}>
                        <Target size={20} color="var(--success)" />
                    </div>
                    <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>
                        85%
                    </div>
                    <div className="stat-label" style={{ fontSize: 'var(--text-xs)' }}>
                        Goal Progress
                    </div>
                </div>
            </div>

            {/* Upcoming Meetings */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-4)'
                }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                        Upcoming Meetings
                    </h3>
                    <Link
                        to="/meetings"
                        style={{
                            color: 'var(--primary)',
                            fontSize: 'var(--text-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)'
                        }}
                    >
                        View All <ChevronRight size={16} />
                    </Link>
                </div>

                {upcomingMeetings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {upcomingMeetings.map((meeting) => (
                            <div key={meeting.id} className="list-item">
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--info-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Calendar size={20} color="var(--info)" />
                                </div>
                                <div className="list-item-content">
                                    <div className="list-item-title">{meeting.title}</div>
                                    <div className="list-item-subtitle">
                                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                                    </div>
                                </div>
                                <span className="badge badge-info">{meeting.type}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                            <Calendar size={32} color="var(--text-muted)" style={{ marginBottom: 'var(--space-3)' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No upcoming meetings</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Team Lead / Senior / MD specific sections */}
            {(user?.role === 'team_lead' || user?.role === 'senior' || user?.role === 'md' || user?.role === 'admin') && (
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 700,
                        marginBottom: 'var(--space-4)'
                    }}>
                        Pending Approvals
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-3)'
                    }}>
                        <Link to="/leave" className="stat-card" style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)'
                            }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--warning-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Palmtree size={22} color="var(--warning)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                                        {pendingLeaves.length}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                        Leave Requests
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link to="/appointments" className="stat-card" style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)'
                            }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--info-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Users size={22} color="var(--info)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                                        {pendingAppointments.length}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                        Appointments
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Tips */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)',
                border: '1px solid rgba(185, 28, 28, 0.2)'
            }}>
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                        <Award size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                                Pro Tip for Today
                            </h4>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                Consistent daily learning, even for just 15 minutes, can dramatically
                                improve your skills over time. Keep your learning streak going!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
