'use client';

import React, { useState } from 'react';
import { Globe, Plus, Edit2, Trash2, DollarSign, MapPin, Car, Hotel } from 'lucide-react';

const MOCK_RATES = [
  {
    id: 1,
    country: 'United Arab Emirates',
    city: 'Dubai',
    dailyAllowance: '$100',
    hotelLimit: '$250',
    transportLimit: '$50',
    mileageRate: '$0.55/km',
    currency: 'AED',
    lastUpdated: '2024-12-01',
  },
  {
    id: 2,
    country: 'Saudi Arabia',
    city: 'Riyadh',
    dailyAllowance: '$80',
    hotelLimit: '$200',
    transportLimit: '$40',
    mileageRate: '$0.50/km',
    currency: 'SAR',
    lastUpdated: '2024-12-01',
  },
  {
    id: 3,
    country: 'India',
    city: 'Mumbai',
    dailyAllowance: '$50',
    hotelLimit: '$120',
    transportLimit: '$25',
    mileageRate: '$0.30/km',
    currency: 'INR',
    lastUpdated: '2024-11-15',
  },
  {
    id: 4,
    country: 'United Kingdom',
    city: 'London',
    dailyAllowance: '$120',
    hotelLimit: '$350',
    transportLimit: '$60',
    mileageRate: '$0.65/km',
    currency: 'GBP',
    lastUpdated: '2024-12-01',
  },
  {
    id: 5,
    country: 'United States',
    city: 'New York',
    dailyAllowance: '$110',
    hotelLimit: '$300',
    transportLimit: '$55',
    mileageRate: '$0.67/km',
    currency: 'USD',
    lastUpdated: '2024-12-01',
  },
  {
    id: 6,
    country: 'Bahrain',
    city: 'Manama',
    dailyAllowance: '$75',
    hotelLimit: '$180',
    transportLimit: '$35',
    mileageRate: '$0.45/km',
    currency: 'BHD',
    lastUpdated: '2024-11-20',
  },
];

export default function TravelRatesPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_RATES.filter(
    (r) =>
      r.country.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-indigo-500">Admin / Travel</p>
          <h1 className="text-3xl font-bold">Per Diem & Mileage Rates</h1>
          <p className="text-slate-500">
            Configure daily allowances, hotel limits, and transport rates by location.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Rate
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Countries Covered',
            value: new Set(MOCK_RATES.map((r) => r.country)).size,
            icon: Globe,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Avg Daily Allowance',
            value: '$89',
            icon: DollarSign,
            color: 'text-green-600 bg-green-50',
          },
          {
            label: 'Avg Hotel Limit',
            value: '$233',
            icon: Hotel,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Avg Mileage',
            value: '$0.52/km',
            icon: Car,
            color: 'text-purple-600 bg-purple-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by country or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Country / City</th>
              <th className="text-left px-4 py-3 font-semibold">Currency</th>
              <th className="text-left px-4 py-3 font-semibold">Daily Allowance</th>
              <th className="text-left px-4 py-3 font-semibold">Hotel Limit</th>
              <th className="text-left px-4 py-3 font-semibold">Transport Limit</th>
              <th className="text-left px-4 py-3 font-semibold">Mileage Rate</th>
              <th className="text-left px-4 py-3 font-semibold">Updated</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.country}</p>
                  <p className="text-xs text-slate-400">{r.city}</p>
                </td>
                <td className="px-4 py-3">{r.currency}</td>
                <td className="px-4 py-3 font-medium">{r.dailyAllowance}</td>
                <td className="px-4 py-3">{r.hotelLimit}</td>
                <td className="px-4 py-3">{r.transportLimit}</td>
                <td className="px-4 py-3">{r.mileageRate}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.lastUpdated}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
