'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Users,
  Layers,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CheckCircle,
  PauseCircle,
  RefreshCw,
} from 'lucide-react';

interface CompanyDetail {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  industry?: string | null;
  website?: string | null;
  taxId?: string | null;
  registrationNumber?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { employees: number; departments: number };
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/companies/${id}?includeRelations=true`);
      const json = await response.json();
      if (response.ok) {
        // route-wrapper returns the payload directly or under `data`
        setCompany(json?.data ?? json);
      } else {
        setError(json?.error?.message || json?.message || 'Failed to load company.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load company.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleLifecycle = async (action: 'activate' | 'suspend') => {
    if (!id) return;
    setActionLoading(action);
    setStatusMessage(null);
    try {
      const response = await fetch(`/api/companies/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setStatusMessage({
          kind: 'success',
          text: `Company ${action === 'activate' ? 'activated' : 'suspended'} successfully.`,
        });
        await fetchCompany();
      } else {
        const err = await response.json().catch(() => ({}));
        setStatusMessage({
          kind: 'error',
          text: err?.error?.message || err?.message || `Failed to ${action} company.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ kind: 'error', text: `Error: ${err?.message}` });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-silver-mist text-sm">Loading company...</div>;
  }

  if (error || !company) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-rose-800">{error || 'Company not found.'}</p>
          <button
            onClick={fetchCompany}
            className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-rose-700 hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const status = (company.status || 'Active').toUpperCase();
  const statusColor =
    status === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'SUSPENDED'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-slate-100 text-slate-600';

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <Link
        href="/core-hr/entities"
        className="inline-flex items-center gap-1 text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl"
      >
        <ArrowLeft className="w-4 h-4" /> Legal Entities
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cloud dark:border-nebula-purple/20">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <Building2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
              {company.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-mono text-silver-mist">{company.code}</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor}`}>
                {status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status !== 'ACTIVE' && (
            <button
              onClick={() => handleLifecycle('activate')}
              disabled={actionLoading === 'activate'}
              className="flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading === 'activate' ? 'Activating...' : 'Activate'}
            </button>
          )}
          {status !== 'SUSPENDED' && (
            <button
              onClick={() => handleLifecycle('suspend')}
              disabled={actionLoading === 'suspend'}
              className="flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <PauseCircle className="w-4 h-4" />
              {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend'}
            </button>
          )}
        </div>
      </div>

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

      {company._count && (
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">
                {company._count.employees}
              </p>
              <p className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                Employees
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">
                {company._count.departments}
              </p>
              <p className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                Departments
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard title="Contact">
          <DetailRow icon={Mail} label="Email" value={company.email} />
          <DetailRow icon={Phone} label="Phone" value={company.phoneNumber} />
          <DetailRow icon={Globe} label="Website" value={company.website} link />
        </DetailCard>

        <DetailCard title="Address">
          <DetailRow icon={MapPin} label="Street" value={company.address} />
          <DetailRow icon={MapPin} label="City" value={company.city} />
          <DetailRow icon={MapPin} label="State" value={company.state} />
          <DetailRow icon={MapPin} label="Postal Code" value={company.postalCode} />
          <DetailRow icon={MapPin} label="Country" value={company.country} />
        </DetailCard>

        <DetailCard title="Business">
          <DetailRow icon={Building2} label="Industry" value={company.industry} />
          <DetailRow icon={FileText} label="Tax ID / TRN" value={company.taxId} />
          <DetailRow icon={FileText} label="Registration No." value={company.registrationNumber} />
        </DetailCard>

        <DetailCard title="Metadata">
          <DetailRow
            icon={FileText}
            label="Created"
            value={company.createdAt ? new Date(company.createdAt).toLocaleString() : null}
          />
          <DetailRow
            icon={FileText}
            label="Last Updated"
            value={company.updatedAt ? new Date(company.updatedAt).toLocaleString() : null}
          />
        </DetailCard>
      </div>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-5 shadow-sm">
      <h3 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-4">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  link?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-silver-mist mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">{label}</p>
        {value ? (
          link ? (
            <a
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-celestial-indigo hover:underline break-all"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm text-ink-black dark:text-pearl break-all">{value}</p>
          )
        ) : (
          <p className="text-sm text-slate-400">—</p>
        )}
      </div>
    </div>
  );
}
