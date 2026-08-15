'use client';

import React, { useState } from 'react';
import { Banknote, PieChart, Users, Calendar, FileCheck, Edit, Trash2, Plus } from 'lucide-react';
import { useGrants, useCreateGrant, useUpdateGrant, useDeleteGrant } from '../hooks/queries';
import { CreateEditGrantModal } from '../components/modals/CreateEditGrantModal';

export default function GrantsPage() {
  const { data: grants = [], isLoading } = useGrants();
  const { mutateAsync: createGrant, isPending: isCreating } = useCreateGrant();
  const { mutateAsync: updateGrant, isPending: isUpdating } = useUpdateGrant();
  const { mutateAsync: deleteGrant, isPending: isDeleting } = useDeleteGrant();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrant, setEditingGrant] = useState<any | null>(null);

  const handleCreate = async (data: any) => {
    await createGrant(data);
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    await updateGrant(data);
    setIsModalOpen(false);
    setEditingGrant(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this grant?')) {
      await deleteGrant(id);
    }
  };

  const openEdit = (g: any) => {
    setEditingGrant(g);
    setIsModalOpen(true);
  };

  // Calculate total funding dynamically
  const totalFunding = grants.reduce((sum, g) => sum + Number(g.amount || 0), 0);
  const formattedTotalFunding =
    totalFunding >= 1000000
      ? `$${(totalFunding / 1000000).toFixed(1)}M`
      : `$${(totalFunding / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-500" />
            Research Grants
          </h1>
          <p className="text-slate-500 text-sm">
            Manage grant budgets, salary allocations, and compliance.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
          Total Funding: {formattedTotalFunding}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading grants...</div>
        ) : (
          grants.map((grant: any, i: number) => {
            const budget = Number(grant.amount || 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            });
            const awarded = Number(grant.awardedAmount || 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            });
            const start = grant.startDate
              ? new Date(grant.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : 'TBD';
            const end = grant.endDate
              ? new Date(grant.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : 'TBD';

            return (
              <div
                key={grant.id || i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all group/card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                      {grant.title}
                    </h3>
                    <div className="text-sm font-bold text-indigo-600">
                      PI: {grant.principalInvestigatorId}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                      {grant.fundingAgency}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(grant)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(grant.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase mb-1">
                      Total Budget
                    </div>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {budget}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Timeline</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {start} - {end}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" /> 4 Researchers Funded
                    </div>
                    <button className="text-xs font-bold text-indigo-500 hover:underline">
                      View Team
                    </button>
                  </div>

                  {/* Salary Allocation Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Status</span>
                      <span>{grant.status}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full w-[70%] rounded-full ${
                          grant.status === 'Awarded'
                            ? 'bg-emerald-500'
                            : grant.status === 'Submitted'
                              ? 'bg-indigo-500'
                              : grant.status === 'Closed'
                                ? 'bg-slate-500'
                                : 'bg-amber-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* New Grant Button */}
        <button
          onClick={() => {
            setEditingGrant(null);
            setIsModalOpen(true);
          }}
          className="h-full min-h-[200px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">Register New Grant</span>
        </button>
      </div>

      <CreateEditGrantModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGrant(null);
        }}
        onSubmit={editingGrant ? handleUpdate : handleCreate}
        initialData={editingGrant}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
