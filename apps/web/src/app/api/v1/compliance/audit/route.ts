import { NextRequest, NextResponse } from 'next/server';

interface Deadline {
  id: number;
  title: string;
  dueDate: string;
  category: string;
  status: string;
  priority: string;
}

interface Violation {
  id: number;
  title: string;
  severity: string;
  identifiedBy: string;
  date: string;
  status: string;
}

interface RiskCategory {
  name: string;
  value: number;
  color: string;
}

/**
 * GET /api/v1/compliance/audit
 * Returns compliance audit dashboard data including score, deadlines, violations, and risk distribution.
 * In production this would aggregate from multiple compliance subsystems and audit tables.
 */
export async function GET(request: NextRequest) {
  try {
    // Aggregate compliance data.
    // In a real implementation this would query:
    // - ComplianceAudit table for the overall score
    // - StatutoryDeadline table for upcoming deadlines
    // - ComplianceViolation table for violations log
    // - RiskAssessment table for risk distribution
    // For now we pull from a combination of computed values and seeded data.

    const now = new Date();
    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // In production: compute from audit results
    const complianceScore = 92;
    const lastAuditDate = formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

    const upcomingDeadlines: Deadline[] = [
      {
        id: 1,
        title: 'PF Monthly Return',
        dueDate: formatDate(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)),
        category: 'Payroll',
        status: 'Due Soon',
        priority: 'High',
      },
      {
        id: 2,
        title: 'Professional Tax Filing',
        dueDate: formatDate(new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000)),
        category: 'Tax',
        status: 'Pending',
        priority: 'Medium',
      },
      {
        id: 3,
        title: 'Annual Labor Return',
        dueDate: formatDate(new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000)),
        category: 'Labor Law',
        status: 'On Track',
        priority: 'High',
      },
    ];

    const violations: Violation[] = [
      {
        id: 1,
        title: 'Missing POSH Committee',
        severity: 'Critical',
        identifiedBy: 'Internal Audit',
        date: formatDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
        status: 'Open',
      },
      {
        id: 2,
        title: 'ESI Contribution Mismatch',
        severity: 'Medium',
        identifiedBy: 'System',
        date: formatDate(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)),
        status: 'In Progress',
      },
      {
        id: 3,
        title: 'Expired Fire Safety Cert',
        severity: 'High',
        identifiedBy: 'Admin',
        date: formatDate(new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000)),
        status: 'Resolved',
      },
    ];

    const riskDistribution: RiskCategory[] = [
      { name: 'Labor Law', value: 35, color: '#f59e0b' },
      { name: 'Taxation', value: 25, color: '#6366f1' },
      { name: 'Workplace Safety', value: 20, color: '#10b981' },
      { name: 'Data Privacy', value: 20, color: '#ec4899' },
    ];

    const criticalCount = violations.filter(v => v.severity === 'Critical' && v.status !== 'Resolved').length;
    const mediumCount = violations.filter(v => v.severity === 'Medium' && v.status !== 'Resolved').length;

    return NextResponse.json({
      success: true,
      data: {
        complianceScore,
        lastAuditDate,
        upcomingDeadlines,
        violations,
        riskDistribution,
        summary: {
          criticalCount,
          mediumCount,
          totalDeadlines: upcomingDeadlines.length,
          totalViolations: violations.length,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance audit data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/compliance/audit
 * Report a new violation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // In production this would insert into the ComplianceViolation table
    const newViolation: Violation = {
      id: Date.now(),
      title: body.title || 'Untitled Violation',
      severity: body.severity || 'Medium',
      identifiedBy: body.identifiedBy || 'System',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Open',
    };

    return NextResponse.json({
      success: true,
      data: newViolation,
      message: 'Violation reported successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to report violation' },
      { status: 500 }
    );
  }
}
