/**
 * @module SessionManager
 * @description Active sessions list with device icons, "This device" badge,
 *              revoke individual sessions, and revoke-all-other-sessions.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  HelpCircle,
  MapPin,
  Clock,
  LogOut,
  ShieldAlert,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { AuthClientService, type ActiveSession } from '@/services/authService';

// ── Device icon ───────────────────────────────────────────────────────────────

function DeviceIcon({ type }: { type: ActiveSession['deviceType'] }) {
  const cls = 'w-5 h-5';
  switch (type) {
    case 'desktop':
      return <Monitor className={cls} />;
    case 'mobile':
      return <Smartphone className={cls} />;
    case 'tablet':
      return <Tablet className={cls} />;
    default:
      return <HelpCircle className={cls} />;
  }
}

// ── Time display ─────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Session card ──────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: ActiveSession;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}

function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
        session.isCurrent
          ? 'border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
          : 'border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue hover:border-cloud/80'
      }`}
    >
      {/* Device icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          session.isCurrent
            ? 'bg-celestial-indigo text-white'
            : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
        }`}
      >
        <DeviceIcon type={session.deviceType} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-ink-black dark:text-pearl">
            {session.deviceName}
          </span>
          {session.isCurrent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-celestial-indigo text-white">
              This device
            </span>
          )}
        </div>
        <p className="text-xs text-silver-mist mt-0.5">
          {session.browser} · {session.os}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] text-silver-mist">
            <MapPin className="w-3 h-3" />
            {session.location}
          </span>
          <span className="text-silver-mist/30">·</span>
          <span className="flex items-center gap-1 text-[11px] text-silver-mist">
            <Clock className="w-3 h-3" />
            {session.isCurrent ? 'Active now' : `Last active ${relativeTime(session.lastActiveAt)}`}
          </span>
        </div>
        <p className="text-[10px] text-silver-mist/60 mt-1">
          IP: {session.ipAddress} · Signed in {relativeTime(session.createdAt)}
        </p>
      </div>

      {/* Revoke */}
      {!session.isCurrent && (
        <button
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-quantum-rose/30 text-quantum-rose text-xs font-medium hover:bg-quantum-rose hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isRevoking ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <LogOut className="w-3 h-3" />
          )}
          Sign out
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface SessionManagerProps {
  className?: string;
}

export function SessionManager({ className = '' }: SessionManagerProps) {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [revokeAllSuccess, setRevokeAllSuccess] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await AuthClientService.getActiveSessions();
      setSessions(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await AuthClientService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setIsRevokingAll(true);
    try {
      await AuthClientService.revokeAllSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setRevokeAllSuccess(true);
      setTimeout(() => setRevokeAllSuccess(false), 3000);
    } finally {
      setIsRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl">Active Sessions</h3>
          <p className="text-xs text-silver-mist mt-0.5">
            {sessions.length} device{sessions.length !== 1 ? 's' : ''} signed in to your account
          </p>
        </div>
        {otherSessions.length > 0 && (
          <button
            onClick={handleRevokeAll}
            disabled={isRevokingAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-quantum-rose/30 text-quantum-rose text-xs font-medium hover:bg-quantum-rose/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isRevokingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : revokeAllSuccess ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            {revokeAllSuccess ? 'Done!' : 'Sign out all other devices'}
          </button>
        )}
      </div>

      {/* Sessions */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Monitor className="w-10 h-10 text-silver-mist/20 mb-3" />
          <p className="text-sm text-silver-mist">No active sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Current session first */}
          {sessions
            .sort((a) => (a.isCurrent ? -1 : 1))
            .map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={handleRevoke}
                isRevoking={revokingId === session.id}
              />
            ))}
        </div>
      )}

      {/* Security tip */}
      <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          If you see a session you don&apos;t recognize, sign out of it immediately and change your
          password.
        </p>
      </div>
    </div>
  );
}

export default SessionManager;
