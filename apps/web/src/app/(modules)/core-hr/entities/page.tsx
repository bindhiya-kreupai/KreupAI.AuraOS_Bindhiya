'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Layers, MapPin, Search, ArrowRight, RefreshCw } from 'lucide-react';

interface LegalEntity {
  id: string;
  code: string;
  name: string;
  taxId: string | null;
  country: string | null;
  currency: string | null;
  employeeCount: number;
  departmentCount: number;
  locationCount: number;
}

export default function LegalEntitiesPage() {
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchEntities = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '1', limit: '100' });
      if (query) params.set('search', query);
      const response = await fetch(`/api/v1/hr/entities?${params.toString()}`);
      const json = await response.json();
      if (response.ok && json.success && Array.isArray(json.data)) {
        setEntities(json.data);
      } else {
        setError(json?.error?.message || 'Failed to load legal entities.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load legal entities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  useEffect(() => {
    const handle = setTimeout(() => fetchEntities(search.trim() || undefined), 300);
    return () => clearTimeout(handle);
  }, [search, fetchEntities]);

  const totals = useMemo(
    () =>
      entities.reduce(
        (acc, e) => ({
          employees: acc.employees + e.employeeCount,
          departments: acc.departments + e.departmentCount,
          locations: acc.locations + e.locationCount,
        }),
        { employees: 0, departments: 0, locations: 0 }
      ),
    [entities]
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-cloud dark:border-nebula-purple/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest">
            <Building2 className="w-4 h-4" /> Organization Identity
          </div>
          <h1 className="text-3xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
            Legal Entities
          </h1>
          <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
            Manage the legal entities (companies) registered for your tenant, with live employee,
            department, and location counts.
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-sm w-full sm:w-80 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Legal Entities" value={entities.length} color="emerald" />
        <StatCard icon={Users} label="Total Employees" value={totals.employees} color="indigo" />
        <StatCard icon={Layers} label="Departments" value={totals.departments} color="amber" />
        <StatCard icon={MapPin} label="Locations" value={totals.locations} color="blue" />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchEntities(search.trim() || undefined)}
            className="flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-silver-mist text-sm">Loading legal entities...</div>
      ) : entities.length === 0 && !error ? (
        <div className="py-16 text-center">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-ink-black dark:text-pearl">No legal entities</p>
          <p className="text-xs text-silver-mist mt-1">
            Create companies from Master Data to see them here.
          </p>
          <Link
            href="/master-data/companies"
            className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Manage Companies <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {entities.map((entity) => (
            <Link
              key={entity.id}
              href={`/companies/${entity.id}`}
              className="block bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/20 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-ink-black dark:text-pearl text-sm group-hover:text-emerald-600 transition-colors">
                      {entity.name}
                    </p>
                    <p className="text-xs text-silver-mist font-mono">{entity.code}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-silver-mist group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <CountPill label="Employees" value={entity.employeeCount} />
                <CountPill label="Departments" value={entity.departmentCount} />
                <CountPill label="Locations" value={entity.locationCount} />
              </div>
              <div className="mt-4 flex items-center gap-3 text-[11px] text-silver-mist">
                {entity.country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {entity.country}
                  </span>
                )}
                {entity.taxId && <span className="font-mono">TRN: {entity.taxId}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  };
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4 flex items-center gap-3 shadow-sm">
      <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.emerald}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold text-ink-black dark:text-pearl">{value}</p>
      </div>
    </div>
  );
}

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg py-2">
      <p className="text-sm font-bold text-ink-black dark:text-pearl">{value}</p>
      <p className="text-[9px] text-silver-mist uppercase tracking-widest font-semibold">{label}</p>
    </div>
  );
}
