import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    FileText,
    Download,
    Calendar,
    Users,
    TrendingUp,
    Clock,
    BarChart3,
    PieChart,
    Filter
} from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();
    const { attendance, workUpdates, learning, leaveRequests, teams } = useData();

    const [reportType, setReportType] = useState('attendance');
    const [dateRange, setDateRange] = useState('week');

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const startOfMonth = new Date(today);
    startOfMonth.setDate(today.getDate() - 30);

    const dateRangeStart = dateRange === 'week' ? startOfWeek : startOfMonth;

    // Calculate report data
    const getAttendanceStats = () => {
        const filtered = attendance.filter(a =>
            new Date(a.date) >= dateRangeStart
        );

        const present = filtered.filter(a => a.status === 'present').length;
        const total = filtered.length || 1;

        return {
            total: filtered.length,
            present,
            absent: total - present,
            rate: Math.round((present / total) * 100) || 0
        };
    };

    const getWorkUpdateStats = () => {
        const filtered = workUpdates.filter(u =>
            new Date(u.date) >= dateRangeStart
        );

        const approved = filtered.filter(u => u.reviewStatus === 'approved').length;
        const pending = filtered.filter(u => u.reviewStatus === 'pending').length;

        return {
            total: filtered.length,
            approved,
            pending,
            needs_improvement: filtered.filter(u => u.reviewStatus === 'needs_improvement').length
        };
    };

    const getLearningStats = () => {
        const filtered = learning.filter(l =>
            new Date(l.date) >= dateRangeStart
        );

        const totalHours = filtered.reduce((acc, l) => acc + (parseFloat(l.timeSpent) || 0), 0);
        const avgConfidence = filtered.length > 0
            ? (filtered.reduce((acc, l) => acc + (l.confidence || 0), 0) / filtered.length).toFixed(1)
            : 0;

        return {
            sessions: filtered.length,
            totalHours,
            avgConfidence,
            topType: 'course' // Would calculate from actual data
        };
    };

    const getLeaveStats = () => {
        const filtered = leaveRequests.filter(l =>
            new Date(l.createdAt) >= dateRangeStart
        );

        return {
            total: filtered.length,
            approved: filtered.filter(l => l.status === 'approved').length,
            rejected: filtered.filter(l => l.status === 'rejected').length,
            pending: filtered.filter(l => l.status === 'pending').length
        };
    };

    const attendanceStats = getAttendanceStats();
    const workStats = getWorkUpdateStats();
    const learningStats = getLearningStats();
    const leaveStats = getLeaveStats();

    const handleDownloadReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: dateRangeStart.toISOString(),
                end: today.toISOString()
            },
            reportType,
            data: reportType === 'attendance' ? attendanceStats
                : reportType === 'work' ? workStats
                    : reportType === 'learning' ? learningStats
                        : leaveStats
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grofast-${reportType}-report-${today.toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const canViewReports = user?.role === 'team_lead' || user?.role === 'senior' ||
        user?.role === 'md' || user?.role === 'admin';

    if (!canViewReports) {
        return (
            <div className="animate-fade-in">
                <div className="empty-state">
                    <FileText size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">Access Restricted</h3>
                    <p className="empty-state-description">
                        Reports are available for team leads and above
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">Analytics and data exports</p>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap'
            }}>
                <select
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    style={{ width: 'auto', minHeight: 'unset', flex: 1 }}
                >
                    <option value="attendance">Attendance Report</option>
                    <option value="work">Work Updates Report</option>
                    <option value="learning">Learning Report</option>
                    <option value="leave">Leave Report</option>
                </select>

                <select
                    className="form-select"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{ width: 'auto', minHeight: 'unset', flex: 1 }}
                >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                </select>

                <button
                    className="btn btn-primary"
                    onClick={handleDownloadReport}
                >
                    <Download size={18} />
                    Export
                </button>
            </div>

            {/* Attendance Report */}
            {reportType === 'attendance' && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        <div className="stat-card">
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--success-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <Users size={22} color="var(--success)" />
                            </div>
                            <div className="stat-value">{attendanceStats.present}</div>
                            <div className="stat-label">Present Days</div>
                        </div>

                        <div className="stat-card">
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--info-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <TrendingUp size={22} color="var(--info)" />
                            </div>
                            <div className="stat-value">{attendanceStats.rate}%</div>
                            <div className="stat-label">Attendance Rate</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>Attendance Overview</h4>

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 'var(--space-2)'
                                }}>
                                    <span>Present</span>
                                    <span>{attendanceStats.present}</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${attendanceStats.rate}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 'var(--space-2)'
                                }}>
                                    <span>Absent / No Record</span>
                                    <span>{attendanceStats.absent}</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${100 - attendanceStats.rate}%`,
                                            background: 'var(--error)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Work Updates Report */}
            {reportType === 'work' && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        <div className="stat-card">
                            <div className="stat-value">{workStats.total}</div>
                            <div className="stat-label">Total Updates</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{workStats.approved}</div>
                            <div className="stat-label">Reviewed</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>Update Status Breakdown</h4>

                            {[
                                { label: 'Approved', value: workStats.approved, color: 'var(--success)' },
                                { label: 'Pending Review', value: workStats.pending, color: 'var(--warning)' },
                                { label: 'Needs Improvement', value: workStats.needs_improvement, color: 'var(--error)' }
                            ].map(item => (
                                <div key={item.label} style={{ marginBottom: 'var(--space-3)' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 'var(--space-1)'
                                    }}>
                                        <span style={{ fontSize: 'var(--text-sm)' }}>{item.label}</span>
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{item.value}</span>
                                    </div>
                                    <div className="progress-bar" style={{ height: 6 }}>
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${workStats.total > 0 ? (item.value / workStats.total) * 100 : 0}%`,
                                                background: item.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Learning Report */}
            {reportType === 'learning' && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        <div className="stat-card">
                            <div className="stat-value">{learningStats.sessions}</div>
                            <div className="stat-label">Learning Sessions</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{learningStats.totalHours}h</div>
                            <div className="stat-label">Total Hours</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>Learning Insights</h4>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--space-3)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <span>Average Confidence</span>
                                <span style={{ fontWeight: 600 }}>{learningStats.avgConfidence}/5</span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--space-3)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <span>Avg Hours Per Session</span>
                                <span style={{ fontWeight: 600 }}>
                                    {learningStats.sessions > 0
                                        ? (learningStats.totalHours / learningStats.sessions).toFixed(1)
                                        : 0}h
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--space-3)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <span>Most Popular Type</span>
                                <span style={{ fontWeight: 600 }}>Online Course</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Leave Report */}
            {reportType === 'leave' && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        <div className="stat-card">
                            <div className="stat-value">{leaveStats.total}</div>
                            <div className="stat-label">Total Requests</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{leaveStats.pending}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h4 style={{ marginBottom: 'var(--space-4)' }}>Leave Request Status</h4>

                            {[
                                { label: 'Approved', value: leaveStats.approved, color: 'var(--success)' },
                                { label: 'Pending', value: leaveStats.pending, color: 'var(--warning)' },
                                { label: 'Rejected', value: leaveStats.rejected, color: 'var(--error)' }
                            ].map(item => (
                                <div key={item.label} style={{ marginBottom: 'var(--space-3)' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 'var(--space-1)'
                                    }}>
                                        <span style={{ fontSize: 'var(--text-sm)' }}>{item.label}</span>
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{item.value}</span>
                                    </div>
                                    <div className="progress-bar" style={{ height: 6 }}>
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${leaveStats.total > 0 ? (item.value / leaveStats.total) * 100 : 0}%`,
                                                background: item.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
