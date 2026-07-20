'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Baby,
  Home,
  Calendar,
  Check,
  X as XIcon,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { LifeEventService } from '../services';
import type { LifeEvent } from '../types';

const eventTypeConfig: Record<
  string,
  { icon: React.ComponentType<any>; color: string; label: string }
> = {
  marriage: { icon: Ring, color: 'text-rose-500 bg-rose-50', label: 'Marriage' },
  birth: { icon: Baby, color: 'text-blue-500 bg-blue-50', label: 'Child Birth' },
  adoption: { icon: Baby, color: 'text-purple-500 bg-purple-50', label: 'Adoption' },
  death: { icon: Heart, color: 'text-slate-500 bg-slate-50', label: 'Bereavement' },
  divorce: { icon: Heart, color: 'text-slate-500 bg-slate-50', label: 'Divorce' },
  relocation: { icon: Home, color: 'text-emerald-500 bg-emerald-50', label: 'Relocation' },
  education: { icon: GraduationCap, color: 'text-amber-500 bg-amber-50', label: 'Education' },
  other: { icon: AlertCircle, color: 'text-slate-500 bg-slate-50', label: 'Other' },
};

const normalizeStatus = (status: string): string => (status || '').toLowerCase();

export default function EmployeeLifeEventsPage() {
  const [employeeLifeEvents, setEmployeeLifeEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeLifeEvents();
  }, []);

  const fetchEmployeeLifeEvents = async () => {
    try {
      setLoading(true);
      const data = await LifeEventService.getAllLifeEvents();
      setEmployeeLifeEvents(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load life events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setError('');
      setActionState((prev) => ({ ...prev, [id]: action }));
      await LifeEventService.processEvent(id, action);
      await fetchEmployeeLifeEvents();
    } catch (err: any) {
      console.error(`${action} failed:`, err);
      setError(`Failed to ${action} the event. Please try again.`);
    } finally {
      setActionState((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Employee Life Events
          </h1>
          <p className="text-slate-500 text-sm">
            Review and approve reported milestones and personal updates.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-2 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Event Declarations</h3>
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}
        {!loading && employeeLifeEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Heart className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No life events found</p>
            <p className="text-sm">Events will appear here once employees report them.</p>
          </div>
        )}
        {!loading && employeeLifeEvents.length > 0 && (
          <div className="space-y-4">
            {employeeLifeEvents.map((evt) => {
              const eventType = normalizeStatus(evt.eventType);
              const config = eventTypeConfig[eventType] || eventTypeConfig.other;
              const IconComponent = config.icon;
              const status = normalizeStatus(evt.status);
              const isPending =
                status === 'reported' || status === 'in_progress' || status === 'pending';
              const busy = actionState[evt.eventId];
              return (
                <div
                  key={evt.eventId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${config.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold">{evt.employeeName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        {config.label} {evt.description ? `- ${evt.description}` : ''}{' '}
                        <Calendar className="w-3 h-3" /> {formatDate(evt.eventDate)}
                      </div>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(evt.eventId, 'approve')}
                        disabled={!!busy}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />{' '}
                        {busy === 'approve' ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(evt.eventId, 'reject')}
                        disabled={!!busy}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        <XIcon className="w-4 h-4" /> {busy === 'reject' ? 'Rejecting…' : 'Reject'}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2 rounded-lg text-sm font-bold ${
                        status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : status === 'rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {status === 'completed'
                        ? 'Approved'
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Ring(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10.5c0 4.14-3.36 7.5-7.5 7.5s-7.5-3.36-7.5-7.5S10.36 3 14.5 3c2.75 0 5.16 1.48 6.44 3.7" />
      <path d="M14.5 3a7.5 7.5 0 0 1 7.5 7.5" />
      <path d="M8 11.5A3.5 3.5 0 0 1 11.5 8" />
      <path d="M7.78 6.41L11.5 8" />
      <circle cx="5" cy="18" r="3" />
    </svg>
  );
}
