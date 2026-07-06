/**
 * @reference docs/aura-master-instructions.md
 */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Industry = {
  code: string;
  name: string;
  description: string;
  icon?: string;
};

export default function IndustrySolutionsPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadIndustries() {
      try {
        setLoading(true);
        const res = await fetch('/api/industry');

        if (!res.ok) {
          throw new Error('Failed to fetch industries');
        }

        const data = await res.json();
        setIndustries(data.industries || []);
      } catch (err) {
        setError('Unable to load industry solutions.');
      } finally {
        setLoading(false);
      }
    }

    loadIndustries();
  }, []);

  const filteredIndustries = useMemo(() => {
    return industries.filter((industry) => {
      const value = `${industry.name} ${industry.description}`.toLowerCase();
      return value.includes(search.toLowerCase());
    });
  }, [industries, search]);

  const exportCsv = () => {
    const rows = [
      ['Code', 'Name', 'Description'],
      ...filteredIndustries.map((item) => [item.code, item.name, item.description]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'industry-solutions.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-indigo-500">Industry Solutions</p>
        <h1 className="text-3xl font-bold">Sector Playbooks</h1>
        <p className="text-slate-500 max-w-3xl">
          Jump into verticalized workspaces. Each card routes to the fully built module under
          `/dashboard/&lt;vertical&gt;`.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search industry solutions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm outline-none focus:border-indigo-500"
        />

        <button
          type="button"
          onClick={exportCsv}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Export CSV
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading industry solutions...</p>}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredIndustries.map((industry) => (
            <Link
              key={industry.code}
              href={`/dashboard/${industry.code}`}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:border-indigo-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                  {industry.name}
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40">
                  Vertical
                </span>
              </div>
              <p className="text-sm text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                {industry.description}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && filteredIndustries.length === 0 && (
        <p className="text-sm text-slate-500">No industry solutions found.</p>
      )}
    </div>
  );
}
