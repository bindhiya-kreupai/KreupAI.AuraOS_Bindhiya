/**
 * @reference docs/aura-master-instructions.md
 */
"use client";

import Link from "next/link";
import {
  Bell,
  FileText,
  GitBranch,
  Globe2,
  Heart,
  Key,
  Layers,
  Network,
  Paintbrush,
  Plane,
  Shield,
  ShieldCheck,
  Upload,
  Workflow,
  Zap,
} from "lucide-react";

const adminSpaces = [
  {
    title: "Master Data",
    href: "/dashboard/admin/master-data",
    description: "Canonical lists: companies, locations, job families, grades, cost centers, languages, statutory rules.",
    icon: Layers,
  },
  {
    title: "Integrations",
    href: "/dashboard/admin/integrations",
    description: "App directory, webhook manager, and API marketplace configuration.",
    icon: Network,
  },
  {
    title: "Workflows",
    href: "/dashboard/admin/workflows/designer",
    description: "Tenant-wide workflow blueprints, routing rules, and approvals.",
    icon: Workflow,
  },
  {
    title: "AI & Automation",
    href: "/dashboard/admin/ai/workflows",
    description: "Global AI policies, copilots, and prediction settings.",
    icon: Zap,
  },
  {
    title: "Compliance & Audit",
    href: "/dashboard/admin/compliance/audit",
    description: "Audit trails, data retention, and policy acknowledgements.",
    icon: ShieldCheck,
  },
  {
    title: "Documents & Stationery",
    href: "/dashboard/admin/documents",
    description: "Templates, ID cards, and branded stationery governance.",
    icon: FileText,
  },
  {
    title: "System Health",
    href: "/dashboard/admin/system/health",
    description: "Platform diagnostics, queues, schedulers, and background jobs.",
    icon: Heart,
  },
  {
    title: "Localization",
    href: "/dashboard/admin/system/localization",
    description: "Locale, timezone, currency, and internationalization defaults.",
    icon: Globe2,
  },
  {
    title: "Notifications",
    href: "/dashboard/admin/system/notifications",
    description: "Email/SMS/push channels, templates, and delivery policies.",
    icon: Bell,
  },
  {
    title: "Security & Access",
    href: "/dashboard/admin/master-data/roles-permissions",
    description: "Roles, permissions, SSO/MFA enforcement, and session policies.",
    icon: Shield,
  },
  {
    title: "Travel Operations",
    href: "/dashboard/admin/travel",
    description: "Travel policy defaults, rates, and integrations.",
    icon: Plane,
  },
  {
    title: "Import / Export",
    href: "/dashboard/admin/system/import-export",
    description: "Bulk uploads, data pipelines, and backup/restore jobs.",
    icon: GitBranch,
  },
  {
    title: "API Keys",
    href: "/dashboard/admin/system/api-keys",
    description: "Manage API keys, scopes, and usage monitoring.",
    icon: Key,
  },
  {
    title: "Branding",
    href: "/dashboard/admin/system/branding",
    description: "Customize logo, colors, favicon, and white-label settings.",
    icon: Paintbrush,
  },
  {
    title: "Permission Matrix",
    href: "/dashboard/admin/system/permissions",
    description: "Role-based permission grid with granular module access control.",
    icon: Shield,
  },
  {
    title: "Data Import Wizard",
    href: "/dashboard/admin/system/data-import",
    description: "Step-by-step wizard for importing employee data from CSV/Excel.",
    icon: Upload,
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 pb-10 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-indigo-500">Administration</p>
        <h1 className="text-3xl font-bold">Tenant Control Center</h1>
        <p className="text-slate-500 max-w-3xl">
          Configure master data, integrations, AI/automation policies, and platform operations.
          Each area below links to its detailed console.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {adminSpaces.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:border-indigo-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-500">Admin</p>
                  <h2 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
