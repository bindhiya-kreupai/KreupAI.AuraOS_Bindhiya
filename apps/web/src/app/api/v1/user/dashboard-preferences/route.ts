import { NextRequest, NextResponse } from 'next/server';

interface WidgetPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  position: WidgetPosition;
  settings: Record<string, unknown>;
}

interface DashboardLayout {
  userId: string;
  layoutId: string;
  name: string;
  widgets: WidgetConfig[];
  columns: number;
  rowHeight: number;
  theme: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

interface DashboardSavePayload {
  name?: string;
  widgets: WidgetConfig[];
  columns?: number;
  rowHeight?: number;
  theme?: 'light' | 'dark' | 'system';
}

const mockDashboardLayout: DashboardLayout = {
  userId: 'user_001',
  layoutId: 'layout_default',
  name: 'My Dashboard',
  columns: 12,
  rowHeight: 80,
  theme: 'system',
  createdAt: '2026-01-10T08:00:00Z',
  updatedAt: '2026-01-22T15:30:00Z',
  widgets: [
    {
      id: 'widget_activity',
      type: 'activity-feed',
      title: 'Recent Activity',
      visible: true,
      position: { id: 'widget_activity', x: 0, y: 0, width: 6, height: 4 },
      settings: { maxItems: 10, refreshInterval: 30000 },
    },
    {
      id: 'widget_stats',
      type: 'stats-overview',
      title: 'System Stats',
      visible: true,
      position: { id: 'widget_stats', x: 6, y: 0, width: 6, height: 2 },
      settings: { showCpu: true, showMemory: true, showDisk: true },
    },
    {
      id: 'widget_webhooks',
      type: 'webhook-status',
      title: 'Webhook Health',
      visible: true,
      position: { id: 'widget_webhooks', x: 6, y: 2, width: 6, height: 2 },
      settings: { showFailedOnly: false, limit: 5 },
    },
    {
      id: 'widget_calendar',
      type: 'calendar',
      title: 'Upcoming Events',
      visible: true,
      position: { id: 'widget_calendar', x: 0, y: 4, width: 4, height: 3 },
      settings: { view: 'week', showCompleted: false },
    },
    {
      id: 'widget_tasks',
      type: 'task-list',
      title: 'My Tasks',
      visible: true,
      position: { id: 'widget_tasks', x: 4, y: 4, width: 4, height: 3 },
      settings: { sortBy: 'dueDate', filterStatus: 'active' },
    },
    {
      id: 'widget_notifications',
      type: 'notifications',
      title: 'Notifications',
      visible: false,
      position: { id: 'widget_notifications', x: 8, y: 4, width: 4, height: 3 },
      settings: { types: ['info', 'warning', 'error'], maxAge: '7d' },
    },
  ],
};

export async function GET() {
  return NextResponse.json({ data: mockDashboardLayout });
}

export async function POST(request: NextRequest) {
  try {
    const body: DashboardSavePayload = await request.json();

    if (!body.widgets || !Array.isArray(body.widgets)) {
      return NextResponse.json(
        { error: 'Missing required field: widgets (must be an array of widget configurations)' },
        { status: 400 }
      );
    }

    for (const widget of body.widgets) {
      if (!widget.id || !widget.type || !widget.position) {
        return NextResponse.json(
          { error: `Invalid widget configuration: each widget must have id, type, and position` },
          { status: 400 }
        );
      }

      const { position } = widget;
      if (
        typeof position.x !== 'number' ||
        typeof position.y !== 'number' ||
        typeof position.width !== 'number' ||
        typeof position.height !== 'number'
      ) {
        return NextResponse.json(
          { error: `Invalid position for widget '${widget.id}': x, y, width, and height must be numbers` },
          { status: 400 }
        );
      }
    }

    const savedLayout: DashboardLayout = {
      userId: 'user_001',
      layoutId: mockDashboardLayout.layoutId,
      name: body.name || mockDashboardLayout.name,
      widgets: body.widgets,
      columns: body.columns || mockDashboardLayout.columns,
      rowHeight: body.rowHeight || mockDashboardLayout.rowHeight,
      theme: body.theme || mockDashboardLayout.theme,
      createdAt: mockDashboardLayout.createdAt,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: savedLayout }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
