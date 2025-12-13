/**
 * Performance Review Module - Sample Data
 */

import type { PerformanceReview, ReviewCycle, Goal, Competency, DevelopmentPlan } from './types';

export const generateSampleReviewCycles = (): ReviewCycle[] => [{
    id: 'cycle_2025',
    name: '2025 Annual Performance Review',
    type: 'annual',
    fiscalYear: '2025',
    periodStart: '2025-01-01',
    periodEnd: '2025-12-31',
    selfAssessmentDeadline: '2025-12-15',
    managerReviewDeadline: '2025-12-31',
    calibrationDate: '2026-01-15',
    isActive: true,
    participantCount: 150,
    completionRate: 75,
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
}];

export const generateSampleReviews = (): PerformanceReview[] => [{
    id: 'rev_001',
    reviewNumber: 'REV-2025-001',
    employeeId: 'emp001',
    employeeName: 'John Doe',
    reviewerId: 'mgr001',
    reviewerName: 'Jane Manager',
    reviewCycleId: 'cycle_2025',
    reviewCycleName: '2025 Annual Performance Review',
    reviewPeriodStart: '2025-01-01',
    reviewPeriodEnd: '2025-12-31',
    status: 'completed',
    selfAssessment: {
        overallRating: 4,
        achievements: 'Successfully delivered all major projects on time',
        challenges: 'Managing multiple stakeholders simultaneously',
        learnings: 'Improved project management and communication skills',
        submittedDate: '2025-12-10T00:00:00Z',
    },
    managerAssessment: {
        overallRating: 4,
        strengths: 'Strong technical skills, excellent collaboration',
        improvements: 'Could improve presentation skills',
        recommendations: 'Ready for senior role with additional leadership training',
        submittedDate: '2025-12-20T00:00:00Z',
    },
    goals: [],
    competencies: [],
    overallRating: 4,
    strengths: ['Technical Excellence', 'Team Collaboration', 'Problem Solving'],
    areasForImprovement: ['Public Speaking', 'Delegation'],
    submittedDate: '2025-12-20T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-12-20T00:00:00Z',
}];

export const generateSampleGoals = (): Goal[] => [{
    id: 'goal_001',
    employeeId: 'emp001',
    title: 'Complete Cloud Migration Project',
    description: 'Migrate legacy systems to cloud infrastructure',
    type: 'individual',
    category: 'performance',
    status: 'achieved',
    priority: 'high',
    targetDate: '2025-06-30',
    progress: 100,
    weight: 30,
    metrics: [{
        id: 'metric_001',
        name: 'Systems Migrated',
        target: 10,
        current: 10,
        unit: 'systems',
    }],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-06-30T00:00:00Z',
}];

export const generateSampleCompetencies = (): Competency[] => [{
    id: 'comp_001',
    name: 'Technical Leadership',
    description: 'Ability to lead technical teams and projects',
    category: 'Leadership',
    level: 'advanced',
    behaviors: ['Mentors team members', 'Makes sound technical decisions', 'Drives innovation'],
}];

export const generateSampleDevelopmentPlans = (): DevelopmentPlan[] => [{
    id: 'dp_001',
    employeeId: 'emp001',
    reviewId: 'rev_001',
    objectives: [{
        id: 'obj_001',
        description: 'Improve public speaking skills',
        actions: ['Attend Toastmasters', 'Present at team meetings monthly'],
        resources: ['Toastmasters membership', 'Speaking coach'],
        targetDate: '2026-06-30',
        status: 'in_progress',
    }],
    timeline: '6 months',
    createdAt: '2025-12-20T00:00:00Z',
    updatedAt: '2025-12-20T00:00:00Z',
}];
