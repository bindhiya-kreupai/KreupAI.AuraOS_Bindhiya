'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Package,
  ArrowRight,
  ArrowLeft,
  User,
  Tag,
  ChevronRight,
  Laptop,
  Smartphone,
  Car,
  Lock,
} from 'lucide-react';
import type {
  Asset,
  AssetCategory,
  AssetStatus,
  AssetCondition,
  AssetCategoryInfo,
} from '@/services/assetManagementService';
import { getAssets, getAssetCategories, returnAsset } from '@/services/assetManagementService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AssetStatus, { bg: string; text: string; border: string }> = {
  Available: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  Assigned: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  'Under Repair': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  Disposed: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-300' },
  'Lost/Stolen': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
};

const CONDITION_STYLES: Record<AssetCondition, string> = {
  Excellent: 'text-emerald-600',
  Good: 'text-sky-600',
  Fair: 'text-amber-600',
  Poor: 'text-orange-600',
  Damaged: 'text-rose-600',
};

function CategoryIcon({ category }: { category: AssetCategory }) {
  const map: Partial<Record<AssetCategory, React.ReactNode>> = {
    Laptop: <Laptop size={14} />,
    'Mobile Phone': <Smartphone size={14} />,
    'Parking Permit': <Car size={14} />,
    Locker: <Lock size={14} />,
    Monitor: <Monitor size={14} />,
    Vehicle: <Car size={14} />,
  };
  return <>{map[category] ?? <Package size={14} />}</>;
}

function StatusBadge({ status }: { status: AssetStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      {status}
    </span>
  );
}

// ── Return Modal ──────────────────────────────────────────────────────────────

function ReturnAssetModal({
  asset,
  onClose,
  onSuccess,
}: {
  asset: Asset;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [condition, setCondition] = useState<AssetCondition>('Good');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    setLoading(true);
    await returnAsset(asset.id, condition, notes);
    setLoading(false);
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Return Asset</h3>
        <p className="text-sm text-slate-500 mb-5">
          {asset.name} ({asset.assetCode})
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Condition on Return
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AssetCondition)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'] as AssetCondition[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Return Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any damage or observations..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReturn}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <ArrowLeft size={14} />}
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Asset Card ────────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  onSelect,
  isSelected,
  onReturn,
}: {
  asset: Asset;
  onSelect: () => void;
  isSelected: boolean;
  onReturn: () => void;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-indigo-400 ring-1 ring-indigo-200 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
            <CategoryIcon category={asset.category} />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400">{asset.assetCode}</p>
            <h3 className="text-sm font-semibold text-slate-800 leading-tight">{asset.name}</h3>
          </div>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Tag size={10} /> {asset.brand} {asset.model}
        </span>
        <span className={`font-medium ${CONDITION_STYLES[asset.condition]}`}>
          {asset.condition}
        </span>
        <span>S/N: {asset.serialNumber}</span>
        <span>Value: ${asset.currentValue.toLocaleString()}</span>
      </div>

      {asset.assignedTo ? (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 mb-3">
          <p className="text-xs text-sky-800 flex items-center gap-1.5">
            <User size={11} />
            <span className="font-medium">{asset.assignedTo.employeeName}</span>
            <span className="text-sky-500">({asset.assignedTo.department})</span>
          </p>
          <p className="text-xs text-sky-500 mt-0.5 pl-4">Since {asset.assignedTo.assignedAt}</p>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mb-3">
          <p className="text-xs text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 size={11} /> Available for assignment
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        {asset.status === 'Assigned' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReturn();
            }}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft size={12} /> Return
          </button>
        ) : asset.status === 'Available' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-xs text-indigo-600 rounded-lg hover:bg-indigo-100"
          >
            <ArrowRight size={12} /> Assign
          </button>
        ) : null}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
        >
          <ChevronRight size={12} /> Details
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const STATUSES: Array<AssetStatus | 'All'> = [
  'All',
  'Available',
  'Assigned',
  'Under Repair',
  'Disposed',
  'Lost/Stolen',
];

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<AssetCategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | 'All'>('All');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [returnAssetTarget, setReturnAssetTarget] = useState<Asset | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [assetRes, catRes] = await Promise.all([
      getAssets({
        search: search || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      }),
      getAssetCategories(),
    ]);
    setAssets(assetRes.assets);
    setTotal(assetRes.total);
    setCategories(catRes);
    setLoading(false);
  }, [search, selectedCategory, selectedStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = {
    total: assets.length,
    available: assets.filter((a) => a.status === 'Available').length,
    assigned: assets.filter((a) => a.status === 'Assigned').length,
    underRepair: assets.filter((a) => a.status === 'Under Repair').length,
    totalValue: assets.reduce((s, a) => s + a.currentValue, 0),
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" /> Asset Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} assets — track assignments, returns, and condition
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <RefreshCw size={16} />
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
              <Plus size={16} /> Add Asset
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-3">
          {[
            {
              label: 'Total Assets',
              value: summary.total,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
            },
            {
              label: 'Available',
              value: summary.available,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            { label: 'Assigned', value: summary.assigned, color: 'text-sky-600', bg: 'bg-sky-50' },
            {
              label: 'Under Repair',
              value: summary.underRepair,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              label: 'Portfolio Value',
              value: `$${summary.totalValue.toLocaleString()}`,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
            },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} rounded-lg p-3`}>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Categories */}
        <aside className="w-56 shrink-0 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Category
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-2 py-1.5 rounded text-sm mb-1 ${selectedCategory === 'All' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm mb-0.5 ${selectedCategory === cat.category ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="flex items-center gap-2 truncate">
                <CategoryIcon category={cat.category} />
                <span className="truncate">{cat.category}</span>
              </span>
              <span className="text-xs text-slate-400 shrink-0">{cat.total}</span>
            </button>
          ))}

          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Status
            </p>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm mb-0.5 ${selectedStatus === st ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Detail Cards */}
          {categories.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Utilization
              </p>
              {categories.map((cat) => (
                <div key={cat.category} className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-slate-700 truncate">{cat.category}</p>
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>
                      {cat.assigned}/{cat.total} assigned
                    </span>
                    <span>{cat.total > 0 ? Math.round((cat.assigned / cat.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${cat.total > 0 ? (cat.assigned / cat.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Asset Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, or serial number..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-slate-400">
                <RefreshCw size={20} className="animate-spin mr-2" /> Loading assets...
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Package size={32} className="mb-2 opacity-40" />
                <p>No assets found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAsset?.id === asset.id}
                    onSelect={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                    onReturn={() => setReturnAssetTarget(asset)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Side Panel */}
        {selectedAsset && (
          <div className="w-72 shrink-0 border-l border-slate-200 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Asset Details</h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                <CategoryIcon category={selectedAsset.category} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{selectedAsset.assetCode}</p>
                <p className="font-semibold text-slate-800 text-sm">{selectedAsset.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              {[
                { label: 'Category', value: selectedAsset.category },
                { label: 'Brand', value: selectedAsset.brand },
                { label: 'Model', value: selectedAsset.model },
                { label: 'Serial No.', value: selectedAsset.serialNumber },
                { label: 'Location', value: selectedAsset.location },
                { label: 'Status', value: <StatusBadge status={selectedAsset.status} /> },
                {
                  label: 'Condition',
                  value: (
                    <span className={CONDITION_STYLES[selectedAsset.condition]}>
                      {selectedAsset.condition}
                    </span>
                  ),
                },
                { label: 'Purchase Date', value: selectedAsset.purchaseDate },
                {
                  label: 'Purchase Cost',
                  value: `$${selectedAsset.purchaseCost.toLocaleString()}`,
                },
                {
                  label: 'Current Value',
                  value: `$${selectedAsset.currentValue.toLocaleString()}`,
                },
                { label: 'Warranty Expiry', value: selectedAsset.warrantyExpiry ?? 'N/A' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">{item.label}</span>
                  <span className="text-slate-800 text-right font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {selectedAsset.assignedTo && (
              <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-xs font-semibold text-sky-700 mb-1 flex items-center gap-1">
                  <User size={12} /> Assigned To
                </p>
                <p className="text-sm font-medium text-sky-800">
                  {selectedAsset.assignedTo.employeeName}
                </p>
                <p className="text-xs text-sky-600">
                  {selectedAsset.assignedTo.employeeCode} — {selectedAsset.assignedTo.department}
                </p>
                <p className="text-xs text-sky-400 mt-0.5">
                  Since {selectedAsset.assignedTo.assignedAt}
                </p>
              </div>
            )}

            {selectedAsset.status === 'Assigned' && (
              <button
                onClick={() => setReturnAssetTarget(selectedAsset)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700"
              >
                <ArrowLeft size={14} /> Process Return
              </button>
            )}
            {selectedAsset.status === 'Available' && (
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                <ArrowRight size={14} /> Assign Asset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {returnAssetTarget && (
        <ReturnAssetModal
          asset={returnAssetTarget}
          onClose={() => setReturnAssetTarget(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
