'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

interface FeatureItem {
  /** Display label shown on the card. */
  label: string;
  /** Route slug appended to basePath. Falls back to kebab-cased label. */
  slug?: string;
}

type Feature = string | FeatureItem;

interface ModuleGridProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features: Feature[];
  basePath?: string;
}

export function ModuleGrid({
  title,
  description,
  icon: Icon,
  features,
  basePath,
}: ModuleGridProps) {
  const toKebabCase = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  return (
    <div className="space-y-8 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Header */}
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

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature, i) => {
          // Features may be a plain label (kebab-cased into a slug) or an
          // object with an explicit label + slug so a card can point at a
          // route that does not match its display text.
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
