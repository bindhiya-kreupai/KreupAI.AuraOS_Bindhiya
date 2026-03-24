'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, DollarSign, Clock, Users } from 'lucide-react';

const MOCK_POLICIES = [
  {
    id: 1,
    name: 'Standard Domestic',
    scope: 'All Employees',
    flightClass: 'Economy',
    hotelLimit: '$150/night',
    mealLimit: '$50/day',
    advanceBooking: '7 days',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Standard International',
    scope: 'All Employees',
    flightClass: 'Economy',
    hotelLimit: '$200/night',
    mealLimit: '$75/day',
    advanceBooking: '14 days',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Executive Domestic',
    scope: 'Directors+',
    flightClass: 'Business',
    hotelLimit: '$300/night',
    mealLimit: '$100/day',
    advanceBooking: '3 days',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Executive International',
    scope: 'Directors+',
    flightClass: 'Business',
    hotelLimit: '$400/night',
    mealLimit: '$150/day',
    advanceBooking: '7 days',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Client Visit',
    scope: 'Sales Team',
    flightClass: 'Business',
    hotelLimit: '$250/night',
    mealLimit: '$80/day',
    advanceBooking: '5 days',
    status: 'Draft',
  },
];

export default function TravelPoliciesPage() {
  const [policies] = useState(MOCK_POLICIES);

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-indigo-500">Admin / Travel</p>
          <h1 className="text-3xl font-bold">Travel Policies</h1>
          <p className="text-slate-500">
            Configure travel rules, limits, and approval thresholds by employee group.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> New Policy
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Active Policies',
            value: policies.filter((p) => p.status === 'Active').length,
            icon: ShieldCheck,
            color: 'text-green-600 bg-green-50',
          },
          { label: 'Employee Groups', value: '3', icon: Users, color: 'text-blue-600 bg-blue-50' },
          {
            label: 'Avg Hotel Limit',
            value: '$260',
            icon: DollarSign,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Advance Booking',
            value: '7 days avg',
            icon: Clock,
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

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Policy Name</th>
              <th className="text-left px-4 py-3 font-semibold">Scope</th>
              <th className="text-left px-4 py-3 font-semibold">Flight Class</th>
              <th className="text-left px-4 py-3 font-semibold">Hotel Limit</th>
              <th className="text-left px-4 py-3 font-semibold">Meal Limit</th>
              <th className="text-left px-4 py-3 font-semibold">Advance Booking</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {policies.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.scope}</td>
                <td className="px-4 py-3">{p.flightClass}</td>
                <td className="px-4 py-3">{p.hotelLimit}</td>
                <td className="px-4 py-3">{p.mealLimit}</td>
                <td className="px-4 py-3">{p.advanceBooking}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {p.status}
                  </span>
                </td>
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
