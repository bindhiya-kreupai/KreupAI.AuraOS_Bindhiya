/**
 * @module WidgetWrapper
 * @description Individual widget wrapper with resize handles and drag support
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { useDashboard } from '@/stores/dashboard-store';
import type { WidgetConfig } from '@/stores/dashboard-store';

interface WidgetWrapperProps {
  widget: WidgetConfig;
  isEditMode: boolean;
  children: React.ReactNode;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget, isEditMode, children }) => {
  const { toggleWidgetVisibility } = useDashboard();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !isEditMode,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Determine span classes based on widget position width
  const getSpanClass = () => {
    const w = widget.position.w;
    if (w >= 6) return 'md:col-span-2 lg:col-span-2 xl:col-span-2';
    if (w >= 4) return 'md:col-span-2 lg:col-span-1 xl:col-span-1';
    return '';
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${getSpanClass()}`}>
      <div
        className={`bg-white dark:bg-stellar-blue rounded-xl border shadow-sm transition-all h-full ${
          isEditMode
            ? 'border-celestial-indigo/30 hover:border-celestial-indigo/60 ring-1 ring-celestial-indigo/10'
            : 'border-cloud dark:border-nebula-purple/50 hover:shadow-md'
        } ${isDragging ? 'shadow-xl scale-[1.02]' : ''}`}
      >
        {/* Edit mode drag handle & controls */}
        {isEditMode && (
          <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1">
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="p-1 rounded-full bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 shadow-sm hover:bg-quantum-rose/10 transition-colors"
              title={widget.visible ? 'Hide widget' : 'Show widget'}
            >
              {widget.visible ? (
                <EyeOff className="w-3 h-3 text-silver-mist" />
              ) : (
                <Eye className="w-3 h-3 text-silver-mist" />
              )}
            </button>
          </div>
        )}

        {/* Drag handle bar at top */}
        {isEditMode && (
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing border-b border-cloud/50 dark:border-nebula-purple/30 bg-pearl/50 dark:bg-deep-cosmos/50 rounded-t-xl"
          >
            <GripVertical className="w-4 h-4 text-silver-mist" />
          </div>
        )}

        {/* Widget Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default WidgetWrapper;
