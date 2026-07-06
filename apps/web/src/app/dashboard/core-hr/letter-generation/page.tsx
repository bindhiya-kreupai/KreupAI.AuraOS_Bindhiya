'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Printer, Eye, Download, X } from 'lucide-react';
import { LetterService, EmployeeService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

const letterTypeLabels: Record<string, string> = {
  employment_verification: 'Employment Verification',
  experience: 'Experience Letter',
  salary: 'Salary Letter',
  promotion: 'Promotion Letter',
  transfer: 'Transfer Letter',
  appointment: 'Appointment Letter',
  relieving: 'Relieving Letter',
  custom: 'Custom Letter',
};

const letterTypeOptions = Object.entries(letterTypeLabels);

export default function LetterGenerationPage() {
  const { user } = useCurrentUser();
  const [letterRequests, setLetterRequests] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Create-letter modal state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    letterType: 'employment_verification',
    subject: '',
    content: '',
    templateId: '',
  });

  // Preview modal state
  const [previewLetter, setPreviewLetter] = useState<any | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [reqs, tmpls] = await Promise.all([
        LetterService.getAllLetterRequests(),
        LetterService.getAllTemplates(),
      ]);
      setLetterRequests(reqs);
      setTemplates(tmpls);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load letters.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = async () => {
    setError('');
    setForm({
      employeeId: '',
      letterType: 'employment_verification',
      subject: '',
      content: '',
      templateId: '',
    });
    setShowCreate(true);
    if (employees.length === 0) {
      const list = await EmployeeService.getAllEmployees();
      setEmployees(list);
    }
  };

  const applyTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => (t.id || t.templateId) === templateId);
    setForm((prev) => ({
      ...prev,
      templateId,
      subject: prev.subject || tmpl?.name || tmpl?.templateName || '',
      content: tmpl?.body || tmpl?.content || prev.content,
    }));
  };

  const handleCreate = async () => {
    if (!form.employeeId || !form.subject.trim()) {
      setError('Employee and subject are required.');
      return;
    }
    try {
      setCreating(true);
      setError('');
      await LetterService.createLetterRequest({
        employeeId: form.employeeId,
        letterType: form.letterType,
        subject: form.subject.trim(),
        content: form.content || undefined,
        templateId: form.templateId || undefined,
        status: 'DRAFT',
      } as any);
      setShowCreate(false);
      await fetchAll();
    } catch (err: any) {
      console.error('Create failed:', err);
      setError(err?.message || 'Failed to create letter.');
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    try {
      setActionLoading(requestId);
      setError('');
      await LetterService.approveRequest(requestId, user.userId, user.employeeId);
      await fetchAll();
    } catch (err: any) {
      console.error('Approve failed:', err);
      setError('Failed to approve letter.');
    } finally {
      setActionLoading(null);
    }
  };

  const getPdfUrl = (row: any): string | undefined => row?.generatedPdfUrl || row?.documentUrl;

  const handleDownload = (row: any) => {
    const url = getPdfUrl(row);
    if (!url) {
      setError('No generated PDF is available for this letter yet.');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = `${row.employeeName || 'letter'}-${row.letterType || 'document'}.pdf`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = (row: any) => {
    const url = getPdfUrl(row);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    // No PDF yet: print the rendered letter content.
    const win = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
    if (!win) {
      setError('Unable to open the print window. Please allow pop-ups.');
      return;
    }
    const safe = (v: string) =>
      String(v || '').replace(
        /[&<>]/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string
      );
    win.document.write(
      `<html><head><title>${safe(row.subject || 'Letter')}</title></head><body style="font-family:sans-serif;padding:40px;line-height:1.6"><h2>${safe(row.subject || letterTypeLabels[row.letterType] || 'Letter')}</h2><p><strong>${safe(row.employeeName || '')}</strong></p><pre style="white-space:pre-wrap;font-family:inherit">${safe(row.content || 'No content available.')}</pre></body></html>`
    );
    win.document.close();
    win.focus();
    win.print();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const employeeLabel = (emp: any) =>
    `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
    emp.employeeName ||
    emp.employeeCode ||
    emp.id;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Letter Generation
          </h1>
          <p className="text-slate-500 text-sm">
            Create and issue HR letters (Offer, Appointment, Promotion, Relieving).
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          Create New Letter
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-2 text-sm text-rose-700 dark:text-rose-300 shrink-0">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Templates */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-500 text-xs uppercase">Templates</h3>
          {loading && <div className="text-sm text-slate-400">Loading templates…</div>}
          {!loading && templates.length === 0 && (
            <div className="p-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400">
              No templates yet. Create one to reuse letter content.
            </div>
          )}
          {templates.map((t) => (
            <div
              key={t.id || t.templateId}
              onClick={() => {
                openCreate().then(() => applyTemplate(t.id || t.templateId));
              }}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">
                {t.name || t.templateName}
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.category || 'General'}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Issued Letters History</h3>
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          )}
          {!loading && letterRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No letters found</p>
              <p className="text-sm">Letters will appear here once they are generated.</p>
            </div>
          )}
          {!loading && letterRequests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {letterRequests.map((row) => {
                    const status = String(row.status || '').toLowerCase();
                    return (
                      <tr
                        key={row.requestId || row.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                          {row.employeeName}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {letterTypeLabels[row.letterType] || row.letterType}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(row.generatedDate || row.requestDate || row.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              status === 'issued'
                                ? 'bg-emerald-100 text-emerald-600'
                                : status === 'approved'
                                  ? 'bg-blue-100 text-blue-600'
                                  : status === 'draft' ||
                                      status === 'generated' ||
                                      status === 'pending'
                                    ? 'bg-amber-100 text-amber-600'
                                    : status === 'rejected'
                                      ? 'bg-rose-100 text-rose-600'
                                      : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex justify-end gap-2 text-slate-400">
                          {(status === 'draft' ||
                            status === 'pending' ||
                            status === 'generated') && (
                            <button
                              onClick={() => handleApprove(row.requestId || row.id)}
                              disabled={actionLoading === (row.requestId || row.id)}
                              className="text-xs font-bold text-indigo-600 hover:underline disabled:opacity-50 mr-1"
                            >
                              {actionLoading === (row.requestId || row.id)
                                ? 'Approving…'
                                : 'Approve'}
                            </button>
                          )}
                          <button
                            onClick={() => setPreviewLetter(row)}
                            className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(row)}
                            className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(row)}
                            className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors"
                            title="Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Letter Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Letter</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Employee</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Employee…</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {employeeLabel(emp)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Letter Type</label>
                <select
                  value={form.letterType}
                  onChange={(e) => setForm((p) => ({ ...p, letterType: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {letterTypeOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {templates.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Template (optional)
                  </label>
                  <select
                    value={form.templateId}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No template</option>
                    {templates.map((t) => (
                      <option key={t.id || t.templateId} value={t.id || t.templateId}>
                        {t.name || t.templateName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Employment Verification Letter"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={5}
                  placeholder="Letter body…"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create Letter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {previewLetter.subject ||
                  letterTypeLabels[previewLetter.letterType] ||
                  'Letter Preview'}
              </h2>
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
                &bull; {letterTypeLabels[previewLetter.letterType] || previewLetter.letterType}
              </div>
              {getPdfUrl(previewLetter) ? (
                <iframe
                  src={getPdfUrl(previewLetter)}
                  title="Letter PDF"
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
                onClick={() => handlePrint(previewLetter)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => handleDownload(previewLetter)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
