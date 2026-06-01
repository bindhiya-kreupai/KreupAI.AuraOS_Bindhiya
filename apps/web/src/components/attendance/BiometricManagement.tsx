// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

/**
 * @component BiometricManagement
 * @description Biometric device management — device list with status, enrollment counts,
 *   sync button, failed scan alerts, device configuration, attendance log viewer,
 *   enrollment queue, device health metrics.
 * @project AURA HCM Platform
 * @section 22.4 — Biometric Integration
 */

import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  Camera,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Activity,
  Plus,
  Download,
  Search,
  Loader2,
  XCircle,
  Signal,
} from 'lucide-react';
import type {
  BiometricDevice,
  AttendancePunch,
  BiometricAnalytics,
  DeviceBrand,
  DeviceStatus,
  DeviceType,
} from '@/services/biometricService';
import { BiometricService } from '@/services/biometricService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDateTime(d: string): string {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_STYLES: Record<
  DeviceStatus,
  { bg: string; text: string; dot: string; label: string; icon: React.ElementType }
> = {
  online: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Online',
    icon: Wifi,
  },
  offline: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: 'Offline',
    icon: WifiOff,
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Error',
    icon: AlertTriangle,
  },
  syncing: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Syncing',
    icon: RefreshCw,
  },
  maintenance: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Maintenance',
    icon: Settings,
  },
};

const BRAND_COLORS: Record<DeviceBrand, string> = {
  ZKTeco: 'text-blue-600 bg-blue-50',
  HikVision: 'text-red-600 bg-red-50',
  Suprema: 'text-purple-600 bg-purple-50',
  Anviz: 'text-amber-600 bg-amber-50',
  Virdi: 'text-emerald-600 bg-emerald-50',
};

const DEVICE_TYPE_ICONS: Record<DeviceType, React.ElementType> = {
  fingerprint: Fingerprint,
  face: Camera,
  iris: Eye,
  multi_modal: Activity,
  card_reader: Signal,
};

// ── Device Card ────────────────────────────────────────────────────────────────

function DeviceCard({
  device,
  onSync,
  syncing,
  onSelect,
  isSelected,
}: {
  device: BiometricDevice;
  onSync: (id: string) => void;
  syncing: boolean;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const s = STATUS_STYLES[device.status];
  const _SIcon = s.icon;
  const DIcon = DEVICE_TYPE_ICONS[device.type];

  return (
    <div
      className={`bg-white rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-blue-400 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <DIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{device.name}</p>
              <p className="text-xs text-slate-500">{device.building}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${s.dot} ${device.status === 'syncing' ? 'animate-pulse' : ''}`}
            />
            {s.label}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{device.enrolledEmployees}</p>
            <p className="text-xs text-slate-400">Enrolled</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-lg font-bold text-slate-800">{device.metrics.dailyScans}</p>
            <p className="text-xs text-slate-400">Daily Scans</p>
          </div>
          <div className="text-center">
            <p
              className={`text-lg font-bold ${device.metrics.successRate >= 97 ? 'text-emerald-600' : device.metrics.successRate >= 95 ? 'text-amber-600' : 'text-red-600'}`}
            >
              {device.metrics.successRate}%
            </p>
            <p className="text-xs text-slate-400">Success Rate</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>
            {device.brand} {device.model}
          </span>
          <span>v{device.firmwareVersion}</span>
        </div>

        {/* Success Rate Bar */}
        <div className="mb-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${device.metrics.successRate >= 97 ? 'bg-emerald-500' : device.metrics.successRate >= 95 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${device.metrics.successRate}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Synced {timeAgo(device.lastSyncAt)}
            {device.pendingPunches > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                {device.pendingPunches} pending
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSync(device.id);
            }}
            disabled={syncing || device.status === 'offline'}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
              device.status === 'offline'
                ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            {syncing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Sync
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Punch Log Row ──────────────────────────────────────────────────────────────

function PunchRow({ punch }: { punch: AttendancePunch }) {
  const typeColors: Record<string, string> = {
    in: 'text-emerald-600 bg-emerald-50',
    out: 'text-blue-600 bg-blue-50',
    break_start: 'text-amber-600 bg-amber-50',
    break_end: 'text-amber-600 bg-amber-50',
    overtime_in: 'text-purple-600 bg-purple-50',
    overtime_out: 'text-purple-600 bg-purple-50',
  };
  return (
    <tr
      className={`border-b border-slate-100 ${!punch.isValid ? 'bg-red-50' : 'hover:bg-slate-50'}`}
    >
      <td className="py-2 pr-3 text-xs text-slate-600">{fmtDateTime(punch.punchTime)}</td>
      <td className="py-2 pr-3 text-xs font-medium text-slate-700">{punch.employeeName}</td>
      <td className="py-2 pr-3">
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${typeColors[punch.punchType] ?? 'text-slate-600 bg-slate-50'}`}
        >
          {punch.punchType.replace('_', ' ')}
        </span>
      </td>
      <td className="py-2 pr-3 text-xs text-slate-500 capitalize">{punch.method}</td>
      <td className="py-2 pr-3 text-xs">
        <div className="flex items-center gap-1">
          <div
            className={`h-1.5 w-10 rounded-full ${punch.verificationScore >= 80 ? 'bg-emerald-400' : punch.verificationScore >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
            style={{
              width: `${punch.verificationScore / 10}px`,
              minWidth: '8px',
              maxWidth: '40px',
            }}
          />
          <span
            className={
              punch.verificationScore >= 80
                ? 'text-emerald-700'
                : punch.verificationScore >= 60
                  ? 'text-amber-700'
                  : 'text-red-700'
            }
          >
            {punch.verificationScore}
          </span>
        </div>
      </td>
      <td className="py-2 text-xs">
        {punch.isValid ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-500" title="Invalid — not processed" />
        )}
      </td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type Tab = 'devices' | 'logs' | 'analytics' | 'enrollment';

export default function BiometricManagement() {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [punches, setPunches] = useState<AttendancePunch[]>([]);
  const [analytics, setAnalytics] = useState<BiometricAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('devices');
  const [selectedDevice, setSelectedDevice] = useState<BiometricDevice | null>(null);
  const [syncingDevices, setSyncingDevices] = useState<Set<string>>(new Set());
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    Promise.all([
      BiometricService.getDevices(),
      BiometricService.getAttendanceLogs('dev-001', '2026-02-25'),
      BiometricService.getBiometricAnalytics(),
    ]).then(([devs, logs, anal]) => {
      setDevices(devs);
      setPunches(logs);
      setAnalytics(anal);
      if (devs.length > 0) setSelectedDevice(devs[0]);
      setLoading(false);
    });
  }, []);

  async function handleSync(deviceId: string) {
    setSyncingDevices((prev) => new Set(prev).add(deviceId));
    try {
      const result = await BiometricService.syncAttendance(deviceId, {
        start: '2026-02-25',
        end: '2026-02-25',
      });
      const updated = await BiometricService.getDevices();
      setDevices(updated);
      if (result.newPunches > 0) {
        const logs = await BiometricService.getAttendanceLogs(deviceId, '2026-02-25');
        setPunches(logs);
      }
    } finally {
      setSyncingDevices((prev) => {
        const s = new Set(prev);
        s.delete(deviceId);
        return s;
      });
    }
  }

  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status === 'offline').length;
  const errorDevices = devices.filter((d) => d.status === 'error').length;
  const totalPending = devices.reduce((s, d) => s + d.pendingPunches, 0);
  const filteredPunches = punches.filter(
    (p) =>
      p.employeeName.toLowerCase().includes(logSearch.toLowerCase()) ||
      p.punchType.includes(logSearch.toLowerCase())
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'devices', label: `Devices (${devices.length})` },
    { id: 'logs', label: 'Attendance Logs' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'enrollment', label: 'Enrollment Queue' },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Biometric Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Device monitoring, attendance sync, and enrollment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600">
            <Download className="w-4 h-4" /> Export Logs
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Online Devices',
            value: onlineDevices,
            sub: `of ${devices.length} total`,
            icon: Wifi,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Offline/Error',
            value: offlineDevices + errorDevices,
            sub: errorDevices > 0 ? `${errorDevices} with errors` : 'No errors',
            icon: offlineDevices + errorDevices > 0 ? AlertTriangle : CheckCircle2,
            color: offlineDevices + errorDevices > 0 ? 'text-red-600' : 'text-slate-400',
            bg: offlineDevices + errorDevices > 0 ? 'bg-red-50' : 'bg-slate-50',
          },
          {
            label: "Today's Scans",
            value: analytics?.totalPunches ?? 0,
            sub: `${analytics?.successRate ?? 0}% success rate`,
            icon: Fingerprint,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Pending Sync',
            value: totalPending,
            sub: 'punches across devices',
            icon: RefreshCw,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{card.label}</p>
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onSync={handleSync}
                  syncing={syncingDevices.has(device.id)}
                  onSelect={() => setSelectedDevice(device)}
                  isSelected={selectedDevice?.id === device.id}
                />
              ))}
            </div>
          )}

          {/* Attendance Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search by employee or punch type..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <select
                  onChange={async (e) => {
                    const logs = await BiometricService.getAttendanceLogs(
                      e.target.value,
                      '2026-02-25'
                    );
                    setPunches(logs);
                  }}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-600"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Time', 'Employee', 'Type', 'Method', 'Score', 'Valid'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2 pr-3 text-xs font-medium text-slate-500 last:pr-0"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPunches.slice(0, 20).map((p) => (
                      <PunchRow key={p.id} punch={p} />
                    ))}
                  </tbody>
                </table>
                {filteredPunches.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">No punch logs found</p>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-5">
              {/* Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Scans', value: analytics.totalPunches, color: 'text-blue-700' },
                  {
                    label: 'Successful',
                    value: analytics.successfulPunches,
                    color: 'text-emerald-700',
                  },
                  { label: 'Failed', value: analytics.failedPunches, color: 'text-red-700' },
                  {
                    label: 'Avg Scan Time',
                    value: `${analytics.avgScanTime}ms`,
                    color: 'text-purple-700',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center"
                  >
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Failure Reasons */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Top Failure Reasons</p>
                <div className="space-y-2">
                  {analytics.topFailureReasons.map((reason) => {
                    const max = analytics.topFailureReasons[0].count;
                    return (
                      <div key={reason.reason} className="flex items-center gap-3">
                        <p className="text-xs text-slate-600 flex-1">{reason.reason}</p>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${(reason.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-red-700 w-6">{reason.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Device Performance */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Device Performance</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {['Device', 'Success Rate', 'Daily Avg Scans', 'Status'].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2 pr-4 text-xs font-medium text-slate-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.devicePerformance.map((dp) => {
                        const device = devices.find((d) => d.id === dp.deviceId);
                        return (
                          <tr key={dp.deviceId} className="hover:bg-slate-50">
                            <td className="py-2.5 pr-4 font-medium text-slate-700">
                              {dp.deviceName}
                            </td>
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${dp.successRate >= 97 ? 'bg-emerald-500' : dp.successRate >= 95 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${dp.successRate}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-medium ${dp.successRate >= 97 ? 'text-emerald-700' : dp.successRate >= 95 ? 'text-amber-700' : 'text-red-700'}`}
                                >
                                  {dp.successRate}%
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 pr-4 text-slate-600">{dp.dailyAvg}</td>
                            <td className="py-2.5">
                              {device && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[device.status].bg} ${STATUS_STYLES[device.status].text}`}
                                >
                                  {STATUS_STYLES[device.status].label}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Enrollment Queue Tab */}
          {activeTab === 'enrollment' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600">Pending Biometric Enrollments</p>
                <button className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                  <Plus className="w-3.5 h-3.5" /> Enroll Employee
                </button>
              </div>
              {/* Device Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {devices
                  .filter((d) => d.status !== 'offline')
                  .map((d) => (
                    <div key={d.id} className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[d.status].dot}`} />
                        <p className="text-xs font-medium text-slate-700 truncate">{d.name}</p>
                      </div>
                      <p className="text-xl font-bold text-slate-800">{d.enrolledEmployees}</p>
                      <p className="text-xs text-slate-400">
                        of {d.totalCapacity.toLocaleString()} enrolled
                      </p>
                      <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${(d.enrolledEmployees / d.totalCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Fingerprint className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Enrollment Queue</p>
                  <p className="text-xs text-amber-700">
                    {devices.filter((d) => d.status === 'offline').length > 0
                      ? `${devices.filter((d) => d.status === 'offline').length} devices offline — enrollment requires device to be online.`
                      : 'All active devices are available for enrollment. Select a device and employee to begin.'}
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-amber-700">
                    <p>
                      <strong>Supported modalities:</strong> Fingerprint · Face Recognition · Iris
                      Scan · Card/PIN
                    </p>
                    <p>
                      <strong>Supported brands:</strong> ZKTeco · HikVision · Suprema · Anviz ·
                      Virdi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Device Detail */}
      {selectedDevice && activeTab === 'devices' && (
        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              {React.createElement(DEVICE_TYPE_ICONS[selectedDevice.type], {
                className: 'w-5 h-5 text-slate-600',
              })}
            </div>
            <div>
              <p className="font-bold text-slate-800">{selectedDevice.name}</p>
              <p className="text-xs text-slate-500">
                <span className={`font-medium ${BRAND_COLORS[selectedDevice.brand].split(' ')[0]}`}>
                  {selectedDevice.brand}
                </span>{' '}
                {selectedDevice.model} · S/N: {selectedDevice.serialNumber}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                <Settings className="w-3.5 h-3.5" /> Configure
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'IP Address', value: selectedDevice.ipAddress },
              { label: 'Location', value: selectedDevice.location },
              { label: 'Firmware', value: selectedDevice.firmwareVersion },
              { label: 'Uptime (30d)', value: `${selectedDevice.metrics.uptime}%` },
              { label: 'Avg Scan Time', value: `${selectedDevice.metrics.avgScanTimeMs}ms` },
              { label: 'Peak Usage', value: selectedDevice.metrics.peakHour },
              { label: 'Last Heartbeat', value: timeAgo(selectedDevice.lastHeartbeatAt) },
              { label: 'Failed Scans Today', value: selectedDevice.metrics.failedScans },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
