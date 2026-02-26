/**
 * @module MobileSecuritySettings
 * @description Mobile security settings panel — device list with compliance badges,
 *              biometric toggle, auto-lock selector, PIN requirement, remote wipe,
 *              encryption status, lost device reporting, security policy viewer (Sec 15.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Fingerprint,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  HardDrive,
  ChevronDown,
  ChevronUp,
  MapPin,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import {
  MobileSecurityService,
  type RegisteredDevice,
  type SecurityPolicy,
  type DevicePlatform,
  type ComplianceReason,
} from '@/services/mobileSecurityService';

// ── Constants ─────────────────────────────────────────────────────────────────

const AUTO_LOCK_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
];

const COMPLIANCE_REASON_LABELS: Record<ComplianceReason, string> = {
  os_outdated: 'OS version outdated',
  encryption_disabled: 'Encryption disabled',
  jailbroken: 'Device is jailbroken',
  rooted: 'Device is rooted',
  pin_not_set: 'PIN not configured',
  screen_lock_disabled: 'Screen lock disabled',
  unknown_source_apps: 'Unknown source apps allowed',
  compliant: 'Fully compliant',
};

const INCIDENT_TYPES = [
  { value: 'lost', label: 'Lost Device' },
  { value: 'stolen', label: 'Stolen Device' },
  { value: 'compromised', label: 'Compromised / Hacked' },
  { value: 'unauthorized_access', label: 'Unauthorized Access Detected' },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: RegisteredDevice['status']) {
  const map: Record<RegisteredDevice['status'], { label: string; cls: string }> = {
    compliant: { label: 'Compliant', cls: 'bg-emerald-100 text-emerald-700' },
    non_compliant: { label: 'Non-Compliant', cls: 'bg-red-100 text-red-700' },
    revoked: { label: 'Revoked', cls: 'bg-slate-200 text-slate-600' },
    registered: { label: 'Registered', cls: 'bg-blue-100 text-blue-700' },
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function platformIcon(platform: DevicePlatform) {
  const icons: Record<DevicePlatform, string> = {
    iOS: '🍎',
    Android: '🤖',
    Windows: '🪟',
    macOS: '💻',
  };
  return icons[platform] ?? '📱';
}

// ── Device Card ────────────────────────────────────────────────────────────────

function DeviceCard({
  device,
  onRevoke,
  onReport,
}: {
  device: RegisteredDevice;
  onRevoke: (id: string, model: string) => void;
  onReport: (deviceId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isNonCompliant = device.status === 'non_compliant';
  const isRevoked = device.status === 'revoked';

  return (
    <div
      className={`rounded-xl border ${isNonCompliant ? 'border-red-200 bg-red-50' : isRevoked ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'} overflow-hidden`}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="text-2xl select-none">{platformIcon(device.platform)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm truncate">{device.model}</p>
            {statusBadge(device.status)}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {device.platform} {device.osVersion} · {device.userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isRevoked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport(device.id);
              }}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Report lost/stolen"
            >
              <MapPin className="w-4 h-4" />
            </button>
          )}
          {!isRevoked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRevoke(device.id, device.model);
              }}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Revoke device"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-400 font-medium uppercase tracking-wide mb-1">Security</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {device.isEncrypted ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="text-slate-600">
                  Encryption {device.isEncrypted ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {device.hasPinSet ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="text-slate-600">PIN {device.hasPinSet ? 'Set' : 'Not Set'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!device.isJailbroken ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="text-slate-600">
                  {device.isJailbroken ? 'Jailbroken!' : 'Not jailbroken'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-medium uppercase tracking-wide mb-1">Details</p>
            <div className="space-y-1 text-slate-600">
              <p>
                Biometric:{' '}
                <span className="font-medium capitalize">
                  {device.biometricType.replace('_', ' ')}
                </span>
              </p>
              <p>App v{device.appVersion}</p>
              <p>Last active: {new Date(device.lastActiveAt).toLocaleDateString()}</p>
            </div>
          </div>
          {isNonCompliant && device.complianceReasons.length > 0 && (
            <div className="col-span-2 bg-red-100 rounded-lg p-2">
              <p className="text-red-700 font-semibold mb-1">Issues:</p>
              {device.complianceReasons
                .filter((r) => r !== 'compliant')
                .map((r) => (
                  <p key={r} className="text-red-600">
                    • {COMPLIANCE_REASON_LABELS[r]}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Toggle Switch ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ── Policy Section ────────────────────────────────────────────────────────────

function PolicyViewer({ policy }: { policy: SecurityPolicy }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
      {[
        { label: 'PIN Required', value: policy.pinRequired ? 'Yes' : 'No' },
        { label: 'Biometric Enabled', value: policy.biometricEnabled ? 'Yes' : 'No' },
        { label: 'Auto-Lock Timeout', value: `${policy.autoLockTimeoutMinutes} min` },
        {
          label: 'Data Encryption',
          value: policy.dataEncryptionRequired ? 'Required' : 'Optional',
        },
        { label: 'Jailbreak Detection', value: policy.jailbreakDetection ? 'Enabled' : 'Disabled' },
        { label: 'Max Failed Attempts', value: String(policy.maxFailedAttempts) },
        { label: 'Remote Wipe', value: policy.remoteWipeEnabled ? 'Enabled' : 'Disabled' },
        { label: 'VPN Required', value: policy.vpnRequired ? 'Yes' : 'No' },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between">
          <span className="text-slate-500">{label}</span>
          <span className="font-semibold text-slate-800">{value}</span>
        </div>
      ))}
      <div>
        <p className="text-slate-500 mb-1">Min OS Versions:</p>
        {Object.entries(policy.minOsVersion).map(([p, v]) => (
          <div key={p} className="flex justify-between pl-3">
            <span className="text-slate-400">{p}</span>
            <span className="font-medium text-slate-700">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Report Modal ──────────────────────────────────────────────────────────────

function ReportModal({
  deviceId,
  devices,
  onClose,
  onSubmit,
}: {
  deviceId: string;
  devices: RegisteredDevice[];
  onClose: () => void;
  onSubmit: (data: { deviceId: string; incidentType: string; description: string }) => void;
}) {
  const [incidentType, setIncidentType] = useState<
    'lost' | 'stolen' | 'compromised' | 'unauthorized_access'
  >('lost');
  const [description, setDescription] = useState('');
  const device = devices.find((d) => d.id === deviceId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900">Report Lost / Stolen Device</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {device && (
            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              <p className="font-semibold text-slate-700">{device.model}</p>
              <p className="text-slate-500">
                {device.platform} {device.osVersion}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Incident Type</label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as typeof incidentType)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {INCIDENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the incident..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            Reporting will trigger an immediate remote wipe request and lock the device.
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ deviceId, incidentType, description })}
            disabled={!description.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Report & Wipe
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MobileSecuritySettings() {
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'devices' | 'settings' | 'policy'>('devices');
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pinRequired, setPinRequired] = useState(true);
  const [autoLock, setAutoLock] = useState(5);
  const [revokeConfirm, setRevokeConfirm] = useState<{ id: string; model: string } | null>(null);
  const [reportDeviceId, setReportDeviceId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [report, pol] = await Promise.all([
        MobileSecurityService.getDeviceComplianceReport(),
        MobileSecurityService.getSecurityPolicy(),
      ]);
      setDevices(report.devices);
      setPolicy(pol);
      setBiometricEnabled(pol.biometricEnabled);
      setPinRequired(pol.pinRequired);
      setAutoLock(pol.autoLockTimeoutMinutes);
      setLoading(false);
    })();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRevoke = async (id: string, model: string) => {
    setRevokeConfirm({ id, model });
  };

  const confirmRevoke = async () => {
    if (!revokeConfirm) return;
    setActionLoading(true);
    const result = await MobileSecurityService.revokeDevice(revokeConfirm.id);
    setDevices((prev) =>
      prev.map((d) => (d.id === revokeConfirm.id ? { ...d, status: 'revoked' } : d))
    );
    setRevokeConfirm(null);
    setActionLoading(false);
    showToast(result.message);
  };

  const handleReport = async (data: {
    deviceId: string;
    incidentType: string;
    description: string;
  }) => {
    setActionLoading(true);
    await MobileSecurityService.reportSecurityIncident({
      deviceId: data.deviceId,
      reportedBy: 'current-user',
      incidentType: data.incidentType as 'lost',
      description: data.description,
    });
    setReportDeviceId(null);
    setActionLoading(false);
    showToast('Incident reported. Remote wipe initiated.');
  };

  const compliantCount = devices.filter((d) => d.status === 'compliant').length;
  const nonCompliantCount = devices.filter((d) => d.status === 'non_compliant').length;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mobile Security</h1>
          <p className="text-sm text-slate-500">Device management & security settings</p>
        </div>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Devices', value: devices.length, cls: 'text-slate-700' },
            { label: 'Compliant', value: compliantCount, cls: 'text-emerald-600' },
            { label: 'Issues', value: nonCompliantCount, cls: 'text-red-600' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-200 p-3 text-center"
            >
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {(['devices', 'settings', 'policy'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No devices registered</p>
            </div>
          ) : (
            devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onRevoke={handleRevoke}
                onReport={setReportDeviceId}
              />
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Biometric */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <div className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">Biometric Authentication</p>
                <p className="text-xs text-slate-500">Fingerprint or Face ID login</p>
              </div>
              <Toggle checked={biometricEnabled} onChange={setBiometricEnabled} />
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">Require PIN / Password</p>
                <p className="text-xs text-slate-500">Mandatory PIN for app access</p>
              </div>
              <Toggle checked={pinRequired} onChange={setPinRequired} />
            </div>
          </div>

          {/* Auto-Lock */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Auto-Lock Timeout</p>
                <p className="text-xs text-slate-500">Lock app after inactivity</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AUTO_LOCK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAutoLock(opt.value)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${autoLock === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-700 hover:border-indigo-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Encryption Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">Data Encryption</p>
                <p className="text-xs text-slate-500">AES-256 encryption at rest</p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Active</span>
              </div>
            </div>
          </div>

          {/* Save */}
          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
            Save Security Settings
          </button>
        </div>
      )}

      {/* Policy Tab */}
      {activeTab === 'policy' && policy && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p>
              Security policy is set by your IT administrator and cannot be changed by employees.
            </p>
          </div>
          <PolicyViewer policy={policy} />
        </div>
      )}

      {/* Revoke Confirm Modal */}
      {revokeConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900">Revoke Device?</h3>
              <p className="text-sm text-slate-500 mt-1">
                This will remotely wipe and block{' '}
                <span className="font-semibold">{revokeConfirm.model}</span>. This action cannot be
                undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRevokeConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevoke}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Revoke & Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportDeviceId && (
        <ReportModal
          deviceId={reportDeviceId}
          devices={devices}
          onClose={() => setReportDeviceId(null)}
          onSubmit={handleReport}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
