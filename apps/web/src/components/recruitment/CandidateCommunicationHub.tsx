"use client";

import React, { useState } from "react";
import { MessageSquare, Mail, Smartphone, Send, FileText, Clock } from "lucide-react";

type MessageChannel = "email" | "sms";

interface Message {
  id: string;
  channel: MessageChannel;
  direction: "sent" | "received";
  content: string;
  timestamp: string;
  sender: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
}

interface CandidateThread {
  candidateName: string;
  position: string;
  messages: Message[];
}

const mockThread: CandidateThread = {
  candidateName: "Sarah Johnson",
  position: "Senior Full-Stack Engineer",
  messages: [
    {
      id: "1",
      channel: "email",
      direction: "sent",
      content: "Hi Sarah, thank you for applying to the Senior Full-Stack Engineer position. We would like to schedule an initial screening call.",
      timestamp: "Jan 18, 2026 9:30 AM",
      sender: "HR Team",
    },
    {
      id: "2",
      channel: "email",
      direction: "received",
      content: "Thank you! I am very interested in this opportunity. I am available for a call this week, Tuesday through Thursday between 10 AM and 4 PM.",
      timestamp: "Jan 18, 2026 11:45 AM",
      sender: "Sarah Johnson",
    },
    {
      id: "3",
      channel: "sms",
      direction: "sent",
      content: "Your screening call is confirmed for Jan 21 at 2:00 PM. The meeting link has been sent to your email.",
      timestamp: "Jan 19, 2026 3:15 PM",
      sender: "HR Team",
    },
    {
      id: "4",
      channel: "email",
      direction: "sent",
      content: "Great news! After your successful screening, we would like to invite you for a technical interview. Please see the details in the attached calendar invite.",
      timestamp: "Jan 21, 2026 4:30 PM",
      sender: "HR Team",
    },
    {
      id: "5",
      channel: "email",
      direction: "received",
      content: "Wonderful! I have accepted the calendar invite. Looking forward to the technical interview. Should I prepare anything specific?",
      timestamp: "Jan 22, 2026 9:00 AM",
      sender: "Sarah Johnson",
    },
  ],
};

const mockTemplates: Template[] = [
  { id: "1", name: "Initial Outreach", content: "Hi [Name], thank you for your interest in..." },
  { id: "2", name: "Interview Confirmation", content: "Your interview has been scheduled for..." },
  { id: "3", name: "Offer Extended", content: "We are pleased to extend an offer for..." },
  { id: "4", name: "Follow Up", content: "Just checking in regarding your application..." },
  { id: "5", name: "Rejection (Polite)", content: "Thank you for your time. After careful consideration..." },
];

export default function CandidateCommunicationHub() {
  const [composeText, setComposeText] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>("email");
  const [showTemplates, setShowTemplates] = useState(false);
  const { candidateName, position, messages } = mockThread;

  const selectTemplate = (template: Template) => {
    setComposeText(template.content);
    setShowTemplates(false);
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Communication Hub</h2>
      </div>

      {/* Candidate Header */}
      <div className="mb-4 pb-4 border-b border-cloud dark:border-nebula-purple/50">
        <p className="text-sm font-semibold text-ink-black dark:text-pearl">{candidateName}</p>
        <p className="text-xs text-silver-mist">{position}</p>
      </div>

      {/* Messages Timeline */}
      <div className="mb-4 max-h-80 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === "sent" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] ${
              msg.direction === "sent"
                ? "bg-celestial-indigo/10 border-celestial-indigo/20"
                : "bg-gray-100 dark:bg-gray-800 border-cloud dark:border-nebula-purple/50"
            } border rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.channel === "email" ? (
                  <Mail className="h-3 w-3 text-celestial-indigo" />
                ) : (
                  <Smartphone className="h-3 w-3 text-green-500" />
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  msg.channel === "email"
                    ? "bg-celestial-indigo/10 text-celestial-indigo"
                    : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                }`}>
                  {msg.channel.toUpperCase()}
                </span>
                <span className="text-xs text-silver-mist">{msg.sender}</span>
              </div>
              <p className="text-sm text-ink-black dark:text-pearl">{msg.content}</p>
              <p className="text-xs text-silver-mist mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Template Selector */}
      <div className="relative mb-3">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/50 text-xs text-silver-mist hover:text-ink-black dark:hover:text-pearl"
        >
          <FileText className="h-3 w-3" />
          Use Template
        </button>
        {showTemplates && (
          <div className="absolute bottom-full left-0 mb-1 w-64 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue shadow-lg z-10">
            {mockTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => selectTemplate(tpl)}
                className="w-full text-left px-3 py-2 text-sm text-ink-black dark:text-pearl hover:bg-gray-50 dark:hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compose Area */}
      <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setSelectedChannel("email")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              selectedChannel === "email"
                ? "bg-celestial-indigo/10 text-celestial-indigo"
                : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            <Mail className="h-3 w-3" />
            Email
          </button>
          <button
            onClick={() => setSelectedChannel("sms")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              selectedChannel === "sms"
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            <Smartphone className="h-3 w-3" />
            SMS
          </button>
        </div>
        <textarea
          value={composeText}
          onChange={(e) => setComposeText(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none"
        />
        <div className="flex justify-end">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
