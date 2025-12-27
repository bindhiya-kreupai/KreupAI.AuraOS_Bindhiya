'use client';

/**
 * @page Asset Management
 * @description Comprehensive asset management with assignment tracking, maintenance, and depreciation
 * @project AURA HCM Platform
 */

import React, { useState, useRef } from 'react';
import { DataPage } from '@aura/ui';
import {
  Monitor,
  Laptop,
  Smartphone,
  Car,
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  FileText,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

// ========================================
// TYPES
// ========================================

interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  description?: string;
  category: 'COMPUTER' | 'FURNITURE' | 'VEHICLE' | 'MOBILE' | 'EQUIPMENT' | 'OTHER';
  assetType: string;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  brand?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number;
  salvageValue?: number;
  locationId?: string;
  location?: {
    id: string;
    name: string;
  };
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_REPAIR' | 'RETIRED' | 'DISPOSED';
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyProvider?: string;
  currentEmployeeId?: string;
  currentAssignedAt?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceInterval?: number;
  tags?: string[];
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  total: number;
  available: number;
  assigned: number;
  inRepair: number;
  retired: number;
  categoryBreakdown: Array<{ category: string; _count: number }>;
  upcomingMaintenance: number;
  expiringWarranty: number;
}

// ========================================
// CONSTANTS
// ========================================

const ASSET_CATEGORIES = [
  { value: 'COMPUTER', label: 'Computer', icon: Monitor, color: 'bg-blue-100 text-blue-600' },
  { value: 'FURNITURE', label: 'Furniture', icon: Package, color: 'bg-purple-100 text-purple-600' },
  { value: 'VEHICLE', label: 'Vehicle', icon: Car, color: 'bg-green-100 text-green-600' },
  { value: 'MOBILE', label: 'Mobile', icon: Smartphone, color: 'bg-pink-100 text-pink-600' },
  { value: 'EQUIPMENT', label: 'Equipment', icon: Wrench, color: 'bg-orange-100 text-orange-600' },
  { value: 'OTHER', label: 'Other', icon: Package, color: 'bg-gray-100 text-gray-600' },
];

const ASSET_STATUS = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-700' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'IN_REPAIR', label: 'In Repair', color: 'bg-amber-100 text-amber-700' },
  { value: 'RETIRED', label: 'Retired', color: 'bg-gray-100 text-gray-700' },
  { value: 'DISPOSED', label: 'Disposed', color: 'bg-red-100 text-red-700' },
];

const CONDITION_OPTIONS = [
  { value: 'EXCELLENT', label: 'Excellent', color: 'text-green-600' },
  { value: 'GOOD', label: 'Good', color: 'text-blue-600' },
  { value: 'FAIR', label: 'Fair', color: 'text-amber-600' },
  { value: 'POOR', label: 'Poor', color: 'text-red-600' },
];

// ========================================
// MAIN COMPONENT
// ========================================

export default function AssetManagementPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // ========================================
  // CATEGORY FILTER PILLS
  // ========================================

  const CategoryFilters = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => setSelectedCategory(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedCategory === null
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <Package className="w-4 h-4" />
        All Assets
        {dashboardStats && <span className="ml-1">({dashboardStats.total})</span>}
      </button>
      {ASSET_CATEGORIES.map((category) => {
        const Icon = category.icon;
        const count = dashboardStats?.categoryBreakdown.find((c) => c.category === category.value)?._count || 0;
        return (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.value
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.label}
            <span className="ml-1">({count})</span>
          </button>
        );
      })}
    </div>
  );

  // ========================================
  // DASHBOARD STATS CARDS
  // ========================================

  const DashboardStatsCards = () => {
    if (!dashboardStats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Assets */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-90">Total Assets</div>
            <Package className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.total}</div>
        </div>

        {/* Available */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-90">Available</div>
            <CheckCircle className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.available}</div>
        </div>

        {/* Assigned */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-90">Assigned</div>
            <User className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.assigned}</div>
        </div>

        {/* In Repair */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-90">In Repair</div>
            <Wrench className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold">{dashboardStats.inRepair}</div>
        </div>
      </div>
    );
  };

  // ========================================
  // ALERT BANNERS
  // ========================================

  const AlertBanners = () => {
    if (!dashboardStats) return null;

    return (
      <div className="space-y-3 mb-6">
        {/* Upcoming Maintenance */}
        {dashboardStats.upcomingMaintenance > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-amber-900 dark:text-amber-100">
                {dashboardStats.upcomingMaintenance} Maintenance{dashboardStats.upcomingMaintenance > 1 ? 's' : ''} Scheduled
              </div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                {dashboardStats.upcomingMaintenance} asset{dashboardStats.upcomingMaintenance > 1 ? 's have' : ' has'} maintenance scheduled in the next 7 days
              </div>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
              View Schedule
            </button>
          </div>
        )}

        {/* Expiring Warranty */}
        {dashboardStats.expiringWarranty > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-900 dark:text-red-100">
                {dashboardStats.expiringWarranty} Warrant{dashboardStats.expiringWarranty > 1 ? 'ies' : 'y'} Expiring Soon
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                {dashboardStats.expiringWarranty} asset{dashboardStats.expiringWarranty > 1 ? 's have warranties' : ' has warranty'} expiring in the next 30 days
              </div>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              View Details
            </button>
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = [
    {
      key: 'assetCode',
      label: 'Asset Code',
      sortable: true,
      render: (row: Asset) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            ASSET_CATEGORIES.find((c) => c.value === row.category)?.color || 'bg-gray-100 text-gray-600'
          }`}>
            {React.createElement(
              ASSET_CATEGORIES.find((c) => c.value === row.category)?.icon || Package,
              { className: 'w-5 h-5' }
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{row.assetCode}</div>
            <div className="text-xs text-slate-500">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'assetName',
      label: 'Asset Name',
      sortable: true,
      render: (row: Asset) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{row.assetName}</div>
          <div className="text-xs text-slate-500">{row.assetType}</div>
          {row.serialNumber && (
            <div className="text-xs text-slate-400 font-mono">SN: {row.serialNumber}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: Asset) => {
        const statusConfig = ASSET_STATUS.find((s) => s.value === row.status);
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-700'}`}>
            {statusConfig?.label || row.status}
          </span>
        );
      },
    },
    {
      key: 'condition',
      label: 'Condition',
      sortable: true,
      render: (row: Asset) => {
        if (!row.condition) return <span className="text-slate-400 text-sm">-</span>;
        const conditionConfig = CONDITION_OPTIONS.find((c) => c.value === row.condition);
        return (
          <span className={`font-medium ${conditionConfig?.color || 'text-slate-600'}`}>
            {conditionConfig?.label || row.condition}
          </span>
        );
      },
    },
    {
      key: 'location',
      label: 'Location',
      sortable: false,
      render: (row: Asset) => (
        <div className="flex items-center gap-2">
          {row.location ? (
            <>
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm">{row.location.name}</span>
            </>
          ) : (
            <span className="text-slate-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'purchasePrice',
      label: 'Value',
      sortable: true,
      render: (row: Asset) => (
        <div>
          {row.currentValue !== undefined ? (
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                ${row.currentValue.toLocaleString()}
              </div>
              {row.purchasePrice && row.purchasePrice !== row.currentValue && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <TrendingDown className="w-3 h-3" />
                  <span>from ${row.purchasePrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'warrantyEndDate',
      label: 'Warranty',
      sortable: true,
      render: (row: Asset) => {
        if (!row.warrantyEndDate) return <span className="text-slate-400 text-sm">-</span>;

        const warrantyEnd = new Date(row.warrantyEndDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
          return (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <div>
                <div className="text-sm font-semibold">Expired</div>
                <div className="text-xs">{warrantyEnd.toLocaleDateString()}</div>
              </div>
            </div>
          );
        }

        if (daysUntilExpiry <= 30) {
          return (
            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="w-4 h-4" />
              <div>
                <div className="text-sm font-semibold">{daysUntilExpiry} days</div>
                <div className="text-xs">{warrantyEnd.toLocaleDateString()}</div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <div>
              <div className="text-sm font-semibold">Valid</div>
              <div className="text-xs">{warrantyEnd.toLocaleDateString()}</div>
            </div>
          </div>
        );
      },
    },
  ];

  // ========================================
  // FORM RENDERER
  // ========================================

  const renderForm = (data: Partial<Asset>, onChange: (field: string, value: any) => void) => {
    return (
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Asset Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.assetCode || ''}
                onChange={(e) => onChange('assetCode', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="AST-001"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.assetName || ''}
                onChange={(e) => onChange('assetName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="MacBook Pro 16 inch"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={data.category || 'COMPUTER'}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                required
              >
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Asset Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.assetType || ''}
                onChange={(e) => onChange('assetType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Laptop"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={data.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                rows={2}
                placeholder="Additional details about the asset..."
              />
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Identification
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={data.serialNumber || ''}
                onChange={(e) => onChange('serialNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="SN123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={data.modelNumber || ''}
                onChange={(e) => onChange('modelNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="MBP-2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={data.manufacturer || ''}
                onChange={(e) => onChange('manufacturer', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Apple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={data.brand || ''}
                onChange={(e) => onChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="MacBook Pro"
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onChange('purchaseDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purchase Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={data.purchasePrice || ''}
                onChange={(e) => onChange('purchasePrice', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="1999.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Depreciation Rate (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={data.depreciationRate || ''}
                onChange={(e) => onChange('depreciationRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Salvage Value ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={data.salvageValue || ''}
                onChange={(e) => onChange('salvageValue', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="200"
              />
            </div>
          </div>
        </div>

        {/* Warranty Information */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Warranty Information
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={data.warrantyStartDate ? new Date(data.warrantyStartDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onChange('warrantyStartDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={data.warrantyEndDate ? new Date(data.warrantyEndDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onChange('warrantyEndDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Provider
              </label>
              <input
                type="text"
                value={data.warrantyProvider || ''}
                onChange={(e) => onChange('warrantyProvider', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Apple Care"
              />
            </div>
          </div>
        </div>

        {/* Status & Condition */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Status & Condition
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Condition
              </label>
              <select
                value={data.condition || ''}
                onChange={(e) => onChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="">Not Specified</option>
                {CONDITION_OPTIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Maintenance Interval (days)
              </label>
              <input
                type="number"
                value={data.maintenanceInterval || ''}
                onChange={(e) => onChange('maintenanceInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="90"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes
          </label>
          <textarea
            value={data.notes || ''}
            onChange={(e) => onChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            rows={3}
            placeholder="Additional notes or comments..."
          />
        </div>
      </div>
    );
  };

  // ========================================
  // ROW ACTIONS
  // ========================================

  const rowActions = (row: Asset) => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => {
        toast.info('Opening asset details...');
      },
    },
    {
      label: 'Edit Asset',
      icon: Edit,
      onClick: () => {
        toast.info('Opening edit form...');
      },
    },
    ...(row.status === 'AVAILABLE'
      ? [
          {
            label: 'Assign to Employee',
            icon: UserPlus,
            onClick: () => {
              setSelectedAsset(row);
              setAssignModalOpen(true);
            },
          },
        ]
      : []),
    ...(row.status === 'ASSIGNED'
      ? [
          {
            label: 'Return Asset',
            icon: RotateCcw,
            onClick: () => {
              setSelectedAsset(row);
              setReturnModalOpen(true);
            },
          },
        ]
      : []),
    {
      label: 'Schedule Maintenance',
      icon: Wrench,
      onClick: () => {
        setSelectedAsset(row);
        setMaintenanceModalOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => {
        toast.error('Delete functionality coming soon');
      },
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  // ========================================
  // FETCH DASHBOARD STATS
  // ========================================

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/v1/assets/dashboard');
      const result = await response.json();
      if (result.success) {
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch stats on mount
  React.useEffect(() => {
    fetchDashboardStats();
  }, []);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      <DashboardStatsCards />
      <AlertBanners />
      <CategoryFilters />

      <DataPage<Asset>
        title="Asset Management"
        description="Track and manage company assets with assignment history, maintenance scheduling, and depreciation tracking"
        icon={Monitor}
        apiEndpoint="/api/v1/assets"
        columns={columns}
        renderForm={renderForm}
        rowActions={rowActions}
        searchPlaceholder="Search by asset code, name, serial number..."
        filterOptions={{
          category: selectedCategory || undefined,
        }}
        onDataChange={fetchDashboardStats}
        enableExport
        exportFilename="assets"
      />
    </div>
  );
}
