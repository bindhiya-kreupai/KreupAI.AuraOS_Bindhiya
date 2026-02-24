/**
 * @module TasksWidget
 * @description Pending tasks and reminders widget
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import { ListTodo, Circle, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export const TasksWidget: React.FC = () => {
  // Mock data – in production, fetch from tasks API
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: 'Complete performance review for Q4',
      dueDate: 'Today',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      title: 'Submit expense report',
      dueDate: 'Tomorrow',
      priority: 'medium',
      completed: false,
    },
    {
      id: '3',
      title: 'Review updated HR policy',
      dueDate: 'Feb 28',
      priority: 'low',
      completed: false,
    },
    {
      id: '4',
      title: 'Schedule team meeting',
      dueDate: 'Mar 1',
      priority: 'medium',
      completed: true,
    },
    {
      id: '5',
      title: 'Update emergency contacts',
      dueDate: 'Mar 3',
      priority: 'low',
      completed: false,
    },
  ]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const priorityStyles: Record<string, string> = {
    high: 'text-quantum-rose',
    medium: 'text-sunset-amber',
    low: 'text-silver-mist',
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-celestial-indigo" />
          Tasks
        </h3>
        <span className="text-[10px] text-silver-mist">{pendingCount} pending</span>
      </div>

      <div className="space-y-1">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="flex items-start gap-2 w-full text-left p-1.5 rounded-lg hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50 transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-neural-mint mt-0.5 shrink-0" />
            ) : (
              <Circle className={`w-4 h-4 mt-0.5 shrink-0 ${priorityStyles[task.priority]}`} />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium truncate ${
                  task.completed
                    ? 'line-through text-silver-mist'
                    : 'text-ink-black dark:text-pearl'
                }`}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-silver-mist">{task.dueDate}</span>
                {task.priority === 'high' && !task.completed && (
                  <span className="flex items-center gap-0.5 text-[10px] text-quantum-rose">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Urgent
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TasksWidget;
