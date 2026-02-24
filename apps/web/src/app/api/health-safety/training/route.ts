import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultTraining = [
      {
        id: 'trn-001',
        title: 'Fire Safety Drill',
        duration: 15,
        progress: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Mandatory',
        tenantId: user.tenantId,
      },
      {
        id: 'trn-002',
        title: 'Ergonomics at Work',
        duration: 30,
        progress: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Recommended',
        tenantId: user.tenantId,
      },
    ];

    return NextResponse.json(
      { success: true, data: defaultTraining },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching safety training:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
