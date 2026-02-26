/**
 * @module SecurityDashboard
 * @description Security overview with score gauge, checklist, login timeline, and quick actions.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Key,
  LogIn,
  Loader2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  AuthClientService,
  type SecurityScore,
  type LoginHistoryEntry,
  type MFAStatus,
} from '@/services/authService';

// ── Score Gauge ────────────────────────────────────────────────────────────────

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const _angle = (score / 100) * 180 - 90; // -90 to +90 degrees

  const gradeColors: Record<string, string> = {
    A: '#10b981', // emerald
    B: '#3b82f6', // blue
    C: '#f59e0b', // amber
    D: '#f97316', // orange
    F: '#ef4444', // red
  };

  const color = gradeColors[grade] ?? '#94a3b8';
  const scoreColor =
    score >= 80
      ? 'text-emerald-500'
      : score >= 60
        ? 'text-blue-500'
        : score >= 40
          ? 'text-amber-500'
          : 'text-red-500';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-20 overflow-hidden">
        {/* Gauge background */}
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Track arc */}
          <path
            d="M 10 58 A 50 50 0 0 1 110 58"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled arc - simplified to avoid complex calculations */}
          <path
            d="M 10 58 A 50 50 0 0 1 110 58"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 157} 157`}
          />
          {/* Center score */}
          <text x="60" y="52" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>
            {score}
          </text>
        </svg>
      </div>
      <div className="text-center -mt-2">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-base font-bold`}
          style={{ backgroundColor: color }}
        >
          {grade}
        </span>
        <p className={`text-xs font-semibold mt-1 ${scoreColor}`}>
          {score >= 80
            ? 'Excellent'
            : score >= 60
              ? 'Good'
              : score >= 40
                ? 'Fair'
                : 'Needs Attention'}
        </p>
        <p className="text-[10px] text-silver-mist">Security Score</p>
      </div>
    </div>
  );
}

// ── Checklist item ────────────────────────────────────────────────────────────

function ChecklistItem({ item }: { item: SecurityScore['items'][number] }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        item.passed
          ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10'
          : 'border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {item.passed ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
          <XCircle className="w-4 h-4 text-silver-mist" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-black dark:text-pearl">{item.label}</p>
          <span
            className={`text-[10px] font-bold ${item.passed ? 'text-emerald-500' : 'text-silver-mist'}`}
          >
            {item.points}/{item.maxPoints} pts
          </span>
        </div>
        <p className="text-[11px] text-silver-mist mt-0.5">{item.description}</p>
        {!item.passed && item.recommendation && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
            {item.recommendation}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Login history item ────────────────────────────────────────────────────────

function LoginHistoryItem({ entry }: { entry: LoginHistoryEntry }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 last:border-0">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          entry.success
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
            : 'bg-red-100 dark:bg-red-900/30 text-red-500'
        }`}
      >
        {entry.success ? (
          <LogIn className="w-3.5 h-3.5" />
        ) : (
          <ShieldAlert className="w-3.5 h-3.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink-black dark:text-pearl">
          {entry.success
            ? 'Successful sign in'
            : `Failed attempt: ${entry.failureReason ?? 'Unknown'}`}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-[10px] text-silver-mist">
            <MapPin className="w-2.5 h-2.5" />
            {entry.location}
          </span>
          <span className="text-silver-mist/30">·</span>
          <span className="text-[10px] text-silver-mist">{entry.browser}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-silver-mist flex-shrink-0">
        <Clock className="w-2.5 h-2.5" />
        {new Date(entry.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface SecurityDashboardProps {
  onOpenMFASetup?: () => void;
  onOpenSessionManager?: () => void;
  onChangePassword?: () => void;
}

export function SecurityDashboard({
  onOpenMFASetup,
  onOpenSessionManager,
  onChangePassword,
}: SecurityDashboardProps) {
  const [securityScore, setSecurityScore] = useState<SecurityScore | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      AuthClientService.getSecurityScore(),
      AuthClientService.getLoginHistory(8),
      AuthClientService.getMFAStatus(),
    ])
      .then(([score, history, mfa]) => {
        setSecurityScore(score);
        setLoginHistory(history);
        setMfaStatus(mfa);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score card */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-celestial-indigo" />
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl">Account Security</h3>
          </div>
          {securityScore && <ScoreGauge score={securityScore.score} grade={securityScore.grade} />}
          <p className="text-[10px] text-silver-mist mt-3">
            Last analyzed{' '}
            {securityScore ? new Date(securityScore.lastAnalyzedAt).toLocaleDateString() : '—'}
          </p>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-5">
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-silver-mist" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            {/* Change password */}
            <button
              onClick={onChangePassword}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/30 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">
                  Change Password
                </p>
                <p className="text-[11px] text-silver-mist">Update your account password</p>
              </div>
              <ChevronRight className="w-4 h-4 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* MFA */}
            <button
              onClick={onOpenMFASetup}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/30 transition-all text-left group"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  mfaStatus?.enabled
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-amber-50 dark:bg-amber-900/20'
                }`}
              >
                <Smartphone
                  className={`w-4 h-4 ${mfaStatus?.enabled ? 'text-emerald-500' : 'text-amber-500'}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    Two-Factor Authentication
                  </p>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      mfaStatus?.enabled
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    }`}
                  >
                    {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[11px] text-silver-mist">
                  {mfaStatus?.enabled
                    ? `Active via ${mfaStatus.method?.toUpperCase() ?? 'authenticator'}`
                    : 'Enable for extra account protection'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Sessions */}
            <button
              onClick={onOpenSessionManager}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/30 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Monitor className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">
                  Review Sessions
                </p>
                <p className="text-[11px] text-silver-mist">
                  Manage devices signed into your account
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Checklist */}
      {securityScore && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-5">
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-silver-mist" />
            Security Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {securityScore.items.map((item) => (
              <ChecklistItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Login History */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <LogIn className="w-4 h-4 text-silver-mist" />
            Recent Login Activity
          </h3>
          <span className="text-[10px] text-silver-mist">Last {loginHistory.length} events</span>
        </div>

        {loginHistory.length === 0 ? (
          <p className="text-sm text-silver-mist text-center py-6">No login history available</p>
        ) : (
          <div>
            {loginHistory.map((entry) => (
              <LoginHistoryItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {loginHistory.some((e) => !e.success) && (
          <div className="mt-4 flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-400">
              We detected failed login attempts on your account. If these weren&apos;t you, please
              change your password immediately and enable two-factor authentication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecurityDashboard;
