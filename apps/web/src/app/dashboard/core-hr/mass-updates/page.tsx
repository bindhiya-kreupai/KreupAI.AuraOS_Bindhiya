'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { MassUpdateService } from '../services';
import type { MassUpdate } from '../types';

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const getStatusDisplay = (rawStatus: string) => {
  const status = (rawStatus || '').toLowerCase();
  switch (status) {
    case 'executed':
    case 'completed':
    case 'success':
      return { label: 'Success', style: 'success' };
    case 'failed':
    case 'error':
      return { label: 'Partial Error', style: 'error' };
    case 'pending_approval':
    case 'approved':
    case 'draft':
    case 'pending':
    case 'running':
      return { label: 'Processing', style: 'processing' };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
        style: 'processing',
      };
  }
};

export default function MassUpdatesPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [massUpdates, setMassUpdates] = useState<MassUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMassUpdates();
  }, []);

  const fetchMassUpdates = async () => {
    try {
      const data = await MassUpdateService.getAllMassUpdates();
      setMassUpdates(data);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const [uploadingFile, setUploadingFile] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Preview modal
  const [preview, setPreview] = useState<any | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const handleUpload = () => {
    document.getElementById('mass-upload-input')?.click();
  };

  const processFile = async (file: File) => {
    try {
      setUploadingFile(true);
      setError('');
      await MassUpdateService.createFromFile(file, { entityType: 'employee' });
      await fetchMassUpdates();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'Failed to upload the file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = '';
  };

  const handlePreview = async (updateId: string) => {
    try {
      setPreviewing(updateId);
      setError('');
      const result = await MassUpdateService.previewUpdate(updateId);
      setPreview(result);
    } catch (err: any) {
      console.error('Preview failed:', err);
      setError('Failed to load preview.');
    } finally {
      setPreviewing(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'Employee ID,First Name,Last Name,Department,Job Title,Email\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Employee_Data_Template_v2.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRetry = async (jobName: string, updateId: string) => {
    try {
      setRetrying(updateId);
      await MassUpdateService.executeUpdate(updateId);
      await fetchMassUpdates();
    } catch (error: any) {
      console.error('Retry failed:', error);
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-500" />
            Mass Data Updates
          </h1>
          <p className="text-slate-500 text-sm">Bulk update employee records via CSV or Excel.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-2 text-sm text-rose-700 dark:text-rose-300 shrink-0">
          {error}
        </div>
      )}

      <input
        type="file"
        id="mass-upload-input"
        accept=".csv,.xls,.xlsx"
        className="hidden"
        onChange={handleFileSelected}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Upload Area */}
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all duration-200
                        ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800'}
                    `}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              void processFile(file);
            }
          }}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors
                        ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}
                    `}
          >
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="font-bold text-xl mb-2">Drag & Drop your file here</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            Supports .csv, .xls, .xlsx. Ensure you follow the data template.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploadingFile}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {uploadingFile ? 'Uploading...' : 'Browse Files'}
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Template
            </button>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-y-auto max-h-[500px]">
          <h3 className="font-bold text-lg mb-4">Recent Import Jobs</h3>

          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {!loading && massUpdates.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Database className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No import jobs found</p>
              <p className="text-sm">Import jobs will appear here once data is uploaded.</p>
            </div>
          )}

          {!loading && massUpdates.length > 0 && (
            <div className="space-y-4">
              {massUpdates.map((job: any) => {
                const statusInfo = getStatusDisplay(job.status);
                const jobId = job.id || job.updateId;
                const recordCount =
                  job.affectedCount ??
                  job.updateValue?.rows?.length ??
                  job.targetEmployees?.length ??
                  0;

                return (
                  <div
                    key={jobId}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm">
                        {job.updateValue?.updateName ||
                          job.updateName ||
                          job.updateValue?.fileName ||
                          job.field ||
                          'Import job'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatDate(job.createdDate || job.createdAt)}{' '}
                        {recordCount > 0 ? `\u2022 ${recordCount} Records` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(jobId)}
                        disabled={previewing === jobId}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-50"
                        title="Preview parsed rows"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      {statusInfo.style === 'success' && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Success
                        </span>
                      )}
                      {statusInfo.style === 'error' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Errors
                          </span>
                          <button
                            onClick={() => handleRetry(job.updateName || jobId, jobId)}
                            disabled={retrying === jobId}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-50"
                            title="Retry Failed Records"
                          >
                            <RefreshCw
                              className={`w-3 h-3 ${retrying === jobId ? 'animate-spin' : ''}`}
                            />
                          </button>
                          <button
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                            title="Download Error Log"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {statusInfo.style === 'processing' && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> {statusInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Import Preview</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {preview.fileName ? `${preview.fileName} — ` : ''}
                  {preview.affectedCount} row{preview.affectedCount === 1 ? '' : 's'} parsed
                </p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-auto">
              {preview.changes.length === 0 ? (
                <p className="text-sm text-slate-400">No rows found in this import.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                    <tr>
                      {(preview.columns.length > 0
                        ? preview.columns
                        : Object.keys(preview.changes[0] || {})
                      ).map((col: string) => (
                        <th key={col} className="px-3 py-2 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {preview.changes.slice(0, 100).map((row: any, i: number) => (
                      <tr key={i}>
                        {(preview.columns.length > 0 ? preview.columns : Object.keys(row)).map(
                          (col: string) => (
                            <td key={col} className="px-3 py-2 font-mono">
                              {String(row[col] ?? '')}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
