import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Calendar,
    Clock,
    Video,
    Users,
    Plus,
    ChevronRight,
    MapPin,
    Bell,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function MeetingsPage() {
    const { user } = useAuth();
    const { meetings } = useData();

    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    // Filter meetings
    const upcomingMeetings = meetings
        .filter(m => m.date >= today && m.attendees?.includes(user?.id))
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

    const pastMeetings = meetings
        .filter(m => m.date < today && m.attendees?.includes(user?.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const todayMeetings = upcomingMeetings.filter(m => m.date === today);

    const getMeetingTypeColor = (type) => {
        switch (type) {
            case 'daily': return 'var(--info)';
            case 'weekly': return 'var(--success)';
            case 'senior': return 'var(--warning)';
            case 'md': return 'var(--primary)';
            default: return 'var(--text-muted)';
        }
    };

    const getMeetingTypeLabel = (type) => {
        switch (type) {
            case 'daily': return 'Daily Standup';
            case 'weekly': return 'Weekly Review';
            case 'senior': return 'Senior Review';
            case 'md': return 'MD Review';
            default: return 'Meeting';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (dateStr === today) return 'Today';

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Meetings</h1>
                <p className="page-subtitle">Your scheduled meetings and reviews</p>
            </div>

            {/* Today's Quick View */}
            {todayMeetings.length > 0 && (
                <div className="card" style={{
                    marginBottom: 'var(--space-6)',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <div className="card-body">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            marginBottom: 'var(--space-3)'
                        }}>
                            <Calendar size={18} color="var(--info)" />
                            <span style={{ fontWeight: 600, color: 'var(--info)' }}>
                                Today's Meetings ({todayMeetings.length})
                            </span>
                        </div>

                        {todayMeetings.map((meeting, index) => (
                            <div
                                key={meeting.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-3) 0',
                                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500 }}>{meeting.title}</div>
                                    <div style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)'
                                    }}>
                                        <Clock size={14} />
                                        {meeting.time} • {meeting.duration} min
                                    </div>
                                </div>
                                <button className="btn btn-sm btn-primary">
                                    <Video size={14} />
                                    Join
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming ({upcomingMeetings.length})
                </button>
                <button
                    className={`tab ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past
                </button>
            </div>

            {/* Meeting List */}
            {activeTab === 'upcoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {upcomingMeetings.length > 0 ? (
                        upcomingMeetings.map(meeting => (
                            <div key={meeting.id} className="card">
                                <div className="card-body">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 'var(--space-4)'
                                    }}>
                                        {/* Date Column */}
                                        <div style={{
                                            minWidth: 60,
                                            textAlign: 'center',
                                            padding: 'var(--space-2)',
                                            background: 'var(--bg-elevated)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}>
                                            <div style={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--text-muted)',
                                                textTransform: 'uppercase'
                                            }}>
                                                {formatDate(meeting.date).split(' ')[0]}
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--text-xl)',
                                                fontWeight: 800,
                                                color: meeting.date === today ? 'var(--primary)' : 'var(--text-primary)'
                                            }}>
                                                {new Date(meeting.date).getDate()}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                                marginBottom: 'var(--space-2)'
                                            }}>
                                                <span style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 'var(--radius-full)',
                                                    background: getMeetingTypeColor(meeting.type)
                                                }} />
                                                <span style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: getMeetingTypeColor(meeting.type),
                                                    textTransform: 'uppercase',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {getMeetingTypeLabel(meeting.type)}
                                                </span>
                                            </div>

                                            <h4 style={{ marginBottom: 'var(--space-2)' }}>{meeting.title}</h4>

                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 'var(--space-3)',
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                    <Clock size={14} />
                                                    {meeting.time}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                    <Users size={14} />
                                                    {meeting.attendees?.length || 0} attendees
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        {meeting.date === today && (
                                            <button className="btn btn-primary btn-sm">
                                                <Video size={14} />
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Calendar size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">No Upcoming Meetings</h3>
                            <p className="empty-state-description">
                                You don't have any scheduled meetings
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'past' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {pastMeetings.length > 0 ? (
                        pastMeetings.map(meeting => (
                            <div key={meeting.id} className="card" style={{ opacity: 0.7 }}>
                                <div className="card-body">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                                marginBottom: 'var(--space-1)'
                                            }}>
                                                <span style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: getMeetingTypeColor(meeting.type)
                                                }}>
                                                    {getMeetingTypeLabel(meeting.type)}
                                                </span>
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                    • {formatDate(meeting.date)}
                                                </span>
                                            </div>
                                            <h4 style={{ fontSize: 'var(--text-base)' }}>{meeting.title}</h4>
                                        </div>
                                        <CheckCircle2 size={20} color="var(--success)" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Calendar size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">No Past Meetings</h3>
                            <p className="empty-state-description">
                                Your past meetings will appear here
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Meeting Types Legend */}
            <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                <div className="card-body">
                    <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                        Meeting Types
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-3)'
                    }}>
                        {[
                            { type: 'daily', desc: 'Daily work updates' },
                            { type: 'weekly', desc: 'Weekly performance review' },
                            { type: 'senior', desc: 'Team performance analytics' },
                            { type: 'md', desc: 'Company-level review' }
                        ].map(item => (
                            <div
                                key={item.type}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)'
                                }}
                            >
                                <span style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 'var(--radius-full)',
                                    background: getMeetingTypeColor(item.type)
                                }} />
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                        {getMeetingTypeLabel(item.type)}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                        {item.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
