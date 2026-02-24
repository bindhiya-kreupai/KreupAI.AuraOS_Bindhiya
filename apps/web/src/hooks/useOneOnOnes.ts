/**
 * @module useOneOnOnes
 * @description React hooks for One-on-One meeting state management
 * @project AURA HCM Platform
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  OneOnOneService,
  type OneOnOneMeeting,
  type MeetingActionItem,
  type AgendaTemplate,
  type MeetingStatus,
} from '@/services/oneOnOneService';

export function useOneOnOnes() {
  const [meetings, setMeetings] = useState<OneOnOneMeeting[]>([]);
  const [templates, setTemplates] = useState<AgendaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<OneOnOneMeeting | null>(null);

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [mtgs, tpls] = await Promise.all([
        OneOnOneService.getMeetings(),
        OneOnOneService.getTemplates(),
      ]);
      if (!cancelled) {
        setMeetings(mtgs);
        setTemplates(tpls);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived data
  const upcoming = useMemo(
    () =>
      meetings
        .filter((m) => m.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
    [meetings]
  );

  const completed = useMemo(
    () =>
      meetings
        .filter((m) => m.status === 'completed')
        .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
    [meetings]
  );

  const allActionItems = useMemo(() => meetings.flatMap((m) => m.actionItems), [meetings]);

  const pendingActions = useMemo(
    () => allActionItems.filter((a) => a.status !== 'completed'),
    [allActionItems]
  );

  // Schedule meeting
  const scheduleMeeting = useCallback(
    async (data: Omit<OneOnOneMeeting, 'id' | 'actionItems' | 'notes' | 'status'>) => {
      const meeting = await OneOnOneService.scheduleMeeting(data);
      setMeetings((prev) => [meeting, ...prev]);
      return meeting;
    },
    []
  );

  // Update meeting
  const updateMeeting = useCallback(
    async (id: string, updates: Partial<OneOnOneMeeting>) => {
      const updated = await OneOnOneService.updateMeeting(id, updates);
      setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selectedMeeting?.id === id) setSelectedMeeting(updated);
      return updated;
    },
    [selectedMeeting]
  );

  // Complete meeting
  const completeMeeting = useCallback(
    async (id: string, notes: string, sentiment: number) => {
      const updated = await OneOnOneService.completeMeeting(id, notes, sentiment);
      setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selectedMeeting?.id === id) setSelectedMeeting(updated);
    },
    [selectedMeeting]
  );

  // Cancel meeting
  const cancelMeeting = useCallback(async (id: string) => {
    await OneOnOneService.cancelMeeting(id);
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'cancelled' as MeetingStatus } : m))
    );
  }, []);

  // Action items
  const addActionItem = useCallback(
    async (
      meetingId: string,
      item: Omit<MeetingActionItem, 'id' | 'meetingId' | 'completedAt'>
    ) => {
      const newItem = await OneOnOneService.addActionItem(meetingId, item);
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId ? { ...m, actionItems: [...m.actionItems, newItem] } : m
        )
      );
      if (selectedMeeting?.id === meetingId) {
        setSelectedMeeting((prev) =>
          prev ? { ...prev, actionItems: [...prev.actionItems, newItem] } : prev
        );
      }
      return newItem;
    },
    [selectedMeeting]
  );

  const updateActionItem = useCallback(
    async (meetingId: string, itemId: string, updates: Partial<MeetingActionItem>) => {
      await OneOnOneService.updateActionItem(meetingId, itemId, updates);
      const updater = (m: OneOnOneMeeting) =>
        m.id === meetingId
          ? {
              ...m,
              actionItems: m.actionItems.map((a) =>
                a.id === itemId
                  ? {
                      ...a,
                      ...updates,
                      ...(updates.status === 'completed'
                        ? { completedAt: new Date().toISOString() }
                        : {}),
                    }
                  : a
              ),
            }
          : m;
      setMeetings((prev) => prev.map(updater));
      if (selectedMeeting?.id === meetingId)
        setSelectedMeeting((prev) => (prev ? updater(prev) : prev));
    },
    [selectedMeeting]
  );

  return {
    meetings,
    templates,
    loading,
    selectedMeeting,
    setSelectedMeeting,
    upcoming,
    completed,
    allActionItems,
    pendingActions,
    scheduleMeeting,
    updateMeeting,
    completeMeeting,
    cancelMeeting,
    addActionItem,
    updateActionItem,
  };
}
