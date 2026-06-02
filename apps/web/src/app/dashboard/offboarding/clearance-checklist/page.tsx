'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Laptop,
  CreditCard,
  Key,
  FileSignature,
  MoreHorizontal,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { OffboardingInstanceService } from '../services';

interface ClearanceTask {
  id: string;
  employee: string;
  dept: string;
  item: string;
  status: string;
  dueDate: string;
  exitRequestId: string;
}

export default function ClearanceChecklistPage() {
  const [clearanceItems, setClearanceItems] = useState<ClearanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const instances = await OffboardingInstanceService.getInstances();

        // Flatten clearances from all instances into a single list
        const items: ClearanceTask[] = [];
        (instances || []).forEach((inst: any) => {
          const clearances = inst.clearances || [];
          clearances.forEach((c: any) => {
            items.push({
              id: c.id,
              employee: inst.employeeName || 'Unknown',
              dept: c.department || 'General',
              item: c.description || 'Clearance item',
              status: c.status === 'approved' ? 'Completed' : 'Pending',
              dueDate: inst.lastWorkingDate
                ? new Date(inst.lastWorkingDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '',
              exitRequestId: inst.id,
            });
          });
        });

        setClearanceItems(items);
      } catch (error: any) {
        console.error('Error fetching clearance data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-silver-mist font-medium">Loading clearance checklist...</p>
        </div>
      </div>
    );
  }

  const pendingCount = clearanceItems.filter((c) => c.status === 'Pending').length;
  const completedCount = clearanceItems.filter((c) => c.status === 'Completed').length;
  const overdueCount = clearanceItems.filter((c) => {
    if (c.status === 'Completed') return false;
    const due = new Date(c.dueDate);
    return due < new Date();
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getDeptIcon = (dept: string) => {
    const d = dept.toLowerCase();
    if (d.includes('it') || d.includes('tech')) return <Laptop className="w-4 h-4" />;
    if (d.includes('finance') || d.includes('account')) return <CreditCard className="w-4 h-4" />;
    if (d.includes('admin') || d.includes('facility')) return <Key className="w-4 h-4" />;
    return <FileSignature className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Clearance Checklist
          </h1>
          <p className="text-slate-500 text-sm">
            Track asset returns and clearance tasks across departments.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter by Dept
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-sm text-slate-500">Pending Clearances</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{overdueCount}</div>
            <div className="text-sm text-slate-500">Overdue Items</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold flex items-center gap-2">Active Tasks</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {clearanceItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No clearance items found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {clearanceItems.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500`}
                  >
                    {getDeptIcon(task.dept)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {task.item}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {task.employee}
                      </span>
                      <span>-</span>
                      <span>Due: {task.dueDate}</span>
                      <span>-</span>
                      <span className="uppercase tracking-wide font-bold">{task.dept}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </span>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.status === 'Pending' && (
                        <button
                          onClick={() => {
                            setClearanceItems((items) =>
                              items.map((t) =>
                                t.id === task.id ? { ...t, status: 'Completed' } : t
                              )
                            );
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Mark Done
                        </button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
