'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, Send, Download, Eye, X } from 'lucide-react';
import { ConfirmationLetterService } from '../services';

export default function ConfirmationLettersPage() {
  const [confirmationLetters, setConfirmationLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewLetter, setPreviewLetter] = useState<any | null>(null);

  useEffect(() => {
    fetchConfirmationLetters();
  }, []);

  const fetchConfirmationLetters = async () => {
    try {
      setLoading(true);
      const data = await ConfirmationLetterService.getAllConfirmationLetters();
      setConfirmationLetters(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load confirmation letters.');
    } finally {
      setLoading(false);
    }
  };

  const pendingLetters = confirmationLetters.filter((l) => l.status !== 'issued');
  const issuedLetters = confirmationLetters.filter((l) => l.status === 'issued');

  const [issuing, setIssuing] = useState<string | null>(null);

  const handleIssue = async (id: string) => {
    try {
      setIssuing(id);
      setError('');
      await ConfirmationLetterService.issueLetter(id);
      await fetchConfirmationLetters();
    } catch (err: any) {
      console.error('Failed to issue letter:', err);
      setError('Failed to issue the letter.');
    } finally {
      setIssuing(null);
    }
  };

  const getPdfUrl = (letter: any): string | undefined =>
    letter?.documentUrl || letter?.generatedPdfUrl;

  const handleDownloadPdf = (letter: any) => {
    const url = getPdfUrl(letter);
    if (!url) {
      setError('No generated PDF is available for this letter yet.');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = `confirmation-${letter.employeeName || 'letter'}.pdf`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-500" />
            Confirmation Letters
          </h1>
          <p className="text-slate-500 text-sm">
            Issue official confirmation letters post-probation.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-2 text-sm text-rose-700 dark:text-rose-300 shrink-0">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Pending Issue */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Ready for Issuance</h3>
            {pendingLetters.length > 0 ? (
              <div className="space-y-4">
                {pendingLetters.map((item) => (
                  <div
                    key={item.letterId}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <div className="font-bold">{item.employeeName}</div>
                      <div className="text-xs text-slate-500">
                        Confirmed on {formatDate(item.confirmationDate)}{' '}
                        {item.status === 'draft'
                          ? '(Draft)'
                          : item.status === 'approved'
                            ? '(Approved)'
                            : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewLetter(item)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleIssue(item.letterId)}
                        disabled={issuing === item.letterId}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />{' '}
                        {issuing === item.letterId ? 'Issuing...' : 'Issue Letter'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No pending letters to issue.</p>
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Recently Issued</h3>
            {issuedLetters.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <FileCheck className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No issued letters</p>
                <p className="text-sm">Issued letters will appear here.</p>
              </div>
            )}
            {issuedLetters.length > 0 && (
              <div className="space-y-3">
                {issuedLetters.map((row) => (
                  <div
                    key={row.letterId}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{row.employeeName}</div>
                        <div className="text-xs text-slate-500">
                          Issued {formatDate(row.issuedDate || row.generatedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreviewLetter(row)}
                        className="text-slate-500 text-xs font-bold hover:text-indigo-600 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(row)}
                        className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Confirmation Letter</h2>
              <button
                onClick={() => setPreviewLetter(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              <div className="text-sm text-slate-500 mb-3">
                <strong className="text-slate-800 dark:text-slate-200">
                  {previewLetter.employeeName}
                </strong>{' '}
                &bull; Confirmed {formatDate(previewLetter.confirmationDate)}
              </div>
              {getPdfUrl(previewLetter) ? (
                <iframe
                  src={getPdfUrl(previewLetter)}
                  title="Confirmation Letter PDF"
                  className="w-full h-[50vh] rounded-lg border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                  {previewLetter.content || 'No content available for this letter yet.'}
                </pre>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadPdf(previewLetter)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
