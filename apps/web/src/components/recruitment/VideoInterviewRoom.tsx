/**
 * @module VideoInterviewRoom
 * @description Video interview room with participant feeds, controls,
 *              chat panel, notes, and recording — designed for WebRTC / Zoom integration
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  FileText,
  Users,
  Circle,
  Square,
  Clock,
  Send,
  ChevronDown,
  Wifi,
  WifiOff,
  Volume2,
  ScreenShare,
  ScreenShareOff,
  Hand,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
export type RoomLayout = 'gallery' | 'speaker' | 'sidebar';

export interface Participant {
  id: string;
  name: string;
  role: 'candidate' | 'interviewer' | 'observer';
  avatar: string;
  isSelf: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  connectionQuality: 'good' | 'fair' | 'poor';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isSystem: boolean;
}

export interface InterviewContext {
  candidateName: string;
  jobTitle: string;
  interviewType: string;
  scheduledDuration: number; // minutes
  interviewId: string;
}

interface VideoInterviewRoomProps {
  context: InterviewContext;
  onEndCall: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: 'self',
    name: 'You',
    role: 'interviewer',
    avatar: 'YO',
    isSelf: true,
    videoEnabled: true,
    audioEnabled: true,
    isScreenSharing: false,
    isSpeaking: false,
    connectionQuality: 'good',
  },
  {
    id: 'candidate',
    name: 'Sarah Johnson',
    role: 'candidate',
    avatar: 'SJ',
    isSelf: false,
    videoEnabled: true,
    audioEnabled: true,
    isScreenSharing: false,
    isSpeaking: true,
    connectionQuality: 'good',
  },
  {
    id: 'int-2',
    name: 'Bob Patel',
    role: 'interviewer',
    avatar: 'BP',
    isSelf: false,
    videoEnabled: true,
    audioEnabled: false,
    isScreenSharing: false,
    isSpeaking: false,
    connectionQuality: 'fair',
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'system',
    senderName: 'System',
    text: 'Interview session started',
    timestamp: new Date(Date.now() - 300000),
    isSystem: true,
  },
  {
    id: 'msg-2',
    senderId: 'self',
    senderName: 'You',
    text: "Welcome Sarah! Let's get started.",
    timestamp: new Date(Date.now() - 240000),
    isSystem: false,
  },
  {
    id: 'msg-3',
    senderId: 'candidate',
    senderName: 'Sarah Johnson',
    text: 'Thank you! Ready when you are.',
    timestamp: new Date(Date.now() - 200000),
    isSystem: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

const CONNECTION_STATUS: Record<
  ConnectionStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  connecting: { label: 'Connecting...', color: 'text-sunset-amber', icon: Wifi },
  connected: { label: 'Connected', color: 'text-neural-mint', icon: Wifi },
  reconnecting: { label: 'Reconnecting...', color: 'text-sunset-amber', icon: Wifi },
  disconnected: { label: 'Disconnected', color: 'text-coral-alert', icon: WifiOff },
};

const QUALITY_DOT: Record<string, string> = {
  good: 'bg-neural-mint',
  fair: 'bg-sunset-amber',
  poor: 'bg-coral-alert',
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ── Main Component ───────────────────────────────────────────────────────────────

export const VideoInterviewRoom: React.FC<VideoInterviewRoomProps> = ({
  context,
  onEndCall,
  onStartRecording,
  onStopRecording,
  isRecording,
}) => {
  // Local state
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [connectionStatus, _setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [layout, setLayout] = useState<RoomLayout>('gallery');
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [_isFullscreen, _setIsFullscreen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Self state
  const selfParticipant = participants.find((p) => p.isSelf);
  const videoEnabled = selfParticipant?.videoEnabled ?? true;
  const audioEnabled = selfParticipant?.audioEnabled ?? true;
  const isScreenSharing = selfParticipant?.isScreenSharing ?? false;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Controls ───────────────────────────────────────────────────────────────

  const toggleVideo = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.isSelf ? { ...p, videoEnabled: !p.videoEnabled } : p))
    );
  }, []);

  const toggleAudio = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.isSelf ? { ...p, audioEnabled: !p.audioEnabled } : p))
    );
  }, []);

  const toggleScreenShare = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.isSelf ? { ...p, isScreenSharing: !p.isScreenSharing } : p))
    );
  }, []);

  const sendMessage = useCallback(() => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderId: 'self',
        senderName: 'You',
        text: chatInput.trim(),
        timestamp: new Date(),
        isSystem: false,
      },
    ]);
    setChatInput('');
  }, [chatInput]);

  const remainingMins = Math.max(0, context.scheduledDuration * 60 - elapsed);
  const isOvertime = elapsed > context.scheduledDuration * 60;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] rounded-2xl border border-cloud dark:border-nebula-purple/20 bg-ink-black overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-ink-black/90 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {(() => {
              const cfg = CONNECTION_STATUS[connectionStatus];
              const StatusIcon = cfg.icon;
              return (
                <>
                  <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                  <span className={`text-[9px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                </>
              );
            })()}
          </div>
          <span className="text-[10px] text-white/40">|</span>
          <span className="text-[10px] font-semibold text-white/70">{context.interviewType}</span>
          <span className="text-[10px] text-white/40">·</span>
          <span className="text-[10px] text-white/50">{context.jobTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-coral-alert/20">
              <Circle className="w-2.5 h-2.5 text-coral-alert fill-coral-alert animate-pulse" />
              <span className="text-[9px] font-bold text-coral-alert">REC</span>
            </div>
          )}

          {/* Timer */}
          <div
            className={`flex items-center gap-1 text-[11px] font-mono font-bold ${
              isOvertime
                ? 'text-coral-alert'
                : remainingMins < 300
                  ? 'text-sunset-amber'
                  : 'text-white/70'
            }`}
          >
            <Clock className="w-3 h-3" />
            {formatTime(elapsed)}
            <span className="text-[8px] text-white/40">/ {context.scheduledDuration}m</span>
          </div>

          {/* Participants count */}
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <Users className="w-3 h-3" />
            {participants.length}
          </div>

          {/* Layout toggle */}
          <div className="flex items-center gap-0.5">
            {(['gallery', 'speaker', 'sidebar'] as RoomLayout[]).map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={`text-[8px] px-1.5 py-0.5 rounded transition-colors ${
                  layout === l ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {l === 'gallery' ? '▦' : l === 'speaker' ? '◻' : '⊞'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-3 flex flex-col">
          {/* Video Grid */}
          <div
            className={`flex-1 gap-2 ${
              layout === 'gallery'
                ? `grid ${participants.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`
                : layout === 'speaker'
                  ? 'flex flex-col'
                  : 'flex'
            }`}
          >
            {participants.map((p, i) => {
              const isSpeakerView = layout === 'speaker';
              const isMainSpeaker = isSpeakerView && i === 1; // candidate is main
              const isSidebarLayout = layout === 'sidebar';

              return (
                <div
                  key={p.id}
                  className={`relative rounded-xl overflow-hidden ${
                    isMainSpeaker
                      ? 'flex-1'
                      : isSpeakerView
                        ? 'h-20'
                        : isSidebarLayout && i === 0
                          ? 'w-1/4'
                          : isSidebarLayout
                            ? 'flex-1'
                            : ''
                  } ${p.isSpeaking ? 'ring-2 ring-neural-mint' : ''} bg-deep-cosmos/50`}
                >
                  {/* Video Placeholder */}
                  {p.videoEnabled ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-deep-cosmos to-stellar-blue flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white/80">
                        {p.avatar}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-deep-cosmos flex items-center justify-center">
                      <div className="text-center">
                        <VideoOff className="w-6 h-6 text-white/20 mx-auto mb-1" />
                        <span className="text-[9px] text-white/30">Camera off</span>
                      </div>
                    </div>
                  )}

                  {/* Participant label */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${QUALITY_DOT[p.connectionQuality]}`}
                    />
                    <span className="text-[10px] font-semibold text-white">{p.name}</span>
                    {p.role !== 'candidate' && (
                      <span className="text-[8px] text-white/50">{p.role}</span>
                    )}
                    {!p.audioEnabled && <MicOff className="w-2.5 h-2.5 text-coral-alert" />}
                    {p.isScreenSharing && <Monitor className="w-2.5 h-2.5 text-celestial-indigo" />}
                  </div>

                  {/* Speaking indicator */}
                  {p.isSpeaking && (
                    <div className="absolute top-2 right-2">
                      <Volume2 className="w-3.5 h-3.5 text-neural-mint animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <ControlButton
              icon={audioEnabled ? Mic : MicOff}
              label={audioEnabled ? 'Mute' : 'Unmute'}
              active={audioEnabled}
              onClick={toggleAudio}
            />
            <ControlButton
              icon={videoEnabled ? Video : VideoOff}
              label={videoEnabled ? 'Stop Video' : 'Start Video'}
              active={videoEnabled}
              onClick={toggleVideo}
            />
            <ControlButton
              icon={isScreenSharing ? ScreenShareOff : ScreenShare}
              label={isScreenSharing ? 'Stop Share' : 'Share Screen'}
              active={!isScreenSharing}
              onClick={toggleScreenShare}
              variant="secondary"
            />
            <ControlButton
              icon={isRecording ? Square : Circle}
              label={isRecording ? 'Stop Rec' : 'Record'}
              active={!isRecording}
              onClick={isRecording ? onStopRecording : onStartRecording}
              variant={isRecording ? 'danger' : 'secondary'}
            />
            <ControlButton
              icon={Hand}
              label={handRaised ? 'Lower' : 'Raise Hand'}
              active={!handRaised}
              onClick={() => setHandRaised(!handRaised)}
              variant={handRaised ? 'warning' : 'secondary'}
            />

            <div className="w-px h-6 bg-white/10 mx-1" />

            <ControlButton
              icon={MessageSquare}
              label="Chat"
              active={!showChat}
              onClick={() => {
                setShowChat(!showChat);
                setShowNotes(false);
                setShowParticipants(false);
              }}
              variant="secondary"
              badge={messages.length}
            />
            <ControlButton
              icon={FileText}
              label="Notes"
              active={!showNotes}
              onClick={() => {
                setShowNotes(!showNotes);
                setShowChat(false);
                setShowParticipants(false);
              }}
              variant="secondary"
            />
            <ControlButton
              icon={Users}
              label="People"
              active={!showParticipants}
              onClick={() => {
                setShowParticipants(!showParticipants);
                setShowChat(false);
                setShowNotes(false);
              }}
              variant="secondary"
            />

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button
              onClick={onEndCall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-coral-alert text-white text-[11px] font-bold hover:bg-coral-alert/90 transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              End
            </button>
          </div>
        </div>

        {/* Side Panel */}
        {(showChat || showNotes || showParticipants) && (
          <div className="w-72 border-l border-white/5 bg-ink-black/80 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
              <span className="text-[11px] font-bold text-white">
                {showChat ? 'Chat' : showNotes ? 'Interview Notes' : 'Participants'}
              </span>
              <button
                onClick={() => {
                  setShowChat(false);
                  setShowNotes(false);
                  setShowParticipants(false);
                }}
                className="text-white/30 hover:text-white/60"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={msg.isSystem ? 'text-center' : ''}>
                      {msg.isSystem ? (
                        <span className="text-[9px] text-white/30 italic">{msg.text}</span>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span
                              className={`text-[9px] font-semibold ${msg.senderId === 'self' ? 'text-celestial-indigo' : 'text-white/70'}`}
                            >
                              {msg.senderName}
                            </span>
                            <span className="text-[8px] text-white/20">
                              {msg.timestamp.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/80 leading-relaxed">{msg.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 outline-none focus:border-celestial-indigo/50"
                    />
                    <button
                      onClick={sendMessage}
                      className="p-1.5 text-celestial-indigo hover:text-celestial-indigo/80"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Panel */}
            {showNotes && (
              <div className="flex-1 p-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take interview notes here...&#10;&#10;- Technical skills assessment&#10;- Communication observations&#10;- Key questions asked"
                  className="w-full h-full rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 outline-none focus:border-celestial-indigo/50 p-3 resize-none"
                />
              </div>
            )}

            {/* Participants Panel */}
            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/80">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white truncate">
                        {p.name} {p.isSelf && '(You)'}
                      </p>
                      <p className="text-[8px] text-white/40 capitalize">{p.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${QUALITY_DOT[p.connectionQuality]}`}
                      />
                      {!p.audioEnabled && <MicOff className="w-3 h-3 text-coral-alert/60" />}
                      {!p.videoEnabled && <VideoOff className="w-3 h-3 text-coral-alert/60" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Control Button ───────────────────────────────────────────────────────────────

const ControlButton: React.FC<{
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  badge?: number;
}> = ({ icon: Icon, label, active, onClick, variant = 'primary', badge }) => {
  const bg =
    variant === 'danger'
      ? 'bg-coral-alert hover:bg-coral-alert/80'
      : variant === 'warning'
        ? 'bg-sunset-amber/20 hover:bg-sunset-amber/30'
        : active
          ? 'bg-white/10 hover:bg-white/20'
          : 'bg-coral-alert/20 hover:bg-coral-alert/30';

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`p-2.5 rounded-full transition-colors ${bg}`}
        title={label}
      >
        <Icon
          className={`w-4 h-4 ${
            variant === 'danger'
              ? 'text-white'
              : variant === 'warning'
                ? 'text-sunset-amber'
                : active
                  ? 'text-white/80'
                  : 'text-coral-alert'
          }`}
        />
      </button>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-celestial-indigo text-[7px] font-bold text-white flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/40 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
        {label}
      </span>
    </div>
  );
};

export default VideoInterviewRoom;
