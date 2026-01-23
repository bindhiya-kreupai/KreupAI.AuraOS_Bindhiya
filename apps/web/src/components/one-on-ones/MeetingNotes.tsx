"use client";

import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Users,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Clock,
} from "lucide-react";

interface MeetingDetails {
  id: string;
  date: string;
  time: string;
  attendees: { name: string; role: string }[];
  notes: string;
  lastSaved: string | null;
}

const mockMeeting: MeetingDetails = {
  id: "meeting-1",
  date: "2026-01-23",
  time: "10:00 AM",
  attendees: [
    { name: "You (Manager)", role: "Engineering Manager" },
    { name: "Sarah Chen", role: "Senior Developer" },
  ],
  notes:
    "## Discussion Points\n\n- Project timeline update\n- Code review feedback from last sprint\n- Career growth plan check-in\n\n## Key Takeaways\n\n- Sprint velocity improved by 15%\n- Need to allocate time for tech debt\n- Sarah interested in system design mentorship",
  lastSaved: "2026-01-23T10:35:00",
};

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: string;
}

export default function MeetingNotes() {
  const [meeting, setMeeting] = useState<MeetingDetails>(mockMeeting);
  const [isSaving, setIsSaving] = useState(false);

  const toolbarButtons: ToolbarButton[] = [
    { icon: <Bold className="w-4 h-4" />, label: "Bold", action: "bold" },
    { icon: <Italic className="w-4 h-4" />, label: "Italic", action: "italic" },
    { icon: <Underline className="w-4 h-4" />, label: "Underline", action: "underline" },
    { icon: <List className="w-4 h-4" />, label: "Bullet List", action: "bulletList" },
    { icon: <ListOrdered className="w-4 h-4" />, label: "Numbered List", action: "orderedList" },
    { icon: <Link className="w-4 h-4" />, label: "Link", action: "link" },
    { icon: <AlignLeft className="w-4 h-4" />, label: "Align Left", action: "alignLeft" },
    { icon: <AlignCenter className="w-4 h-4" />, label: "Align Center", action: "alignCenter" },
    { icon: <AlignRight className="w-4 h-4" />, label: "Align Right", action: "alignRight" },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setMeeting({
        ...meeting,
        lastSaved: new Date().toISOString(),
      });
      setIsSaving(false);
    }, 800);
  };

  const handleToolbarAction = (action: string) => {
    console.log("Toolbar action triggered:", action);
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Meeting Notes
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-celestial-indigo rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Notes"}
        </button>
      </div>

      {/* Meeting Meta */}
      <div className="flex flex-wrap gap-6 mb-6 pb-4 border-b border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-silver-mist" />
          <span className="text-sm text-ink-black dark:text-pearl">
            {new Date(meeting.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-silver-mist" />
          <span className="text-sm text-ink-black dark:text-pearl">{meeting.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-silver-mist" />
          <div className="flex gap-2">
            {meeting.attendees.map((attendee, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs font-medium rounded-full bg-celestial-indigo/10 text-celestial-indigo"
              >
                {attendee.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 mb-3 p-2 bg-cloud/30 dark:bg-nebula-purple/10 rounded-lg border border-cloud dark:border-nebula-purple/50">
        {toolbarButtons.map((button, index) => (
          <React.Fragment key={button.action}>
            <button
              type="button"
              onClick={() => handleToolbarAction(button.action)}
              title={button.label}
              className="p-2 rounded hover:bg-cloud dark:hover:bg-nebula-purple/30 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
            >
              {button.icon}
            </button>
            {(index === 2 || index === 4 || index === 5) && (
              <div className="w-px h-5 bg-cloud dark:bg-nebula-purple/50 mx-1" />
            )}
          </React.Fragment>
        ))}
        {meeting.lastSaved && (
          <span className="ml-auto text-xs text-silver-mist">
            Last saved:{" "}
            {new Date(meeting.lastSaved).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Notes Editor */}
      <textarea
        value={meeting.notes}
        onChange={(e) => setMeeting({ ...meeting, notes: e.target.value })}
        rows={16}
        placeholder="Start typing your meeting notes here..."
        className="w-full px-4 py-3 text-sm font-mono border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 resize-y"
      />
    </div>
  );
}
