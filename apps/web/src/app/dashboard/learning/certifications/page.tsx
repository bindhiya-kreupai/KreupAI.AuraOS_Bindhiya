'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, Download, Share2, Search, Loader2 } from 'lucide-react';
import { CertificationService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface CertRow {
  id?: string;
  name?: string;
  certificateName?: string;
  learnerName?: string;
  employeeId?: string;
  certificateNumber?: string;
  certificationId?: string;
  issuedDate?: string;
  issueDate?: string;
  credentialUrl?: string;
  documentUrl?: string;
}

const COLORS = ['text-emerald-500', 'text-indigo-500', 'text-cyan-500'];
const BGS = [
  'bg-emerald-50 dark:bg-emerald-900/10',
  'bg-indigo-50 dark:bg-indigo-900/10',
  'bg-cyan-50 dark:bg-cyan-900/10',
];

export default function CertificationsPage() {
  const toast = useToast();
  const [data, setData] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await CertificationService.getCertifications();
      setData(result as CertRow[]);
    } catch (err) {
      console.error('Error loading certifications:', err);
      toast.error('Failed to load certifications. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (c) =>
        (c.name || c.certificateName || '').toLowerCase().includes(term) ||
        (c.learnerName || c.employeeId || '').toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleDownload = (cert: CertRow) => {
    const url = cert.documentUrl || cert.credentialUrl;
    if (!url) {
      toast.warning('No certificate document is available for download.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (cert: CertRow) => {
    const url =
      cert.credentialUrl ||
      cert.documentUrl ||
      (typeof window !== 'undefined' ? window.location.href : '');
    const title = cert.name || cert.certificateName || 'Certificate';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text: `Certificate: ${title}`, url });
        toast.success('Shared successfully.');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        toast.success('Certificate link copied to clipboard.');
      } else {
        toast.warning('Sharing is not supported on this device.');
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Error sharing:', err);
        toast.error('Failed to share certificate.');
      }
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            Certifications
          </h1>
          <p className="text-slate-500 text-sm">View and manage earned certificates.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee or cert..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Award className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold">No certifications found</p>
          <p className="text-sm">Certifications will appear here once issued.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
          {filtered.map((cert, i) => {
            const colorIdx = i % COLORS.length;
            const issued = cert.issuedDate || cert.issueDate;
            return (
              <div
                key={cert.id || i}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden group"
              >
                <div className={`p-4 rounded-full ${BGS[colorIdx]} mb-4`}>
                  <Award className={`w-8 h-8 ${COLORS[colorIdx]}`} />
                </div>

                <h3 className="font-bold text-lg mb-1">{cert.certificateName || cert.name}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Awarded to{' '}
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {cert.learnerName || cert.employeeId}
                  </span>
                </p>

                <div className="text-xs font-mono text-slate-400 mb-6">
                  ID: {cert.certificateNumber || cert.certificationId || cert.id}{' '}
                  {issued ? `| ${new Date(issued).toLocaleDateString()}` : ''}
                </div>

                <div className="flex gap-2 w-full mt-auto">
                  <button
                    type="button"
                    onClick={() => handleDownload(cert)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(cert)}
                    className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
