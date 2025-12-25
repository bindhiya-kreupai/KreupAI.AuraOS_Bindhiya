"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Plus,
    X,
    Check
} from 'lucide-react';
import { EmployeeService } from '../services';

export default function EmployeeDatabasePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState('All');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await EmployeeService.getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    // Mock Data - fallback if no data from service
    const mockEmployees = [
        { id: 1, name: 'Alice Cooper', role: 'Senior Product Designer', dept: 'Design', loc: 'San Francisco', img: 'https://i.pravatar.cc/150?u=a', email: 'alice@company.com', phone: '+1 555 0101' },
        { id: 2, name: 'Bob Marley', role: 'Frontend Engineer', dept: 'Engineering', loc: 'Remote', img: 'https://i.pravatar.cc/150?u=b', email: 'bob@company.com', phone: '+1 555 0102' },
        { id: 3, name: 'Charlie Puth', role: 'Marketing Manager', dept: 'Marketing', loc: 'New York', img: 'https://i.pravatar.cc/150?u=c', email: 'charlie@company.com', phone: '+1 555 0103' },
        { id: 4, name: 'David Bowie', role: 'DevOps Engineer', dept: 'Engineering', loc: 'London', img: 'https://i.pravatar.cc/150?u=d', email: 'david@company.com', phone: '+44 20 7123 4567' },
        { id: 5, name: 'Eva Green', role: 'HR BP', dept: 'People', loc: 'Berlin', img: 'https://i.pravatar.cc/150?u=e', email: 'eva@company.com', phone: '+49 30 123456' },
        { id: 6, name: 'Frank Ocean', role: 'Sales Director', dept: 'Sales', loc: 'Austin', img: 'https://i.pravatar.cc/150?u=f', email: 'frank@company.com', phone: '+1 512 555 0199' },
        { id: 7, name: 'Grace Hopper', role: 'CTO', dept: 'Executive', loc: 'San Francisco', img: 'https://i.pravatar.cc/150?u=g', email: 'grace@company.com', phone: '+1 415 555 0100' },
        { id: 8, name: 'Harry Styles', role: 'Content Writer', dept: 'Marketing', loc: 'London', img: 'https://i.pravatar.cc/150?u=h', email: 'harry@company.com', phone: '+44 20 7987 6543' },
    ];

    const allEmployees = employees.length > 0 ? employees : mockEmployees;

    const filteredEmployees = allEmployees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'All' || emp.dept === selectedDept;
        return matchesSearch && matchesDept;
    });

    const handleEmail = (email: string) => {
        alert(`Opening mail client for: ${email}`);
    };

    const handleCall = (phone: string) => {
        alert(`Dialing: ${phone}`);
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Employee Database
                    </h1>
                    <p className="text-slate-500 text-sm">Centralized directory of all active and inactive employees.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Employee
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Design', 'Engineering', 'Marketing', 'Sales'].map(dept => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${selectedDept === dept
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20 p-1">
                {filteredEmployees.map((emp) => (
                    <div key={emp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 group relative hover:-translate-y-1">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 dark:border-slate-800 group-hover:border-indigo-500 transition-colors">
                            <img src={emp.img} alt={emp.name} className="w-full h-full object-cover" />
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{emp.name}</h3>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">{emp.role}</div>
                        <div className="text-xs text-slate-500 mb-4 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{emp.dept}</div>

                        <div className="w-full flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                            <button
                                onClick={() => handleEmail(emp.email)}
                                className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:scale-110"
                                title="Send Email"
                            >
                                <Mail className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleCall(emp.phone)}
                                className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:scale-110"
                                title="Call"
                            >
                                <Phone className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                <MapPin className="w-3 h-3 text-slate-400" /> {emp.loc}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Employee</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">First Name</label>
                                    <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Last Name</label>
                                    <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Role Title</label>
                                <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Senior Developer" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>Engineering</option>
                                    <option>Design</option>
                                    <option>Sales</option>
                                    <option>Marketing</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                            <button
                                onClick={() => {
                                    alert('Employee Added! (Simulated)');
                                    setShowAddModal(false);
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                Create Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
