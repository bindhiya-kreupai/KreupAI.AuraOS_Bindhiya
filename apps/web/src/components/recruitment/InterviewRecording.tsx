/**
 * @module InterviewRecording
 * @description Interview recording playback with timeline, speaker segments,
 *              AI-generated transcript, bookmarks, and download options
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Bookmark,
  BookmarkPlus,
  MessageSquare,
  FileText,
  Clock,
  Video,
  Mic,
  Search,
  Star,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Trash2,
  Calendar,
  Briefcase,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface RecordingSpeaker {
  id: string;
  name: string;
  role: 'interviewer' | 'candidate' | 'observer';
  avatar: string;
  color: string;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  startTime: number; // seconds from start
  endTime: number;
  text: string;
  confidence: number; // 0–1
  isHighlight?: boolean;
}

export interface RecordingBookmark {
  id: string;
  timestamp: number;
  label: string;
  color: 'yellow' | 'green' | 'red' | 'blue';
  createdBy: string;
}

export interface AIInsight {
  id: string;
  type: 'strength' | 'concern' | 'question' | 'skill';
  title: string;
  description: string;
  timestamp: number;
  confidence: number;
}

export interface RecordingData {
  id: string;
  candidateName: string;
  jobTitle: string;
  interviewType: string;
  date: string;
  duration: number; // total seconds
  speakers: RecordingSpeaker[];
  transcript: TranscriptSegment[];
  bookmarks: RecordingBookmark[];
  insights: AIInsight[];
  videoUrl?: string;
  audioUrl?: string;
  status: 'processing' | 'ready' | 'expired';
}

interface InterviewRecordingProps {
  recording: RecordingData;
  onClose?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatTimeFull = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const BOOKMARK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: 'bg-sunset-amber/10', border: 'border-sunset-amber/30', text: 'text-sunset-amber' },
  green: { bg: 'bg-neural-mint/10', border: 'border-neural-mint/30', text: 'text-neural-mint' },
  red: { bg: 'bg-coral-alert/10', border: 'border-coral-alert/30', text: 'text-coral-alert' },
  blue: {
    bg: 'bg-celestial-indigo/10',
    border: 'border-celestial-indigo/30',
    text: 'text-celestial-indigo',
  },
};

const INSIGHT_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  strength: { icon: Star, color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  concern: { icon: AlertTriangle, color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
  question: { icon: MessageSquare, color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10' },
  skill: { icon: CheckCircle2, color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_SPEAKERS: RecordingSpeaker[] = [
  {
    id: 'sp1',
    name: 'Sarah Chen',
    role: 'interviewer',
    avatar: 'SC',
    color: 'bg-celestial-indigo',
  },
  { id: 'sp2', name: 'James Wilson', role: 'candidate', avatar: 'JW', color: 'bg-quantum-rose' },
  { id: 'sp3', name: 'Emily Davis', role: 'interviewer', avatar: 'ED', color: 'bg-neural-mint' },
];

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  {
    id: 't1',
    speakerId: 'sp1',
    startTime: 0,
    endTime: 18,
    text: "Welcome James, thank you for joining us today. My name is Sarah Chen and I lead the engineering team. With me is Emily Davis, our senior architect. We're excited to learn more about your experience.",
    confidence: 0.97,
  },
  {
    id: 't2',
    speakerId: 'sp2',
    startTime: 19,
    endTime: 45,
    text: "Thank you Sarah, Emily. I'm really excited about this opportunity. I've been following your company's work in the AI space and I'm particularly impressed by the recent product launches.",
    confidence: 0.95,
  },
  {
    id: 't3',
    speakerId: 'sp1',
    startTime: 46,
    endTime: 78,
    text: "Great to hear. Let's start with your background. Can you walk us through your experience with building scalable distributed systems? Specifically, I'd like to understand your role in designing microservices architectures.",
    confidence: 0.94,
  },
  {
    id: 't4',
    speakerId: 'sp2',
    startTime: 80,
    endTime: 155,
    text: 'Absolutely. At my current role at TechCorp, I architected a microservices platform handling over 50 million requests per day. I designed the service mesh using Kubernetes and Istio, implemented event-driven communication with Kafka, and built comprehensive observability with Prometheus and Grafana. The system achieved 99.99% uptime over the past year.',
    confidence: 0.92,
    isHighlight: true,
  },
  {
    id: 't5',
    speakerId: 'sp3',
    startTime: 157,
    endTime: 185,
    text: "That's impressive. Can you tell us about a specific challenge you faced with that architecture and how you resolved it?",
    confidence: 0.96,
  },
  {
    id: 't6',
    speakerId: 'sp2',
    startTime: 187,
    endTime: 260,
    text: 'One major challenge was handling cascading failures. We had an incident where a downstream payment service went down and it started affecting all upstream services. I implemented a circuit breaker pattern using Resilience4j, added bulkhead isolation for critical paths, and set up automated canary deployments. After that, we reduced incident impact by 85%.',
    confidence: 0.91,
    isHighlight: true,
  },
  {
    id: 't7',
    speakerId: 'sp1',
    startTime: 262,
    endTime: 290,
    text: "Excellent. Now let's talk about your experience with team leadership. How do you approach mentoring junior engineers and ensuring code quality across the team?",
    confidence: 0.95,
  },
  {
    id: 't8',
    speakerId: 'sp2',
    startTime: 292,
    endTime: 370,
    text: 'I believe in a combination of structured processes and personal mentorship. I established a code review culture where every PR needs at least two approvals. I pair program with junior developers weekly and created an internal tech talk series. For code quality, I introduced static analysis tools, increased test coverage from 45% to 92%, and set up automated architecture decision records.',
    confidence: 0.93,
  },
  {
    id: 't9',
    speakerId: 'sp3',
    startTime: 372,
    endTime: 400,
    text: 'How do you handle disagreements about technical decisions within the team? Can you give a concrete example?',
    confidence: 0.94,
  },
  {
    id: 't10',
    speakerId: 'sp2',
    startTime: 402,
    endTime: 470,
    text: 'Recently, we had a debate about migrating from REST to GraphQL. Half the team favored it, the other half was concerned about complexity. I facilitated a design spike where we built proof-of-concepts for both approaches, defined clear evaluation criteria including developer experience, performance, and migration effort, and let data drive the decision. We ended up adopting GraphQL for client-facing APIs while keeping REST for internal service communication.',
    confidence: 0.9,
  },
  {
    id: 't11',
    speakerId: 'sp1',
    startTime: 472,
    endTime: 495,
    text: "That's a very pragmatic approach. Let's move on to a system design question. How would you design a real-time notification system that needs to support 10 million concurrent users?",
    confidence: 0.96,
  },
  {
    id: 't12',
    speakerId: 'sp2',
    startTime: 497,
    endTime: 600,
    text: "I'd approach this in layers. First, a WebSocket gateway using a technology like Socket.io or native WebSockets behind a load balancer with sticky sessions. For the message broker, I'd use Redis Pub/Sub for low-latency fan-out combined with Kafka for durability and replay. User preference storage in DynamoDB for fast lookups. I'd implement connection pooling, heartbeat mechanisms, and graceful reconnection. For 10 million concurrent users, I'd estimate around 200 gateway instances and implement horizontal sharding of channels.",
    confidence: 0.89,
    isHighlight: true,
  },
];

const MOCK_BOOKMARKS: RecordingBookmark[] = [
  {
    id: 'b1',
    timestamp: 80,
    label: 'Strong system design experience',
    color: 'green',
    createdBy: 'Sarah Chen',
  },
  {
    id: 'b2',
    timestamp: 187,
    label: 'Incident handling & resilience',
    color: 'green',
    createdBy: 'Emily Davis',
  },
  {
    id: 'b3',
    timestamp: 292,
    label: 'Leadership approach',
    color: 'blue',
    createdBy: 'Sarah Chen',
  },
  {
    id: 'b4',
    timestamp: 497,
    label: 'System design answer - evaluate',
    color: 'yellow',
    createdBy: 'Emily Davis',
  },
];

const MOCK_INSIGHTS: AIInsight[] = [
  {
    id: 'i1',
    type: 'strength',
    title: 'Distributed Systems Expertise',
    description:
      'Demonstrated deep knowledge of microservices, service mesh, and observability patterns with quantified results.',
    timestamp: 80,
    confidence: 0.94,
  },
  {
    id: 'i2',
    type: 'skill',
    title: 'Incident Management',
    description:
      'Strong incident response approach with measurable improvement (85% reduction in impact).',
    timestamp: 187,
    confidence: 0.91,
  },
  {
    id: 'i3',
    type: 'strength',
    title: 'Team Leadership',
    description:
      'Evidence-based approach to mentoring, code quality improvement (45%→92% coverage), and knowledge sharing.',
    timestamp: 292,
    confidence: 0.88,
  },
  {
    id: 'i4',
    type: 'question',
    title: 'GraphQL Migration Depth',
    description:
      'Could probe deeper into the GraphQL migration outcomes and metrics. The initial answer focused on process, not results.',
    timestamp: 402,
    confidence: 0.82,
  },
  {
    id: 'i5',
    type: 'strength',
    title: 'System Design Skills',
    description:
      'Comprehensive real-time system design covering all layers with specific technology choices and capacity estimates.',
    timestamp: 497,
    confidence: 0.9,
  },
];

export const MOCK_RECORDING: RecordingData = {
  id: 'rec-001',
  candidateName: 'James Wilson',
  jobTitle: 'Senior Software Engineer',
  interviewType: 'Technical Interview',
  date: '2026-02-20',
  duration: 2700, // 45 minutes
  speakers: MOCK_SPEAKERS,
  transcript: MOCK_TRANSCRIPT,
  bookmarks: MOCK_BOOKMARKS,
  insights: MOCK_INSIGHTS,
  status: 'ready',
};

// ── Component ────────────────────────────────────────────────────────────────────

export const InterviewRecording: React.FC<InterviewRecordingProps> = ({ recording, _onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [_volume, _setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'transcript' | 'bookmarks' | 'insights'>('transcript');
  const [searchQuery, setSearchQuery] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState(recording.bookmarks);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const progressRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated playback
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= recording.duration) {
            setIsPlaying(false);
            return recording.duration;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, recording.duration]);

  const speakerMap = useMemo(() => {
    const map: Record<string, RecordingSpeaker> = {};
    recording.speakers.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [recording.speakers]);

  const currentSegment = useMemo(
    () => recording.transcript.find((s) => currentTime >= s.startTime && currentTime <= s.endTime),
    [recording.transcript, currentTime]
  );

  const filteredTranscript = useMemo(() => {
    let segments = recording.transcript;
    if (speakerFilter) {
      segments = segments.filter((s) => s.speakerId === speakerFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      segments = segments.filter((s) => s.text.toLowerCase().includes(q));
    }
    return segments;
  }, [recording.transcript, speakerFilter, searchQuery]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setCurrentTime(Math.floor(pct * recording.duration));
    },
    [recording.duration]
  );

  const handleSkip = useCallback(
    (seconds: number) => {
      setCurrentTime((prev) => Math.max(0, Math.min(recording.duration, prev + seconds)));
    },
    [recording.duration]
  );

  const handleAddBookmark = useCallback(() => {
    const newBookmark: RecordingBookmark = {
      id: `b-${Date.now()}`,
      timestamp: currentTime,
      label: `Bookmark at ${formatTimeFull(currentTime)}`,
      color: 'yellow',
      createdBy: 'You',
    };
    setBookmarks((prev) => [...prev, newBookmark].sort((a, b) => a.timestamp - b.timestamp));
  }, [currentTime]);

  const handleDeleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleCopyTranscript = useCallback((segmentId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(segmentId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const progressPct = recording.duration > 0 ? (currentTime / recording.duration) * 100 : 0;

  // Speaker talk-time distribution
  const speakerStats = useMemo(() => {
    const stats: Record<string, number> = {};
    recording.transcript.forEach((seg) => {
      const dur = seg.endTime - seg.startTime;
      stats[seg.speakerId] = (stats[seg.speakerId] || 0) + dur;
    });
    const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;
    return recording.speakers.map((sp) => ({
      ...sp,
      talkTime: stats[sp.id] || 0,
      pct: Math.round(((stats[sp.id] || 0) / total) * 100),
    }));
  }, [recording.speakers, recording.transcript]);

  const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-celestial-indigo" />
              <p className="text-sm font-bold text-ink-black dark:text-pearl">
                {recording.candidateName} — {recording.interviewType}
              </p>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                  recording.status === 'ready'
                    ? 'bg-neural-mint/10 text-neural-mint'
                    : recording.status === 'processing'
                      ? 'bg-sunset-amber/10 text-sunset-amber'
                      : 'bg-coral-alert/10 text-coral-alert'
                }`}
              >
                {recording.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-silver-mist">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {recording.jobTitle}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />{' '}
                {new Date(recording.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatTimeFull(recording.duration)}
              </span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>

        {/* Speaker Stats */}
        <div className="mt-3 flex items-center gap-2">
          {speakerStats.map((sp) => (
            <div key={sp.id} className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full ${sp.color} flex items-center justify-center text-[7px] font-bold text-white`}
              >
                {sp.avatar}
              </div>
              <div>
                <p className="text-[9px] font-semibold text-ink-black dark:text-pearl">{sp.name}</p>
                <p className="text-[8px] text-silver-mist">
                  {sp.pct}% · {formatTime(sp.talkTime)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Talk-Time Bar */}
        <div className="mt-2 flex h-1.5 rounded-full overflow-hidden">
          {speakerStats.map((sp) => (
            <div
              key={sp.id}
              className={`${sp.color} transition-all`}
              style={{ width: `${sp.pct}%` }}
            />
          ))}
        </div>
      </div>

      {/* Video Player Area */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-ink-black overflow-hidden">
        {/* Video placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-deep-cosmos to-ink-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <Video className="w-8 h-8 text-white/50" />
            </div>
            <p className="text-sm font-bold text-white/70">Interview Recording</p>
            <p className="text-xs text-white/40 mt-1">
              {recording.candidateName} · {formatTimeFull(recording.duration)}
            </p>
          </div>

          {/* Current speaker overlay */}
          {currentSegment && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full ${speakerMap[currentSegment.speakerId]?.color || 'bg-silver-mist'} flex items-center justify-center text-[8px] font-bold text-white shrink-0`}
                >
                  {speakerMap[currentSegment.speakerId]?.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-white/60">
                    {speakerMap[currentSegment.speakerId]?.name}
                  </p>
                  <p className="text-xs text-white truncate">
                    {currentSegment.text.slice(0, 100)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bookmark markers on overlay */}
          {bookmarks.length > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-white/40" />
              <span className="text-[9px] text-white/40">{bookmarks.length} bookmarks</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-3 py-2 bg-deep-cosmos/90">
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="relative h-2 rounded-full bg-white/10 cursor-pointer group mb-2"
          >
            {/* Progress fill */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-celestial-indigo transition-all"
              style={{ width: `${progressPct}%` }}
            />
            {/* Playhead */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPct}% - 6px)` }}
            />
            {/* Bookmark markers */}
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-sm ${BOOKMARK_COLORS[bm.color]?.text.replace('text-', 'bg-') || 'bg-sunset-amber'}`}
                style={{ left: `${(bm.timestamp / recording.duration) * 100}%` }}
                title={bm.label}
              />
            ))}
            {/* Speaker segments colored bar */}
            <div className="absolute left-0 top-0 w-full h-full rounded-full overflow-hidden pointer-events-none">
              {recording.transcript.map((seg) => {
                const left = (seg.startTime / recording.duration) * 100;
                const width = ((seg.endTime - seg.startTime) / recording.duration) * 100;
                const speaker = speakerMap[seg.speakerId];
                return (
                  <div
                    key={seg.id}
                    className={`absolute top-0 h-full opacity-20 ${speaker?.color || 'bg-silver-mist'}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/60 min-w-[36px]">
                {formatTimeFull(currentTime)}
              </span>
              <span className="text-[10px] text-white/30">/</span>
              <span className="text-[10px] text-white/40">
                {formatTimeFull(recording.duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSkip(-10)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Rewind 10s"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={() => handleSkip(10)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Forward 10s"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="text-[10px] bg-white/10 text-white/70 border-none rounded px-1.5 py-0.5 outline-none cursor-pointer"
              >
                {SPEED_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}x
                  </option>
                ))}
              </select>

              {/* Volume */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 text-white/60 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Bookmark */}
              <button
                onClick={handleAddBookmark}
                className="p-1 text-white/60 hover:text-sunset-amber transition-colors"
                title="Add Bookmark"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        <div className="flex border-b border-cloud dark:border-nebula-purple/20">
          {(
            [
              {
                key: 'transcript',
                label: 'Transcript',
                icon: FileText,
                count: recording.transcript.length,
              },
              { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
              {
                key: 'insights',
                label: 'AI Insights',
                icon: Star,
                count: recording.insights.length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold transition-colors ${
                activeTab === tab.key
                  ? 'text-celestial-indigo border-b-2 border-celestial-indigo bg-celestial-indigo/5'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                  activeTab === tab.key
                    ? 'bg-celestial-indigo/20 text-celestial-indigo'
                    : 'bg-pearl dark:bg-deep-cosmos/30 text-silver-mist'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Transcript Tab */}
          {activeTab === 'transcript' && (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transcript..."
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-pearl/30 dark:bg-deep-cosmos/10 text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSpeakerFilter(null)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition-colors ${
                      !speakerFilter
                        ? 'bg-celestial-indigo/10 text-celestial-indigo'
                        : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                    }`}
                  >
                    All
                  </button>
                  {recording.speakers.map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => setSpeakerFilter(speakerFilter === sp.id ? null : sp.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold transition-colors ${
                        speakerFilter === sp.id
                          ? 'bg-celestial-indigo/10 text-celestial-indigo'
                          : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${sp.color} flex items-center justify-center text-[5px] font-bold text-white`}
                      >
                        {sp.avatar[0]}
                      </div>
                      {sp.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Segments */}
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {filteredTranscript.map((seg) => {
                  const speaker = speakerMap[seg.speakerId];
                  const isCurrent = currentSegment?.id === seg.id;

                  return (
                    <div
                      key={seg.id}
                      onClick={() => setCurrentTime(seg.startTime)}
                      className={`flex gap-2 p-2 rounded-lg cursor-pointer transition-all group ${
                        isCurrent
                          ? 'bg-celestial-indigo/10 border border-celestial-indigo/20'
                          : seg.isHighlight
                            ? 'bg-sunset-amber/5 border border-sunset-amber/10 hover:bg-sunset-amber/10'
                            : 'hover:bg-pearl/30 dark:hover:bg-deep-cosmos/10 border border-transparent'
                      }`}
                    >
                      <div className="shrink-0 pt-0.5">
                        <div
                          className={`w-6 h-6 rounded-full ${speaker?.color || 'bg-silver-mist'} flex items-center justify-center text-[7px] font-bold text-white`}
                        >
                          {speaker?.avatar}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-bold text-ink-black dark:text-pearl">
                            {speaker?.name}
                          </span>
                          <span className="text-[8px] text-silver-mist">
                            {formatTimeFull(seg.startTime)}
                          </span>
                          {seg.isHighlight && <Star className="w-2.5 h-2.5 text-sunset-amber" />}
                          <span className="text-[7px] text-silver-mist/50 ml-auto">
                            {Math.round(seg.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-black/80 dark:text-pearl/80 leading-relaxed">
                          {seg.text}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTranscript(seg.id, seg.text);
                        }}
                        className="p-1 text-silver-mist/40 hover:text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-start"
                      >
                        {copiedId === seg.id ? (
                          <CheckCircle2 className="w-3 h-3 text-neural-mint" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  );
                })}

                {filteredTranscript.length === 0 && (
                  <div className="text-center py-6">
                    <Search className="w-5 h-5 text-silver-mist/20 mx-auto mb-2" />
                    <p className="text-[10px] text-silver-mist">No matching transcript segments</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-2">
              {bookmarks.map((bm) => {
                const colors = BOOKMARK_COLORS[bm.color] || BOOKMARK_COLORS.yellow;
                return (
                  <div
                    key={bm.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${colors.bg} ${colors.border} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setCurrentTime(bm.timestamp)}
                  >
                    <Bookmark className={`w-3.5 h-3.5 shrink-0 ${colors.text}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                        {bm.label}
                      </p>
                      <p className="text-[9px] text-silver-mist">
                        {bm.createdBy} · {formatTimeFull(bm.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBookmark(bm.id);
                      }}
                      className="p-1 text-silver-mist/40 hover:text-coral-alert transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {bookmarks.length === 0 && (
                <div className="text-center py-6">
                  <BookmarkPlus className="w-5 h-5 text-silver-mist/20 mx-auto mb-2" />
                  <p className="text-[10px] text-silver-mist">No bookmarks yet</p>
                  <p className="text-[9px] text-silver-mist/60 mt-1">
                    Click the bookmark button during playback to add one
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-2">
              {recording.insights.map((insight) => {
                const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.question;
                const Icon = config.icon;
                return (
                  <div
                    key={insight.id}
                    className={`flex items-start gap-2 p-3 rounded-lg border border-cloud dark:border-nebula-purple/20 hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10 cursor-pointer transition-colors`}
                    onClick={() => setCurrentTime(insight.timestamp)}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                          {insight.title}
                        </p>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${config.bg} ${config.color}`}
                        >
                          {insight.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[9px] text-silver-mist leading-relaxed">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-silver-mist flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {formatTimeFull(insight.timestamp)}
                        </span>
                        <span className="text-[8px] text-silver-mist">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Download Options */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Download className="w-4 h-4 text-celestial-indigo" />
          Export Options
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { label: 'Full Video', desc: 'MP4 format', icon: Video },
              { label: 'Audio Only', desc: 'MP3 format', icon: Mic },
              { label: 'Transcript', desc: 'PDF / TXT', icon: FileText },
              { label: 'AI Summary', desc: 'PDF report', icon: Star },
            ] as const
          ).map((opt) => (
            <button
              key={opt.label}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-cloud dark:border-nebula-purple/20 hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10 transition-colors text-left"
            >
              <opt.icon className="w-4 h-4 text-celestial-indigo shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                  {opt.label}
                </p>
                <p className="text-[8px] text-silver-mist">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewRecording;
