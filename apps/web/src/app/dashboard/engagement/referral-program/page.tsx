'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Link as LinkIcon, Copy, Loader2 } from 'lucide-react';
import { ReferralService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

export default function ReferralProgramPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ReferralService.getReferrals();
      setReferrals(data);
    } catch {
      setToast({ type: 'error', msg: 'Failed to load referrals.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const refCode = user?.employeeId ? `ref_${user.employeeId.slice(0, 12)}` : 'ref';
  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/careers?ref=${refCode}`
      : `https://aura.os/careers?ref=${refCode}`;

  const copyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
        showToast('success', 'Referral link copied!');
      }
    } catch {
      showToast('error', 'Could not copy link.');
    }
  };

  const shareTo = (network: 'linkedin' | 'twitter') => {
    const encoded = encodeURIComponent(referralLink);
    const text = encodeURIComponent('Join our team at Aura!');
    const url =
      network === 'linkedin'
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`
        : `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`;
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  };

  const bonusEarned = referrals
    .filter((r: any) => (r.status || '').toUpperCase() === 'HIRED')
    .reduce((sum: number, r: any) => sum + (r.bonusAmount || 0), 0);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`absolute top-2 right-2 z-50 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Referral Program
          </h1>
          <p className="text-slate-500 text-sm">Refer talent to Aura and earn bonuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <div className="text-indigo-200 text-sm font-bold uppercase mb-2">Total Referrals</div>
            <div className="text-4xl font-bold">{referrals.length}</div>
          </div>
          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <div className="text-emerald-200 text-sm font-bold uppercase mb-2">Offers Accepted</div>
            <div className="text-4xl font-bold">
              {
                referrals.filter((r: any) =>
                  ['ACCEPTED', 'HIRED'].includes((r.status || '').toUpperCase())
                ).length
              }
            </div>
          </div>
          <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
            <div className="text-amber-100 text-sm font-bold uppercase mb-2">Bonus Earned</div>
            <div className="text-4xl font-bold">${bonusEarned}</div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
          <h3 className="font-bold text-lg mb-4">Share Your Link</h3>
          <p className="text-sm text-slate-500 mb-4">
            Anyone who applies using this link will be tracked as your referral.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center gap-2 mb-4 border border-slate-100 dark:border-slate-700">
            <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-mono truncate flex-1 text-slate-600 dark:text-slate-400">
              {referralLink}
            </span>
            <button
              onClick={copyLink}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-indigo-600"
              aria-label="Copy link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => shareTo('linkedin')}
              className="py-2 bg-[#0077b5] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              LinkedIn
            </button>
            <button
              onClick={() => shareTo('twitter')}
              className="py-2 bg-[#1da1f2] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Twitter
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Referral Status</h3>
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Users className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm font-medium">No referrals yet.</p>
              <p className="text-xs">Share your referral link to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((ref: any, i: number) => (
                <div
                  key={ref.id || i}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <h4 className="font-bold">{ref.candidateName || ref.name || 'Referral'}</h4>
                    <div className="text-xs text-slate-500">{ref.role || ''}</div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded inline-block mb-1 ${
                        ['ACCEPTED', 'HIRED'].includes((ref.status || '').toUpperCase())
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {ref.status || 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
