"use client";

import React, { useState, useEffect } from "react";
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

interface ApiOneOnOne {
  id: string;
  managerId: string;
  managerName: string;
  reportId: string;
  reportName: string;
  frequency: string;
  nextMeeting: string;
  duration: number;
  status: string;
  agendaItems: string[];
  lastMeetingNotes?: string;
}

interface MeetingNotesProps {
  oneOnOnes?: ApiOneOnOne[];
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: string;
}

function mapApiToMeetingDetails(item: ApiOneOnOne): MeetingDetails {
  const meetingDate = new Date(item.nextMeeting);
  return {
    id: item.id,
    date: meetingDate.toISOString().split("T")[0],
    time: meetingDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    attendees: [
      { name: item.managerName || "You (Manager)", role: "Manager" },
      { name: item.reportName, role: "Direct Report" },
    ],
    notes: item.lastMeetingNotes
      ? item.lastMeetingNotes
      : item.agendaItems?.length
      ? `## Agenda\n\n${item.agendaItems.map((a) => `- ${a}`).join("\n")}`
      : "",
    lastSaved: null,
  };
}

export default function MeetingNotes({ oneOnOnes }: MeetingNotesProps) {
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [allMeetings, setAllMeetings] = useState<MeetingDetails[]>([]);
  const [loading, setLoading] = useState(!oneOnOnes);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");

  useEffect(() => {
    if (oneOnOnes && oneOnOnes.length > 0) {
      const mapped = oneOnOnes.map(mapApiToMeetingDetails);
      setAllMeetings(mapped);
      setMeeting(mapped[0]);
      setSelectedMeetingId(mapped[0].id);
      setLoading(false);
      return;
    }

    // Fallback
    fetch("/api/v1/performance/one-on-ones")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.oneOnOnes) {
          const mapped = result.data.oneOnOnes.map(mapApiToMeetingDetails);
          setAllMeetings(mapped);
          if (mapped.length > 0) {
            setMeeting(mapped[0]);
            setSelectedMeetingId(mapped[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [oneOnOnes]);

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
    // In a real implementation, this would POST the notes to the API
    setTimeout(() => {
      if (meeting) {
        setMeeting({
          ...meeting,
          lastSaved: new Date().toISOString(),
        });
      }
      setIsSaving(false);
    }, 800);
  };

  const handleToolbarAction = (action: string) => {
    console.log("Toolbar action triggered:", action);
  };

  const handleMeetingChange = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    const found = allMeetings.find((m) => m.id === meetingId);
    if (found) setMeeting(found);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Meeting Notes
          </h2>
        </div>
        <p className="text-center text-silver-mist py-8">
          No meetings found. Schedule a meeting first.
        </p>
      </div>
    );
  }

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

      {/* Meeting Selector */}
      {allMeetings.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedMeetingId}
            onChange={(e) => handleMeetingChange(e.target.value)}
            className="px-4 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
          >
            {allMeetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.attendees[1]?.name || "Meeting"} - {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </option>
            ))}
          </select>
        </div>
      )}

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
