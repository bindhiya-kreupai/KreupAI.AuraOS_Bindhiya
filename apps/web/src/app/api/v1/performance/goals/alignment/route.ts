import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (_request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('performance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing performance:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  return NextResponse.json({
    success: true,
    data: {
      goalTree: {
        id: 'goal-company-001',
        title: 'Achieve 40% Revenue Growth in 2026',
        level: 'company',
        progress: 35,
        owner: 'CEO',
        children: [
          {
            id: 'goal-dept-001',
            title: 'Expand Customer Base by 25%',
            level: 'department',
            department: 'Sales',
            progress: 45,
            owner: 'VP of Sales',
            children: [
              {
                id: 'goal-team-001',
                title: 'Generate 500 Qualified Leads per Month',
                level: 'team',
                team: 'Outbound Sales',
                progress: 60,
                owner: 'Sales Manager',
                children: [
                  {
                    id: 'goal-ind-001',
                    title: 'Close 10 Enterprise Deals Q1',
                    level: 'individual',
                    progress: 30,
                    owner: 'Jane Smith',
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'goal-dept-002',
            title: 'Launch 3 New Product Features',
            level: 'department',
            department: 'Engineering',
            progress: 22,
            owner: 'VP of Engineering',
            children: [
              {
                id: 'goal-team-002',
                title: 'Deliver AI-Powered Analytics Module',
                level: 'team',
                team: 'Platform Team',
                progress: 40,
                owner: 'Tech Lead',
                children: [
                  {
                    id: 'goal-ind-002',
                    title: 'Implement ML Pipeline for Predictions',
                    level: 'individual',
                    progress: 55,
                    owner: 'Michael Lee',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  });
});
