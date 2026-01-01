import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    TrendingUp,
    Calendar,
    BookOpen,
    ClipboardList,
    Target,
    Award,
    Flame,
    CheckCircle2,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';

export default function ProgressionBoardPage() {
    const { user } = useAuth();
    const { attendance, workUpdates, learning } = useData();

    const [timeRange, setTimeRange] = useState('week');

    // Calculate stats
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const startOfMonth = new Date(today);
    startOfMonth.setDate(today.getDate() - 30);

    const dateRange = timeRange === 'week' ? startOfWeek : startOfMonth;
    const dateRangeStr = dateRange.toISOString().split('T')[0];

    // Filter data by date range and user
    const userAttendance = attendance.filter(a =>
        a.employeeId === user?.id && a.date >= dateRangeStr
    );

    const userUpdates = workUpdates.filter(u =>
        u.employeeId === user?.id && u.date >= dateRangeStr
    );

    const userLearning = learning.filter(l =>
        l.employeeId === user?.id && l.date >= dateRangeStr
    );

    // Calculate metrics
    const totalDays = timeRange === 'week' ? 7 : 30;
    const workDays = Math.floor(totalDays * 5 / 7); // Approximate work days

    const attendanceRate = workDays > 0
        ? Math.round((userAttendance.filter(a => a.status === 'present').length / workDays) * 100)
        : 0;

    const updateRate = workDays > 0
        ? Math.round((userUpdates.length / workDays) * 100)
        : 0;

    const learningHours = userLearning.reduce((acc, l) => {
        const hours = parseFloat(l.timeSpent) || 0;
        return acc + hours;
    }, 0);

    const avgConfidence = userLearning.length > 0
        ? (userLearning.reduce((acc, l) => acc + (l.confidence || 0), 0) / userLearning.length).toFixed(1)
        : 0;

    // Calculate overall score
    const overallScore = Math.round(
        (attendanceRate * 0.3) +
        (updateRate * 0.3) +
        (Math.min(learningHours * 10, 100) * 0.2) +
        (avgConfidence * 20 * 0.2)
    );

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--error)';
    };

    const getTrend = (current, previous = 0) => {
        if (current > previous) return { icon: ArrowUp, color: 'var(--success)', label: 'up' };
        if (current < previous) return { icon: ArrowDown, color: 'var(--error)', label: 'down' };
        return { icon: Minus, color: 'var(--text-muted)', label: 'same' };
    };

    const metrics = [
        {
            icon: Calendar,
            label: 'Attendance',
            value: `${attendanceRate}%`,
            description: `${userAttendance.filter(a => a.status === 'present').length} of ${workDays} days`,
            color: getScoreColor(attendanceRate),
            trend: getTrend(attendanceRate, 85)
        },
        {
            icon: ClipboardList,
            label: 'Daily Updates',
            value: `${updateRate}%`,
            description: `${userUpdates.length} updates submitted`,
            color: getScoreColor(updateRate),
            trend: getTrend(updateRate, 90)
        },
        {
            icon: BookOpen,
            label: 'Learning Hours',
            value: `${learningHours}h`,
            description: `${userLearning.length} learning sessions`,
            color: learningHours >= 5 ? 'var(--success)' : 'var(--warning)',
            trend: getTrend(learningHours, 4)
        },
        {
            icon: Target,
            label: 'Avg Confidence',
            value: avgConfidence,
            description: 'Self-rated skill level',
            color: avgConfidence >= 3.5 ? 'var(--success)' : 'var(--warning)',
            trend: getTrend(parseFloat(avgConfidence), 3.5)
        }
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Progression Board</h1>
                <p className="page-subtitle">Track your overall growth and performance</p>
            </div>

            {/* Time Range Toggle */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`tab ${timeRange === 'week' ? 'active' : ''}`}
                    onClick={() => setTimeRange('week')}
                >
                    This Week
                </button>
                <button
                    className={`tab ${timeRange === 'month' ? 'active' : ''}`}
                    onClick={() => setTimeRange('month')}
                >
                    This Month
                </button>
            </div>

            {/* Overall Score Card */}
            <div className="card" style={{
                marginBottom: 'var(--space-6)',
                background: `linear-gradient(135deg, ${getScoreColor(overallScore)}15 0%, ${getScoreColor(overallScore)}05 100%)`,
                border: `1px solid ${getScoreColor(overallScore)}40`
            }}>
                <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <div style={{
                        width: 120,
                        height: 120,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-4)',
                        border: `4px solid ${getScoreColor(overallScore)}`,
                        position: 'relative'
                    }}>
                        <div>
                            <div style={{
                                fontSize: 'var(--text-4xl)',
                                fontWeight: 900,
                                fontFamily: 'var(--font-display)',
                                color: getScoreColor(overallScore)
                            }}>
                                {overallScore}
                            </div>
                        </div>
                    </div>

                    <h2 style={{ marginBottom: 'var(--space-1)' }}>
                        {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good Progress' : 'Needs Improvement'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        Your {timeRange === 'week' ? 'weekly' : 'monthly'} performance score
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
            }}>
                {metrics.map(metric => (
                    <div key={metric.label} className="card">
                        <div className="card-body">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 'var(--radius-lg)',
                                    background: `${metric.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <metric.icon size={20} color={metric.color} />
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-1)',
                                    padding: 'var(--space-1) var(--space-2)',
                                    borderRadius: 'var(--radius-full)',
                                    background: `${metric.trend.color}15`
                                }}>
                                    <metric.trend.icon size={12} color={metric.trend.color} />
                                </div>
                            </div>

                            <div style={{
                                fontSize: 'var(--text-2xl)',
                                fontWeight: 800,
                                fontFamily: 'var(--font-display)',
                                marginBottom: 'var(--space-1)'
                            }}>
                                {metric.value}
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                {metric.label}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                {metric.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Streak & Achievements */}
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                Achievements
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {/* Learning Streak */}
                <div className="card">
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--warning-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Flame size={24} color="var(--warning)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>Learning Streak</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                    {userLearning.length} consecutive days
                                </div>
                            </div>
                            <span style={{
                                fontSize: 'var(--text-xl)',
                                fontWeight: 800,
                                color: 'var(--warning)'
                            }}>
                                🔥
                            </span>
                        </div>
                    </div>
                </div>

                {/* Consistency Badge */}
                {updateRate >= 80 && (
                    <div className="card">
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--success-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Award size={24} color="var(--success)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>Consistency Champion</div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        {updateRate}% daily update rate
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 800,
                                    color: 'var(--success)'
                                }}>
                                    🏆
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Perfect Attendance */}
                {attendanceRate >= 95 && (
                    <div className="card">
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--info-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CheckCircle2 size={24} color="var(--info)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>Perfect Attendance</div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        {attendanceRate}% attendance rate
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 800,
                                    color: 'var(--info)'
                                }}>
                                    ⭐
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                <div className="card-body">
                    <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                        Tips to Improve Your Score
                    </h4>
                    <ul style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)'
                    }}>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <span>•</span>
                            <span>Mark attendance daily before 10 AM</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <span>•</span>
                            <span>Submit daily work updates consistently</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <span>•</span>
                            <span>Log at least 30 mins of learning daily</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <span>•</span>
                            <span>Rate your confidence honestly to track growth</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
