"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Baby, Home, GraduationCap, Gem, UserMinus, Plus, ChevronRight, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { LifeEventService } from '../services';

const eventTypes = [
  { id: 'marriage', label: 'Marriage / Domestic Partnership', icon: <Gem className="w-5 h-5" />, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  { id: 'baby', label: 'Birth / Adoption of Child', icon: <Baby className="w-5 h-5" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'home', label: 'Home Purchase / Relocation', icon: <Home className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'education', label: 'Continued Education', icon: <GraduationCap className="w-5 h-5" />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { id: 'loss', label: 'Loss of Family Member', icon: <Heart className="w-5 h-5" />, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' },
  { id: 'divorce', label: 'Divorce / Separation', icon: <UserMinus className="w-5 h-5" />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
];

const iconMap: Record<string, React.ReactNode> = {
  marriage: <Gem className="w-4 h-4 text-pink-500" />,
  baby: <Baby className="w-4 h-4 text-blue-500" />,
  home: <Home className="w-4 h-4 text-emerald-500" />,
  education: <GraduationCap className="w-4 h-4 text-purple-500" />,
  loss: <Heart className="w-4 h-4 text-slate-500" />,
  divorce: <UserMinus className="w-4 h-4 text-amber-500" />,
};

export default function LifeEventsPage() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await LifeEventService.getEvents();
        if (res?.success && Array.isArray(res.data)) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch life events:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchEvents();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'processed': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'in-review':
      case 'pending':
      case 'in_review': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleReportEvent = async (eventTypeId: string) => {
    try {
      await LifeEventService.reportEvent({
        eventType: eventTypeId,
        eventDate: new Date().toISOString(),
        description: `${eventTypeId} life event reported`,
      });
      setShowReportForm(false);
      const res = await LifeEventService.getEvents();
      if (res?.success && Array.isArray(res.data)) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to report event:', err);
      alert('Failed to report life event. Please try again.');
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Life Events</h1>
          <p className="text-sm text-silver-mist mt-1">Report life changes that affect your benefits and employment</p>
        </div>
        <button
          onClick={() => setShowReportForm(!showReportForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Report Life Event
        </button>
      </div>

      {showReportForm && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Select Event Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventTypes.map((event) => (
              <button
                key={event.id}
                onClick={() => handleReportEvent(event.id)}
                className="flex items-center gap-3 p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo transition-colors text-left"
              >
                <div className={`p-2.5 rounded-lg ${event.color}`}>
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{event.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-silver-mist flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Recent Life Events</h3>
        </div>
        {events.length > 0 ? (
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {events.map((event: any) => {
              const eventIcon = iconMap[event.eventType?.toLowerCase()] || <Heart className="w-4 h-4 text-slate-500" />;
              const status = event.status || 'pending';
              const actions = event.actions || event.impactedAreas || [];

              return (
                <div key={event.id} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-deep-cosmos">
                      {eventIcon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">{event.eventType || event.type || 'Life Event'}</p>
                      <p className="text-xs text-silver-mist">Reported: {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusStyle(status)}`}>
                      {status.replace(/[-_]/g, ' ')}
                    </span>
                  </div>
                  {Array.isArray(actions) && actions.length > 0 && (
                    <div className="ml-11 space-y-1.5">
                      {actions.map((action: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {status === 'completed' || status === 'processed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-silver-mist">{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Heart className="w-12 h-12 text-silver-mist mx-auto mb-3" />
            <p className="text-sm text-silver-mist">No life events reported yet</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Heart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Qualifying Life Events</p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
            Life events may qualify you for a Special Enrollment Period, allowing benefits changes outside open enrollment. Report within 30 days of the event.
          </p>
        </div>
      </div>
    </div>
  );
}
