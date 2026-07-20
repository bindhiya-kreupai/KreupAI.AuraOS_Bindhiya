'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Car, TrendingUp, DollarSign, Plus, X } from 'lucide-react';

type Commission = {
  id: string;
  rank: number;
  salesperson: string;
  unitsSold: number;
  grossProfit: number;
  commission: number;
};

export default function SalesCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    rank: '',
    salesperson: '',
    unitsSold: '',
    grossProfit: '',
    commission: '',
  });

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/industry-automotive/sales-commissions');
      const data = await res.json();
      setCommissions(data.commissions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, []);

  const totalUnits = useMemo(
    () => commissions.reduce((sum, item) => sum + item.unitsSold, 0),
    [commissions]
  );

  const totalGrossProfit = useMemo(
    () => commissions.reduce((sum, item) => sum + item.grossProfit, 0),
    [commissions]
  );

  const totalCommission = useMemo(
    () => commissions.reduce((sum, item) => sum + item.commission, 0),
    [commissions]
  );

  const topCloser = commissions.length > 0 ? commissions[0].salesperson : '-';

  const formatMoney = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const saveCommission = async () => {
    if (
      !form.rank ||
      !form.salesperson ||
      !form.unitsSold ||
      !form.grossProfit ||
      !form.commission
    ) {
      alert('Please fill all fields.');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/industry-automotive/sales-commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rank: Number(form.rank),
        salesperson: form.salesperson,
        unitsSold: Number(form.unitsSold),
        grossProfit: Number(form.grossProfit),
        commission: Number(form.commission),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      alert('Failed to save commission.');
      return;
    }

    setShowModal(false);
    setForm({
      rank: '',
      salesperson: '',
      unitsSold: '',
      grossProfit: '',
      commission: '',
    });

    await loadCommissions();
  };

  const stats = [
    {
      label: 'Total Sales',
      val: totalUnits.toString(),
      icon: Car,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500',
    },
    {
      label: 'Gross Profit',
      val: formatMoney(totalGrossProfit),
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500',
    },
    {
      label: 'Commission Pool',
      val: formatMoney(totalCommission),
      icon: Trophy,
      color: 'text-amber-500',
      bg: 'bg-amber-500',
    },
    {
      label: 'Top Closer',
      val: topCloser,
      icon: TrendingUp,
      color: 'text-rose-500',
      bg: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-500" />
            Sales Commissions
          </h1>
          <p className="text-slate-500 text-sm">Track sales performance and incentive payouts.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Commission
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${stat.bg}`} />
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.val}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg">Sales Leaderboard</h3>
        </div>

        {loading && <div className="p-6 text-sm text-slate-500">Loading sales commissions...</div>}

        {!loading && commissions.length === 0 && (
          <div className="p-6 text-sm text-slate-500 text-center">No sales commissions found.</div>
        )}

        {!loading && commissions.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Salesperson</th>
                <th className="px-6 py-4">Units Sold</th>
                <th className="px-6 py-4">Gross Profit</th>
                <th className="px-6 py-4 text-right">Commission Est.</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {commissions.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold text-slate-400">#{person.rank}</td>
                  <td className="px-6 py-4 font-bold">{person.salesperson}</td>
                  <td className="px-6 py-4">{person.unitsSold}</td>
                  <td className="px-6 py-4">{formatMoney(person.grossProfit)}</td>
                  <td className="px-6 py-4 font-bold text-right text-emerald-600">
                    {formatMoney(person.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Sales Commission</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Rank"
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Salesperson"
                value={form.salesperson}
                onChange={(e) => setForm({ ...form, salesperson: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Units Sold"
                value={form.unitsSold}
                onChange={(e) => setForm({ ...form, unitsSold: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Gross Profit"
                value={form.grossProfit}
                onChange={(e) => setForm({ ...form, grossProfit: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Commission"
                value={form.commission}
                onChange={(e) => setForm({ ...form, commission: e.target.value })}
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border font-bold"
              >
                Cancel
              </button>

              <button
                onClick={saveCommission}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Commission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
