'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { Building2, CheckCircle, XCircle, PauseCircle } from 'lucide-react';

interface Company {
  id: string;
  code: string;
  name: string;
  taxId?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  status?: string;
  industry?: string;
  website?: string;
  registrationNumber?: string;
  country?: string;
}

interface CompanyStats {
  total: number;
  active: number;
  suspended: number;
  byIndustry: { industry: string; count: number }[];
  byCountry: { country: string; count: number }[];
}

export default function CompaniesPage() {
  const [data, setData] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCompanies = useCallback(async (search?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', '1');
      params.set('limit', '100');
      const qs = params.toString();
      const url = qs ? `/api/master-data/companies?${qs}` : '/api/master-data/companies';
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setData(json.data);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch companies:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/companies/stats');
      if (!response.ok) return;
      const json = await response.json();
      if (!json.success || !json.data) return;
      const d = json.data;
      setStats({
        total: d.totalCompanies ?? 0,
        active: d.activeCompanies ?? 0,
        suspended: d.suspendedCompanies ?? 0,
        byIndustry: d.companiesByIndustry
          ? Object.entries(d.companiesByIndustry).map(([industry, count]) => ({
              industry,
              count: count as number,
            }))
          : [],
        byCountry: d.companiesByCountry
          ? Object.entries(d.companiesByCountry).map(([country, count]) => ({
              country,
              count: count as number,
            }))
          : [],
      });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, [fetchCompanies, fetchStats]);

  const handleLifecycleAction = async (company: Company, action: 'activate' | 'suspend') => {
    setActionLoading(`${company.id}-${action}`);
    setStatusMessage(null);
    try {
      const response = await fetch(`/api/companies/${company.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setStatusMessage({
          kind: 'success',
          text: `${company.name} ${action === 'activate' ? 'activated' : 'suspended'} successfully.`,
        });
        await fetchCompanies();
        await fetchStats();
      } else {
        const err = await response.json().catch(() => ({}));
        setStatusMessage({
          kind: 'error',
          text: err?.error || err?.message || `Failed to ${action} company.`,
        });
      }
    } catch (error: any) {
      setStatusMessage({ kind: 'error', text: `Error: ${error?.message}` });
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<Company>[] = [
    {
      key: 'code',
      header: 'Code',
      width: '120px',
      render: (row) => <span className="font-mono text-xs">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Company Name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'taxId',
      header: 'Tax ID',
      render: (row) => <span className="text-silver-mist text-xs font-mono">{row.taxId}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const status = (row.status || 'ACTIVE').toUpperCase();
        const color =
          status === 'ACTIVE'
            ? 'bg-emerald-100 text-emerald-700'
            : status === 'SUSPENDED'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-slate-100 text-slate-600';
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{status}</span>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => {
        const status = (row.status || 'ACTIVE').toUpperCase();
        const isActivating = actionLoading === `${row.id}-activate`;
        const isSuspending = actionLoading === `${row.id}-suspend`;

        return (
          <div className="flex items-center gap-2">
            {status !== 'ACTIVE' && (
              <button
                onClick={() => handleLifecycleAction(row, 'activate')}
                disabled={isActivating}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3 h-3" />
                {isActivating ? 'Activating...' : 'Activate'}
              </button>
            )}
            {status !== 'SUSPENDED' && (
              <button
                onClick={() => handleLifecycleAction(row, 'suspend')}
                disabled={isSuspending}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                <PauseCircle className="w-3 h-3" />
                {isSuspending ? 'Suspending...' : 'Suspend'}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const handleSave = async (record: Partial<Company>) => {
    setStatusMessage(null);
    try {
      const isUpdate = !!record.id;
      const response = await fetch(
        isUpdate ? `/api/master-data/companies/${record.id}` : '/api/master-data/companies',
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }
      );

      if (response.ok) {
        setStatusMessage({
          kind: 'success',
          text: `Company ${isUpdate ? 'updated' : 'created'} successfully.`,
        });
        await fetchCompanies();
        await fetchStats();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage({
          kind: 'error',
          text: `Failed to save company: ${errorData.error || errorData.message || 'Unknown error'}`,
        });
      }
    } catch (error: any) {
      setStatusMessage({ kind: 'error', text: `Error saving company: ${error?.message}` });
    }
  };

  const handleDelete = async (record: Company) => {
    if (!confirm(`Are you sure you want to delete ${record.name}?`)) return;
    setStatusMessage(null);
    try {
      const response = await fetch(`/api/master-data/companies/${record.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStatusMessage({ kind: 'success', text: `${record.name} deleted successfully.` });
        await fetchCompanies();
        await fetchStats();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage({
          kind: 'error',
          text: `Failed to delete company: ${errorData.error || errorData.message || 'Unknown error'}`,
        });
      }
    } catch (error: any) {
      setStatusMessage({ kind: 'error', text: `Error deleting company: ${error?.message}` });
    }
  };

  const handleExport = () => handleValuesExport('companies');

  const parseCsv = (text: string): Record<string, string>[] => {
    const rows: string[][] = [];
    let field = '';
    let row: string[] = [];
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && text[i + 1] === '\n') i += 1;
        row.push(field);
        rows.push(row);
        field = '';
        row = [];
      } else {
        field += char;
      }
    }
    if (field !== '' || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ''));
    if (nonEmpty.length < 2) return [];
    const headers = nonEmpty[0].map((h) => h.trim());
    return nonEmpty.slice(1).map((cells) => {
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = (cells[idx] ?? '').trim();
      });
      return record;
    });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (event.target) event.target.value = '';
    if (!file) return;
    setImporting(true);
    setStatusMessage(null);
    try {
      const text = await file.text();
      const records = parseCsv(text);
      if (records.length === 0) {
        setStatusMessage({
          kind: 'error',
          text: 'No valid rows found. CSV must have a header row (code,name,...) and at least one record.',
        });
        return;
      }
      let created = 0;
      const errors: string[] = [];
      for (const record of records) {
        if (!record.code || !record.name) {
          errors.push(`Skipped row missing code/name: ${JSON.stringify(record).slice(0, 60)}`);
          continue;
        }
        const response = await fetch('/api/master-data/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        if (response.ok) {
          created += 1;
        } else {
          const err = await response.json().catch(() => ({}));
          errors.push(`${record.code}: ${err.error || err.message || 'failed'}`);
        }
      }
      await fetchCompanies();
      await fetchStats();
      setStatusMessage({
        kind: errors.length === 0 ? 'success' : 'error',
        text:
          errors.length === 0
            ? `Imported ${created} company(ies) successfully.`
            : `Imported ${created}, ${errors.length} failed: ${errors.slice(0, 3).join('; ')}`,
      });
    } catch (error: any) {
      setStatusMessage({ kind: 'error', text: `Import failed: ${error?.message}` });
    } finally {
      setImporting(false);
    }
  };

  const handleImport = () => fileInputRef.current?.click();
  const handleFilter = () => {
    const query = window.prompt('Search companies:');
    if (query !== null) fetchCompanies(query);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImportFile}
      />
      <div className="px-6 pt-6 space-y-6">
        {importing && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-800">
            Importing companies from CSV...
          </div>
        )}
        {/* Stats Widgets */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-silver-mist font-medium">Total Companies</p>
                <p className="text-2xl font-bold text-ink-black dark:text-pearl">{stats.total}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-silver-mist font-medium">Active</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-silver-mist font-medium">Suspended</p>
                <p className="text-2xl font-bold text-rose-600">{stats.suspended}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`rounded-lg border px-4 py-2 text-sm ${
              statusMessage.kind === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Industry & Country Breakdown */}
        {stats && (stats.byIndustry.length > 0 || stats.byCountry.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.byIndustry.length > 0 && (
              <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 shadow-sm">
                <h3 className="font-semibold mb-3">Industry Breakdown</h3>
                {stats.byIndustry.map(({ industry, count }) => (
                  <div key={industry} className="flex justify-between py-1 text-sm">
                    <span>{industry}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}

            {stats.byCountry.length > 0 && (
              <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 shadow-sm">
                <h3 className="font-semibold mb-3">Country Breakdown</h3>
                {stats.byCountry.map(({ country, count }) => (
                  <div key={country} className="flex justify-between py-1 text-sm">
                    <span>{country}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Companies Table */}
      <DataPage<Company>
        title="Companies"
        addButtonText="Add Company"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Master Data' }, { label: 'Companies' }]}
        data={data}
        columns={columns}
        onSave={handleSave}
        onDelete={handleDelete}
        onExport={handleExport}
        onImport={handleImport}
        onFilter={handleFilter}
        defaultValues={{}}
        renderForm={(record, onChange) => {
          const inputCls =
            'w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none';
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">
                  Company Code *
                </label>
                <input
                  type="text"
                  value={record.code || ''}
                  onChange={(e) => onChange('code', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. US_HQ"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={record.name || ''}
                  onChange={(e) => onChange('name', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. KreupAI Inc."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">Email</label>
                <input
                  type="email"
                  value={record.email || ''}
                  onChange={(e) => onChange('email', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. info@kreupai.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">Phone</label>
                <input
                  type="text"
                  value={record.phoneNumber || ''}
                  onChange={(e) => onChange('phoneNumber', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. +971 4 000 0000"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-silver-mist mb-1">Address</label>
                <input
                  type="text"
                  value={record.address || ''}
                  onChange={(e) => onChange('address', e.target.value)}
                  className={inputCls}
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">City</label>
                <input
                  type="text"
                  value={record.city || ''}
                  onChange={(e) => onChange('city', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  value={record.state || ''}
                  onChange={(e) => onChange('state', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={record.postalCode || ''}
                  onChange={(e) => onChange('postalCode', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">Country</label>
                <input
                  type="text"
                  value={record.country || ''}
                  onChange={(e) => onChange('country', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. UAE"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">Industry</label>
                <input
                  type="text"
                  value={record.industry || ''}
                  onChange={(e) => onChange('industry', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Technology"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">Website</label>
                <input
                  type="text"
                  value={record.website || ''}
                  onChange={(e) => onChange('website', e.target.value)}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">
                  Tax ID / TRN
                </label>
                <input
                  type="text"
                  value={record.taxId || ''}
                  onChange={(e) => onChange('taxId', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. EIN-123456789"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">
                  Registration No.
                </label>
                <input
                  type="text"
                  value={record.registrationNumber || ''}
                  onChange={(e) => onChange('registrationNumber', e.target.value)}
                  className={inputCls}
                  placeholder="Company registration number"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">Status</label>
                <select
                  value={record.status || 'Active'}
                  onChange={(e) => onChange('status', e.target.value)}
                  className={inputCls}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          );
        }}
      />
    </>
  );
}
