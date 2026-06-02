import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultPolicies = [
      {
        policyId: 'policy-001',
        policyName: 'Standard SLA',
        description: 'Default SLA policy for regular priority tickets',
        priority: 'medium',
        categories: ['payroll', 'benefits', 'time_off', 'policy'],
        firstResponseTime: 240,
        resolutionTime: 1440,
        businessHoursOnly: true,
        escalationRules: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        tenantId: user.tenantId,
      },
      {
        policyId: 'policy-002',
        policyName: 'Priority SLA',
        description: 'SLA policy for high priority tickets',
        priority: 'high',
        categories: ['it_access', 'onboarding', 'offboarding'],
        firstResponseTime: 30,
        resolutionTime: 240,
        businessHoursOnly: false,
        escalationRules: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        tenantId: user.tenantId,
      },
    ];

    return NextResponse.json(
      { success: true, data: defaultPolicies },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching SLA policies:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const policy = {
      ...body,
      policyId: `policy-${Date.now()}`,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: policy },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating SLA policy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
