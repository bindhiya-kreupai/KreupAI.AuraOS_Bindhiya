'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

const MOCK_VENDORS = [
  {
    id: 1,
    name: 'Office Pro Supplies',
    type: 'Office Supplies',
    contract: '$24,000/yr',
    status: 'Active',
    rating: 4.5,
    contact: 'vendor@officepro.com',
  },
  {
    id: 2,
    name: 'TechServe Solutions',
    type: 'IT Services',
    contract: '$120,000/yr',
    status: 'Active',
    rating: 4.8,
    contact: 'accounts@techserve.io',
  },
  {
    id: 3,
    name: 'CleanCorp Facilities',
    type: 'Facility Management',
    contract: '$36,000/yr',
    status: 'Active',
    rating: 4.2,
    contact: 'ops@cleancorp.com',
  },
  {
    id: 4,
    name: 'SecureGuard Inc.',
    type: 'Security Services',
    contract: '$48,000/yr',
    status: 'Under Review',
    rating: 3.9,
    contact: 'admin@secureguard.com',
  },
  {
    id: 5,
    name: 'PrintMax Media',
    type: 'Printing & Stationery',
    contract: '$8,500/yr',
    status: 'Expired',
    rating: 4.0,
    contact: 'sales@printmax.com',
  },
];

const statusColor: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  Expired: 'bg-red-100 text-red-700',
};

const statusIcon: Record<string, React.ReactNode> = {
  Active: <CheckCircle2 className="w-3 h-3" />,
  'Under Review': <Clock className="w-3 h-3" />,
  Expired: <AlertCircle className="w-3 h-3" />,
};

export default function FinanceVendorsPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_VENDORS.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-indigo-500">Finance</p>
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <p className="text-slate-500 max-w-3xl">
          Onboard vendors, manage contracts, and ensure compliance with procurement rules.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Vendor</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold">Contract Value</th>
              <th className="text-left px-4 py-3 font-semibold">Rating</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-slate-400">{v.contact}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.type}</td>
                <td className="px-4 py-3 font-medium">{v.contract}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{v.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[v.status] || ''}`}
                  >
                    {statusIcon[v.status]} {v.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
