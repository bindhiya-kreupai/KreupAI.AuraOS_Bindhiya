import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const audits = await db.complianceAudit.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(audits);
  } catch (error) {
    console.error('Failed to fetch compliance audits:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance audits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const audit = await db.complianceAudit.create({
      data: {
        auditId: body.auditId || `audit-${Date.now()}`,
        auditName: body.auditName,
        auditType: body.auditType,
        status: body.status || 'scheduled',
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : new Date(),
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
        overallRating: body.overallRating || 'satisfactory',
        scope: body.scope || [],
        auditor: body.auditor || null,
        findings: body.findings || [],
        reportUrl: body.reportUrl || null,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      },
    });
    return NextResponse.json(audit, { status: 201 });
  } catch (error) {
    console.error('Failed to create compliance audit:', error);
    return NextResponse.json({ error: 'Failed to create compliance audit' }, { status: 500 });
  }
}
