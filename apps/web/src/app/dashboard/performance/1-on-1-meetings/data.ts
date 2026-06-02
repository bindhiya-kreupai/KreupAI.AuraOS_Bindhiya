// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
/**
 * Sample/Seed Data for One-on-One Meetings
 */

import type { Employee, FeedbackQuestion, Meeting } from './types';

export const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
    { id: 'fq1', question: 'How satisfied are you with your current role?', category: 'satisfaction' },
    { id: 'fq2', question: 'Do you feel your workload is manageable?', category: 'workload' },
    { id: 'fq3', question: 'Are you getting opportunities to grow and develop?', category: 'growth' },
    { id: 'fq4', question: 'How engaged do you feel with your team and work?', category: 'engagement' },
    { id: 'fq5', question: 'Do you have any concerns you would like to discuss?', category: 'concerns' },
];

export const SAMPLE_EMPLOYEES: Employee[] = [
    { id: 'emp1', name: 'Dwight Schrute', role: 'Assistant Regional Manager', department: 'Sales' },
    { id: 'emp2', name: 'Jim Halpert', role: 'Sales Executive', department: 'Sales' },
    { id: 'emp3', name: 'Pam Beesly', role: 'Receptionist', department: 'Admin' },
    { id: 'emp4', name: 'Stanley Hudson', role: 'Sales Representative', department: 'Sales' },
    { id: 'emp5', name: 'Angela Martin', role: 'Accountant', department: 'Accounting' },
];

export const generateInitialMeetings = (): Meeting[] => [
    {
        id: 'm1',
        employeeId: 'emp1',
        employeeName: 'Dwight Schrute',
        employeeRole: 'Assistant Regional Manager',
        managerId: 'mgr1',
        managerName: 'Michael Scott',
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
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
        scheduledDate: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
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
