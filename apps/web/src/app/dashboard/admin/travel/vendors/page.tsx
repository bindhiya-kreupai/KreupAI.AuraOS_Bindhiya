'use client';

import React, { useState } from 'react';
import {
  Plane,
  Hotel,
  Car,
  Plus,
  Search,
  Star,
  MoreVertical,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const MOCK_VENDORS = [
  {
    id: 1,
    name: 'FlyRight Travel Agency',
    type: 'Flight Booking',
    rating: 4.7,
    contracts: 12,
    status: 'Preferred',
    contact: 'bookings@flyright.com',
  },
  {
    id: 2,
    name: 'StayWell Hotels',
    type: 'Hotel Reservations',
    rating: 4.5,
    contracts: 8,
    status: 'Preferred',
    contact: 'corporate@staywell.com',
  },
  {
    id: 3,
    name: 'DriveNow Rentals',
    type: 'Car Rental',
    rating: 4.3,
    contracts: 5,
    status: 'Active',
    contact: 'fleet@drivenow.com',
  },
  {
    id: 4,
    name: 'Global Transfers',
    type: 'Airport Transfers',
    rating: 4.1,
    contracts: 3,
    status: 'Active',
    contact: 'ops@globaltransfers.com',
  },
  {
    id: 5,
    name: 'VisaExpress',
    type: 'Visa Processing',
    rating: 4.6,
    contracts: 15,
    status: 'Preferred',
    contact: 'support@visaexpress.com',
  },
  {
    id: 6,
    name: 'TravelSafe Insurance',
    type: 'Travel Insurance',
    rating: 4.0,
    contracts: 2,
    status: 'Under Review',
    contact: 'claims@travelsafe.com',
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  'Flight Booking': <Plane className="w-4 h-4" />,
  'Hotel Reservations': <Hotel className="w-4 h-4" />,
  'Car Rental': <Car className="w-4 h-4" />,
};

export default function TravelVendorsPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_VENDORS.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-indigo-500">Admin / Travel</p>
          <h1 className="text-3xl font-bold">Travel Vendors & Agencies</h1>
          <p className="text-slate-500">
            Manage travel service providers, contracts, and preferred vendor status.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      <div className="flex items-center gap-3">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  {typeIcons[v.type] || <Plane className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold">{v.name}</h3>
                  <p className="text-xs text-slate-400">{v.type}</p>
                </div>
              </div>
              <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-medium">{v.rating}</span>
              </div>
              <span className="text-slate-400">{v.contracts} contracts</span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  v.status === 'Preferred'
                    ? 'bg-indigo-100 text-indigo-700'
                    : v.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {v.status === 'Preferred' ? (
                  <Star className="w-3 h-3" />
                ) : v.status === 'Active' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {v.status}
              </span>
              <p className="text-xs text-slate-400">{v.contact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
