'use client';

import React, { useState } from 'react';
import {
  Fingerprint,
  ScanFace,
  Wifi,
  WifiOff,
  Plus,
  Search,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

const MOCK_DEVICES = [
  {
    id: 1,
    name: 'Main Entrance - ZKTeco F22',
    type: 'Fingerprint',
    location: 'Building A - Lobby',
    ip: '192.168.1.101',
    status: 'Online',
    employees: 245,
    lastSync: '2 min ago',
  },
  {
    id: 2,
    name: 'Server Room - HikVision DS-K1T671',
    type: 'Face Recognition',
    location: 'Building A - Floor 3',
    ip: '192.168.1.102',
    status: 'Online',
    employees: 45,
    lastSync: '5 min ago',
  },
  {
    id: 3,
    name: 'Warehouse Gate - Suprema BioStation',
    type: 'Fingerprint + Card',
    location: 'Warehouse - Main Gate',
    ip: '192.168.2.50',
    status: 'Online',
    employees: 120,
    lastSync: '1 min ago',
  },
  {
    id: 4,
    name: 'Parking Entry - ZKTeco SpeedFace',
    type: 'Face Recognition',
    location: 'Parking Basement',
    ip: '192.168.1.110',
    status: 'Offline',
    employees: 300,
    lastSync: '3 hours ago',
  },
  {
    id: 5,
    name: 'Branch Office - Suprema BioLite',
    type: 'Fingerprint',
    location: 'Branch - Reception',
    ip: '10.0.1.20',
    status: 'Online',
    employees: 60,
    lastSync: '8 min ago',
  },
  {
    id: 6,
    name: 'Factory Floor - ZKTeco MB460',
    type: 'Multi-Biometric',
    location: 'Factory - Shift Entry',
    ip: '192.168.3.15',
    status: 'Syncing',
    employees: 180,
    lastSync: '15 min ago',
  },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Online: { color: 'bg-green-100 text-green-700', icon: <Wifi className="w-3 h-3" /> },
  Offline: { color: 'bg-red-100 text-red-700', icon: <WifiOff className="w-3 h-3" /> },
  Syncing: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" /> },
};

const typeIcon: Record<string, React.ReactNode> = {
  Fingerprint: <Fingerprint className="w-5 h-5" />,
  'Face Recognition': <ScanFace className="w-5 h-5" />,
  'Fingerprint + Card': <Fingerprint className="w-5 h-5" />,
  'Multi-Biometric': <ScanFace className="w-5 h-5" />,
};

export default function BiometricIntegrationPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_DEVICES.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
  );

  const online = MOCK_DEVICES.filter((d) => d.status === 'Online').length;
  const totalEmployees = MOCK_DEVICES.reduce((sum, d) => sum + d.employees, 0);

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-indigo-500">Attendance</p>
          <h1 className="text-3xl font-bold">Biometric Device Integration</h1>
          <p className="text-slate-500">
            Manage biometric devices, monitor connectivity, and sync attendance data.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Device
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Total Devices',
            value: MOCK_DEVICES.length,
            icon: Fingerprint,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            label: 'Online',
            value: `${online}/${MOCK_DEVICES.length}`,
            icon: Wifi,
            color: 'text-green-600 bg-green-50',
          },
          {
            label: 'Enrolled Employees',
            value: totalEmployees,
            icon: CheckCircle2,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Sync Issues',
            value: MOCK_DEVICES.filter((d) => d.status === 'Offline').length,
            icon: AlertCircle,
            color: 'text-red-600 bg-red-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  {typeIcon[d.type] || <Fingerprint className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{d.name}</h3>
                  <p className="text-xs text-slate-400">{d.type}</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <Settings className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Location</span>
                <span className="font-medium">{d.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP Address</span>
                <span className="font-mono text-xs">{d.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employees</span>
                <span className="font-medium">{d.employees}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[d.status]?.color || ''}`}
              >
                {statusConfig[d.status]?.icon} {d.status}
              </span>
              <span className="text-xs text-slate-400">Synced {d.lastSync}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
