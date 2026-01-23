"use client";

import React from 'react';
import { Circle, CheckCircle2, AlertCircle } from 'lucide-react';

const tasks = [
  { id: '1', title: 'Complete quarterly review', priority: 'high', due: 'Today' },
  { id: '2', title: 'Update emergency contacts', priority: 'medium', due: 'Tomorrow' },
  { id: '3', title: 'Submit expense report', priority: 'low', due: 'Jan 25' },
  { id: '4', title: 'Acknowledge policy update', priority: 'medium', due: 'Jan 28' },
];

export function TasksWidget() {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-2 group">
          <button className="mt-0.5 text-silver-mist hover:text-celestial-indigo transition-colors">
            <Circle className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors truncate">
              {task.title}
            </p>
            <p className="text-[10px] text-silver-mist">Due: {task.due}</p>
          </div>
          {task.priority === 'high' && (
            <AlertCircle className="w-3 h-3 text-coral-alert flex-shrink-0 mt-0.5" />
          )}
        </div>
      ))}
    </div>
  );
}
