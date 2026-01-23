import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const realTimeData = {
    timestamp: new Date().toISOString(),
    refreshInterval: 30000,
    activeEmployees: {
      total: 1247,
      currentlyOnline: 892,
      onLeave: 47,
      onBreak: 68,
      inMeetings: 234,
      byStatus: [
        { status: 'active', count: 892, color: '#22c55e' },
        { status: 'away', count: 156, color: '#f59e0b' },
        { status: 'busy', count: 234, color: '#ef4444' },
        { status: 'offline', count: 355, color: '#6b7280' },
      ],
    },
    pendingApprovals: {
      total: 67,
      byType: [
        { type: 'Leave Requests', count: 23, urgent: 5 },
        { type: 'Expense Claims', count: 18, urgent: 3 },
        { type: 'Timesheet Approvals', count: 12, urgent: 8 },
        { type: 'Hiring Requisitions', count: 8, urgent: 2 },
        { type: 'Performance Reviews', count: 4, urgent: 0 },
        { type: 'Policy Changes', count: 2, urgent: 1 },
      ],
      oldestPending: '2026-01-18T09:00:00Z',
      averageResolutionTime: '1.8 days',
    },
    todayLeaves: {
      total: 47,
      byType: [
        { type: 'Annual Leave', count: 22 },
        { type: 'Sick Leave', count: 12 },
        { type: 'Personal Leave', count: 8 },
        { type: 'Parental Leave', count: 3 },
        { type: 'Bereavement', count: 2 },
      ],
      upcomingThisWeek: 15,
      impactedTeams: [
        { team: 'Frontend Engineering', onLeave: 3, teamSize: 18 },
        { team: 'Customer Support', onLeave: 4, teamSize: 24 },
      ],
    },
    todayEvents: [
      { time: '09:00', event: 'All-Hands Meeting', attendees: 450 },
      { time: '10:30', event: 'New Hire Orientation', attendees: 8 },
      { time: '14:00', event: 'Q1 Planning Kickoff', attendees: 35 },
      { time: '16:00', event: 'Engineering Demo Day', attendees: 120 },
    ],
    alerts: [
      { id: 'alert-001', severity: 'warning', message: '5 leave requests pending > 3 days', timestamp: '2026-01-23T08:00:00Z' },
      { id: 'alert-002', severity: 'info', message: '3 employees completing probation this week', timestamp: '2026-01-23T08:00:00Z' },
      { id: 'alert-003', severity: 'warning', message: 'Customer Support team at 83% capacity today', timestamp: '2026-01-23T08:30:00Z' },
    ],
    systemHealth: {
      apiLatency: '45ms',
      uptime: 99.98,
      lastSync: new Date().toISOString(),
      integrationStatus: [
        { name: 'Payroll', status: 'healthy', lastSync: '2026-01-23T06:00:00Z' },
        { name: 'ATS', status: 'healthy', lastSync: '2026-01-23T07:30:00Z' },
        { name: 'Benefits Provider', status: 'degraded', lastSync: '2026-01-22T22:00:00Z' },
      ],
    },
  };

  return NextResponse.json({ success: true, data: realTimeData });
}
