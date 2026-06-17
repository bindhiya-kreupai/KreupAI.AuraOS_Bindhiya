'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Save,
  Settings,
  Shield,
  Smartphone,
} from 'lucide-react';
import { AttendanceSettingsService } from '../services';

interface RulesConfig {
  gracePeriodMinutes: number;
  earlyExitBufferMinutes: number;
  autoCheckout: boolean;
  halfDayThresholdHours: number;
  allowMobilePunch: boolean;
}

interface LocationPolicy {
  id: string;
  name: string;
  type: 'Geo-Fence' | 'IP Range';
  value: string;
  active: boolean;
}

const DEFAULT_CONFIG: RulesConfig = {
  gracePeriodMinutes: 15,
  earlyExitBufferMinutes: 10,
  autoCheckout: true,
  halfDayThresholdHours: 4.0,
  allowMobilePunch: true,
};

const LOCAL_STORAGE_KEY = 'auraos.attendance.rules.v1';

export default function AttendanceRulesPage() {
  const [config, setConfig] = useState<RulesConfig>(DEFAULT_CONFIG);
  const [locations, setLocations] = useState<LocationPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        const localConfig: Partial<RulesConfig> = raw ? JSON.parse(raw) : {};

        const settings: any = await AttendanceSettingsService.getSettings().catch(() => null);
        const serverPart: Partial<RulesConfig> = settings
          ? {
              autoCheckout: settings.autoMarkAbsent ?? DEFAULT_CONFIG.autoCheckout,
              allowMobilePunch: settings.enableMobileCheckIn ?? DEFAULT_CONFIG.allowMobilePunch,
            }
          : {};

        if (!cancelled) {
          setConfig({ ...DEFAULT_CONFIG, ...localConfig, ...serverPart });
        }

        const res = await fetch('/api/attendance/geo-fencing');
        const json = await res.json().catch(() => ({}));
        if (!cancelled && json?.success !== false && Array.isArray(json?.data)) {
          const mapped: LocationPolicy[] = json.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            type: 'Geo-Fence',
            value: `${g.latitude?.toFixed?.(4) ?? g.latitude}, ${g.longitude?.toFixed?.(4) ?? g.longitude} · ${g.radiusMeters}m`,
            active: g.isActive,
          }));
          setLocations(mapped);
        }
      } catch (e: any) {
        console.error('Error loading rules:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof RulesConfig>(field: K, value: RulesConfig[K]) => {
    setConfig((c) => ({ ...c, [field]: value }));
    setStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
      await AttendanceSettingsService.updateSettings({
        autoMarkAbsent: config.autoCheckout,
        enableMobileCheckIn: config.allowMobilePunch,
      } as any).catch(() => null);
      setStatus({ kind: 'success', text: 'Settings saved.' });
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            Attendance Configuration
          </h1>
          <p className="text-slate-500 text-sm">
            Manage punch rules, geo-fencing policies, and device restrictions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
            <Shield className="w-4 h-4" /> Policy Active
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Time Capture Rules
          </h3>
          <div className="space-y-4">
            <NumberRow
              label="Grace Period"
              hint="Allow late entry without penalty"
              value={config.gracePeriodMinutes}
              unit="min"
              min={0}
              onChange={(v) => update('gracePeriodMinutes', v)}
            />
            <NumberRow
              label="Early Exit Buffer"
              hint="Allowed early leave duration"
              value={config.earlyExitBufferMinutes}
              unit="min"
              min={0}
              onChange={(v) => update('earlyExitBufferMinutes', v)}
            />
            <ToggleRow
              label="Auto-Checkout"
              hint="System auto-out at shift end + buffer"
              checked={config.autoCheckout}
              onChange={(v) => update('autoCheckout', v)}
            />
            <NumberRow
              label="Half-Day Threshold"
              hint="Min hours to count as half day"
              value={config.halfDayThresholdHours}
              unit="hrs"
              step={0.5}
              min={0}
              onChange={(v) => update('halfDayThresholdHours', v)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" /> Geo-Fencing &amp; IP
            </h3>
            <div className="space-y-3">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : locations.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">
                  No location policies configured.
                </div>
              ) : (
                locations.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {l.type === 'Geo-Fence' ? (
                          <MapPin className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Globe className="w-3 h-3 text-blue-500" />
                        )}
                        {l.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{l.value}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        l.active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {l.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/dashboard/attendance/geo-fencing"
              className="block text-center w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              + Add New Location Policy
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-500" /> Mobile Restrictions
            </h3>
            <ToggleRow
              label="Allow Mobile Punch"
              hint="Only from verified devices"
              checked={config.allowMobilePunch}
              onChange={(v) => update('allowMobilePunch', v)}
              tone="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberRow({
  label,
  hint,
  value,
  unit,
  onChange,
  step,
  min,
}: {
  label: string;
  hint?: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
      <div>
        <div className="font-bold text-sm">{label}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={step ?? 1}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 px-2 py-1 text-right font-bold text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-indigo-300 focus:outline-none"
        />
        <span className="text-xs font-bold text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  tone,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tone?: 'purple';
}) {
  const onColor = tone === 'purple' ? 'bg-purple-500' : 'bg-emerald-500';
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <div className="font-bold text-sm">{label}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
          checked ? onColor : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
            checked ? 'right-1' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
