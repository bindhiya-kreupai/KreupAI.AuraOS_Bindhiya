"use client";

import React, { useState } from 'react';
import {
    MessageSquare,
    Calendar,
    Mic,
    CheckSquare,
    Smile,
    ArrowRight,
    X,
    Plus,
    Clock,
    User,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Edit2,
    Trash2,
    Send,
    BarChart3,
    Target,
    Users
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

type MeetingType = 'Weekly Sync' | 'Career Dev' | 'Performance Review' | 'Feedback' | 'Check-in';
type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
type ActionStatus = 'pending' | 'in-progress' | 'completed';
type SentimentScore = 1 | 2 | 3 | 4 | 5;

interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar?: string;
}

interface TalkingPoint {
    id: string;
    text: string;
    isDiscussed: boolean;
    notes?: string;
}

interface ActionItem {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: ActionStatus;
    priority: 'low' | 'medium' | 'high';
}

interface FeedbackQuestion {
    id: string;
    question: string;
    category: 'engagement' | 'workload' | 'growth' | 'satisfaction' | 'concerns';
}

interface FeedbackResponse {
    questionId: string;
    response: string;
    rating?: number;
}

interface Meeting {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    managerId: string;
    managerName: string;
    scheduledDate: string;
    duration: number; // in minutes
    type: MeetingType;
    status: MeetingStatus;
    talkingPoints: TalkingPoint[];
    actionItems: ActionItem[];
    notes: string;
    sentiment?: SentimentScore;
    feedbackResponses?: FeedbackResponse[];
    createdAt: string;
    completedAt?: string;
}

interface MeetingStats {
    totalMeetings: number;
    completedMeetings: number;
    averageSentiment: number;
    pendingActionItems: number;
    employeesEngaged: number;
    trendsImproving: boolean;
}

// ==================== SAMPLE DATA ====================

const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
    { id: 'fq1', question: 'How satisfied are you with your current role?', category: 'satisfaction' },
    { id: 'fq2', question: 'Do you feel your workload is manageable?', category: 'workload' },
    { id: 'fq3', question: 'Are you getting opportunities to grow and develop?', category: 'growth' },
    { id: 'fq4', question: 'How engaged do you feel with your team and work?', category: 'engagement' },
    { id: 'fq5', question: 'Do you have any concerns you would like to discuss?', category: 'concerns' },
];

const SAMPLE_EMPLOYEES: Employee[] = [
    { id: 'emp1', name: 'Dwight Schrute', role: 'Assistant Regional Manager', department: 'Sales' },
    { id: 'emp2', name: 'Jim Halpert', role: 'Sales Executive', department: 'Sales' },
    { id: 'emp3', name: 'Pam Beesly', role: 'Receptionist', department: 'Admin' },
    { id: 'emp4', name: 'Stanley Hudson', role: 'Sales Representative', department: 'Sales' },
    { id: 'emp5', name: 'Angela Martin', role: 'Accountant', department: 'Accounting' },
];

const generateInitialMeetings = (): Meeting[] => [
    {
        id: 'm1',
        employeeId: 'emp1',
        employeeName: 'Dwight Schrute',
        employeeRole: 'Assistant Regional Manager',
        managerId: 'mgr1',
        managerName: 'Michael Scott',
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        duration: 30,
        type: 'Weekly Sync',
        status: 'scheduled',
        talkingPoints: [
            { id: 'tp1', text: 'Review Sales Numbers for Nov', isDiscussed: false },
            { id: 'tp2', text: 'Discuss new Beet Farm Policy', isDiscussed: false },
            { id: 'tp3', text: 'Safety Training Compliance', isDiscussed: false },
        ],
        actionItems: [
            { id: 'ai1', description: 'Submit revised forecast by Friday', assignedTo: 'emp1', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', priority: 'high' },
        ],
        notes: '',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'm2',
        employeeId: 'emp2',
        employeeName: 'Jim Halpert',
        employeeRole: 'Sales Executive',
        managerId: 'mgr1',
        managerName: 'Michael Scott',
        scheduledDate: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 45,
        type: 'Career Dev',
        status: 'scheduled',
        talkingPoints: [
            { id: 'tp4', text: 'Career progression goals', isDiscussed: false },
            { id: 'tp5', text: 'Skill development opportunities', isDiscussed: false },
        ],
        actionItems: [],
        notes: '',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'm3',
        employeeId: 'emp3',
        employeeName: 'Pam Beesly',
        employeeRole: 'Receptionist',
        managerId: 'mgr1',
        managerName: 'Michael Scott',
        scheduledDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        type: 'Check-in',
        status: 'completed',
        talkingPoints: [
            { id: 'tp6', text: 'Discussed design courses', isDiscussed: true, notes: 'Interested in graphic design certification' },
            { id: 'tp7', text: 'Office improvements', isDiscussed: true },
        ],
        actionItems: [
            { id: 'ai2', description: 'Research design courses', assignedTo: 'emp3', dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed', priority: 'medium' },
        ],
        notes: 'Pam is very enthusiastic about learning design. Approved budget for courses.',
        sentiment: 4,
        feedbackResponses: [
            { questionId: 'fq1', response: 'I enjoy my work but would like more creative challenges.', rating: 3 },
            { questionId: 'fq2', response: 'Workload is manageable.', rating: 4 },
            { questionId: 'fq3', response: 'Yes, excited about design courses!', rating: 5 },
            { questionId: 'fq4', response: 'Very engaged, love the team.', rating: 5 },
        ],
        completedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'm4',
        employeeId: 'emp4',
        employeeName: 'Stanley Hudson',
        employeeRole: 'Sales Representative',
        managerId: 'mgr1',
        managerName: 'Michael Scott',
        scheduledDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        type: 'Weekly Sync',
        status: 'completed',
        talkingPoints: [
            { id: 'tp8', text: 'Retirement planning', isDiscussed: true, notes: 'Wants to reduce hours gradually' },
            { id: 'tp9', text: 'Sales territory review', isDiscussed: true },
        ],
        actionItems: [],
        notes: 'Stanley is planning to retire in 2 years. Discussed succession planning.',
        sentiment: 3,
        feedbackResponses: [
            { questionId: 'fq1', response: 'Ready to retire soon.', rating: 3 },
            { questionId: 'fq2', response: 'Workload is fine.', rating: 4 },
        ],
        completedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// ==================== MAIN COMPONENT ====================

export default function OneOnOnePage() {
    const [meetings, setMeetings] = useState<Meeting[]>(generateInitialMeetings());
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(meetings[0]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [newTalkingPoint, setNewTalkingPoint] = useState('');
    const [newActionItem, setNewActionItem] = useState('');

    // ==================== SCHEDULE MEETING FORM STATE ====================
    const [scheduleForm, setScheduleForm] = useState({
        employeeId: '',
        date: '',
        time: '',
        duration: '30',
        type: 'Weekly Sync' as MeetingType,
    });

    // ==================== FEEDBACK FORM STATE ====================
    const [feedbackForm, setFeedbackForm] = useState<FeedbackResponse[]>(
        FEEDBACK_QUESTIONS.map(q => ({ questionId: q.id, response: '', rating: undefined }))
    );

    // ==================== COMPUTED STATS ====================
    const stats: MeetingStats = {
        totalMeetings: meetings.length,
        completedMeetings: meetings.filter(m => m.status === 'completed').length,
        averageSentiment: meetings.filter(m => m.sentiment).reduce((acc, m) => acc + (m.sentiment || 0), 0) / meetings.filter(m => m.sentiment).length || 0,
        pendingActionItems: meetings.flatMap(m => m.actionItems).filter(a => a.status !== 'completed').length,
        employeesEngaged: new Set(meetings.map(m => m.employeeId)).size,
        trendsImproving: true, // Would be calculated based on historical data
    };

    // ==================== HANDLERS ====================

    const handleScheduleMeeting = () => {
        const employee = SAMPLE_EMPLOYEES.find(e => e.id === scheduleForm.employeeId);
        if (!employee || !scheduleForm.date || !scheduleForm.time) {
            alert('Please fill all required fields');
            return;
        }

        const scheduledDate = new Date(`${scheduleForm.date}T${scheduleForm.time}`);
        const newMeeting: Meeting = {
            id: `m${Date.now()}`,
            employeeId: employee.id,
            employeeName: employee.name,
            employeeRole: employee.role,
            managerId: 'mgr1',
            managerName: 'Michael Scott',
            scheduledDate: scheduledDate.toISOString(),
            duration: parseInt(scheduleForm.duration),
            type: scheduleForm.type,
            status: 'scheduled',
            talkingPoints: [],
            actionItems: [],
            notes: '',
            createdAt: new Date().toISOString(),
        };

        setMeetings([newMeeting, ...meetings]);
        setSelectedMeeting(newMeeting);
        setShowScheduleModal(false);
        setScheduleForm({ employeeId: '', date: '', time: '', duration: '30', type: 'Weekly Sync' });
    };

    const handleAddTalkingPoint = () => {
        if (!selectedMeeting || !newTalkingPoint.trim()) return;

        const updatedMeeting = {
            ...selectedMeeting,
            talkingPoints: [
                ...selectedMeeting.talkingPoints,
                { id: `tp${Date.now()}`, text: newTalkingPoint, isDiscussed: false },
            ],
        };

        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
        setNewTalkingPoint('');
    };

    const handleToggleTalkingPoint = (tpId: string) => {
        if (!selectedMeeting) return;

        const updatedMeeting = {
            ...selectedMeeting,
            talkingPoints: selectedMeeting.talkingPoints.map(tp =>
                tp.id === tpId ? { ...tp, isDiscussed: !tp.isDiscussed } : tp
            ),
        };

        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
    };

    const handleAddActionItem = () => {
        if (!selectedMeeting || !newActionItem.trim()) return;

        const updatedMeeting = {
            ...selectedMeeting,
            actionItems: [
                ...selectedMeeting.actionItems,
                {
                    id: `ai${Date.now()}`,
                    description: newActionItem,
                    assignedTo: selectedMeeting.employeeId,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending' as ActionStatus,
                    priority: 'medium' as const,
                },
            ],
        };

        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
        setNewActionItem('');
    };

    const handleToggleActionItem = (aiId: string) => {
        if (!selectedMeeting) return;

        const updatedMeeting = {
            ...selectedMeeting,
            actionItems: selectedMeeting.actionItems.map(ai =>
                ai.id === aiId ? { ...ai, status: ai.status === 'completed' ? 'pending' : 'completed' as ActionStatus } : ai
            ),
        };

        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
    };

    const handleSetSentiment = (score: SentimentScore) => {
        if (!selectedMeeting) return;

        const updatedMeeting = { ...selectedMeeting, sentiment: score };
        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
    };

    const handleCompleteMeeting = () => {
        if (!selectedMeeting) return;

        if (!selectedMeeting.sentiment) {
            alert('Please rate the meeting vibe before completing');
            return;
        }

        const updatedMeeting = {
            ...selectedMeeting,
            status: 'completed' as MeetingStatus,
            completedAt: new Date().toISOString(),
        };

        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
        setShowFeedbackModal(true);
    };

    const handleSubmitFeedback = () => {
        if (!selectedMeeting) return;

        const updatedMeeting = {
            ...selectedMeeting,
            feedbackResponses: feedbackForm.filter(f => f.response.trim() !== ''),
        };

        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
        setShowFeedbackModal(false);
        setFeedbackForm(FEEDBACK_QUESTIONS.map(q => ({ questionId: q.id, response: '', rating: undefined })));
    };

    const handleUpdateNotes = (notes: string) => {
        if (!selectedMeeting) return;

        const updatedMeeting = { ...selectedMeeting, notes };
        setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
        setSelectedMeeting(updatedMeeting);
    };

    const handleDeleteMeeting = (meetingId: string) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return;

        setMeetings(meetings.filter(m => m.id !== meetingId));
        if (selectedMeeting?.id === meetingId) {
            setSelectedMeeting(meetings.find(m => m.id !== meetingId) || null);
        }
    };

    // ==================== RENDER ====================

    const upcomingMeetings = meetings.filter(m => m.status === 'scheduled').sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    const pastMeetings = meetings.filter(m => m.status === 'completed').sort((a, b) => new Date(b.completedAt || b.scheduledDate).getTime() - new Date(a.completedAt || a.scheduledDate).getTime());

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-emerald-500" />
                        1-on-1 Meetings
                    </h1>
                    <p className="text-slate-500 text-sm">Track manager-employee check-ins, talking points, and action items.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-bold"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule New
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-2xl font-bold text-emerald-600">{stats.totalMeetings}</div>
                    <div className="text-xs text-slate-500">Total Meetings</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-2xl font-bold text-blue-600">{stats.completedMeetings}</div>
                    <div className="text-xs text-slate-500">Completed</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-2xl font-bold text-amber-600">{stats.averageSentiment.toFixed(1)}/5</div>
                    <div className="text-xs text-slate-500">Avg Sentiment</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-2xl font-bold text-indigo-600">{stats.pendingActionItems}</div>
                    <div className="text-xs text-slate-500">Pending Actions</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-2xl font-bold text-purple-600">{stats.employeesEngaged}</div>
                    <div className="text-xs text-slate-500">Employees</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Meeting List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-sm mb-2 text-slate-500 uppercase">Upcoming ({upcomingMeetings.length})</h3>
                    {upcomingMeetings.map(meeting => (
                        <div
                            key={meeting.id}
                            onClick={() => setSelectedMeeting(meeting)}
                            className={`bg-white dark:bg-slate-900 p-4 rounded-xl border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all ${selectedMeeting?.id === meeting.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-300'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{meeting.employeeName}</h4>
                                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-0.5 rounded font-bold">{meeting.type}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-bold mb-1">{meeting.employeeRole}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(meeting.scheduledDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {meeting.duration} mins
                            </div>
                        </div>
                    ))}

                    <h3 className="font-bold text-sm mt-6 mb-2 text-slate-500 uppercase">Past Logs ({pastMeetings.length})</h3>
                    {pastMeetings.map(meeting => (
                        <div
                            key={meeting.id}
                            onClick={() => setSelectedMeeting(meeting)}
                            className={`bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border cursor-pointer transition-all ${selectedMeeting?.id === meeting.id ? 'border-slate-400 dark:border-slate-600' : 'border-slate-100 dark:border-slate-800'
                                } hover:border-slate-300 dark:hover:border-slate-700`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{meeting.employeeName}</h4>
                                <div className="flex items-center gap-1">
                                    {meeting.sentiment && (
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(meeting.sentiment)].map((_, i) => (
                                                <Smile key={i} className="w-3 h-3 text-emerald-500" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{meeting.notes || 'No notes recorded'}</p>
                            <div className="text-[10px] text-slate-400 mt-1">
                                {new Date(meeting.completedAt || meeting.scheduledDate).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Meeting Console */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto pb-20">
                    {selectedMeeting ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            {/* Meeting Header */}
                            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 text-lg">
                                            {selectedMeeting.employeeName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{selectedMeeting.employeeName}</h2>
                                            <p className="text-xs text-slate-500">{selectedMeeting.employeeRole}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(selectedMeeting.scheduledDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {selectedMeeting.duration} mins
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedMeeting.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {selectedMeeting.status}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            {selectedMeeting.type}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Talking Points */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Talking Points ({selectedMeeting.talkingPoints.length})
                                </h3>
                                <div className="space-y-2">
                                    {selectedMeeting.talkingPoints.map(tp => (
                                        <div
                                            key={tp.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${tp.isDiscussed
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30'
                                                    : 'bg-slate-50 dark:bg-slate-800'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={tp.isDiscussed}
                                                onChange={() => handleToggleTalkingPoint(tp.id)}
                                                disabled={selectedMeeting.status === 'completed'}
                                                className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <span className={`text-sm font-bold ${tp.isDiscussed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {tp.text}
                                                </span>
                                                {tp.notes && (
                                                    <p className="text-xs text-slate-500 mt-1 italic">{tp.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {selectedMeeting.status !== 'completed' && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newTalkingPoint}
                                                onChange={(e) => setNewTalkingPoint(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTalkingPoint()}
                                                placeholder="Add talking point..."
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <button
                                                onClick={handleAddTalkingPoint}
                                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Items */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4" /> Action Items ({selectedMeeting.actionItems.length})
                                </h3>
                                <div className="space-y-2">
                                    {selectedMeeting.actionItems.map(ai => (
                                        <div
                                            key={ai.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border ${ai.status === 'completed'
                                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                                                    : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={ai.status === 'completed'}
                                                onChange={() => handleToggleActionItem(ai.id)}
                                                className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <span className={`text-sm font-bold ${ai.status === 'completed'
                                                        ? 'text-green-700 dark:text-green-400 line-through'
                                                        : 'text-indigo-700 dark:text-indigo-300'
                                                    }`}>
                                                    {ai.description}
                                                </span>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {SAMPLE_EMPLOYEES.find(e => e.id === ai.assignedTo)?.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Due: {new Date(ai.dueDate).toLocaleDateString()}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ai.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' :
                                                            ai.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                                                'bg-slate-100 text-slate-700 dark:bg-slate-800'
                                                        }`}>
                                                        {ai.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedMeeting.status !== 'completed' && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newActionItem}
                                                onChange={(e) => setNewActionItem(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddActionItem()}
                                                placeholder="Add action item..."
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={handleAddActionItem}
                                                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Meeting Notes */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Meeting Notes
                                </h3>
                                <textarea
                                    value={selectedMeeting.notes}
                                    onChange={(e) => handleUpdateNotes(e.target.value)}
                                    disabled={selectedMeeting.status === 'completed'}
                                    placeholder="Add notes about the meeting..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Feedback Responses (if completed) */}
                            {selectedMeeting.status === 'completed' && selectedMeeting.feedbackResponses && selectedMeeting.feedbackResponses.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Employee Feedback
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedMeeting.feedbackResponses.map(fr => {
                                            const question = FEEDBACK_QUESTIONS.find(q => q.id === fr.questionId);
                                            return (
                                                <div key={fr.questionId} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{question?.question}</div>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">{fr.response}</div>
                                                    {fr.rating && (
                                                        <div className="flex items-center gap-0.5 mt-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Smile key={i} className={`w-3 h-3 ${i < fr.rating! ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Meeting Actions */}
                            {selectedMeeting.status === 'scheduled' && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Meeting Vibe</div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => handleSetSentiment(n as SentimentScore)}
                                                    className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${selectedMeeting.sentiment === n
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                                            : 'text-slate-400'
                                                        }`}
                                                >
                                                    <Smile className="w-4 h-4" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCompleteMeeting}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                                    >
                                        Complete Meeting <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {selectedMeeting.status === 'completed' && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="text-sm font-bold">
                                            Meeting completed on {new Date(selectedMeeting.completedAt!).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-400 dark:text-slate-600 mb-2">No Meeting Selected</h3>
                            <p className="text-sm text-slate-500">Select a meeting from the list or schedule a new one</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Meeting Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Schedule 1-on-1 Meeting</h2>
                            <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Employee</label>
                                <select
                                    value={scheduleForm.employeeId}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, employeeId: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select employee...</option>
                                    {SAMPLE_EMPLOYEES.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Date</label>
                                <input
                                    type="date"
                                    value={scheduleForm.date}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Time</label>
                                <input
                                    type="time"
                                    value={scheduleForm.time}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Duration (minutes)</label>
                                <select
                                    value={scheduleForm.duration}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Meeting Type</label>
                                <select
                                    value={scheduleForm.type}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as MeetingType })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Weekly Sync">Weekly Sync</option>
                                    <option value="Career Dev">Career Development</option>
                                    <option value="Performance Review">Performance Review</option>
                                    <option value="Feedback">Feedback Session</option>
                                    <option value="Check-in">General Check-in</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleMeeting}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold"
                            >
                                Schedule Meeting
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Survey Modal */}
            {showFeedbackModal && selectedMeeting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold">Employee Feedback Survey</h2>
                                <p className="text-sm text-slate-500">Collect feedback from {selectedMeeting.employeeName}</p>
                            </div>
                            <button onClick={() => setShowFeedbackModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                            {FEEDBACK_QUESTIONS.map((question, idx) => (
                                <div key={question.id} className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">
                                        {idx + 1}. {question.question}
                                    </label>
                                    <textarea
                                        value={feedbackForm[idx].response}
                                        onChange={(e) => {
                                            const updated = [...feedbackForm];
                                            updated[idx].response = e.target.value;
                                            setFeedbackForm(updated);
                                        }}
                                        placeholder="Enter response..."
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-none mb-2"
                                    />
                                    {question.category !== 'concerns' && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Rating:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <button
                                                        key={n}
                                                        onClick={() => {
                                                            const updated = [...feedbackForm];
                                                            updated[idx].rating = n;
                                                            setFeedbackForm(updated);
                                                        }}
                                                        className={`p-1 rounded transition-colors ${feedbackForm[idx].rating === n
                                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        <Smile className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Skip for Now
                            </button>
                            <button
                                onClick={handleSubmitFeedback}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {showAnalytics && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 border border-slate-200 dark:border-slate-800 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-indigo-500" />
                                    Meeting Analytics & Insights
                                </h2>
                                <p className="text-sm text-slate-500">Summary insights and trends</p>
                            </div>
                            <button onClick={() => setShowAnalytics(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 p-4 rounded-xl">
                                <div className="text-3xl font-bold text-emerald-600">{stats.totalMeetings}</div>
                                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Total Meetings</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-4 rounded-xl">
                                <div className="text-3xl font-bold text-blue-600">{((stats.completedMeetings / stats.totalMeetings) * 100).toFixed(0)}%</div>
                                <div className="text-xs text-blue-700 dark:text-blue-400 font-bold">Completion Rate</div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 p-4 rounded-xl">
                                <div className="text-3xl font-bold text-amber-600">{stats.averageSentiment.toFixed(1)}/5</div>
                                <div className="text-xs text-amber-700 dark:text-amber-400 font-bold">Avg Sentiment</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-4 rounded-xl">
                                <div className="text-3xl font-bold text-purple-600">{stats.employeesEngaged}</div>
                                <div className="text-xs text-purple-700 dark:text-purple-400 font-bold">Employees</div>
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Key Insights
                            </h3>

                            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 p-4 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-emerald-700 dark:text-emerald-400">High Engagement</div>
                                        <div className="text-sm text-emerald-600 dark:text-emerald-500">
                                            {stats.employeesEngaged} employees are actively participating in 1-on-1 meetings. Average sentiment score of {stats.averageSentiment.toFixed(1)} indicates positive engagement.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {stats.pendingActionItems > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-4 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-amber-700 dark:text-amber-400">Action Items Pending</div>
                                            <div className="text-sm text-amber-600 dark:text-amber-500">
                                                {stats.pendingActionItems} action items are still pending. Follow up with team members to ensure completion.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {meetings.filter(m => m.feedbackResponses && m.feedbackResponses.length > 0).length > 0 && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 p-4 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <Target className="w-5 h-5 text-indigo-600 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-indigo-700 dark:text-indigo-400">Feedback Collected</div>
                                            <div className="text-sm text-indigo-600 dark:text-indigo-500">
                                                {meetings.filter(m => m.feedbackResponses && m.feedbackResponses.length > 0).length} meetings have employee feedback responses.
                                                Review concerns and growth opportunities mentioned.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {stats.trendsImproving && (
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 p-4 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-blue-700 dark:text-blue-400">Improving Trends</div>
                                            <div className="text-sm text-blue-600 dark:text-blue-500">
                                                Meeting sentiment and completion rates are trending upward. Continue current engagement practices.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Common Themes */}
                        {meetings.some(m => m.feedbackResponses && m.feedbackResponses.length > 0) && (
                            <div className="mt-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-purple-500" />
                                    Common Themes from Feedback
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Growth & Development</div>
                                        <div className="text-sm text-slate-700 dark:text-slate-300">
                                            Employees are interested in skill development and career advancement opportunities.
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Work-Life Balance</div>
                                        <div className="text-sm text-slate-700 dark:text-slate-300">
                                            Overall satisfaction with workload management is high across the team.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowAnalytics(false)}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
