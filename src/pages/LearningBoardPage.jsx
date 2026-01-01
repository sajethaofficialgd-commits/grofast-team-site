import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    BookOpen,
    Clock,
    Star,
    TrendingUp,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Flame,
    Award,
    Target,
    Plus
} from 'lucide-react';

export default function LearningBoardPage() {
    const { user } = useAuth();
    const { learning, submitLearning } = useData();

    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        learningType: 'course',
        timeSpent: '',
        confidence: 3,
        resourceLink: '',
        notes: ''
    });

    const myLearning = learning
        .filter(l => l.employeeId === user?.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate stats
    const totalHours = myLearning.reduce((acc, l) => {
        const hours = parseFloat(l.timeSpent) || 0;
        return acc + hours;
    }, 0);

    const avgConfidence = myLearning.length > 0
        ? (myLearning.reduce((acc, l) => acc + (l.confidence || 0), 0) / myLearning.length).toFixed(1)
        : 0;

    // Calculate streak
    const calculateStreak = () => {
        if (myLearning.length === 0) return 0;

        const dates = [...new Set(myLearning.map(l => l.date))].sort().reverse();
        let streak = 0;
        let checkDate = new Date();

        for (const date of dates) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (date === dateStr) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    };

    const streak = calculateStreak();

    const learningTypes = [
        { value: 'course', label: 'Online Course' },
        { value: 'practice', label: 'Practice / Project' },
        { value: 'reading', label: 'Reading / Article' },
        { value: 'video', label: 'Video Tutorial' },
        { value: 'mentoring', label: 'Mentoring / Discussion' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitLearning(formData);
            setFormData({
                topic: '',
                learningType: 'course',
                timeSpent: '',
                confidence: 3,
                resourceLink: '',
                notes: ''
            });
            setShowForm(false);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderConfidenceStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={16}
                        fill={star <= rating ? 'var(--warning)' : 'none'}
                        color={star <= rating ? 'var(--warning)' : 'var(--text-muted)'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Learning Board</h1>
                <p className="page-subtitle">Track your learning journey and growth</p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
            }}>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--warning-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-2)'
                    }}>
                        <Flame size={22} color="var(--warning)" />
                    </div>
                    <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{streak}</div>
                    <div className="stat-label">Day Streak</div>
                </div>

                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--info-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-2)'
                    }}>
                        <Clock size={22} color="var(--info)" />
                    </div>
                    <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{totalHours}h</div>
                    <div className="stat-label">Total Hours</div>
                </div>

                <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--success-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-2)'
                    }}>
                        <Target size={22} color="var(--success)" />
                    </div>
                    <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{avgConfidence}</div>
                    <div className="stat-label">Avg Confidence</div>
                </div>
            </div>

            {/* Add Learning Button */}
            <button
                className="btn btn-primary btn-block btn-lg"
                onClick={() => setShowForm(!showForm)}
                style={{ marginBottom: 'var(--space-6)' }}
            >
                <Plus size={20} />
                Log Today's Learning
            </button>

            {/* Learning Form */}
            {showForm && (
                <div className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-body">
                        <h3 style={{ marginBottom: 'var(--space-5)' }}>Log Learning</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">What did you learn? *</label>
                                <input
                                    type="text"
                                    name="topic"
                                    className="form-input"
                                    placeholder="e.g., Advanced React Patterns"
                                    value={formData.topic}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Learning Type *</label>
                                <select
                                    name="learningType"
                                    className="form-select"
                                    value={formData.learningType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {learningTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Time Spent *</label>
                                <select
                                    name="timeSpent"
                                    className="form-select"
                                    value={formData.timeSpent}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select duration</option>
                                    <option value="0.5">30 minutes</option>
                                    <option value="1">1 hour</option>
                                    <option value="1.5">1.5 hours</option>
                                    <option value="2">2 hours</option>
                                    <option value="3">3 hours</option>
                                    <option value="4">4+ hours</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confidence Level (1-5)</label>
                                <div style={{
                                    display: 'flex',
                                    gap: 'var(--space-2)',
                                    marginTop: 'var(--space-2)'
                                }}>
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, confidence: level }))}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 'var(--radius-lg)',
                                                border: formData.confidence === level
                                                    ? '2px solid var(--primary)'
                                                    : '1px solid rgba(255,255,255,0.1)',
                                                background: formData.confidence === level
                                                    ? 'rgba(185, 28, 28, 0.2)'
                                                    : 'var(--bg-elevated)',
                                                color: formData.confidence === level
                                                    ? 'var(--primary)'
                                                    : 'var(--text-primary)',
                                                fontSize: 'var(--text-lg)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 150ms ease'
                                            }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <p className="form-hint">
                                    1 = Beginner, 5 = Can teach others
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Resource Link (Optional)</label>
                                <input
                                    type="url"
                                    name="resourceLink"
                                    className="form-input"
                                    placeholder="https://..."
                                    value={formData.resourceLink}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    className="form-textarea"
                                    placeholder="Key takeaways, insights, or things to remember..."
                                    value={formData.notes}
                                    onChange={handleInputChange}
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
                                        'Save Learning'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Learning History */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                    Learning History
                </h3>
            </div>

            {myLearning.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {myLearning.map(item => (
                        <div key={item.id} className="card">
                            <div className="card-body">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: 'var(--space-3)'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            fontSize: 'var(--text-base)',
                                            marginBottom: 'var(--space-1)',
                                            paddingRight: 'var(--space-3)'
                                        }}>
                                            {item.topic}
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 'var(--space-3)',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                <BookOpen size={14} />
                                                {learningTypes.find(t => t.value === item.learningType)?.label || item.learningType}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                <Clock size={14} />
                                                {item.timeSpent}h
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--text-muted)',
                                            marginBottom: 'var(--space-1)'
                                        }}>
                                            {new Date(item.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        {renderConfidenceStars(item.confidence)}
                                    </div>
                                </div>

                                {item.notes && (
                                    <p style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)',
                                        marginBottom: 'var(--space-3)',
                                        padding: 'var(--space-3)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        {item.notes}
                                    </p>
                                )}

                                {item.resourceLink && (
                                    <a
                                        href={item.resourceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-1)',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--primary)'
                                        }}
                                    >
                                        <ExternalLink size={14} />
                                        View Resource
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <BookOpen size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">No Learning Logged</h3>
                    <p className="empty-state-description">
                        Start tracking your learning journey. Even 15 minutes a day counts!
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={18} />
                        Log Your First Learning
                    </button>
                </div>
            )}

            {/* Motivation Card */}
            {streak > 0 && (
                <div className="card" style={{
                    marginTop: 'var(--space-6)',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
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
                            <div>
                                <h4 style={{ color: 'var(--warning)' }}>
                                    {streak} Day Streak! 🔥
                                </h4>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                    Keep it going! Consistent learning leads to mastery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
