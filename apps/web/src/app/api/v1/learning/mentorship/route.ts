import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user-001';

  const mentorshipData = {
    userId,
    activeMatches: [
      {
        id: 'match-001',
        mentor: {
          id: 'mentor-001',
          name: 'Dr. Sarah Chen',
          title: 'VP of Engineering',
          department: 'Technology',
          expertise: ['leadership', 'system-design', 'career-development'],
          avatar: '/images/mentors/sarah-chen.jpg',
          rating: 4.9,
          menteeCount: 3,
        },
        status: 'active',
        startDate: '2025-10-01T00:00:00Z',
        nextSession: '2026-01-28T14:00:00Z',
        sessionsCompleted: 8,
        goals: ['Transition to senior leadership role', 'Improve strategic thinking'],
        progress: 65,
      },
    ],
    pastMatches: [
      {
        id: 'match-000',
        mentor: {
          id: 'mentor-003',
          name: 'Mike Johnson',
          title: 'Senior Director, Product',
          department: 'Product',
          avatar: '/images/mentors/mike-johnson.jpg',
        },
        status: 'completed',
        startDate: '2025-03-01T00:00:00Z',
        endDate: '2025-09-30T00:00:00Z',
        sessionsCompleted: 12,
        outcome: 'Successfully promoted to Team Lead',
      },
    ],
    availableMentors: [
      {
        id: 'mentor-002',
        name: 'Lisa Wang',
        title: 'Director of Data Science',
        department: 'Analytics',
        expertise: ['data-science', 'machine-learning', 'analytics-leadership'],
        avatar: '/images/mentors/lisa-wang.jpg',
        rating: 4.8,
        availability: 'open',
        matchScore: 89,
      },
      {
        id: 'mentor-004',
        name: 'Robert Garcia',
        title: 'Chief People Officer',
        department: 'Human Resources',
        expertise: ['organizational-development', 'culture', 'change-management'],
        avatar: '/images/mentors/robert-garcia.jpg',
        rating: 4.7,
        availability: 'limited',
        matchScore: 76,
      },
    ],
  };

  return NextResponse.json({ success: true, data: mentorshipData });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const mentorRequest = {
    id: 'match-002',
    menteeId: body.menteeId || 'user-001',
    mentorId: body.mentorId || 'mentor-002',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    goals: body.goals || ['Learn data science fundamentals', 'Career transition guidance'],
    preferredSchedule: body.preferredSchedule || {
      frequency: 'biweekly',
      preferredDays: ['tuesday', 'thursday'],
      preferredTime: '14:00-15:00',
      timezone: 'America/New_York',
    },
    message: body.message || 'I would love to learn from your expertise in data science.',
    expectedDuration: body.expectedDuration || '6 months',
    estimatedResponse: '2-3 business days',
  };

  return NextResponse.json(
    { success: true, data: mentorRequest, message: 'Mentorship request submitted successfully' },
    { status: 201 }
  );
}
