const fs = require('fs');
const path = require('path');

const baseDir = 'd:/KreupAI.AuraOS/apps/web/src/app/api/industry-aviation';

const endpoints = [
  // Cabin Crew
  {
    path: 'cabin-crew/members',
    model: 'aviationCabinCrewMember',
    idField: 'crewId',
    parentKey: 'crewMembers'
  },
  {
    path: 'cabin-crew/members/[id]',
    model: 'aviationCabinCrewMember',
    idField: 'crewId',
    parentKey: 'crewMember',
    isSingle: true
  },
  {
    path: 'cabin-crew/assignments',
    model: 'aviationFlightAssignment',
    idField: 'assignmentId',
    parentKey: 'assignments'
  },
  {
    path: 'cabin-crew/assignments/[id]',
    model: 'aviationFlightAssignment',
    idField: 'assignmentId',
    parentKey: 'assignment',
    isSingle: true
  },
  {
    path: 'cabin-crew/duty-times',
    model: 'aviationDutyTime',
    idField: 'dutyId',
    parentKey: 'dutyTimes'
  },
  {
    path: 'cabin-crew/rest-periods',
    model: 'aviationRestPeriod',
    idField: 'restId',
    parentKey: 'restPeriods'
  },

  // Pilot Training
  {
    path: 'pilot-training/pilots',
    model: 'aviationPilotProfile',
    idField: 'pilotId',
    parentKey: 'pilots'
  },
  {
    path: 'pilot-training/pilots/[id]',
    model: 'aviationPilotProfile',
    idField: 'pilotId',
    parentKey: 'pilot',
    isSingle: true
  },
  {
    path: 'pilot-training/training-records',
    model: 'aviationPilotTraining',
    idField: 'recordId',
    parentKey: 'trainingRecords'
  },
  {
    path: 'pilot-training/simulator-sessions',
    model: 'aviationSimulatorSession',
    idField: 'sessionId',
    parentKey: 'simulatorSessions'
  },
  {
    path: 'pilot-training/proficiency-checks',
    model: 'aviationProficiencyCheck',
    idField: 'checkId',
    parentKey: 'proficiencyChecks'
  },

  // Ground Operations
  {
    path: 'ground-operations/staff',
    model: 'aviationGroundStaff',
    idField: 'staffId',
    parentKey: 'staff'
  },
  {
    path: 'ground-operations/staff/[id]',
    model: 'aviationGroundStaff',
    idField: 'staffId',
    parentKey: 'staffMember',
    isSingle: true
  },
  {
    path: 'ground-operations/turnarounds',
    model: 'aviationTurnaround',
    idField: 'id', // Doesn't have turnaroundId, use default id
    parentKey: 'turnarounds'
  },
  {
    path: 'ground-operations/equipment',
    model: 'aviationGroundEquipment',
    idField: 'id',
    parentKey: 'equipment'
  },
  {
    path: 'ground-operations/ramp-procedures',
    model: 'aviationRampProcedure',
    idField: 'procedureId',
    parentKey: 'rampProcedures'
  },
  {
    path: 'ground-operations/safety-compliance',
    model: 'aviationSafetyCompliance',
    idField: 'recordId',
    parentKey: 'safetyCompliance'
  }
];

function generateListRoute(ep) {
  return `import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.user.tenantId;
      const data = await prisma.${ep.model}.findMany({
        where: { tenantId, isDeleted: false },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ ${ep.parentKey}: data }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.user.tenantId;
      const body = await request.json();
      
      const data = await prisma.${ep.model}.create({
        data: {
          ...body,
          tenantId,
          createdBy: context.user.userId,
        }
      });
      
      return NextResponse.json({ ${ep.parentKey.replace(/s$/, '')}: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:write'] }
);
`;
}

function generateSingleRoute(ep) {
  return `import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.user.tenantId;
      const id = context.params.id;
      
      const data = await prisma.${ep.model}.findFirst({
        where: { tenantId, ${ep.idField}: id, isDeleted: false }
      });
      
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      
      return NextResponse.json({ ${ep.parentKey}: data }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const PUT = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.user.tenantId;
      const id = context.params.id;
      const body = await request.json();
      
      const existing = await prisma.${ep.model}.findFirst({
        where: { tenantId, ${ep.idField}: id, isDeleted: false }
      });
      
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      
      const data = await prisma.${ep.model}.update({
        where: { id: existing.id },
        data: {
          ...body,
          updatedBy: context.user.userId,
        }
      });
      
      return NextResponse.json({ ${ep.parentKey}: data }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:write'] }
);

export const DELETE = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.user.tenantId;
      const id = context.params.id;
      
      const existing = await prisma.${ep.model}.findFirst({
        where: { tenantId, ${ep.idField}: id, isDeleted: false }
      });
      
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      
      await prisma.${ep.model}.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: context.user.userId,
        }
      });
      
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:delete'] }
);
`;
}

endpoints.forEach(ep => {
  const dirPath = path.join(baseDir, ep.path);
  fs.mkdirSync(dirPath, { recursive: true });
  
  const content = ep.isSingle ? generateSingleRoute(ep) : generateListRoute(ep);
  fs.writeFileSync(path.join(dirPath, 'route.ts'), content);
  console.log('Created route:', dirPath);
});
