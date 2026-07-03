'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

interface FeatureItem {
  label: string;
  slug?: string;
}

type Feature = string | FeatureItem;

interface ModuleGridProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features: Feature[];
  basePath?: string;
  showControls?: boolean;
}

export function ModuleGrid({
  title,
  description,
  icon: Icon,
  features,
  basePath,
  showControls = false,
}: ModuleGridProps) {
  const [search, setSearch] = React.useState('');

  const toKebabCase = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  const filteredFeatures = features.filter((feature) => {
    const label = typeof feature === 'string' ? feature : feature.label;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const exportCsv = () => {
    const rows = [
      ['Feature'],
      ...filteredFeatures.map((feature) => {
        const label = typeof feature === 'string' ? feature : feature.label;
        return [label];
      }),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-features.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {Icon ? (
              <Icon className="w-8 h-8 text-indigo-500" />
            ) : (
              <LayoutGrid className="w-8 h-8 text-indigo-500" />
            )}
            {title}
          </h1>
          <p className="text-slate-500 text-lg mt-1">{description}</p>
        </div>
      </div>

      {showControls && (
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()} modules...`}
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFeatures.map((feature, i) => {
          const label = typeof feature === 'string' ? feature : feature.label;
          const slug =
            typeof feature === 'string'
              ? toKebabCase(feature)
              : (feature.slug ?? toKebabCase(feature.label));

          const link = basePath ? `${basePath}/${slug}` : slug;

          return (
            <Link
              key={i}
              href={link}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="mb-4 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
                <LayoutGrid className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>

              <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                {label}
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Access and manage {label.toLowerCase()} settings and records.
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-600">
                Open Module <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
