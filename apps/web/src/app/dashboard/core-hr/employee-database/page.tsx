"use client";

import React, { useState } from 'react';
import {
    Search,
    Filter,
    Grid,
    List as ListIcon,
    MoreHorizontal,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Building2,
    Download,
    Plus,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';

// --- MOCK DATA ---

const EMPLOYEES = [
    {
        id: 'EMP001',
        name: 'Sarah Anderson',
        role: 'Senior Product Designer',
        department: 'Product',
        location: 'New York, USA',
        email: 'sarah.a@kreupai.com',
        phone: '+1 (555) 123-4567',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=EMP001',
        joinDate: 'Jan 15, 2022'
    },
    {
        id: 'EMP002',
        name: 'Michael Chen',
        role: 'Engineering Manager',
        department: 'Engineering',
        location: 'San Francisco, USA',
        email: 'mike.c@kreupai.com',
        phone: '+1 (555) 987-6543',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=EMP002',
        joinDate: 'Mar 01, 2021'
    },
    {
        id: 'EMP003',
        name: 'Priya Sharma',
        role: 'HR Specialist',
        department: 'Human Resources',
        location: 'Bangalore, India',
        email: 'priya.s@kreupai.com',
        phone: '+91 98765 43210',
        status: 'On Leave',
        avatar: 'https://i.pravatar.cc/150?u=EMP003',
        joinDate: 'Jun 10, 2023'
    },
    {
        id: 'EMP004',
        name: 'James Wilson',
        role: 'Backend Developer',
        department: 'Engineering',
        location: 'London, UK',
        email: 'james.w@kreupai.com',
        phone: '+44 20 1234 5678',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=EMP004',
        joinDate: 'Nov 22, 2022'
    },
    {
        id: 'EMP005',
        name: 'Anita Desai',
        role: 'Marketing Lead',
        department: 'Marketing',
        location: 'Mumbai, India',
        email: 'anita.d@kreupai.com',
        phone: '+91 99887 76655',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=EMP005',
        joinDate: 'Feb 14, 2020'
    },
    {
        id: 'EMP006',
        name: 'Omar Al-Fayed',
        role: 'Sales Director',
        department: 'Sales',
        location: 'Dubai, UAE',
        email: 'omar.f@kreupai.com',
        phone: '+971 50 123 4567',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=EMP006',
        joinDate: 'Sep 05, 2019'
    },
    {
        id: 'EMP007',
        name: 'Elena Rodriguez',
        role: 'QA Engineer',
        department: 'Engineering',
        location: 'Madrid, Spain',
        email: 'elena.r@kreupai.com',
        phone: '+34 600 123 456',
        status: 'Probation',
        avatar: 'https://i.pravatar.cc/150?u=EMP007',
        joinDate: 'Aug 01, 2024'
    },
    {
        id: 'EMP008',
        name: 'David Kim',
        role: 'Data Scientist',
        department: 'AI Research',
        location: 'Seoul, South Korea',
        email: 'david.k@kreupai.com',
        phone: '+82 10 1234 5678',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=EMP008',
        joinDate: 'Dec 12, 2021'
    },
];

const FILTER_OPTIONS = {
    Department: ['Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'AI Research'],
    Location: ['New York, USA', 'San Francisco, USA', 'London, UK', 'Dubai, UAE', 'Bangalore, India', 'Mumbai, India'],
    Status: ['Active', 'On Leave', 'Probation', 'Terminated'],
};

export default function EmployeeDatabasePage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);

    // Filter Logic
    const filteredEmployees = EMPLOYEES.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
            if (!value) return true;
            if (key === 'Department') return emp.department === value;
            if (key === 'Location') return emp.location === value;
            if (key === 'Status') return emp.status === value;
            return true;
        });

        return matchesSearch && matchesFilters;
    });

    const toggleFilter = (category: string, value: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [category]: prev[category] === value ? '' : value
        }));
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            {/* Sidebar Filters */}
            <div className={`w-64 flex-shrink-0 bg-white dark:bg-stellar-blue border-r border-cloud dark:border-nebula-purple/20 p-4 overflow-y-auto transition-all duration-300 ${showFilters ? 'translate-x-0' : '-ml-72 lg:ml-0'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filters
                    </h2>
                    {(Object.keys(activeFilters).length > 0) && (
                        <button
                            onClick={() => setActiveFilters({})}
                            className="text-xs text-celestial-indigo hover:text-celestial-indigo/80 font-medium"
                        >
                            Reset
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {Object.entries(FILTER_OPTIONS).map(([category, options]) => (
                        <div key={category}>
                            <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wider mb-3">{category}</h3>
                            <div className="space-y-2">
                                {options.map(option => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters[category] === option ? 'bg-celestial-indigo border-celestial-indigo' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-deep-cosmos'}`}>
                                            {activeFilters[category] === option && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={activeFilters[category] === option}
                                            onChange={() => toggleFilter(category, option)}
                                        />
                                        <span className={`text-sm ${activeFilters[category] === option ? 'text-celestial-indigo font-medium' : 'text-slate-600 dark:text-slate-400 group-hover:text-ink-black dark:group-hover:text-pearl'}`}>
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden p-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg"
                        >
                            <Filter className="w-5 h-5 text-silver-mist" />
                        </button>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-cloud dark:bg-deep-cosmos text-celestial-indigo' : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-cloud dark:bg-deep-cosmos text-celestial-indigo' : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium hover:bg-cloud/50 transition-colors">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                            <Plus className="w-4 h-4" /> Add Employee
                        </button>
                    </div>
                </div>

                {/* Database View */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {filteredEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 bg-cloud dark:bg-deep-cosmos rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-silver-mist" />
                            </div>
                            <h3 className="text-lg font-medium text-ink-black dark:text-pearl">No employees found</h3>
                            <p className="text-silver-mist text-sm">Try adjusting your search or filters</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveFilters({}); }}
                                className="mt-4 text-celestial-indigo font-medium text-sm hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredEmployees.map(emp => (
                                <EmployeeCard key={emp.id} employee={emp} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-cloud/50 dark:bg-deep-cosmos/50 text-xs uppercase text-silver-mist font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Employee</th>
                                        <th className="px-4 py-3 hidden md:table-cell">Role & Dept</th>
                                        <th className="px-4 py-3 hidden lg:table-cell">Location</th>
                                        <th className="px-4 py-3 hidden xl:table-cell">Contacts</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                                    {filteredEmployees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full bg-slate-200 object-cover" />
                                                    <div>
                                                        <div className="font-medium text-ink-black dark:text-pearl">{emp.name}</div>
                                                        <div className="text-xs text-silver-mist">{emp.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <div className="text-ink-black dark:text-pearl">{emp.role}</div>
                                                <div className="text-xs text-silver-mist">{emp.department}</div>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-silver-mist" />
                                                    {emp.location}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden xl:table-cell">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                        <Mail className="w-3 h-3" /> {emp.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                        <Phone className="w-3 h-3" /> {emp.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={emp.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="p-1.5 hover:bg-cloud dark:hover:bg-deep-cosmos rounded text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function EmployeeCard({ employee }: { employee: typeof EMPLOYEES[0] }) {
    return (
        <div className="group bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md hover:border-celestial-indigo/50 transition-all cursor-pointer relative overflow-hidden">
            {/* Top Pattern */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-celestial-indigo to-quantum-rose opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img src={employee.avatar} alt={employee.name} className="w-12 h-12 rounded-full bg-slate-200 object-cover ring-2 ring-white dark:ring-deep-cosmos shadow-sm" />
                    <div>
                        <h3 className="font-bold text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">{employee.name}</h3>
                        <p className="text-xs text-silver-mist">{employee.id}</p>
                    </div>
                </div>
                <StatusBadge status={employee.status} />
            </div>

            <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Briefcase className="w-4 h-4 text-celestial-indigo/70" />
                    <span className="truncate">{employee.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Building2 className="w-4 h-4 text-quantum-rose/70" />
                    <span className="truncate">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-neural-mint/70" />
                    <span className="truncate">{employee.location}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-cloud dark:border-nebula-purple/20 flex items-center justify-between text-xs text-silver-mist">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Joined {employee.joinDate}
                </div>
                <button className="text-celestial-indigo hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile
                </button>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        'Active': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle2 },
        'On Leave': { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Clock },
        'Probation': { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: Users },
        'Terminated': { bg: 'bg-red-500/10', text: 'text-red-600', icon: XCircle },
    }[status] || { bg: 'bg-slate-500/10', text: 'text-slate-600', icon: CheckCircle2 };

    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
}
