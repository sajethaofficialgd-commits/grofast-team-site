import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    Send,
    Calendar,
    Paperclip,
    ChevronDown,
    ChevronUp,
    MessageSquare
} from 'lucide-react';

export default function DailyUpdatePage() {
    const { user } = useAuth();
    const { workUpdates, submitWorkUpdate, reviewWorkUpdate } = useData();

    const [activeTab, setActiveTab] = useState('submit');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [expandedUpdate, setExpandedUpdate] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        yesterdayWork: '',
        todayPlan: '',
        blockers: '',
        timeSpent: '',
        attachments: []
    });

    const today = new Date().toISOString().split('T')[0];
    const todayUpdate = workUpdates.find(u => u.date === today && u.employeeId === user?.id);

    // Get updates for review (for team leads/seniors)
    const pendingReviews = workUpdates.filter(u =>
        u.reviewStatus === 'pending' &&
        u.employeeId !== user?.id &&
        (user?.role === 'team_lead' || user?.role === 'senior' || user?.role === 'md' || user?.role === 'admin')
    );

    // User's past updates
    const myUpdates = workUpdates
        .filter(u => u.employeeId === user?.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitWorkUpdate(formData);
            setShowSuccess(true);
            setFormData({
                yesterdayWork: '',
                todayPlan: '',
                blockers: '',
                timeSpent: '',
                attachments: []
            });

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReview = async (updateId, status) => {
        const comment = prompt('Add a comment (optional):');
        await reviewWorkUpdate(updateId, status, comment);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="badge badge-success">Reviewed</span>;
            case 'needs_improvement':
                return <span className="badge badge-warning">Needs Work</span>;
            default:
                return <span className="badge badge-neutral">Pending</span>;
        }
    };

    const cutoffTime = '11:00 AM';
    const currentTime = new Date();
    const isPastCutoff = currentTime.getHours() >= 11;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Daily Work Update</h1>
                <p className="page-subtitle">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </p>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submit')}
                >
                    Submit Update
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    My History
                </button>
                {(user?.role === 'team_lead' || user?.role === 'senior' || user?.role === 'md') && (
                    <button
                        className={`tab ${activeTab === 'review' ? 'active' : ''}`}
                        onClick={() => setActiveTab('review')}
                    >
                        Review ({pendingReviews.length})
                    </button>
                )}
            </div>

            {/* Submit Tab */}
            {activeTab === 'submit' && (
                <>
                    {/* Status Card */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-full)',
                                    background: todayUpdate ? 'var(--success-bg)' : 'var(--warning-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {todayUpdate ? (
                                        <CheckCircle2 size={24} color="var(--success)" />
                                    ) : (
                                        <Clock size={24} color="var(--warning)" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>
                                        {todayUpdate ? 'Update Submitted' : 'Update Pending'}
                                    </h3>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        {todayUpdate
                                            ? `Submitted at ${new Date(todayUpdate.submittedAt).toLocaleTimeString()}`
                                            : `Please submit by ${cutoffTime}`
                                        }
                                    </p>
                                </div>
                                {todayUpdate && getStatusBadge(todayUpdate.reviewStatus)}
                            </div>
                        </div>
                    </div>

                    {/* Warning for late submission */}
                    {isPastCutoff && !todayUpdate && (
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--warning-bg)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--space-5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)'
                        }}>
                            <AlertCircle size={20} color="var(--warning)" />
                            <p style={{ color: 'var(--warning)', fontSize: 'var(--text-sm)' }}>
                                You're submitting after the {cutoffTime} cutoff. This will be flagged.
                            </p>
                        </div>
                    )}

                    {/* Success message */}
                    {showSuccess && (
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--success-bg)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--space-5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            animation: 'slideUp 300ms ease'
                        }}>
                            <CheckCircle2 size={20} color="var(--success)" />
                            <p style={{ color: 'var(--success)', fontSize: 'var(--text-sm)' }}>
                                Your daily update has been submitted successfully!
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    {!todayUpdate ? (
                        <form onSubmit={handleSubmit}>
                            <div className="card">
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label">Yesterday's Work *</label>
                                        <textarea
                                            name="yesterdayWork"
                                            className="form-textarea"
                                            placeholder="What did you accomplish yesterday?"
                                            value={formData.yesterdayWork}
                                            onChange={handleInputChange}
                                            required
                                            rows={4}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Today's Plan *</label>
                                        <textarea
                                            name="todayPlan"
                                            className="form-textarea"
                                            placeholder="What do you plan to work on today?"
                                            value={formData.todayPlan}
                                            onChange={handleInputChange}
                                            required
                                            rows={4}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Blockers (if any)</label>
                                        <textarea
                                            name="blockers"
                                            className="form-textarea"
                                            placeholder="Any blockers or challenges you're facing?"
                                            value={formData.blockers}
                                            onChange={handleInputChange}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Time Spent (Optional)</label>
                                        <select
                                            name="timeSpent"
                                            className="form-select"
                                            value={formData.timeSpent}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select hours</option>
                                            <option value="< 4 hours">Less than 4 hours</option>
                                            <option value="4-6 hours">4-6 hours</option>
                                            <option value="6-8 hours">6-8 hours</option>
                                            <option value="8+ hours">8+ hours</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block btn-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="loading-spinner" />
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Submit Update
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="card">
                            <div className="card-body">
                                <h4 style={{ marginBottom: 'var(--space-4)' }}>Today's Submitted Update</h4>

                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <label style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)',
                                        display: 'block',
                                        marginBottom: 'var(--space-1)'
                                    }}>
                                        Yesterday's Work
                                    </label>
                                    <p>{todayUpdate.yesterdayWork}</p>
                                </div>

                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <label style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)',
                                        display: 'block',
                                        marginBottom: 'var(--space-1)'
                                    }}>
                                        Today's Plan
                                    </label>
                                    <p>{todayUpdate.todayPlan}</p>
                                </div>

                                {todayUpdate.blockers && (
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--text-secondary)',
                                            display: 'block',
                                            marginBottom: 'var(--space-1)'
                                        }}>
                                            Blockers
                                        </label>
                                        <p>{todayUpdate.blockers}</p>
                                    </div>
                                )}

                                {todayUpdate.seniorComment && (
                                    <div style={{
                                        marginTop: 'var(--space-4)',
                                        padding: 'var(--space-4)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-2)',
                                            marginBottom: 'var(--space-2)'
                                        }}>
                                            <MessageSquare size={16} color="var(--primary)" />
                                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                Senior's Comment
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 'var(--text-sm)' }}>{todayUpdate.seniorComment}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {myUpdates.length > 0 ? (
                        myUpdates.map(update => (
                            <div key={update.id} className="card">
                                <div
                                    className="card-body"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setExpandedUpdate(
                                        expandedUpdate === update.id ? null : update.id
                                    )}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 'var(--radius-lg)',
                                                background: 'var(--info-bg)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Calendar size={20} color="var(--info)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>
                                                    {new Date(update.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                    Submitted at {new Date(update.submittedAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            {getStatusBadge(update.reviewStatus)}
                                            {expandedUpdate === update.id ? (
                                                <ChevronUp size={20} color="var(--text-muted)" />
                                            ) : (
                                                <ChevronDown size={20} color="var(--text-muted)" />
                                            )}
                                        </div>
                                    </div>

                                    {expandedUpdate === update.id && (
                                        <div style={{
                                            marginTop: 'var(--space-4)',
                                            paddingTop: 'var(--space-4)',
                                            borderTop: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                                <label style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: 'var(--text-muted)',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Yesterday's Work
                                                </label>
                                                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                                                    {update.yesterdayWork}
                                                </p>
                                            </div>
                                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                                <label style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: 'var(--text-muted)',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Today's Plan
                                                </label>
                                                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                                                    {update.todayPlan}
                                                </p>
                                            </div>
                                            {update.blockers && (
                                                <div>
                                                    <label style={{
                                                        fontSize: 'var(--text-xs)',
                                                        color: 'var(--text-muted)',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        Blockers
                                                    </label>
                                                    <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                                                        {update.blockers}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <ClipboardList size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">No Updates Yet</h3>
                            <p className="empty-state-description">
                                Start submitting daily updates to track your progress
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Review Tab (for Team Leads/Seniors) */}
            {activeTab === 'review' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {pendingReviews.length > 0 ? (
                        pendingReviews.map(update => (
                            <div key={update.id} className="card">
                                <div className="card-body">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        marginBottom: 'var(--space-4)'
                                    }}>
                                        <div className="avatar">{update.employeeName?.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{update.employeeName}</div>
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                {update.team} • {new Date(update.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 'var(--space-3)' }}>
                                        <label style={{
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase'
                                        }}>
                                            Yesterday's Work
                                        </label>
                                        <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                                            {update.yesterdayWork}
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: 'var(--space-3)' }}>
                                        <label style={{
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase'
                                        }}>
                                            Today's Plan
                                        </label>
                                        <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                                            {update.todayPlan}
                                        </p>
                                    </div>

                                    {update.blockers && (
                                        <div style={{ marginBottom: 'var(--space-4)' }}>
                                            <label style={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--text-muted)',
                                                textTransform: 'uppercase'
                                            }}>
                                                Blockers
                                            </label>
                                            <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', color: 'var(--warning)' }}>
                                                {update.blockers}
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleReview(update.id, 'approved')}
                                            style={{ flex: 1 }}
                                        >
                                            <CheckCircle2 size={16} />
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleReview(update.id, 'needs_improvement')}
                                            style={{ flex: 1 }}
                                        >
                                            Needs Work
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
                                No pending updates to review
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
