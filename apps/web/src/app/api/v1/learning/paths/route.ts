import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('learning/paths:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing learning/paths:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const level = searchParams.get('level');

  const paths = [
    {
      id: 'lp-001',
      title: 'Leadership Essentials',
      description: 'Develop core leadership competencies for emerging managers',
      category: 'leadership',
      level: 'intermediate',
      duration: '40 hours',
      modulesCount: 8,
      enrolledCount: 245,
      rating: 4.7,
      skills: ['communication', 'decision-making', 'team-management'],
      thumbnail: '/images/learning/leadership-essentials.jpg',
      createdAt: '2025-06-15T10:00:00Z',
      updatedAt: '2025-12-01T14:30:00Z',
    },
    {
      id: 'lp-002',
      title: 'Data Analytics Fundamentals',
      description: 'Master data-driven decision making with modern analytics tools',
      category: 'technical',
      level: 'beginner',
      duration: '30 hours',
      modulesCount: 6,
      enrolledCount: 189,
      rating: 4.5,
      skills: ['data-analysis', 'excel', 'visualization', 'sql-basics'],
      thumbnail: '/images/learning/data-analytics.jpg',
      createdAt: '2025-07-20T08:00:00Z',
      updatedAt: '2025-11-15T09:45:00Z',
    },
    {
      id: 'lp-003',
      title: 'Compliance & Ethics Training',
      description: 'Mandatory compliance training covering workplace ethics and regulations',
      category: 'compliance',
      level: 'beginner',
      duration: '12 hours',
      modulesCount: 4,
      enrolledCount: 1024,
      rating: 4.2,
      skills: ['compliance', 'ethics', 'workplace-safety'],
      thumbnail: '/images/learning/compliance.jpg',
      createdAt: '2025-03-10T12:00:00Z',
      updatedAt: '2025-10-20T16:00:00Z',
    },
    {
      id: 'lp-004',
      title: 'Advanced Project Management',
      description: 'Learn agile, scrum, and hybrid project management methodologies',
      category: 'management',
      level: 'advanced',
      duration: '60 hours',
      modulesCount: 12,
      enrolledCount: 156,
      rating: 4.8,
      skills: ['agile', 'scrum', 'risk-management', 'stakeholder-management'],
      thumbnail: '/images/learning/project-mgmt.jpg',
      createdAt: '2025-08-05T09:00:00Z',
      updatedAt: '2025-12-10T11:20:00Z',
    },
  ];

  let filtered = paths;
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (level) {
    filtered = filtered.filter((p) => p.level === level);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    meta: {
      total: filtered.length,
      categories: ['leadership', 'technical', 'compliance', 'management'],
      levels: ['beginner', 'intermediate', 'advanced'],
    },
  });
});

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('learning/paths:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing learning/paths:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const body = await request.json();

  const newPath = {
    id: 'lp-005',
    title: body.title || 'New Learning Path',
    description: body.description || 'A new learning path',
    category: body.category || 'general',
    level: body.level || 'beginner',
    duration: body.duration || '20 hours',
    modulesCount: 0,
    enrolledCount: 0,
    rating: 0,
    skills: body.skills || [],
    thumbnail: body.thumbnail || '/images/learning/default.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin-001',
  };

  return NextResponse.json(
    { success: true, data: newPath, message: 'Learning path created successfully' },
    { status: 201 }
  );
});
