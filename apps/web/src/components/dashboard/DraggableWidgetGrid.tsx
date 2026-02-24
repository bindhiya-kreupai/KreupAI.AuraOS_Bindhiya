/**
 * @module DraggableWidgetGrid
 * @description Grid container with drag-drop widget support using @dnd-kit
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useDashboard } from '@/stores/dashboard-store';
import { WidgetWrapper } from './WidgetWrapper';
import { WidgetConfigPanel } from './WidgetConfigPanel';
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
import { Settings, RotateCcw, Save, X, Loader2 } from 'lucide-react';

const WIDGET_COMPONENTS: Record<string, React.FC> = {
  attendance: AttendanceWidget,
  'leave-balance': LeaveBalanceWidget,
  team: TeamWidget,
  approvals: ApprovalWidget,
  tasks: TasksWidget,
  calendar: CalendarWidget,
  announcements: AnnouncementsWidget,
  metrics: MetricsWidget,
  birthdays: BirthdayWidget,
  'quick-links': QuickLinksWidget,
};

export const DraggableWidgetGrid: React.FC = () => {
  const {
    preferences,
    editMode,
    setEditMode,
    configPanelOpen,
    setConfigPanelOpen,
    reorderWidgets,
    resetLayout,
    savePreferences,
    isSaving,
  } = useDashboard();

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const visibleWidgets = useMemo(
    () => preferences.layout.widgets.filter((w) => w.visible),
    [preferences.layout.widgets]
  );

  const widgetIds = useMemo(() => visibleWidgets.map((w) => w.id), [visibleWidgets]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  };

  const handleSave = async () => {
    await savePreferences();
    setEditMode(false);
  };

  const activeWidget = activeId ? visibleWidgets.find((w) => w.id === activeId) : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink-black dark:text-pearl">Dashboard</h1>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => setConfigPanelOpen(!configPanelOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Widgets
              </button>
              <button
                onClick={resetLayout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-silver-mist/10 text-silver-mist hover:bg-silver-mist/20 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neural-mint/10 text-neural-mint hover:bg-neural-mint/20 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-quantum-rose/10 text-quantum-rose hover:bg-quantum-rose/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-pearl dark:bg-deep-cosmos text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Customize
            </button>
          )}
        </div>
      </div>

      {/* Config Panel */}
      {configPanelOpen && <WidgetConfigPanel />}

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleWidgets.map((widget) => {
              const WidgetComponent = WIDGET_COMPONENTS[widget.type];
              if (!WidgetComponent) return null;

              return (
                <WidgetWrapper key={widget.id} widget={widget} isEditMode={editMode}>
                  <WidgetComponent />
                </WidgetWrapper>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget ? (
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-celestial-indigo/50 shadow-xl p-4 opacity-90">
              <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                {activeWidget.title}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {visibleWidgets.length === 0 && (
        <div className="text-center py-16">
          <p className="text-silver-mist text-sm mb-2">No widgets visible</p>
          <button
            onClick={() => {
              setEditMode(true);
              setConfigPanelOpen(true);
            }}
            className="text-celestial-indigo text-sm font-medium hover:underline"
          >
            Configure your dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default DraggableWidgetGrid;
