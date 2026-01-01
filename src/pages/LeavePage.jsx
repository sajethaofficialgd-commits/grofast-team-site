import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Palmtree,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Filter
} from 'lucide-react';

export default function LeavePage() {
    const { user } = useAuth();
    const { leaveRequests, submitLeaveRequest, updateLeaveStatus } = useData();

    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('my-leaves');
    const [filterStatus, setFilterStatus] = useState('all');

    const [formData, setFormData] = useState({
        leaveType: 'casual',
        fromDate: '',
        toDate: '',
        reason: ''
    });

    const leaveTypes = [
        { value: 'casual', label: 'Casual Leave' },
        { value: 'sick', label: 'Sick Leave' },
        { value: 'paid', label: 'Paid Leave' },
        { value: 'wfh', label: 'Work From Home' },
        { value: 'emergency', label: 'Emergency Leave' },
        { value: 'half_day', label: 'Half Day' }
    ];

    const leaveBalance = {
        casual: 12,
        sick: 8,
        paid: 15,
        wfh: 'Unlimited',
        emergency: 5,
        half_day: 10
    };

    // Get user's leave requests
    const myLeaves = leaveRequests
        .filter(l => l.employeeId === user?.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get pending approvals (for team leads/seniors/MD)
    const pendingApprovals = leaveRequests
        .filter(l => l.status === 'pending' && l.employeeId !== user?.id);

    const filteredLeaves = filterStatus === 'all'
        ? myLeaves
        : myLeaves.filter(l => l.status === filterStatus);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitLeaveRequest(formData);
            setFormData({
                leaveType: 'casual',
                fromDate: '',
                toDate: '',
                reason: ''
            });
            setShowForm(false);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproval = async (leaveId, status) => {
        await updateLeaveStatus(leaveId, status, user?.name);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="badge badge-success">Approved</span>;
            case 'rejected':
                return <span className="badge badge-error">Rejected</span>;
            default:
                return <span className="badge badge-warning">Pending</span>;
        }
    };

    const getLeaveTypeLabel = (type) => {
        return leaveTypes.find(t => t.value === type)?.label || type;
    };

    const calculateDays = (from, to) => {
        if (!from || !to) return 0;
        const diff = new Date(to) - new Date(from);
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    const canApprove = user?.role === 'team_lead' || user?.role === 'senior' ||
        user?.role === 'md' || user?.role === 'admin';

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Leave Management</h1>
                <p className="page-subtitle">Apply for leave and track requests</p>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`tab ${activeTab === 'my-leaves' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-leaves')}
                >
                    My Leaves
                </button>
                <button
                    className={`tab ${activeTab === 'balance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balance')}
                >
                    Balance
                </button>
                {canApprove && (
                    <button
                        className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approvals')}
                    >
                        Approvals ({pendingApprovals.length})
                    </button>
                )}
            </div>

            {/* My Leaves Tab */}
            {activeTab === 'my-leaves' && (
                <>
                    {/* Apply Leave Button */}
                    <button
                        className="btn btn-primary btn-block btn-lg"
                        onClick={() => setShowForm(!showForm)}
                        style={{ marginBottom: 'var(--space-6)' }}
                    >
                        <Plus size={20} />
                        Apply for Leave
                    </button>

                    {/* Leave Form */}
                    {showForm && (
                        <div className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)' }}>
                            <div className="card-body">
                                <h3 style={{ marginBottom: 'var(--space-5)' }}>Apply for Leave</h3>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Leave Type *</label>
                                        <select
                                            name="leaveType"
                                            className="form-select"
                                            value={formData.leaveType}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {leaveTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">From Date *</label>
                                            <input
                                                type="date"
                                                name="fromDate"
                                                className="form-input"
                                                value={formData.fromDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">To Date *</label>
                                            <input
                                                type="date"
                                                name="toDate"
                                                className="form-input"
                                                value={formData.toDate}
                                                onChange={handleInputChange}
                                                min={formData.fromDate || new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {formData.fromDate && formData.toDate && (
                                        <div style={{
                                            padding: 'var(--space-3)',
                                            background: 'var(--info-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: 'var(--space-4)',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--info)'
                                        }}>
                                            Total: {calculateDays(formData.fromDate, formData.toDate)} day(s)
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Reason *</label>
                                        <textarea
                                            name="reason"
                                            className="form-textarea"
                                            placeholder="Please provide a reason for your leave request..."
                                            value={formData.reason}
                                            onChange={handleInputChange}
                                            required
                                            rows={3}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowForm(false)}
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSubmitting}
                                            style={{ flex: 1 }}
                                        >
                                            {isSubmitting ? (
                                                <span className="loading-spinner" />
                                            ) : (
                                                'Submit Request'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Filter */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        marginBottom: 'var(--space-4)'
                    }}>
                        <Filter size={18} color="var(--text-muted)" />
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ width: 'auto', minHeight: 'unset', padding: 'var(--space-2) var(--space-3)' }}
                        >
                            <option value="all">All Requests</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Leave Requests List */}
                    {filteredLeaves.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {filteredLeaves.map(leave => (
                                <div key={leave.id} className="card">
                                    <div className="card-body">
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: 'var(--space-3)'
                                        }}>
                                            <div>
                                                <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>
                                                    {getLeaveTypeLabel(leave.leaveType)}
                                                </h4>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-2)',
                                                    fontSize: 'var(--text-sm)',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    <Calendar size={14} />
                                                    {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                                    <span style={{ color: 'var(--text-muted)' }}>
                                                        ({calculateDays(leave.fromDate, leave.toDate)} days)
                                                    </span>
                                                </div>
                                            </div>
                                            {getStatusBadge(leave.status)}
                                        </div>

                                        <p style={{
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--text-secondary)',
                                            marginBottom: 'var(--space-2)'
                                        }}>
                                            {leave.reason}
                                        </p>

                                        {leave.approvedBy && (
                                            <p style={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                {leave.status === 'approved' ? 'Approved' : 'Rejected'} by {leave.approvedBy}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Palmtree size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">No Leave Requests</h3>
                            <p className="empty-state-description">
                                You haven't applied for any leave yet
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Balance Tab */}
            {activeTab === 'balance' && (
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {leaveTypes.map(type => {
                        const used = myLeaves.filter(l =>
                            l.leaveType === type.value && l.status === 'approved'
                        ).reduce((acc, l) => acc + calculateDays(l.fromDate, l.toDate), 0);

                        const total = leaveBalance[type.value];
                        const remaining = typeof total === 'number' ? total - used : total;
                        const percentage = typeof total === 'number' ? ((total - used) / total) * 100 : 100;

                        return (
                            <div key={type.value} className="card">
                                <div className="card-body">
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 'var(--space-3)'
                                    }}>
                                        <h4 style={{ fontSize: 'var(--text-base)' }}>{type.label}</h4>
                                        <span style={{
                                            fontSize: 'var(--text-lg)',
                                            fontWeight: 700,
                                            color: typeof remaining === 'number' && remaining < 3
                                                ? 'var(--warning)'
                                                : 'var(--success)'
                                        }}>
                                            {remaining} {typeof remaining === 'number' ? 'left' : ''}
                                        </span>
                                    </div>

                                    {typeof total === 'number' && (
                                        <>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        background: percentage < 30 ? 'var(--warning)' : 'var(--primary-gradient)'
                                                    }}
                                                />
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--text-muted)',
                                                marginTop: 'var(--space-2)'
                                            }}>
                                                <span>Used: {used}</span>
                                                <span>Total: {total}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && canApprove && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {pendingApprovals.length > 0 ? (
                        pendingApprovals.map(leave => (
                            <div key={leave.id} className="card">
                                <div className="card-body">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        marginBottom: 'var(--space-4)'
                                    }}>
                                        <div className="avatar">{leave.employeeName?.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{leave.employeeName}</div>
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                {leave.team}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 'var(--space-3)' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 'var(--space-2)'
                                        }}>
                                            <span style={{ fontWeight: 500 }}>{getLeaveTypeLabel(leave.leaveType)}</span>
                                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                {calculateDays(leave.fromDate, leave.toDate)} day(s)
                                            </span>
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-2)'
                                        }}>
                                            <Calendar size={14} />
                                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <p style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)',
                                        padding: 'var(--space-3)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-4)'
                                    }}>
                                        {leave.reason}
                                    </p>

                                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleApproval(leave.id, 'approved')}
                                            style={{ flex: 1 }}
                                        >
                                            <CheckCircle2 size={16} />
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleApproval(leave.id, 'rejected')}
                                            style={{ flex: 1 }}
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <CheckCircle2 size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">All Caught Up!</h3>
                            <p className="empty-state-description">
                                No pending leave requests to review
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
