import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Alumni profiles are derived from completed ExitRequest records (the same
// canonical source used by /api/offboarding/alumni). This endpoint returns the
// AlumniProfile-shaped rows the Alumni Directory page renders.

function monthsBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
}

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || '').trim().toLowerCase();

    const exitRequests = await prisma.exitRequest.findMany({
      where: { tenantId: user.tenantId, status: 'COMPLETED', isDeleted: false },
      orderBy: { lastWorkingDate: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            departmentId: true,
            joiningDate: true,
            department: { select: { name: true } },
            jobProfile: { select: { title: true } },
          },
        },
      },
    });

    const profiles = exitRequests
      .map((req) => {
        const emp = req.employee;
        const firstName = emp?.firstName || '';
        const lastName = emp?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const dateJoined = emp?.joiningDate ? new Date(emp.joiningDate) : null;
        const dateLeft = req.lastWorkingDate;
        return {
          alumniId: `ALM-${req.id}`,
          employeeId: req.employeeId,
          firstName,
          lastName,
          fullName,
          email: emp?.email || '',
          dateJoined: dateJoined ? dateJoined.toISOString() : null,
          dateLeft: dateLeft.toISOString(),
          tenure: dateJoined ? monthsBetween(dateJoined, dateLeft) : 0,
          lastDesignation: emp?.jobProfile?.title || '',
          lastDepartment: emp?.department?.name || '',
          lastLocation: '',
          currentCompany: '',
          currentDesignation: '',
          currentLocation: '',
          linkedInProfile: '',
          alumniStatus: req.rehireEligible ? 'active' : 'inactive',
          membershipType: 'basic',
          profileVisibility: 'alumni_only',
          willingToMentor: false,
          openToOpportunities: req.rehireEligible,
          openToReferrals: false,
          interests: [] as string[],
          skills: [] as string[],
          eventsAttended: 0,
          jobsPosted: 0,
          referralsGiven: 0,
          mentoringSessions: 0,
          yearRange:
            dateJoined && dateLeft ? `${dateJoined.getFullYear()}-${dateLeft.getFullYear()}` : '',
          createdDate: req.createdAt.toISOString(),
          lastUpdatedDate: req.updatedAt.toISOString(),
        };
      })
      .filter((p) => {
        if (!query) return true;
        return (
          p.fullName.toLowerCase().includes(query) ||
          p.lastDesignation.toLowerCase().includes(query) ||
          p.lastDepartment.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
        );
      });

    return NextResponse.json(profiles, { status: 200 });
  } catch (error) {
    console.error('Error fetching alumni profiles:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch alumni profiles',
        messageAr: 'فشل في جلب ملفات الخريجين',
      },
      { status: 500 }
    );
  }
});
