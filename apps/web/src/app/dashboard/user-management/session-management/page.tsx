'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Shield } from 'lucide-react';

interface UserSession {
  id: string;
  userId: string;
  user: { email: string };
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  status: string;
  expiresAt: string | null;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const [data, setData] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/sessions');
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
      } else {
        setError(json.error || 'Failed to load sessions');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRevoke = async (record: UserSession) => {
    if (record.isCurrent) {
      showNotification('error', 'Use logout to end your current session');
      return;
    }
    if (!confirm(`Revoke session from ${record.ipAddress} (${record.device || 'unknown device'})?`))
      return;

    try {
      const res = await fetch(`/api/sessions/${record.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        showNotification('success', json.message || 'Session revoked');
        fetchData();
      } else {
        showNotification('error', json.error || 'Failed to revoke session');
      }
    } catch (err: any) {
      showNotification('error', 'Network error while revoking session');
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Revoke all other sessions? You will remain logged in on this device.')) return;

    try {
      const res = await fetch('/api/sessions', { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        showNotification('success', json.message || 'Other sessions revoked');
        fetchData();
      } else {
        showNotification('error', json.error || 'Failed to revoke sessions');
      }
    } catch (err: any) {
      showNotification('error', 'Network error while revoking sessions');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-rose-500 text-lg font-medium">Failed to load sessions</div>
        <p className="text-silver-mist text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeSessions = data.filter((s) => s.status === 'Active');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-1">
            Session Management
          </h1>
          <p className="text-silver-mist text-sm">
            {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''} — manage
            and revoke sessions across devices.
          </p>
        </div>
        {activeSessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Revoke All Other Sessions
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cloud dark:border-nebula-purple/30 bg-gray-50 dark:bg-stellar-blue/40">
              <th className="text-left px-4 py-3 font-medium text-midnight-blue dark:text-white">
                User
              </th>
              <th className="text-left px-4 py-3 font-medium text-midnight-blue dark:text-white">
                IP Address
              </th>
              <th className="text-left px-4 py-3 font-medium text-midnight-blue dark:text-white">
                Device
              </th>
              <th className="text-left px-4 py-3 font-medium text-midnight-blue dark:text-white">
                Browser
              </th>
              <th className="text-left px-4 py-3 font-medium text-midnight-blue dark:text-white">
                Location
              </th>
              <th className="text-left px-4 py-3 font-medium text-midnight-blue dark:text-white">
                Last Active
              </th>
              <th className="text-left px-4 py-3 font-medium text-midnight-blue dark:text-white">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-midnight-blue dark:text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center px-4 py-12 text-silver-mist">
                  No sessions found.
                </td>
              </tr>
            ) : (
              data.map((session) => (
                <tr
                  key={session.id}
                  className={`border-b border-cloud dark:border-nebula-purple/20 hover:bg-gray-50 dark:hover:bg-stellar-blue/30 transition-colors ${session.isCurrent ? 'bg-celestial-indigo/5 dark:bg-celestial-indigo/10' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-midnight-blue dark:text-white">
                      {session.user?.email}
                    </span>
                    {session.isCurrent && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-celestial-indigo/10 text-celestial-indigo">
                        <Shield className="w-3 h-3" />
                        Current
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-silver-mist font-mono text-xs">
                    {session.ipAddress}
                  </td>
                  <td className="px-4 py-3 text-silver-mist">{session.device || '—'}</td>
                  <td className="px-4 py-3 text-silver-mist">{session.browser || '—'}</td>
                  <td className="px-4 py-3 text-silver-mist">{session.location || '—'}</td>
                  <td className="px-4 py-3 text-silver-mist text-xs">
                    {new Date(session.lastActive).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${session.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {session.status === 'Active' && !session.isCurrent && (
                      <button
                        onClick={() => handleRevoke(session)}
                        className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                    {session.isCurrent && <span className="text-xs text-silver-mist">Current</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
