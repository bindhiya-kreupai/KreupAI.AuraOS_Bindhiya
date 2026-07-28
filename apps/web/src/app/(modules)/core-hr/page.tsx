'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Network,
  MapPin,
  History,
  FileCheck,
  UserMinus,
  Contact,
  GraduationCap,
  ShieldCheck,
  ClipboardList,
  Globe,
  Check,
  Zap,
  ArrowUpRight,
  Search,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';

import { EntitySwitcher } from './components/EntitySwitcher';
import { GlobalMetrics } from './components/GlobalMetrics';
import { AgenticWorkflowHub } from './components/AgenticWorkflowHub';

const coreHRFeatures = [
  {
    title: 'Employee Database',
    description: 'Manage comprehensive employee profiles and lifecycle data.',
    icon: Users,
    href: '/dashboard/core-hr/employees',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  {
    title: 'Organization Structure',
    description: 'Define departments, cost centers, and hierarchies.',
    icon: Network,
    href: '/dashboard/core-hr/departments',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
  },
  {
    title: 'Position Management',
    description: 'Track job roles, classifications, and headcount budgeting.',
    icon: ShieldCheck,
    href: '/dashboard/core-hr/position-management',
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10',
  },
  {
    title: 'Global Transfers',
    description: 'Process inter-company and cross-border movements.',
    icon: Globe,
    href: '/dashboard/core-hr/transfers',
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  {
    title: 'Employment History',
    description: 'Track career movements and job changes.',
    icon: History,
    href: '/dashboard/core-hr/employment-history',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    title: 'Shared Services',
    description: 'Centralized administrative services hub.',
    icon: FileCheck,
    href: '/dashboard/core-hr/shared-services',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Probation Tracking',
    description: 'Monitor employee probation periods and confirmations.',
    icon: ClipboardList,
    href: '/dashboard/core-hr/probation-tracking',
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10',
  },
  {
    title: 'Asset Management',
    description: 'Track equipment and assets assigned to employees.',
    icon: MapPin,
    href: '/dashboard/core-hr/asset-management',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  {
    title: 'Document Intelligence',
    description: 'AI OCR scanning and automated document lifecycles.',
    icon: ShieldCheck,
    href: '/dashboard/core-hr/document-intelligence',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

export default function CoreHRPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: 'Engineering',
    role: 'Software Engineer',
  });
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Alice Smith', department: 'Engineering', role: 'Senior Developer' },
    { id: 2, name: 'Bob Johnson', department: 'HR', role: 'HR Manager' },
    { id: 3, name: 'Charlie Brown', department: 'Sales', role: 'Sales Rep' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = employees.filter(
    (emp: any) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateEmployee = () => {
    setEmployees([...employees, { id: Date.now(), ...formData }]);
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Department,Role\n' +
      employees.map((e: any) => `${e.name},${e.department},${e.role}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this employee?')) {
      setEmployees(employees.filter((e: any) => e.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Leadership Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-cloud dark:border-nebula-purple/20">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-black dark:text-pearl tracking-tight mb-2">
            Core HR <span className="text-indigo-600 dark:text-indigo-400">Command Center</span>
          </h1>
          <p className="text-silver-mist max-w-xl leading-relaxed">
            Unified multi-entity administration across all global jurisdictions, organizational
            hierarchies, and talent lifecycles.
          </p>
        </div>
        <EntitySwitcher />
      </div>

      {/* Global Group Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">
            Group Performance Metrics
          </h2>
          <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View Detailed Analytics
          </button>
        </div>
        <GlobalMetrics />
      </div>

      <div className="pt-2">
        <AgenticWorkflowHub />
      </div>

      {/* Module Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">
          Administrative Intelligence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreHRFeatures.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group block p-6 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div
                className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-silver-mist leading-relaxed">{feature.description}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Module <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Intelligent Insights Bridge */}
      <div className="bg-gradient-to-br from-celestial-indigo/10 via-white to-transparent dark:from-indigo-900/10 dark:via-stellar-blue dark:to-transparent border border-celestial-indigo/20 rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-500/10 scale-110">
            <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-ink-black dark:text-pearl mb-2">
              Automated Compliance Sentinel
            </h3>
            <p className="text-silver-mist max-w-2xl leading-relaxed">
              Our Agentic AI is actively monitoring cross-border labor law changes in{' '}
              <strong>UAE, KSA, and India</strong>. Real-time headcount trends and diversity metrics
              are being synchronized across your 4 active legal entities.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                <Check className="w-3 h-3" /> System Healthy
              </span>
              <span className="text-xs text-silver-mist font-medium">
                Last Audit: 12 minutes ago
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Employee Directory */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">
            Quick Employee Directory
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-silver-mist" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleExport}
              className="p-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-silver-mist hover:text-indigo-600 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormData({ name: '', department: 'Engineering', role: '' });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-cloud dark:border-nebula-purple/20">
                <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                  Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                  Department
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-silver-mist uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
              {filteredEmployees.map((emp: any) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-indigo-900/5 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-ink-black dark:text-pearl text-sm">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-silver-mist">{emp.department}</td>
                  <td className="px-6 py-4 text-sm text-silver-mist">{emp.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="p-2 text-silver-mist hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-silver-mist text-sm">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-blue p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">
              Add Employee
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e: any) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-ink-black dark:text-pearl rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEmployee}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
