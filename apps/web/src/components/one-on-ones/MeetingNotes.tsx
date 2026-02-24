/**
 * @module MeetingNotes
 * @description Rich text notes editor for one-on-one meetings with agenda tracking
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Check,
  Plus,
  X,
  Save,
  MessageSquare,
  Smile,
  Meh,
  Frown,
  Star,
  Bold,
  Italic,
  List,
} from 'lucide-react';
import type { OneOnOneMeeting, AgendaItem } from '@/services/oneOnOneService';

interface MeetingNotesProps {
  meeting: OneOnOneMeeting;
  onUpdateNotes: (notes: string) => void;
  onUpdateAgenda: (items: AgendaItem[]) => void;
  onComplete: (notes: string, sentiment: number) => void;
  readonly?: boolean;
}

export const MeetingNotes: React.FC<MeetingNotesProps> = ({
  meeting,
  onUpdateNotes,
  onUpdateAgenda,
  onComplete,
  readonly = false,
}) => {
  const [notes, setNotes] = useState(meeting.notes);
  const [agendaItems, setAgendaItems] = useState(meeting.agendaItems);
  const [newItem, setNewItem] = useState('');
  const [sentiment, setSentiment] = useState(meeting.sentiment || 3);

  const toggleDiscussed = useCallback(
    (id: string) => {
      if (readonly) return;
      const updated = agendaItems.map((a) =>
        a.id === id ? { ...a, isDiscussed: !a.isDiscussed } : a
      );
      setAgendaItems(updated);
      onUpdateAgenda(updated);
    },
    [agendaItems, readonly, onUpdateAgenda]
  );

  const updateItemNotes = useCallback(
    (id: string, itemNotes: string) => {
      const updated = agendaItems.map((a) => (a.id === id ? { ...a, notes: itemNotes } : a));
      setAgendaItems(updated);
      onUpdateAgenda(updated);
    },
    [agendaItems, onUpdateAgenda]
  );

  const addAgendaItem = useCallback(() => {
    if (!newItem.trim()) return;
    const item: AgendaItem = {
      id: `a-${Date.now()}`,
      text: newItem.trim(),
      isDiscussed: false,
      notes: '',
      addedBy: 'manager',
    };
    const updated = [...agendaItems, item];
    setAgendaItems(updated);
    onUpdateAgenda(updated);
    setNewItem('');
  }, [newItem, agendaItems, onUpdateAgenda]);

  const removeItem = useCallback(
    (id: string) => {
      const updated = agendaItems.filter((a) => a.id !== id);
      setAgendaItems(updated);
      onUpdateAgenda(updated);
    },
    [agendaItems, onUpdateAgenda]
  );

  const handleSaveNotes = useCallback(() => {
    onUpdateNotes(notes);
  }, [notes, onUpdateNotes]);

  const discussedCount = agendaItems.filter((a) => a.isDiscussed).length;

  const SENTIMENT_OPTIONS = [
    { value: 1, icon: Frown, label: 'Difficult', color: 'text-coral-alert' },
    { value: 2, icon: Frown, label: 'Below Average', color: 'text-sunset-amber' },
    { value: 3, icon: Meh, label: 'Neutral', color: 'text-silver-mist' },
    { value: 4, icon: Smile, label: 'Positive', color: 'text-celestial-indigo' },
    { value: 5, icon: Star, label: 'Excellent', color: 'text-neural-mint' },
  ];

  return (
    <div className="space-y-4">
      {/* Agenda Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
            <List className="w-3.5 h-3.5 text-celestial-indigo" />
            Agenda ({discussedCount}/{agendaItems.length} discussed)
          </h4>
        </div>

        <div className="space-y-2">
          {agendaItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border transition-colors ${
                item.isDiscussed
                  ? 'border-neural-mint/30 bg-neural-mint/5 dark:bg-neural-mint/10'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              <div className="flex items-start gap-2.5 p-3">
                <button
                  onClick={() => toggleDiscussed(item.id)}
                  disabled={readonly}
                  className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.isDiscussed
                      ? 'border-neural-mint bg-neural-mint'
                      : 'border-cloud dark:border-nebula-purple/30'
                  } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {item.isDiscussed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs ${item.isDiscussed ? 'text-silver-mist line-through' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {item.text}
                  </p>
                  <span className="text-[9px] text-silver-mist/60 capitalize">
                    Added by {item.addedBy}
                  </span>
                </div>
                {!readonly && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos shrink-0"
                  >
                    <X className="w-3 h-3 text-silver-mist" />
                  </button>
                )}
              </div>
              {/* Item-level notes */}
              {(item.isDiscussed || item.notes) && !readonly && (
                <div className="px-3 pb-3 pl-9">
                  <textarea
                    value={item.notes}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    placeholder="Discussion notes for this item..."
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-cloud/50 dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-[11px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
                  />
                </div>
              )}
              {item.notes && readonly && (
                <div className="px-3 pb-3 pl-9">
                  <p className="text-[11px] text-silver-mist italic">{item.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new agenda item */}
        {!readonly && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAgendaItem()}
              placeholder="Add agenda item..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
            />
            <button
              onClick={addAgendaItem}
              className="p-1.5 rounded-lg bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Meeting Notes */}
      <div>
        <h4 className="text-xs font-bold text-ink-black dark:text-pearl flex items-center gap-1.5 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-nebula-purple" />
          Meeting Notes
        </h4>
        {readonly ? (
          <div className="px-3 py-2.5 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/20 text-xs text-ink-black dark:text-pearl whitespace-pre-wrap min-h-[80px]">
            {notes || <span className="text-silver-mist italic">No notes recorded.</span>}
          </div>
        ) : (
          <>
            {/* Simple formatting toolbar */}
            <div className="flex items-center gap-1 mb-1.5 px-1">
              <button
                className="p-1 rounded hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                title="Bold"
              >
                <Bold className="w-3 h-3 text-silver-mist" />
              </button>
              <button
                className="p-1 rounded hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                title="Italic"
              >
                <Italic className="w-3 h-3 text-silver-mist" />
              </button>
              <button
                className="p-1 rounded hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                title="List"
              >
                <List className="w-3 h-3 text-silver-mist" />
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Capture key discussion points, decisions, and follow-ups..."
              rows={5}
              className="w-full px-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
            />
            <div className="flex items-center justify-end mt-1.5">
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-semibold text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
              >
                <Save className="w-3 h-3" /> Save Notes
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sentiment (for completing meetings) */}
      {!readonly && meeting.status === 'scheduled' && (
        <div>
          <h4 className="text-xs font-bold text-ink-black dark:text-pearl mb-2">
            Meeting Sentiment
          </h4>
          <div className="flex items-center gap-2">
            {SENTIMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = sentiment === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSentiment(opt.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-celestial-indigo bg-celestial-indigo/5'
                      : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? opt.color : 'text-silver-mist'}`} />
                  <span className="text-[9px] text-silver-mist">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onComplete(notes, sentiment)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-neural-mint text-white hover:opacity-90 transition-opacity"
          >
            <Check className="w-4 h-4" /> Complete Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingNotes;
