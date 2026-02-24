import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultContacts = [
      { id: 'ec-001', name: 'Ambulance', number: '911', type: 'medical', tenantId: user.tenantId },
      { id: 'ec-002', name: 'Fire Department', number: '911', type: 'fire', tenantId: user.tenantId },
      { id: 'ec-003', name: 'Police', number: '911', type: 'police', tenantId: user.tenantId },
      { id: 'ec-004', name: 'Security Control', number: 'EXT 4004', type: 'security', tenantId: user.tenantId },
      { id: 'ec-005', name: 'Medical Room', number: 'EXT 3333', type: 'medical', tenantId: user.tenantId },
      { id: 'ec-006', name: 'Facility Manager', number: 'EXT 4005', type: 'facility', tenantId: user.tenantId },
    ];

    return NextResponse.json(
      { success: true, data: defaultContacts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
