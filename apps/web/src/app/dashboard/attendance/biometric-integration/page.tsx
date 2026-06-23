'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Fingerprint,
  Plus,
  ScanFace,
  Search,
  Settings,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';

type DeviceStatus = 'Online' | 'Offline' | 'Syncing';
type DeviceType = 'Fingerprint' | 'Face Recognition' | 'Fingerprint + Card' | 'Multi-Biometric';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  ip: string;
  status: DeviceStatus;
  employees: number;
  lastSync: string;
}

const STORAGE_KEY = 'auraos.attendance.biometricDevices.v1';

const SEED_DEVICES: Device[] = [
  {
    id: 'seed-1',
    name: 'Main Entrance - ZKTeco F22',
    type: 'Fingerprint',
    location: 'Building A - Lobby',
    ip: '192.168.1.101',
    status: 'Online',
    employees: 245,
    lastSync: '2 min ago',
  },
  {
    id: 'seed-2',
    name: 'Server Room - HikVision DS-K1T671',
    type: 'Face Recognition',
    location: 'Building A - Floor 3',
    ip: '192.168.1.102',
    status: 'Online',
    employees: 45,
    lastSync: '5 min ago',
  },
  {
    id: 'seed-3',
    name: 'Warehouse Gate - Suprema BioStation',
    type: 'Fingerprint + Card',
    location: 'Warehouse - Main Gate',
    ip: '192.168.2.50',
    status: 'Online',
    employees: 120,
    lastSync: '1 min ago',
  },
  {
    id: 'seed-4',
    name: 'Parking Entry - ZKTeco SpeedFace',
    type: 'Face Recognition',
    location: 'Parking Basement',
    ip: '192.168.1.110',
    status: 'Offline',
    employees: 300,
    lastSync: '3 hours ago',
  },
];

const statusConfig: Record<DeviceStatus, { color: string; icon: React.ReactNode }> = {
  Online: { color: 'bg-green-100 text-green-700', icon: <Wifi className="w-3 h-3" /> },
  Offline: { color: 'bg-red-100 text-red-700', icon: <WifiOff className="w-3 h-3" /> },
  Syncing: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" /> },
};

const typeIcon: Record<DeviceType, React.ReactNode> = {
  Fingerprint: <Fingerprint className="w-5 h-5" />,
  'Face Recognition': <ScanFace className="w-5 h-5" />,
  'Fingerprint + Card': <Fingerprint className="w-5 h-5" />,
  'Multi-Biometric': <ScanFace className="w-5 h-5" />,
};

type FormState = {
  id?: string;
  name: string;
  type: DeviceType;
  location: string;
  ip: string;
  status: DeviceStatus;
  employees: string;
};

const emptyForm: FormState = {
  name: '',
  type: 'Fingerprint',
  location: '',
  ip: '',
  status: 'Online',
  employees: '0',
};

export default function BiometricIntegrationPage() {
  const [devices, setDevices] = useState<Device[]>(SEED_DEVICES);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<FormState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDevices(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Device[]) => {
    setDevices(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const filtered = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
  );

  const online = devices.filter((d) => d.status === 'Online').length;
  const totalEmployees = devices.reduce((sum, d) => sum + d.employees, 0);

  const saveDevice = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.location.trim()) {
      alert('Name and location are required.');
      return;
    }
    const employees = Math.max(0, Number(editing.employees) || 0);
    if (editing.id) {
      persist(
        devices.map((d) =>
          d.id === editing.id
            ? {
                ...d,
                name: editing.name,
                type: editing.type,
                location: editing.location,
                ip: editing.ip,
                status: editing.status,
                employees,
                lastSync: 'just now',
              }
            : d
        )
      );
    } else {
      persist([
        ...devices,
        {
          id: `dev-${Date.now()}`,
          name: editing.name,
          type: editing.type,
          location: editing.location,
          ip: editing.ip,
          status: editing.status,
          employees,
          lastSync: 'just now',
        },
      ]);
    }
    setEditing(null);
  };

  const removeDevice = (d: Device) => {
    if (!confirm(`Remove "${d.name}"?`)) return;
    persist(devices.filter((x) => x.id !== d.id));
  };

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-indigo-500">Attendance</p>
          <h1 className="text-3xl font-bold">Biometric Device Integration</h1>
          <p className="text-slate-500">
            Manage biometric devices, monitor connectivity, and sync attendance data.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="self-start flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Device
        </button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Device inventory is currently stored per-browser — no{' '}
          <code className="px-1 bg-amber-100 dark:bg-amber-900/40 rounded">BiometricDevice</code>
          model exists in the schema yet. Edits persist locally so the page is fully functional
          until a tenant-wide device table is added.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Devices"
          value={devices.length}
          icon={<Fingerprint className="w-5 h-5" />}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="Online"
          value={`${online}/${devices.length}`}
          icon={<Wifi className="w-5 h-5" />}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          label="Enrolled Employees"
          value={totalEmployees}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="Sync Issues"
          value={devices.filter((d) => d.status === 'Offline').length}
          icon={<AlertCircle className="w-5 h-5" />}
          color="text-red-600 bg-red-50"
        />
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setEditing({
                      id: d.id,
                      name: d.name,
                      type: d.type,
                      location: d.location,
                      ip: d.ip,
                      status: d.status,
                      employees: String(d.employees),
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Edit"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => removeDevice(d)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">{editing.id ? 'Edit device' : 'Add device'}</h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block sm:col-span-2">
                <span className="block text-xs font-medium text-slate-500 mb-1">Name</span>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 bg-pearl dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Type</span>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value as DeviceType })}
                  className="w-full px-3 py-2 bg-pearl dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                >
                  {(
                    [
                      'Fingerprint',
                      'Face Recognition',
                      'Fingerprint + Card',
                      'Multi-Biometric',
                    ] as DeviceType[]
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Status</span>
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as DeviceStatus })
                  }
                  className="w-full px-3 py-2 bg-pearl dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Syncing">Syncing</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-xs font-medium text-slate-500 mb-1">Location</span>
                <input
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full px-3 py-2 bg-pearl dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">IP</span>
                <input
                  value={editing.ip}
                  onChange={(e) => setEditing({ ...editing, ip: e.target.value })}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 bg-pearl dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Employees</span>
                <input
                  type="number"
                  value={editing.employees}
                  onChange={(e) => setEditing({ ...editing, employees: e.target.value })}
                  className="w-full px-3 py-2 bg-pearl dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveDevice}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
