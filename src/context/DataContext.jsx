import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// Demo data
const INITIAL_TEAMS = [
    {
        id: 'team-001',
        name: 'Digital Marketing',
        department: 'Marketing',
        leadId: 'tl-001',
        members: ['emp-001', 'tl-001'],
        createdAt: '2024-01-15'
    },
    {
        id: 'team-002',
        name: 'Operations',
        department: 'Operations',
        leadId: 'senior-001',
        members: ['senior-001'],
        createdAt: '2024-01-10'
    },
    {
        id: 'team-003',
        name: 'Development',
        department: 'Tech',
        leadId: 'tl-002',
        members: [],
        createdAt: '2024-02-01'
    }
];

const INITIAL_ATTENDANCE = [
    {
        id: 'att-001',
        date: new Date().toISOString().split('T')[0],
        employeeId: 'emp-001',
        checkIn: null,
        checkOut: null,
        status: 'pending',
        photoUrl: null,
        latitude: null,
        longitude: null,
        address: null,
        device: null
    }
];

const INITIAL_LEAVE_REQUESTS = [
    {
        id: 'leave-001',
        employeeId: 'emp-001',
        employeeName: 'Ravi Kumar',
        team: 'Digital Marketing',
        leaveType: 'casual',
        fromDate: '2026-01-05',
        toDate: '2026-01-05',
        reason: 'Personal work',
        status: 'pending',
        approvedBy: null,
        createdAt: '2026-01-01'
    }
];

const INITIAL_WORK_UPDATES = [
    {
        id: 'wu-001',
        date: '2025-12-31',
        employeeId: 'emp-001',
        employeeName: 'Ravi Kumar',
        team: 'Digital Marketing',
        yesterdayWork: 'Completed social media content calendar for January',
        todayPlan: 'Design creatives for new campaign',
        blockers: 'Waiting for brand guidelines',
        timeSpent: '6 hours',
        attachments: [],
        reviewStatus: 'pending',
        seniorComment: null,
        submittedAt: '2025-12-31T09:30:00'
    }
];

const INITIAL_LEARNING = [
    {
        id: 'learn-001',
        date: '2025-12-31',
        employeeId: 'emp-001',
        employeeName: 'Ravi Kumar',
        topic: 'Advanced Google Ads Optimization',
        learningType: 'course',
        timeSpent: '2 hours',
        confidence: 4,
        resourceLink: 'https://skillshop.google.com',
        notes: 'Learned about smart bidding strategies'
    }
];

const INITIAL_APPOINTMENTS = [
    {
        id: 'apt-001',
        requestedBy: 'emp-001',
        requestedByName: 'Ravi Kumar',
        requestedWith: 'tl-001',
        requestedWithName: 'Priya Sharma',
        requestedWithRole: 'Team Lead',
        date: '2026-01-02',
        time: '14:00',
        agenda: 'Discuss Q1 marketing strategy',
        status: 'pending',
        createdAt: '2026-01-01'
    }
];

const INITIAL_MEETINGS = [
    {
        id: 'meet-001',
        title: 'Daily Standup - Marketing',
        type: 'daily',
        teamId: 'team-001',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 15,
        attendees: ['emp-001', 'tl-001'],
        status: 'scheduled'
    },
    {
        id: 'meet-002',
        title: 'Weekly Review - Marketing',
        type: 'weekly',
        teamId: 'team-001',
        date: '2026-01-06',
        time: '15:00',
        duration: 60,
        attendees: ['emp-001', 'tl-001', 'senior-001'],
        status: 'scheduled'
    }
];

const INITIAL_MESSAGES = [
    {
        id: 'msg-001',
        chatId: 'chat-emp001-tl001',
        senderId: 'tl-001',
        senderName: 'Priya Sharma',
        content: 'Hi Ravi, how is the campaign progress?',
        timestamp: '2025-12-31T14:30:00',
        read: true
    },
    {
        id: 'msg-002',
        chatId: 'chat-emp001-tl001',
        senderId: 'emp-001',
        senderName: 'Ravi Kumar',
        content: 'Going great! Will share the draft by EOD.',
        timestamp: '2025-12-31T14:35:00',
        read: true
    }
];

const INITIAL_CHATS = [
    {
        id: 'chat-emp001-tl001',
        type: 'direct',
        participants: ['emp-001', 'tl-001'],
        lastMessage: 'Going great! Will share the draft by EOD.',
        lastMessageTime: '2025-12-31T14:35:00',
        unreadCount: 0
    },
    {
        id: 'chat-team-001',
        type: 'group',
        name: 'Digital Marketing Team',
        participants: ['emp-001', 'tl-001'],
        lastMessage: 'Team meeting at 3 PM today',
        lastMessageTime: '2025-12-31T10:00:00',
        unreadCount: 0
    }
];

export function DataProvider({ children }) {
    const { user } = useAuth();

    const [teams, setTeams] = useState(INITIAL_TEAMS);
    const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
    const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
    const [workUpdates, setWorkUpdates] = useState(INITIAL_WORK_UPDATES);
    const [learning, setLearning] = useState(INITIAL_LEARNING);
    const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
    const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [chats, setChats] = useState(INITIAL_CHATS);

    // Load data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('grofast_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.teams) setTeams(data.teams);
                if (data.attendance) setAttendance(data.attendance);
                if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
                if (data.workUpdates) setWorkUpdates(data.workUpdates);
                if (data.learning) setLearning(data.learning);
                if (data.appointments) setAppointments(data.appointments);
                if (data.meetings) setMeetings(data.meetings);
                if (data.messages) setMessages(data.messages);
                if (data.chats) setChats(data.chats);
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }, []);

    // Save data to localStorage
    useEffect(() => {
        const data = {
            teams,
            attendance,
            leaveRequests,
            workUpdates,
            learning,
            appointments,
            meetings,
            messages,
            chats
        };
        localStorage.setItem('grofast_data', JSON.stringify(data));
    }, [teams, attendance, leaveRequests, workUpdates, learning, appointments, meetings, messages, chats]);

    // Webhook helper - sends data to n8n
    const sendToWebhook = async (endpoint, data) => {
        // In production, replace with actual n8n webhook URL
        const webhookBaseUrl = 'https://your-n8n-instance.com/webhook';

        try {
            // Log for demo purposes
            console.log(`[n8n Webhook] ${endpoint}:`, data);

            // Actual webhook call (uncomment in production)
            // const response = await fetch(`${webhookBaseUrl}/${endpoint}`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(data)
            // });
            // return response.json();

            return { success: true };
        } catch (error) {
            console.error('Webhook error:', error);
            return { success: false, error };
        }
    };

    // Attendance functions
    const markAttendance = async (attendanceData) => {
        const newAttendance = {
            id: `att-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            employeeId: user?.id,
            checkIn: new Date().toISOString(),
            checkOut: null,
            status: 'present',
            ...attendanceData
        };

        setAttendance(prev => [...prev, newAttendance]);
        await sendToWebhook('attendance', newAttendance);
        return newAttendance;
    };

    const checkOut = async (attendanceId) => {
        setAttendance(prev => prev.map(a =>
            a.id === attendanceId
                ? { ...a, checkOut: new Date().toISOString() }
                : a
        ));
    };

    // Leave functions
    const submitLeaveRequest = async (leaveData) => {
        const newRequest = {
            id: `leave-${Date.now()}`,
            employeeId: user?.id,
            employeeName: user?.name,
            team: user?.team,
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...leaveData
        };

        setLeaveRequests(prev => [...prev, newRequest]);
        await sendToWebhook('leave-request', newRequest);
        return newRequest;
    };

    const updateLeaveStatus = async (leaveId, status, approvedBy) => {
        setLeaveRequests(prev => prev.map(l =>
            l.id === leaveId
                ? { ...l, status, approvedBy }
                : l
        ));

        const leave = leaveRequests.find(l => l.id === leaveId);
        await sendToWebhook('leave-status-update', { ...leave, status, approvedBy });
    };

    // Work update functions
    const submitWorkUpdate = async (updateData) => {
        const newUpdate = {
            id: `wu-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            employeeId: user?.id,
            employeeName: user?.name,
            team: user?.team,
            reviewStatus: 'pending',
            submittedAt: new Date().toISOString(),
            ...updateData
        };

        setWorkUpdates(prev => [...prev, newUpdate]);
        await sendToWebhook('work-update', newUpdate);
        return newUpdate;
    };

    const reviewWorkUpdate = async (updateId, status, comment) => {
        setWorkUpdates(prev => prev.map(u =>
            u.id === updateId
                ? { ...u, reviewStatus: status, seniorComment: comment }
                : u
        ));
    };

    // Learning functions
    const submitLearning = async (learningData) => {
        const newLearning = {
            id: `learn-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            employeeId: user?.id,
            employeeName: user?.name,
            ...learningData
        };

        setLearning(prev => [...prev, newLearning]);
        await sendToWebhook('learning-progress', newLearning);
        return newLearning;
    };

    // Appointment functions
    const bookAppointment = async (appointmentData) => {
        const newApt = {
            id: `apt-${Date.now()}`,
            requestedBy: user?.id,
            requestedByName: user?.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...appointmentData
        };

        setAppointments(prev => [...prev, newApt]);
        await sendToWebhook('appointment', newApt);
        return newApt;
    };

    const updateAppointmentStatus = async (aptId, status) => {
        setAppointments(prev => prev.map(a =>
            a.id === aptId ? { ...a, status } : a
        ));
    };

    // Chat functions
    const sendMessage = async (chatId, content) => {
        const newMessage = {
            id: `msg-${Date.now()}`,
            chatId,
            senderId: user?.id,
            senderName: user?.name,
            content,
            timestamp: new Date().toISOString(),
            read: false
        };

        setMessages(prev => [...prev, newMessage]);
        setChats(prev => prev.map(c =>
            c.id === chatId
                ? { ...c, lastMessage: content, lastMessageTime: newMessage.timestamp }
                : c
        ));

        return newMessage;
    };

    // Team functions
    const createTeam = async (teamData) => {
        const newTeam = {
            id: `team-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0],
            members: [],
            ...teamData
        };

        setTeams(prev => [...prev, newTeam]);
        return newTeam;
    };

    // Get dashboard stats
    const getDashboardStats = () => {
        const today = new Date().toISOString().split('T')[0];

        const todayAttendance = attendance.filter(a =>
            a.date === today && a.employeeId === user?.id
        );

        const todayUpdate = workUpdates.find(u =>
            u.date === today && u.employeeId === user?.id
        );

        const pendingLeaves = leaveRequests.filter(l =>
            l.status === 'pending' && l.employeeId === user?.id
        );

        const upcomingMeetings = meetings.filter(m =>
            m.date >= today && m.attendees?.includes(user?.id)
        );

        const learningStreak = calculateLearningStreak();

        return {
            attendanceMarked: todayAttendance.length > 0 && todayAttendance[0].status === 'present',
            updateSubmitted: !!todayUpdate,
            pendingLeaves: pendingLeaves.length,
            upcomingMeetings: upcomingMeetings.length,
            learningStreak
        };
    };

    const calculateLearningStreak = () => {
        const userLearning = learning.filter(l => l.employeeId === user?.id);
        if (userLearning.length === 0) return 0;

        const sortedDates = [...new Set(userLearning.map(l => l.date))].sort().reverse();
        let streak = 0;
        let checkDate = new Date();

        for (const date of sortedDates) {
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

    return (
        <DataContext.Provider value={{
            // Data
            teams,
            attendance,
            leaveRequests,
            workUpdates,
            learning,
            appointments,
            meetings,
            messages,
            chats,

            // Functions
            markAttendance,
            checkOut,
            submitLeaveRequest,
            updateLeaveStatus,
            submitWorkUpdate,
            reviewWorkUpdate,
            submitLearning,
            bookAppointment,
            updateAppointmentStatus,
            sendMessage,
            createTeam,
            getDashboardStats,
            sendToWebhook
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

export default DataContext;
