'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users, Ticket, Loader2, PartyPopper } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { EventsService } from '../services';
import { ToastContainer } from '../components/Toast';
import type { AlumniEvent, Reunion, Toast } from '../types';

function formatDate(value: Date | string | undefined): {
  month: string;
  day: string;
  full: string;
} {
  if (!value) return { month: '', day: '', full: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { month: '', day: '', full: '' };
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()),
    full: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  };
}

export default function EventsReunionsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvping, setRsvping] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, message }]);
  }, []);
  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, reunionsData] = await Promise.all([
        EventsService.getAllEvents(),
        EventsService.getAllReunions(),
      ]);
      setEvents(eventsData || []);
      setReunions(reunionsData || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRsvp = useCallback(
    async (event: AlumniEvent) => {
      if (!user?.employeeId) {
        pushToast('error', 'You must be signed in to RSVP.');
        return;
      }
      setRsvping(event.eventId);
      try {
        await EventsService.registerForEvent(event.eventId, user.employeeId, {
          alumniName: user.email,
          alumniEmail: user.email,
          guestCount: 0,
        });
        pushToast('success', `You are registered for ${event.eventName}.`);
        await load();
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Failed to RSVP.');
      } finally {
        setRsvping(null);
      }
    },
    [user?.employeeId, user?.email, pushToast, load]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <ToastContainer toasts={toasts} onClose={closeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Events &amp; Reunions
          </h1>
          <p className="text-slate-500 text-sm">
            Upcoming gatherings and networking opportunities.
          </p>
        </div>
      </div>

      {loading || authLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => void load()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {events.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No upcoming events.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {events.map((event) => {
                const dt = formatDate(event.eventDate);
                return (
                  <div
                    key={event.eventId}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-32 bg-indigo-500 flex items-center justify-center">
                      <CalendarDays className="w-12 h-12 text-white/50" />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-xl mb-1">{event.eventName}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="w-4 h-4" />{' '}
                            {event.virtualLink
                              ? 'Virtual Event'
                              : (event as AlumniEvent & { location?: string }).location ||
                                event.venue?.venueName ||
                                'TBA'}
                          </div>
                        </div>
                        <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2 min-w-[60px]">
                          <div className="text-xs uppercase font-bold text-slate-400">
                            {dt.month}
                          </div>
                          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {dt.day}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                          <Users className="w-4 h-4" /> {event.currentAttendees ?? 0} Going
                        </div>
                        <button
                          onClick={() => void handleRsvp(event)}
                          disabled={rsvping === event.eventId}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
                        >
                          {rsvping === event.eventId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Ticket className="w-4 h-4" />
                          )}{' '}
                          RSVP
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
              <PartyPopper className="w-5 h-5 text-rose-500" /> Reunions
            </h2>
            {reunions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">No reunions scheduled.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {reunions.map((reunion) => {
                  const dt = formatDate(
                    (reunion as Reunion & { eventDate?: Date | string }).eventDate
                  );
                  return (
                    <div
                      key={reunion.reunionId}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
                    >
                      <h3 className="font-bold text-lg mb-1">{reunion.reunionName}</h3>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mb-2">
                        <CalendarDays className="w-4 h-4" /> {dt.full || 'Date TBA'}
                      </div>
                      {reunion.location ? (
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {reunion.location}
                        </div>
                      ) : null}
                      <div className="text-xs text-slate-400 mt-3">
                        {reunion.actualAttendees ?? 0} attending
                        {reunion.batchYear ? ` · Batch ${reunion.batchYear}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
