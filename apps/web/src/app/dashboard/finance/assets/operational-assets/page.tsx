'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Wrench,
  Wifi,
  Box,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { FinancialAssetService, exportToCsv } from '../../services';
import { ToastContainer, useToast } from '../../components/Toast';

type AssetCategory = 'all' | 'it-accessories' | 'office-supplies' | 'tools' | 'maintenance';
type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order';

interface OperationalAsset {
  id: string;
  name: string;
  category: 'it-accessories' | 'office-supplies' | 'tools' | 'maintenance';
  sku: string;
  quantity: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  status: StockStatus;
}

interface AssetFormData {
  name: string;
  category: 'it-accessories' | 'office-supplies' | 'tools' | 'maintenance';
  sku: string;
  quantity: string;
  reorderPoint: string;
  unitCost: string;
  location: string;
  supplier: string;
}

export default function OperationalAssetsPage() {
  const [filter, setFilter] = useState<AssetCategory>('all');
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<OperationalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FinancialAssetService.getAssets();
      const mapped: OperationalAsset[] = (data ?? []).map((a: any) => {
        const quantity = Number(a.quantity ?? 0);
        const unitCost = Number(a.unitCost ?? 0);
        return {
          id: String(a.id ?? ''),
          name: String(a.assetName ?? a.name ?? ''),
          category: (a.category ?? 'it-accessories') as OperationalAsset['category'],
          sku: String(a.serialNumber ?? a.sku ?? ''),
          quantity,
          reorderPoint: Number(a.reorderPoint ?? 0),
          unitCost,
          totalValue: Number(a.totalValue ?? quantity * unitCost),
          location: String(a.location ?? ''),
          supplier: String(a.supplier ?? ''),
          lastRestocked: String(
            a.lastRestocked ?? a.updatedAt ?? new Date().toISOString().split('T')[0]
          ),
          status: (a.status ?? 'in-stock') as StockStatus,
        };
      });
      setAssets(mapped);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: 'it-accessories',
    sku: '',
    quantity: '',
    reorderPoint: '',
    unitCost: '',
    location: '',
    supplier: '',
  });

  const filteredAssets = filter === 'all' ? assets : assets.filter((a) => a.category === filter);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.sku ||
      !formData.quantity ||
      !formData.reorderPoint ||
      !formData.unitCost ||
      !formData.location ||
      !formData.supplier
    ) {
      showToast('warning', 'Please fill in all required fields.');
      return;
    }

    const payload = {
      assetName: formData.name,
      assetType: 'operational',
      category: formData.category,
      serialNumber: formData.sku,
      quantity: Number(formData.quantity),
      reorderPoint: Number(formData.reorderPoint),
      unitCost: Number(formData.unitCost),
      location: formData.location,
      supplier: formData.supplier,
      status: 'active',
    };

    try {
      setSaving(true);
      await FinancialAssetService.createAsset(payload as any);
      await load();
      showToast('success', 'Asset created.');
      setShowModal(false);
      setFormData({
        name: '',
        category: 'it-accessories',
        sku: '',
        quantity: '',
        reorderPoint: '',
        unitCost: '',
        location: '',
        supplier: '',
      });
    } catch (error: any) {
      showToast('error', error?.message || 'Failed to create asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (assets.length === 0) {
      showToast('info', 'No items to export.');
      return;
    }
    exportToCsv(
      'operational-assets',
      assets.map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        sku: a.sku,
        quantity: a.quantity,
        reorderPoint: a.reorderPoint,
        unitCost: a.unitCost,
        totalValue: a.totalValue,
        location: a.location,
        supplier: a.supplier,
        lastRestocked: a.lastRestocked,
        status: a.status,
      }))
    );
    showToast('success', 'Exported to CSV.');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'it-accessories':
        return <Wifi className="w-5 h-5" />;
      case 'office-supplies':
        return <Package className="w-5 h-5" />;
      case 'tools':
        return <Wrench className="w-5 h-5" />;
      case 'maintenance':
        return <Box className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'it-accessories':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'office-supplies':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'tools':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'maintenance':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStockStatus = (asset: OperationalAsset): StockStatus => {
    if (asset.quantity === 0) return 'out-of-stock';
    if (asset.quantity <= asset.reorderPoint) return 'low-stock';
    return 'in-stock';
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case 'in-stock':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'low-stock':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'out-of-stock':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'on-order':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="w-4 h-4" />;
      case 'low-stock':
      case 'out-of-stock':
        return <AlertTriangle className="w-4 h-4" />;
      case 'on-order':
        return <ShoppingCart className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const totalValue = assets.reduce((sum, a) => sum + a.totalValue, 0);
  const totalItems = assets.reduce((sum, a) => sum + a.quantity, 0);
  const lowStockCount = assets.filter((a) => getStockStatus(a) === 'low-stock').length;
  const outOfStockCount = assets.filter((a) => getStockStatus(a) === 'out-of-stock').length;

  const stats = [
    {
      label: 'Total Inventory Value',
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      trend: 'Current',
    },
    {
      label: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'text-blue-600',
      trend: `${assets.length} SKUs`,
    },
    {
      label: 'Low Stock Items',
      value: lowStockCount,
      icon: AlertTriangle,
      color: 'text-amber-600',
      trend: 'Needs Reorder',
    },
    {
      label: 'Out of Stock',
      value: outOfStockCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      trend: 'Critical',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-500" />
            Operational Assets
          </h1>
          <p className="text-slate-500 text-sm">
            Manage inventory of operational supplies and consumables
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500">{stat.trend}</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or supplier..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('all')}
          >
            All Items
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'it-accessories'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('it-accessories')}
          >
            IT Accessories
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'office-supplies'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('office-supplies')}
          >
            Office Supplies
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'tools'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('tools')}
          >
            Tools
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'maintenance'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('maintenance')}
          >
            Maintenance
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Item Name</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Reorder Point</th>
                    <th className="p-4">Unit Cost</th>
                    <th className="p-4">Total Value</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Last Restocked</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssets.map((asset) => {
                    const status = getStockStatus(asset);
                    const needsReorder = asset.quantity <= asset.reorderPoint;

                    return (
                      <tr
                        key={asset.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${needsReorder ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getCategoryColor(asset.category)}`}>
                              {getCategoryIcon(asset.category)}
                            </div>
                            <div>
                              <div className="font-bold">{asset.name}</div>
                              <div className="text-xs text-slate-500">{asset.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-500">{asset.sku}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getCategoryColor(asset.category)}`}
                          >
                            {asset.category.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${needsReorder ? 'text-amber-600 dark:text-amber-400' : ''}`}
                            >
                              {asset.quantity}
                            </span>
                            {needsReorder && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {asset.reorderPoint}
                        </td>
                        <td className="p-4 font-mono">${asset.unitCost.toFixed(2)}</td>
                        <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${asset.totalValue.toFixed(2)}
                        </td>
                        <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                          {asset.location}
                        </td>
                        <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                          {asset.supplier}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {new Date(asset.lastRestocked).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(status)} w-fit`}
                          >
                            {getStatusIcon(status)}
                            <span>{status.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Restock"
                            >
                              <RefreshCw className="w-4 h-4 text-emerald-500" />
                            </button>
                            <button
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Plus className="w-6 h-6 text-indigo-500" />
                  Add New Inventory Item
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add a new item to operational inventory
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
                  <Package className="w-5 h-5" />
                  Item Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., USB-C Cables"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="it-accessories">IT Accessories</option>
                      <option value="office-supplies">Office Supplies</option>
                      <option value="tools">Tools</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., USB-C-3M-001"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
                  <BarChart3 className="w-5 h-5" />
                  Inventory Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="e.g., 45"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Reorder Point *
                    </label>
                    <input
                      type="number"
                      name="reorderPoint"
                      value={formData.reorderPoint}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="e.g., 20"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Unit Cost ($) *
                    </label>
                    <input
                      type="number"
                      name="unitCost"
                      value={formData.unitCost}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 12.50"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
                  <ShoppingCart className="w-5 h-5" />
                  Location & Supplier
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., IT Storage Room A"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Supplier *
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Tech Supply Co"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
