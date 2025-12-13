/**
 * @reference docs/aura-master-instructions.md
 */
"use client";

import Link from "next/link";

const verticals = [
  { title: "Manufacturing", slug: "manufacturing", blurb: "Shop-floor safety, plant maintenance, and production analytics." },
  { title: "Healthcare", slug: "healthcare", blurb: "Credentialing, nurse rostering, and compliance for care teams." },
  { title: "Retail", slug: "retail", blurb: "Store operations, seasonal hiring, and commissions." },
  { title: "Education", slug: "education", blurb: "Faculty tenure, adjunct management, and research grants." },
  { title: "Government", slug: "government", blurb: "Civil service grades, security clearance, and pensions." },
  { title: "Agriculture", slug: "agriculture", blurb: "Crop cycles, seasonal labor, and housing management." },
  { title: "Mining", slug: "mining", blurb: "Camp logistics, hazard pay, and FIFO management." },
  { title: "Hospitality", slug: "hospitality", blurb: "Events, housekeeping, and tip management." },
  { title: "Automotive", slug: "automotive", blurb: "Technician rostering, service lanes, and parts inventory." },
  { title: "Aviation", slug: "aviation", blurb: "Crew scheduling, ground ops, and compliance." },
  { title: "Maritime", slug: "maritime", blurb: "Vessel crewing, port operations, and offshore compliance." },
  { title: "Nonprofit", slug: "nonprofit", blurb: "Volunteer management, donor relations, and field deployment." },
  { title: "Logistics", slug: "logistics", blurb: "Fleet safety, driver scheduling, and warehouse staffing." },
  { title: "Collaboration", slug: "collaboration", blurb: "Vertical collaboration suite under industry menu." },
];

export default function IndustrySolutionsPage() {
  return (
    <div className="space-y-8 pb-10 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-indigo-500">Industry Solutions</p>
        <h1 className="text-3xl font-bold">Sector Playbooks</h1>
        <p className="text-slate-500 max-w-3xl">
          Jump into verticalized workspaces. Each card routes to the fully built module under
          `/dashboard/&lt;vertical&gt;`.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {verticals.map((v) => (
          <Link
            key={v.slug}
            href={`/dashboard/${v.slug}`}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:border-indigo-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">{v.title}</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40">
                Vertical
              </span>
            </div>
            <p className="text-sm text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              {v.blurb}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
