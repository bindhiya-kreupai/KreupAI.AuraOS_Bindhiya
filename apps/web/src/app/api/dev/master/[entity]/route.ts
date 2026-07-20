/**
 * DEV-ONLY: Unprotected master data endpoints for local development.
 * Returns companies, departments, locations, job-profiles, grades, statuses, types.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest, { params }: { params: { entity: string } }) {
  try {
    const { entity } = params;
    let data: any[] = [];

    switch (entity) {
      case 'companies':
        data = await prisma.company.findMany({
          select: { id: true, name: true, code: true },
          orderBy: { name: 'asc' },
        });
        break;

      case 'departments':
        data = await prisma.department.findMany({
          select: { id: true, name: true, code: true },
          orderBy: { name: 'asc' },
        });
        break;

      case 'locations':
        data = await prisma.location.findMany({
          select: { id: true, name: true, code: true },
          orderBy: { name: 'asc' },
        });
        break;

      case 'job-profiles':
        data = await prisma.jobProfile.findMany({
          select: { id: true, title: true, code: true },
          orderBy: { title: 'asc' },
        });
        break;

      case 'grades':
        data = await prisma.grade.findMany({
          select: { id: true, name: true, code: true, level: true },
          orderBy: { level: 'asc' },
        });
        break;

      case 'employee-statuses':
        data = await prisma.employeeStatus.findMany({
          select: { id: true, name: true, code: true },
          orderBy: { name: 'asc' },
        });
        break;

      case 'employment-types':
        data = await prisma.employmentType.findMany({
          select: { id: true, name: true, code: true },
          orderBy: { name: 'asc' },
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: { message: `Unknown entity: ${entity}` } },
          { status: 404 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`[DEV] GET /api/dev/master/${params.entity} error:`, error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
