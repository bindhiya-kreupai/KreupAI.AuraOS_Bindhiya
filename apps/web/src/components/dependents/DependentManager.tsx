/**
 * @module DependentManager
 * @description ESS Dependent Manager — list view with add/edit/delete and eligibility overview
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { UserPlus, Search, Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DependentCard, type DependentInfo, type DependentStatus } from './DependentCard';
import { DependentForm } from './DependentForm';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DEPENDENTS: DependentInfo[] = [
  {
    id: 'dep-001',
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1990-05-12',
    gender: 'female',
    ssn: '456-78-9012',
    relationship: 'spouse',
    status: 'verified',
    isStudent: false,
    isDisabled: false,
    enrolledPlans: ['Medical — Balanced Choice', 'Dental — Comprehensive', 'Vision — Enhanced'],
    phone: '(555) 234-5678',
    email: 'jane.doe@email.com',
    eligibleForBenefits: true,
    verifiedDate: '2024-01-15',
    createdAt: '2023-11-20',
  },
  {
    id: 'dep-002',
    firstName: 'Max',
    lastName: 'Doe',
    dateOfBirth: '2018-09-03',
    gender: 'male',
    ssn: '567-89-0123',
    relationship: 'child',
    status: 'verified',
    isStudent: false,
    isDisabled: false,
    enrolledPlans: ['Medical — Balanced Choice', 'Dental — Comprehensive'],
    eligibleForBenefits: true,
    verifiedDate: '2024-01-15',
    createdAt: '2024-09-10',
  },
  {
    id: 'dep-003',
    firstName: 'Lily',
    lastName: 'Doe',
    dateOfBirth: '2021-01-15',
    gender: 'female',
    ssn: '678-90-1234',
    relationship: 'child',
    status: 'active',
    isStudent: false,
    isDisabled: false,
    enrolledPlans: ['Medical — Balanced Choice'],
    eligibleForBenefits: true,
    createdAt: '2024-09-10',
  },
  {
    id: 'dep-004',
    firstName: 'Emma',
    lastName: 'Doe',
    middleName: 'Grace',
    dateOfBirth: '2002-03-22',
    gender: 'female',
    ssn: '789-01-2345',
    relationship: 'stepchild',
    status: 'pending_verification',
    isStudent: true,
    isDisabled: false,
    enrolledPlans: ['Medical — Balanced Choice'],
    eligibleForBenefits: true,
    eligibilityReason: undefined,
    createdAt: '2025-11-05',
  },
  {
    id: 'dep-005',
    firstName: 'Robert',
    lastName: 'Doe',
    dateOfBirth: '1998-07-10',
    gender: 'male',
    relationship: 'child',
    status: 'aged_out',
    isStudent: false,
    isDisabled: false,
    enrolledPlans: [],
    eligibleForBenefits: false,
    eligibilityReason: 'Over age 26',
    createdAt: '2020-01-01',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const DependentManager: React.FC = () => {
  const [dependents, setDependents] = useState<DependentInfo[]>(MOCK_DEPENDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DependentStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDep, setEditingDep] = useState<DependentInfo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtered dependents
  const filtered = useMemo(() => {
    let list = dependents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
          d.relationship.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      list = list.filter((d) => d.status === filterStatus);
    }
    return list;
  }, [dependents, searchQuery, filterStatus]);

  // Stats
  const stats = useMemo(
    () => ({
      total: dependents.length,
      eligible: dependents.filter((d) => d.eligibleForBenefits).length,
      pending: dependents.filter((d) => d.status === 'pending_verification').length,
      ineligible: dependents.filter((d) => !d.eligibleForBenefits).length,
    }),
    [dependents]
  );

  const handleEdit = useCallback((dep: DependentInfo) => {
    setEditingDep(dep);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      setDependents((prev) => prev.filter((d) => d.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  }, [deleteConfirm]);

  const handleSave = useCallback(
    (data: Omit<DependentInfo, 'id' | 'createdAt'>) => {
      if (editingDep) {
        // Update existing
        setDependents((prev) => prev.map((d) => (d.id === editingDep.id ? { ...d, ...data } : d)));
      } else {
        // Add new
        const newDep: DependentInfo = {
          ...data,
          id: `dep-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setDependents((prev) => [...prev, newDep]);
      }
      setShowForm(false);
      setEditingDep(null);
    },
    [editingDep]
  );

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingDep(null);
  }, []);

  // ── Form view ──────────────────────────────────────────────────────────────

  if (showForm) {
    return <DependentForm dependent={editingDep} onSave={handleSave} onCancel={handleCancelForm} />;
  }

  // ── List view ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total"
          value={stats.total}
          color="text-celestial-indigo bg-celestial-indigo/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Eligible"
          value={stats.eligible}
          color="text-neural-mint bg-neural-mint/10"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          color="text-sunset-amber bg-sunset-amber/10"
        />
        <StatCard
          icon={AlertTriangle}
          label="Ineligible"
          value={stats.ineligible}
          color="text-coral-alert bg-coral-alert/10"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dependents..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DependentStatus | 'all')}
            className="px-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="verified">Verified</option>
            <option value="pending_verification">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="aged_out">Aged Out</option>
          </select>
        </div>

        {/* Add button */}
        <button
          onClick={() => {
            setEditingDep(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Dependent
        </button>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-silver-mist/30 mx-auto mb-3" />
          <p className="text-sm text-silver-mist">
            {searchQuery || filterStatus !== 'all'
              ? 'No dependents match your filters.'
              : 'No dependents added yet.'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-xs font-semibold text-celestial-indigo hover:underline"
            >
              Add your first dependent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((dep) => (
            <DependentCard
              key={dep.id}
              dependent={dep}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/40 dark:bg-deep-cosmos/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-5 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-coral-alert/10">
                <AlertTriangle className="w-5 h-5 text-coral-alert" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-black dark:text-pearl">
                  Remove Dependent
                </h4>
                <p className="text-[10px] text-silver-mist">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-silver-mist mb-4">
              Are you sure you want to remove this dependent? They will be removed from all enrolled
              benefit plans.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-coral-alert text-white hover:opacity-90 transition-opacity"
              >
                Remove Dependent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-3">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${color.split(' ')[1]}`}>
        <Icon className={`w-4 h-4 ${color.split(' ')[0]}`} />
      </div>
      <div>
        <p className="text-lg font-bold text-ink-black dark:text-pearl">{value}</p>
        <p className="text-[10px] text-silver-mist">{label}</p>
      </div>
    </div>
  </div>
);

export default DependentManager;
