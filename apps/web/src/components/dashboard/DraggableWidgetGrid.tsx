"use client";

import React from 'react';
import { Settings2 } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { AttendanceWidget } from './widgets/AttendanceWidget';
import { LeaveBalanceWidget } from './widgets/LeaveBalanceWidget';
import { TeamWidget } from './widgets/TeamWidget';
import { ApprovalWidget } from './widgets/ApprovalWidget';
import { TasksWidget } from './widgets/TasksWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { AnnouncementsWidget } from './widgets/AnnouncementsWidget';
import { MetricsWidget } from './widgets/MetricsWidget';
import { BirthdayWidget } from './widgets/BirthdayWidget';
import { QuickLinksWidget } from './widgets/QuickLinksWidget';
import { useDashboardStore, WidgetConfig } from '@/stores/dashboard-store';

const WIDGET_COMPONENTS: Record<string, React.FC> = {
  'attendance': AttendanceWidget,
  'leave-balance': LeaveBalanceWidget,
  'team': TeamWidget,
  'approvals': ApprovalWidget,
  'tasks': TasksWidget,
  'calendar': CalendarWidget,
  'announcements': AnnouncementsWidget,
  'metrics': MetricsWidget,
  'birthdays': BirthdayWidget,
  'quick-links': QuickLinksWidget,
};

export function DraggableWidgetGrid() {
  const { widgets, toggleWidgetVisibility, setConfigPanelOpen } = useDashboardStore();
  const visibleWidgets = widgets.filter((w) => w.visible);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-black dark:text-pearl">My Dashboard</h2>
        <button
          onClick={() => setConfigPanelOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-silver-mist hover:text-celestial-indigo bg-slate-50 dark:bg-deep-cosmos hover:bg-celestial-indigo/5 rounded-lg transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Customize
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleWidgets.map((widget) => {
          const WidgetComponent = WIDGET_COMPONENTS[widget.type];
          if (!WidgetComponent) return null;
          return (
            <WidgetWrapper
              key={widget.id}
              id={widget.id}
              title={widget.title}
              onRemove={(id) => toggleWidgetVisibility(id)}
              className={widget.position.w > 1 ? 'md:col-span-2' : ''}
            >
              <WidgetComponent />
            </WidgetWrapper>
          );
        })}
      </div>
    </div>
  );
}
