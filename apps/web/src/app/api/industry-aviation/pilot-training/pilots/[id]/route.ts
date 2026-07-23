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
      const id = context.params.id;

      const data = await prisma.aviationPilotProfile.findFirst({
        where: { tenantId, pilotId: id, isDeleted: false },
      });

      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      return NextResponse.json({ pilot: mapToFrontend(data) }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const PUT = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;
      const body = await request.json();

      const existing = await prisma.aviationPilotProfile.findFirst({
        where: { tenantId, pilotId: id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const updateData: any = {};
      if (body.pilotType !== undefined) updateData.pilotType = body.pilotType;
      if (body.rank !== undefined) updateData.rank = body.rank;
      if (body.baseAirport !== undefined) updateData.baseAirport = body.baseAirport;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.personalInfo !== undefined) updateData.personalInfo = body.personalInfo;
      if (body.licenses !== undefined) updateData.licenses = body.licenses;
      else if (body.license !== undefined) updateData.licenses = [body.license];
      if (body.typeRatings !== undefined) updateData.typeRatings = body.typeRatings;
      if (body.medicalCertificate !== undefined) updateData.medicalStatus = body.medicalCertificate;
      else if (body.medicalStatus !== undefined) updateData.medicalStatus = body.medicalStatus;
      if (body.flightHours !== undefined) updateData.flightHours = body.flightHours;
      if (body.performanceRating !== undefined)
        updateData.performanceRating = body.performanceRating;

      const data = await prisma.aviationPilotProfile.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ pilot: mapToFrontend(data) }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:write'] }
);

export const DELETE = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;

      const existing = await prisma.aviationPilotProfile.findFirst({
        where: { tenantId, pilotId: id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await prisma.aviationPilotProfile.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:delete'] }
);
