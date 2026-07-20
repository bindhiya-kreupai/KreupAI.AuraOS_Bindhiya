import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

const mapToFrontend = (dbRecord: any) => ({
  ...dbRecord,
  license:
    dbRecord.licenses && Array.isArray(dbRecord.licenses) && dbRecord.licenses.length > 0
      ? dbRecord.licenses[0]
      : {
          licenseNumber: '',
          licenseType: 'ATPL',
          issuingAuthority: 'FAA',
          issueDate: '2020-01-01',
        },
  medicalCertificate: dbRecord.medicalStatus || {
    medicalClass: 'class_1',
    examDate: '2020-01-01',
    expiryDate: '2030-01-01',
    examiner: 'FAA',
    fitnessStatus: 'fit',
    nextExamDate: '2030-01-01',
    medicalId: 'MED-1',
  },
});

export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const data = await prisma.aviationPilotProfile.findMany({
        where: { tenantId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ pilots: data.map(mapToFrontend) }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const body = await request.json();

      const data = await prisma.aviationPilotProfile.create({
        data: {
          pilotId: body.pilotId || body.employeeId || crypto.randomUUID(),
          employeeId: body.employeeId || `EMP-${Date.now()}`,
          pilotType: body.pilotType || 'COMMERCIAL',
          rank: body.rank || 'first_officer',
          baseAirport: body.baseAirport || 'LHR',
          status: body.status || 'active',
          personalInfo: body.personalInfo || {},
          licenses: body.licenses || (body.license ? [body.license] : []),
          typeRatings: body.typeRatings || [],
          medicalStatus: body.medicalCertificate || body.medicalStatus || {},
          flightHours: body.flightHours || {},
          performanceRating: body.performanceRating || {},
          tenantId,
          createdBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ pilot: mapToFrontend(data) }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:write'] }
);
