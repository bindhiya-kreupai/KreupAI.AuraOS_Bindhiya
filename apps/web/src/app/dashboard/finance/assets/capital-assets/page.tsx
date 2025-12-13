"use client";

import React, { useState } from 'react';
import {
    Building2,
    Laptop,
    Car,
    Printer,
    Plus,
    Filter,
    Search,
    TrendingUp,
    DollarSign,
    Calendar,
    MapPin,
    User,
    Edit,
    Trash2,
    MoreVertical,
    X
} from 'lucide-react';

type AssetCategory = 'all' | 'equipment' | 'vehicles' | 'property' | 'furniture';

interface CapitalAsset {
    id: string;
    name: string;
    category: 'equipment' | 'vehicles' | 'property' | 'furniture';
    purchaseDate: string;
    purchaseCost: number;
    currentValue: number;
    location: string;
    assignedTo: string;
    status: 'active' | 'maintenance' | 'disposed';
    serialNumber: string;
    depreciationRate: number;
}

interface AssetFormData {
    name: string;
    category: 'equipment' | 'vehicles' | 'property' | 'furniture';
    purchaseDate: string;
    purchaseCost: string;
    currentValue: string;
    location: string;
    assignedTo: string;
    status: 'active' | 'maintenance' | 'disposed';
    serialNumber: string;
    depreciationRate: string;
}

export default function CapitalAssetsPage() {
    const [filter, setFilter] = useState<AssetCategory>('all');
    const [showModal, setShowModal] = useState(false);
    const [assets, setAssets] = useState<CapitalAsset[]>([
        {
            id: 'CA-001',
            name: 'MacBook Pro M3 Max',
            category: 'equipment',
            purchaseDate: '2024-01-15',
            purchaseCost: 3500,
            currentValue: 3100,
            location: 'Engineering Dept',
            assignedTo: 'Sarah Connor',
            status: 'active',
            serialNumber: 'MBP-2024-001',
            depreciationRate: 20
        },
        {
            id: 'CA-002',
            name: 'Toyota Camry 2023',
            category: 'vehicles',
            purchaseDate: '2023-06-20',
            purchaseCost: 28000,
            currentValue: 24000,
            location: 'HQ Parking',
            assignedTo: 'Fleet Management',
            status: 'active',
            serialNumber: 'VEH-2023-001',
            depreciationRate: 15
        },
        {
            id: 'CA-003',
            name: 'Office Building - Floor 3',
            category: 'property',
            purchaseDate: '2020-03-10',
            purchaseCost: 850000,
            currentValue: 920000,
            location: '123 Business St',
            assignedTo: 'Corporate',
            status: 'active',
            serialNumber: 'PROP-2020-001',
            depreciationRate: 2
        },
        {
            id: 'CA-004',
            name: 'Industrial Printer HP LaserJet',
            category: 'equipment',
            purchaseDate: '2023-09-05',
            purchaseCost: 5500,
            currentValue: 4200,
            location: 'Print Room',
            assignedTo: 'Operations',
            status: 'maintenance',
            serialNumber: 'PRT-2023-002',
            depreciationRate: 25
        },
        {
            id: 'CA-005',
            name: 'Executive Desk Set',
            category: 'furniture',
            purchaseDate: '2023-11-12',
            purchaseCost: 2800,
            currentValue: 2400,
            location: 'CEO Office',
            assignedTo: 'Executive Team',
            status: 'active',
            serialNumber: 'FRN-2023-005',
            depreciationRate: 10
        },
        {
            id: 'CA-006',
            name: 'Dell Latitude Laptop x15',
            category: 'equipment',
            purchaseDate: '2024-02-01',
            purchaseCost: 22500,
            currentValue: 20000,
            location: 'IT Department',
            assignedTo: 'Various Staff',
            status: 'active',
            serialNumber: 'LAP-2024-015',
            depreciationRate: 20
        },
        {
            id: 'CA-007',
            name: 'Ford Transit Van',
            category: 'vehicles',
            purchaseDate: '2022-08-15',
            purchaseCost: 35000,
            currentValue: 26000,
            location: 'Service Center',
            assignedTo: 'Field Operations',
            status: 'active',
            serialNumber: 'VAN-2022-003',
            depreciationRate: 15
        },
        {
            id: 'CA-008',
            name: 'Conference Room Furniture',
            category: 'furniture',
            purchaseDate: '2023-04-20',
            purchaseCost: 8500,
            currentValue: 7200,
            location: 'Floor 2 - Room 201',
            assignedTo: 'Facilities',
            status: 'active',
            serialNumber: 'FRN-2023-008',
            depreciationRate: 12
        }
    ]);

    const [formData, setFormData] = useState<AssetFormData>({
        name: '',
        category: 'equipment',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: '',
        currentValue: '',
        location: '',
        assignedTo: '',
        status: 'active',
        serialNumber: '',
        depreciationRate: '20'
    });

    const filteredAssets = filter === 'all'
        ? assets
        : assets.filter(a => a.category === filter);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'equipment':
                return <Laptop className="w-5 h-5" />;
            case 'vehicles':
                return <Car className="w-5 h-5" />;
            case 'property':
                return <Building2 className="w-5 h-5" />;
            case 'furniture':
                return <Printer className="w-5 h-5" />;
            default:
                return <DollarSign className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'equipment':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'vehicles':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'property':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'furniture':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'maintenance':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'disposed':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateAssetId = () => {
        const prefix = 'CA';
        const lastId = assets.length > 0 ? parseInt(assets[assets.length - 1].id.split('-')[1]) : 0;
        const newId = String(lastId + 1).padStart(3, '0');
        return `${prefix}-${newId}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.purchaseCost || !formData.currentValue || !formData.location || !formData.assignedTo || !formData.serialNumber) {
            alert('Please fill in all required fields');
            return;
        }

        const newAsset: CapitalAsset = {
            id: generateAssetId(),
            name: formData.name,
            category: formData.category,
            purchaseDate: formData.purchaseDate,
            purchaseCost: parseFloat(formData.purchaseCost),
            currentValue: parseFloat(formData.currentValue),
            location: formData.location,
            assignedTo: formData.assignedTo,
            status: formData.status,
            serialNumber: formData.serialNumber,
            depreciationRate: parseFloat(formData.depreciationRate)
        };

        setAssets(prev => [...prev, newAsset]);
        setShowModal(false);

        // Reset form
        setFormData({
            name: '',
            category: 'equipment',
            purchaseDate: new Date().toISOString().split('T')[0],
            purchaseCost: '',
            currentValue: '',
            location: '',
            assignedTo: '',
            status: 'active',
            serialNumber: '',
            depreciationRate: '20'
        });
    };

    const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalCost = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
    const totalDepreciation = totalCost - totalValue;
    const activeAssets = assets.filter(a => a.status === 'active').length;

    const stats = [
        {
            label: 'Total Asset Value',
            value: `$${(totalValue / 1000).toFixed(0)}k`,
            icon: DollarSign,
            color: 'text-blue-600',
            trend: '+8.2%'
        },
        {
            label: 'Total Assets',
            value: assets.length,
            icon: Building2,
            color: 'text-emerald-600',
            trend: `${activeAssets} Active`
        },
        {
            label: 'Purchase Cost',
            value: `$${(totalCost / 1000).toFixed(0)}k`,
            icon: TrendingUp,
            color: 'text-indigo-600',
            trend: 'Original'
        },
        {
            label: 'Depreciation',
            value: `$${(totalDepreciation / 1000).toFixed(0)}k`,
            icon: Calendar,
            color: 'text-red-600',
            trend: `${((totalDepreciation / totalCost) * 100).toFixed(1)}%`
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-500" />
                        Capital Assets
                    </h1>
                    <p className="text-slate-500 text-sm">Track and manage company capital assets and depreciation</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Asset
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-emerald-600">{stat.trend}</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex gap-2 shrink-0 overflow-x-auto">
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'all'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('all')}
                >
                    All Assets
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'equipment'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('equipment')}
                >
                    Equipment
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'vehicles'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('vehicles')}
                >
                    Vehicles
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'property'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('property')}
                >
                    Property
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        filter === 'furniture'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('furniture')}
                >
                    Furniture
                </button>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredAssets.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No assets found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">Asset Name</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Serial #</th>
                                        <th className="p-4">Purchase Date</th>
                                        <th className="p-4">Purchase Cost</th>
                                        <th className="p-4">Current Value</th>
                                        <th className="p-4">Depreciation</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">Assigned To</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredAssets.map((asset) => {
                                        const depreciation = asset.purchaseCost - asset.currentValue;
                                        const depreciationPercent = (depreciation / asset.purchaseCost) * 100;

                                        return (
                                            <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getCategoryColor(asset.category)}`}>
                                                        {asset.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-slate-500">{asset.serialNumber}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {new Date(asset.purchaseDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 font-mono font-bold">${asset.purchaseCost.toLocaleString()}</td>
                                                <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${asset.currentValue.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono text-xs text-red-600 dark:text-red-400">
                                                            -${depreciation.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {depreciationPercent.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="text-xs">{asset.location}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                        <User className="w-3 h-3" />
                                                        <span className="text-xs">{asset.assignedTo}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(asset.status)}`}>
                                                        {asset.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                            <Edit className="w-4 h-4 text-slate-500" />
                                                        </button>
                                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                            <MoreVertical className="w-4 h-4 text-slate-500" />
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

            {/* Add Asset Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Plus className="w-6 h-6 text-indigo-500" />
                                    Add New Capital Asset
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Enter the details of the new asset</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
                                    <Building2 className="w-5 h-5" />
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Asset Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., MacBook Pro M3"
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
                                            <option value="equipment">Equipment</option>
                                            <option value="vehicles">Vehicles</option>
                                            <option value="property">Property</option>
                                            <option value="furniture">Furniture</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Serial Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="serialNumber"
                                            value={formData.serialNumber}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., MBP-2024-001"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Status *
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="disposed">Disposed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
                                    <DollarSign className="w-5 h-5" />
                                    Financial Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Purchase Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="purchaseDate"
                                            value={formData.purchaseDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Purchase Cost ($) *
                                        </label>
                                        <input
                                            type="number"
                                            name="purchaseCost"
                                            value={formData.purchaseCost}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g., 3500"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Current Value ($) *
                                        </label>
                                        <input
                                            type="number"
                                            name="currentValue"
                                            value={formData.currentValue}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g., 3100"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Depreciation Rate (%) *
                                        </label>
                                        <input
                                            type="number"
                                            name="depreciationRate"
                                            value={formData.depreciationRate}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            placeholder="e.g., 20"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Annual depreciation rate percentage</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Assignment */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
                                    <MapPin className="w-5 h-5" />
                                    Location & Assignment
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            placeholder="e.g., Engineering Dept"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Assigned To *
                                        </label>
                                        <input
                                            type="text"
                                            name="assignedTo"
                                            value={formData.assignedTo}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Sarah Connor"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Asset
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
