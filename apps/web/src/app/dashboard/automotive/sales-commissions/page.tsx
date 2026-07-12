'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Car, TrendingUp, DollarSign, Download, Plus, Search } from 'lucide-react';
import { useAutomotive } from '../hooks/useAutomotive';
import { SalesPersonModal } from '../components/SalesPersonModal';
import { LoadingOverlay } from '../../agriculture/components/LoadingSpinner'; // reuse spinner
import { ToastContainer } from '../../agriculture/components/Toast'; // reuse toast
import type { SalesPerson } from '../types';

export default function SalesCommissionsPage() {
  const {
    salesPeople,
    loading,
    createSalesPerson,
    // Note: The hook/service doesn't expose updateSalesPerson or deleteSalesPerson directly,
    // so we'll mock the updates/deletes in this component for demonstration,
    // or just use createSalesPerson if we only need Add.
    // Actually, let's implement the UI for them anyway.
  } = useAutomotive();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<SalesPerson | null>(null);

  const [localToasts, setLocalToasts] = useState<any[]>([]);

  // Fallback for mocked update/delete since hook doesn't expose it
  const [mockDeletedIds, setMockDeletedIds] = useState<Set<string>>(new Set());

  const addToast = (toast: { type: string; message: string }) => {
    setLocalToasts((prev) => [...prev, { ...toast, id: Date.now().toString() }]);
  };
  const removeToast = (id: string) => {
    setLocalToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const visibleSalesPeople = useMemo(() => {
    let filtered = salesPeople.filter((p) => !mockDeletedIds.has(p.salesPersonId));
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(lowerQuery) ||
          p.lastName.toLowerCase().includes(lowerQuery) ||
          p.department.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered.sort((a, b) => b.performanceMetrics.ytdSales - a.performanceMetrics.ytdSales);
  }, [salesPeople, searchQuery, mockDeletedIds]);

  const handleExportCSV = () => {
    if (visibleSalesPeople.length === 0) {
      addToast({ type: 'warning', message: 'No sales people to export' });
      return;
    }

    const headers = [
      'SalesPerson ID',
      'First Name',
      'Last Name',
      'Department',
      'YTD Sales',
      'YTD Commissions',
      'YTD Units',
    ];
    const csvRows = [headers.join(',')];

    for (const person of visibleSalesPeople) {
      const row = [
        person.salesPersonId,
        `"${person.firstName}"`,
        `"${person.lastName}"`,
        person.department,
        person.performanceMetrics.ytdSales,
        person.performanceMetrics.ytdCommissions,
        person.performanceMetrics.ytdUnits,
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_commissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Exported sales commissions successfully' });
  };

  const handleSavePerson = async (data: Partial<SalesPerson>) => {
    if (editingPerson) {
      // Mocking update since not in hook
      addToast({ type: 'success', message: 'Salesperson updated successfully (Mock)' });
    } else {
      await createSalesPerson({
        ...data,
        employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
        commissionStructureId: 'CS-001',
        hireDate: new Date(),
        performanceMetrics: {
          ytdSales: 0,
          ytdCommissions: 0,
          ytdUnits: 0,
          mtdSales: 0,
          mtdCommissions: 0,
          mtdUnits: 0,
          averageDealSize: 0,
          closingRate: 0,
          customerSatisfactionScore: 100,
          lastReviewDate: new Date(),
        },
      });
      // Toast handled in hook
    }
  };

  const openAddModal = () => {
    setEditingPerson(null);
    setIsModalOpen(true);
  };

  const openEditModal = (person: SalesPerson) => {
    setEditingPerson(person);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this salesperson?')) {
      setMockDeletedIds((prev) => new Set(prev).add(id));
      addToast({ type: 'success', message: 'Salesperson deleted (Mock)' });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && <LoadingOverlay message="Loading sales data..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-500" />
            Sales Commissions
          </h1>
          <p className="text-slate-500 text-sm">Track sales performance and incentive payouts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Salesperson
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 shrink-0">
        {[
          {
            label: 'Total Sales (YTD)',
            val: formatCurrency(
              visibleSalesPeople.reduce((acc, curr) => acc + curr.performanceMetrics.ytdSales, 0)
            ),
            icon: Car,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500',
          },
          {
            label: 'Avg Deal Size',
            val: formatCurrency(
              visibleSalesPeople.length
                ? visibleSalesPeople.reduce(
                    (acc, curr) => acc + curr.performanceMetrics.averageDealSize,
                    0
                  ) / visibleSalesPeople.length
                : 0
            ),
            icon: DollarSign,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500',
          },
          {
            label: 'Total Units (YTD)',
            val: visibleSalesPeople.reduce(
              (acc, curr) => acc + curr.performanceMetrics.ytdUnits,
              0
            ),
            icon: Trophy,
            color: 'text-amber-500',
            bg: 'bg-amber-500',
          },
          {
            label: 'Top Closer',
            val: visibleSalesPeople[0]
              ? `${visibleSalesPeople[0].firstName} ${visibleSalesPeople[0].lastName}`
              : 'N/A',
            icon: TrendingUp,
            color: 'text-rose-500',
            bg: 'bg-rose-500',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${stat.bg}`}></div>
            <div className="flex justify-center mb-3">
              <div
                className={`p-3 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-xl font-bold mb-1">{stat.val}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sales team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex-grow flex flex-col min-h-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="font-bold text-lg">Sales Leaderboard (YTD)</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Salesperson</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Units Sold</th>
                <th className="px-6 py-4">Total Sales</th>
                <th className="px-6 py-4">Commission Est.</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleSalesPeople.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No sales people found.
                  </td>
                </tr>
              ) : (
                visibleSalesPeople.map((person, i) => (
                  <tr
                    key={person.salesPersonId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4 font-bold text-slate-400">#{i + 1}</td>
                    <td className="px-6 py-4 font-bold">
                      {person.firstName} {person.lastName}
                    </td>
                    <td className="px-6 py-4 capitalize">{person.department.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{person.performanceMetrics.ytdUnits}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(person.performanceMetrics.ytdSales)}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {formatCurrency(person.performanceMetrics.ytdCommissions)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(person)}
                          className="text-xs font-bold text-indigo-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(person.salesPersonId)}
                          className="text-xs font-bold text-rose-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SalesPersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePerson}
        person={editingPerson}
      />

      <ToastContainer toasts={localToasts} onClose={removeToast} />
    </div>
  );
}
