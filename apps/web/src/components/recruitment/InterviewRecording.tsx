"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Volume2,
  FileText,
  Clock,
  Video,
  User,
} from "lucide-react";

interface TranscriptEntry {
  id: string;
  speaker: string;
  role: string;
  timestamp: string;
  timestampSeconds: number;
  text: string;
}

interface RecordingMetadata {
  title: string;
  candidateName: string;
  position: string;
  date: string;
  duration: string;
  durationSeconds: number;
  fileSize: string;
  interviewers: string[];
}

interface InterviewRecordingProps {
  metadata?: RecordingMetadata;
  transcript?: TranscriptEntry[];
}

const mockMetadata: RecordingMetadata = {
  title: "Technical Interview - Round 2",
  candidateName: "Sarah Johnson",
  position: "Senior Full-Stack Engineer",
  date: "2026-01-20",
  duration: "45:32",
  durationSeconds: 2732,
  fileSize: "256 MB",
  interviewers: ["Michael Roberts", "Lisa Chen"],
};

const mockTranscript: TranscriptEntry[] = [
  {
    id: "t-1",
    speaker: "Michael Roberts",
    role: "Interviewer",
    timestamp: "00:00:15",
    timestampSeconds: 15,
    text: "Welcome Sarah, thank you for joining us today. Let's start by discussing your experience with distributed systems.",
  },
  {
    id: "t-2",
    speaker: "Sarah Johnson",
    role: "Candidate",
    timestamp: "00:00:32",
    timestampSeconds: 32,
    text: "Thank you for having me. I've worked extensively with microservices architecture at my previous role, handling systems processing over 10 million requests per day.",
  },
  {
    id: "t-3",
    speaker: "Lisa Chen",
    role: "Interviewer",
    timestamp: "00:01:45",
    timestampSeconds: 105,
    text: "Can you walk us through how you would design a real-time notification system that needs to handle high concurrency?",
  },
  {
    id: "t-4",
    speaker: "Sarah Johnson",
    role: "Candidate",
    timestamp: "00:02:10",
    timestampSeconds: 130,
    text: "Sure. I would start with a message queue like Kafka for event ingestion, then use WebSocket connections for real-time delivery to clients, with a fallback to long polling for older browsers.",
  },
  {
    id: "t-5",
    speaker: "Michael Roberts",
    role: "Interviewer",
    timestamp: "00:05:30",
    timestampSeconds: 330,
    text: "That's a solid approach. How would you handle failure scenarios and ensure message delivery guarantees?",
  },
  {
    id: "t-6",
    speaker: "Sarah Johnson",
    role: "Candidate",
    timestamp: "00:05:55",
    timestampSeconds: 355,
    text: "I would implement an at-least-once delivery pattern with idempotent consumers. We can use a dead letter queue for failed messages and implement retry with exponential backoff.",
  },
  {
    id: "t-7",
    speaker: "Lisa Chen",
    role: "Interviewer",
    timestamp: "00:10:20",
    timestampSeconds: 620,
    text: "Let's move on to a coding challenge. I'm going to share a problem about optimizing database queries for a social media feed.",
  },
];

export function InterviewRecording({
  metadata = mockMetadata,
  transcript = mockTranscript,
}: InterviewRecordingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(null);

  const progressPercent = (currentTime / metadata.durationSeconds) * 100;

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeekToTimestamp = (seconds: number, id: string) => {
    setCurrentTime(seconds);
    setActiveTranscriptId(id);
    setIsPlaying(true);
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-5 h-5 text-celestial-indigo" />
          <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
            Interview Recording
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{metadata.title}</p>
            <p className="text-xs text-silver-mist">
              {metadata.candidateName} - {metadata.position}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-silver-mist">
              {new Date(metadata.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-silver-mist">
              Duration: {metadata.duration} | {metadata.fileSize}
            </p>
          </div>
        </div>
      </div>

      {/* Video Player Placeholder */}
      <div className="relative aspect-video bg-slate-50 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-celestial-indigo/10 flex items-center justify-center mx-auto mb-3">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-celestial-indigo" />
            ) : (
              <Play className="w-8 h-8 text-celestial-indigo ml-1" />
            )}
          </div>
          <p className="text-sm text-silver-mist">Video Playback</p>
          <p className="text-xs text-silver-mist mt-1">
            {metadata.interviewers.join(", ")} with {metadata.candidateName}
          </p>
        </div>

        {/* Playback Overlay */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 cursor-pointer"
          aria-label={isPlaying ? "Pause" : "Play"}
        />
      </div>

      {/* Playback Controls */}
      <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
            <div
              className="h-full rounded-full bg-celestial-indigo transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-silver-mist font-mono">{formatTimestamp(currentTime)}</span>
            <span className="text-xs text-silver-mist font-mono">{metadata.duration}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
              <SkipBack className="w-4 h-4 text-ink-black dark:text-pearl" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
              <SkipForward className="w-4 h-4 text-ink-black dark:text-pearl" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-silver-mist" />
              <div className="w-16 h-1 rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="w-3/4 h-full rounded-full bg-celestial-indigo" />
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 text-xs font-medium text-ink-black dark:text-pearl hover:border-celestial-indigo transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-celestial-indigo" />
          <h4 className="text-sm font-semibold text-ink-black dark:text-pearl">Transcript</h4>
          <span className="ml-auto text-xs text-silver-mist">
            {transcript.length} entries
          </span>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {transcript.map((entry) => (
            <button
              key={entry.id}
              onClick={() => handleSeekToTimestamp(entry.timestampSeconds, entry.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                activeTranscriptId === entry.id
                  ? "border-celestial-indigo bg-celestial-indigo/5"
                  : "border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-deep-cosmos"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3 h-3 text-celestial-indigo" />
                <span className="text-xs font-medium text-ink-black dark:text-pearl">
                  {entry.speaker}
                </span>
                <span className="text-xs text-silver-mist">({entry.role})</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-celestial-indigo font-mono">
                  <Clock className="w-3 h-3" />
                  {entry.timestamp}
                </span>
              </div>
              <p className="text-xs text-ink-black dark:text-pearl leading-relaxed">
                {entry.text}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
