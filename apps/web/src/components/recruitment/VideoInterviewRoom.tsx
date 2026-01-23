"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Users,
  Clock,
  Circle,
  Monitor,
  MessageSquare,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isSpeaking: boolean;
}

interface VideoInterviewRoomProps {
  interviewTitle?: string;
  participants?: Participant[];
  isRecording?: boolean;
  durationMinutes?: number;
  onEndCall?: () => void;
}

const mockParticipants: Participant[] = [
  {
    id: "p-1",
    name: "Sarah Johnson",
    role: "Candidate",
    isVideoOn: true,
    isAudioOn: true,
    isSpeaking: false,
  },
  {
    id: "p-2",
    name: "Michael Roberts",
    role: "Hiring Manager",
    isVideoOn: true,
    isAudioOn: true,
    isSpeaking: true,
  },
  {
    id: "p-3",
    name: "Lisa Chen",
    role: "Technical Lead",
    isVideoOn: true,
    isAudioOn: false,
    isSpeaking: false,
  },
  {
    id: "p-4",
    name: "James Wilson",
    role: "HR Coordinator",
    isVideoOn: false,
    isAudioOn: true,
    isSpeaking: false,
  },
];

export function VideoInterviewRoom({
  interviewTitle = "Senior Full-Stack Engineer - Technical Interview",
  participants = mockParticipants,
  isRecording: initialRecording = true,
  durationMinutes = 0,
  onEndCall,
}: VideoInterviewRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(initialRecording);
  const [elapsed, setElapsed] = useState(durationMinutes * 60);
  const [showParticipants, setShowParticipants] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-3">
          <Video className="w-4 h-4 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl truncate">
            {interviewTitle}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Recording Indicator */}
          {isRecording && (
            <span className="flex items-center gap-1.5 text-xs text-red-500">
              <Circle className="w-2.5 h-2.5 fill-red-500 animate-pulse" />
              Recording
            </span>
          )}
          {/* Timer */}
          <span className="flex items-center gap-1.5 text-xs text-silver-mist font-mono">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(elapsed)}
          </span>
          {/* Participant Count */}
          <span className="flex items-center gap-1 text-xs text-silver-mist">
            <Users className="w-3.5 h-3.5" />
            {participants.length}
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Main Video Area */}
        <div className="flex-1 p-4">
          {/* Primary Video Placeholder */}
          <div className="relative aspect-video rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 flex items-center justify-center mb-3">
            <div className="text-center">
              <Video className="w-12 h-12 text-silver-mist mx-auto mb-2" />
              <p className="text-sm text-silver-mist">
                {participants[0]?.name || "Waiting for participant..."}
              </p>
              <p className="text-xs text-silver-mist mt-0.5">
                {participants[0]?.role || ""}
              </p>
            </div>
            {/* Speaking indicator */}
            {participants[0]?.isSpeaking && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400">Speaking</span>
              </div>
            )}
          </div>

          {/* Secondary Video Thumbnails */}
          <div className="grid grid-cols-3 gap-2">
            {participants.slice(1).map((participant) => (
              <div
                key={participant.id}
                className={`relative aspect-video rounded-lg bg-slate-50 dark:bg-deep-cosmos border flex items-center justify-center ${
                  participant.isSpeaking
                    ? "border-green-500"
                    : "border-cloud dark:border-nebula-purple/50"
                }`}
              >
                {participant.isVideoOn ? (
                  <div className="text-center">
                    <Video className="w-6 h-6 text-silver-mist mx-auto mb-1" />
                    <p className="text-xs text-ink-black dark:text-pearl">{participant.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs font-medium text-celestial-indigo">
                        {participant.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <p className="text-xs text-ink-black dark:text-pearl">{participant.name}</p>
                  </div>
                )}
                {/* Audio/Video indicators */}
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5">
                  {!participant.isAudioOn && (
                    <MicOff className="w-3 h-3 text-red-400" />
                  )}
                  {!participant.isVideoOn && (
                    <VideoOff className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-center gap-3 mt-4 py-3">
            <button
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-3 rounded-full transition-colors ${
                isAudioOn
                  ? "bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl hover:bg-gray-200 dark:hover:bg-gray-700"
                  : "bg-red-500 text-white"
              }`}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full transition-colors ${
                isVideoOn
                  ? "bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl hover:bg-gray-200 dark:hover:bg-gray-700"
                  : "bg-red-500 text-white"
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button className="p-3 rounded-full bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Monitor className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-full bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                  : "bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Circle className={`w-5 h-5 ${isRecording ? "fill-red-500" : ""}`} />
            </button>
            <button
              onClick={onEndCall}
              className="px-6 py-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" />
            </button>
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-56 border-l border-cloud dark:border-nebula-purple/50 p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-ink-black dark:text-pearl uppercase tracking-wider">
                Participants ({participants.length})
              </h4>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-xs text-silver-mist hover:text-celestial-indigo"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-deep-cosmos"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-celestial-indigo">
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    {p.isSpeaking && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-stellar-blue" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-silver-mist">{p.role}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {p.isAudioOn ? (
                      <Mic className="w-3 h-3 text-silver-mist" />
                    ) : (
                      <MicOff className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
