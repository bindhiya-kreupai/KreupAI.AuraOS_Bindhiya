"use client";

import React, { useState } from "react";
import {
  FileText,
  Clock,
  MessageCircle,
  CheckSquare,
  RotateCcw,
  Plus,
} from "lucide-react";

export type NoteCategory = "talking_points" | "action_items" | "follow_ups";

export interface NoteItem {
  id: string;
  content: string;
  category: NoteCategory;
  timestamp: string;
  completed?: boolean;
}

export interface MeetingNotes {
  id: string;
  meetingDate: string;
  participant: string;
  participantAvatar: string;
  notes: NoteItem[];
}

const mockMeetingNotes: MeetingNotes = {
  id: "meeting-1",
  meetingDate: "2026-01-23",
  participant: "Alice Chen",
  participantAvatar: "AC",
  notes: [
    {
      id: "1",
      content: "Discuss progress on the API redesign project",
      category: "talking_points",
      timestamp: "2026-01-23T10:00:00",
    },
    {
      id: "2",
      content: "Review career development goals for Q1",
      category: "talking_points",
      timestamp: "2026-01-23T10:05:00",
    },
    {
      id: "3",
      content: "Address team communication concerns raised in retro",
      category: "talking_points",
      timestamp: "2026-01-23T10:10:00",
    },
    {
      id: "4",
      content: "Complete draft of the technical specification by Friday",
      category: "action_items",
      timestamp: "2026-01-23T10:15:00",
      completed: false,
    },
    {
      id: "5",
      content: "Schedule pairing session with new team member",
      category: "action_items",
      timestamp: "2026-01-23T10:20:00",
      completed: true,
    },
    {
      id: "6",
      content: "Set up 1:1 with design team lead about component library",
      category: "action_items",
      timestamp: "2026-01-23T10:25:00",
      completed: false,
    },
    {
      id: "7",
      content: "Check in on workload balance after sprint planning",
      category: "follow_ups",
      timestamp: "2026-01-23T10:30:00",
    },
    {
      id: "8",
      content: "Revisit promotion timeline in next 1:1",
      category: "follow_ups",
      timestamp: "2026-01-23T10:35:00",
    },
  ],
};

const categoryConfig: Record<
  NoteCategory,
  { label: string; icon: React.ReactNode; colorClass: string }
> = {
  talking_points: {
    label: "Talking Points",
    icon: <MessageCircle className="w-4 h-4" />,
    colorClass: "text-celestial-indigo bg-celestial-indigo/10",
  },
  action_items: {
    label: "Action Items",
    icon: <CheckSquare className="w-4 h-4" />,
    colorClass: "text-aurora-green bg-aurora-green/10",
  },
  follow_ups: {
    label: "Follow-ups",
    icon: <RotateCcw className="w-4 h-4" />,
    colorClass: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20",
  },
};

export function OneOnOneNotes() {
  const [activeCategory, setActiveCategory] =
    useState<NoteCategory>("talking_points");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>(mockMeetingNotes.notes);

  const filteredNotes = notes.filter(
    (note) => note.category === activeCategory
  );

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      content: noteText.trim(),
      category: activeCategory,
      timestamp: new Date().toISOString(),
      completed: activeCategory === "action_items" ? false : undefined,
    };
    setNotes((prev) => [...prev, newNote]);
    setNoteText("");
  };

  const handleToggleComplete = (noteId: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, completed: !note.completed } : note
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-celestial-indigo" />
          <div>
            <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
              1:1 Notes
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-5 h-5 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[9px] font-bold text-celestial-indigo">
                {mockMeetingNotes.participantAvatar}
              </div>
              <span className="text-xs text-silver-mist">
                with {mockMeetingNotes.participant}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-silver-mist">
          <Clock className="w-3 h-3" />
          {mockMeetingNotes.meetingDate}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-50 dark:bg-deep-cosmos rounded-lg p-1">
        {(Object.keys(categoryConfig) as NoteCategory[]).map((cat) => {
          const config = categoryConfig[cat];
          const count = notes.filter((n) => n.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors flex-1 justify-center ${
                activeCategory === cat
                  ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm border border-cloud dark:border-nebula-purple/50"
                  : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              }`}
            >
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
              <span
                className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeCategory === cat
                    ? "bg-celestial-indigo/10 text-celestial-indigo"
                    : "bg-cloud dark:bg-nebula-purple/30 text-silver-mist"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notes List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/50"
          >
            {activeCategory === "action_items" && (
              <button
                onClick={() => handleToggleComplete(note.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-colors ${
                  note.completed
                    ? "bg-aurora-green border-aurora-green text-white"
                    : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo"
                }`}
              >
                {note.completed && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            )}
            <div className="flex-1">
              <p
                className={`text-sm text-ink-black dark:text-pearl leading-relaxed ${
                  note.completed ? "line-through opacity-50" : ""
                }`}
              >
                {note.content}
              </p>
              <span className="text-[10px] text-silver-mist mt-1 block">
                {new Date(note.timestamp).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <p className="text-sm text-silver-mist text-center py-6 italic">
            No {categoryConfig[activeCategory].label.toLowerCase()} yet
          </p>
        )}
      </div>

      {/* Add Note Input */}
      <div className="flex gap-2">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${categoryConfig[activeCategory].label.toLowerCase()}...`}
          className="flex-1 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg px-3 py-2 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 resize-none min-h-[40px]"
          rows={2}
        />
        <button
          onClick={handleAddNote}
          disabled={!noteText.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-celestial-indigo text-white flex items-center justify-center hover:bg-celestial-indigo/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
