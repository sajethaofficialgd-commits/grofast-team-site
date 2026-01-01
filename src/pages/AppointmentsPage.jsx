import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    CalendarCheck,
    Plus,
    Clock,
    User,
    Users,
    CheckCircle2,
    XCircle,
    Calendar,
    MessageSquare,
    ChevronDown
} from 'lucide-react';

export default function AppointmentsPage() {
    const { user, getRoleLabel } = useAuth();
    const { appointments, bookAppointment, updateAppointmentStatus } = useData();

    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('my-bookings');

    const [formData, setFormData] = useState({
        requestedWith: '',
        requestedWithName: '',
        requestedWithRole: '',
        date: '',
        time: '',
        agenda: ''
    });

    // Available people to book with based on role
    const availableContacts = [
        { id: 'tl-001', name: 'Priya Sharma', role: 'Team Lead' },
        { id: 'senior-001', name: 'Arun Patel', role: 'Senior' },
        { id: 'md-001', name: 'Vikram Raghunathan', role: 'MD' }
    ].filter(c => {
        // MD can only be booked by seniors
        if (c.role === 'MD' && user?.role !== 'senior' && user?.role !== 'team_lead') {
            return false;
        }
        return c.id !== user?.id;
    });

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
        '16:30', '17:00', '17:30'
    ];

    // My bookings
    const myBookings = appointments
        .filter(a => a.requestedBy === user?.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Incoming requests (for team leads/seniors/MD)
    const incomingRequests = appointments
        .filter(a => a.requestedWith === user?.id && a.status === 'pending');

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'requestedWith') {
            const selected = availableContacts.find(c => c.id === value);
            setFormData(prev => ({
                ...prev,
                requestedWith: value,
                requestedWithName: selected?.name || '',
                requestedWithRole: selected?.role || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await bookAppointment(formData);
            setFormData({
                requestedWith: '',
                requestedWithName: '',
                requestedWithRole: '',
                date: '',
                time: '',
                agenda: ''
            });
            setShowForm(false);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproval = async (aptId, status) => {
        await updateAppointmentStatus(aptId, status);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="badge badge-success">Approved</span>;
            case 'rejected':
                return <span className="badge badge-error">Rejected</span>;
            case 'rescheduled':
                return <span className="badge badge-warning">Rescheduled</span>;
            default:
                return <span className="badge badge-warning">Pending</span>;
        }
    };

    const canReceiveAppointments = user?.role === 'team_lead' || user?.role === 'senior' ||
        user?.role === 'md';

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Appointments</h1>
                <p className="page-subtitle">Book meetings with seniors and leadership</p>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`tab ${activeTab === 'my-bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-bookings')}
                >
                    My Bookings
                </button>
                {canReceiveAppointments && (
                    <button
                        className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests ({incomingRequests.length})
                    </button>
                )}
            </div>

            {/* My Bookings Tab */}
            {activeTab === 'my-bookings' && (
                <>
                    {/* Book Appointment Button */}
                    <button
                        className="btn btn-primary btn-block btn-lg"
                        onClick={() => setShowForm(!showForm)}
                        style={{ marginBottom: 'var(--space-6)' }}
                    >
                        <Plus size={20} />
                        Book Appointment
                    </button>

                    {/* Booking Form */}
                    {showForm && (
                        <div className="card animate-slide-up" style={{ marginBottom: 'var(--space-6)' }}>
                            <div className="card-body">
                                <h3 style={{ marginBottom: 'var(--space-5)' }}>Book an Appointment</h3>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Select Person *</label>
                                        <select
                                            name="requestedWith"
                                            className="form-select"
                                            value={formData.requestedWith}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Choose who to meet with...</option>
                                            {availableContacts.map(contact => (
                                                <option key={contact.id} value={contact.id}>
                                                    {contact.name} ({contact.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Date *</label>
                                            <input
                                                type="date"
                                                name="date"
                                                className="form-input"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Time Slot *</label>
                                            <select
                                                name="time"
                                                className="form-select"
                                                value={formData.time}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select time...</option>
                                                {timeSlots.map(slot => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Meeting Agenda *</label>
                                        <textarea
                                            name="agenda"
                                            className="form-textarea"
                                            placeholder="Brief description of what you'd like to discuss..."
                                            value={formData.agenda}
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
                                                'Book Appointment'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* My Bookings List */}
                    {myBookings.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {myBookings.map(apt => (
                                <div key={apt.id} className="card">
                                    <div className="card-body">
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: 'var(--space-3)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <div className="avatar">{apt.requestedWithName?.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{apt.requestedWithName}</div>
                                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                        {apt.requestedWithRole}
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(apt.status)}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--space-4)',
                                            marginBottom: 'var(--space-3)',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                <Calendar size={14} />
                                                {new Date(apt.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                <Clock size={14} />
                                                {apt.time}
                                            </span>
                                        </div>

                                        <div style={{
                                            padding: 'var(--space-3)',
                                            background: 'var(--bg-elevated)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--text-sm)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                                marginBottom: 'var(--space-1)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                <MessageSquare size={14} />
                                                Agenda
                                            </div>
                                            {apt.agenda}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <CalendarCheck size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">No Appointments</h3>
                            <p className="empty-state-description">
                                Book an appointment with your seniors or leadership
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && canReceiveAppointments && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {incomingRequests.length > 0 ? (
                        incomingRequests.map(apt => (
                            <div key={apt.id} className="card">
                                <div className="card-body">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        marginBottom: 'var(--space-4)'
                                    }}>
                                        <div className="avatar">{apt.requestedByName?.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{apt.requestedByName}</div>
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                Appointment Request
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: 'var(--space-4)',
                                        marginBottom: 'var(--space-3)',
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                            <Calendar size={14} />
                                            {new Date(apt.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                            <Clock size={14} />
                                            {apt.time}
                                        </span>
                                    </div>

                                    <div style={{
                                        padding: 'var(--space-3)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-4)',
                                        fontSize: 'var(--text-sm)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-2)',
                                            marginBottom: 'var(--space-1)',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <MessageSquare size={14} />
                                            Agenda
                                        </div>
                                        {apt.agenda}
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleApproval(apt.id, 'approved')}
                                            style={{ flex: 1 }}
                                        >
                                            <CheckCircle2 size={16} />
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleApproval(apt.id, 'rejected')}
                                            style={{ flex: 1 }}
                                        >
                                            <XCircle size={16} />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <CheckCircle2 size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">No Pending Requests</h3>
                            <p className="empty-state-description">
                                You don't have any appointment requests
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
