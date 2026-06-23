'use client';

import React, { useEffect, useState } from 'react';
import { Edit2, Globe, MapPin, Navigation, Plus, Save, Trash2, X } from 'lucide-react';

type Geofence = {
  id: string;
  name: string;
  description?: string | null;
  fenceType: 'OFFICE' | 'BRANCH' | 'SITE' | 'CUSTOM';
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address?: string | null;
  strictMode: boolean;
  isActive: boolean;
  version: number;
};

type FormState = {
  id?: string;
  version?: number;
  name: string;
  description: string;
  fenceType: Geofence['fenceType'];
  latitude: string;
  longitude: string;
  radiusMeters: string;
  address: string;
  strictMode: boolean;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  fenceType: 'OFFICE',
  latitude: '',
  longitude: '',
  radiusMeters: '100',
  address: '',
  strictMode: false,
  isActive: true,
};

async function apiCall<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      return { ok: false, error: json?.error || `Request failed (${res.status})` };
    }
    return { ok: true, data: json?.data };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error' };
  }
}

export default function GeoFencingPage() {
  const [fences, setFences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await apiCall<Geofence[]>('/api/attendance/geo-fencing');
    if (r.ok && r.data) {
      setFences(r.data);
      if (!selectedId && r.data.length > 0) setSelectedId(r.data[0].id);
    } else if (r.error) {
      setError(r.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setError(null);
    setEditing({ ...emptyForm });
  };

  const openEdit = (f: Geofence) => {
    setError(null);
    setEditing({
      id: f.id,
      version: f.version,
      name: f.name,
      description: f.description || '',
      fenceType: f.fenceType,
      latitude: String(f.latitude),
      longitude: String(f.longitude),
      radiusMeters: String(f.radiusMeters),
      address: f.address || '',
      strictMode: f.strictMode,
      isActive: f.isActive,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);

    const lat = Number(editing.latitude);
    const lon = Number(editing.longitude);
    const radius = Number(editing.radiusMeters);
    if (
      !editing.name.trim() ||
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      !Number.isFinite(radius)
    ) {
      setError('Name, latitude, longitude and radius are required and must be numeric.');
      setSaving(false);
      return;
    }

    let r;
    if (editing.id && editing.version !== undefined) {
      r = await apiCall<Geofence>('/api/attendance/geo-fencing', {
        method: 'PUT',
        body: JSON.stringify({
          id: editing.id,
          version: editing.version,
          patch: {
            name: editing.name,
            description: editing.description || undefined,
            fenceType: editing.fenceType,
            latitude: lat,
            longitude: lon,
            radiusMeters: radius,
            address: editing.address || undefined,
            strictMode: editing.strictMode,
            isActive: editing.isActive,
          },
        }),
      });
    } else {
      r = await apiCall<Geofence>('/api/attendance/geo-fencing', {
        method: 'POST',
        body: JSON.stringify({
          name: editing.name,
          description: editing.description || undefined,
          fenceType: editing.fenceType,
          latitude: lat,
          longitude: lon,
          radiusMeters: radius,
          address: editing.address || undefined,
          strictMode: editing.strictMode,
          isActive: editing.isActive,
        }),
      });
    }

    if (!r.ok) {
      setError(r.error || 'Failed to save');
      setSaving(false);
      return;
    }
    setEditing(null);
    setSaving(false);
    await load();
  };

  const remove = async (f: Geofence) => {
    if (!confirm(`Delete geofence "${f.name}"?`)) return;
    const r = await apiCall(`/api/attendance/geo-fencing?id=${f.id}`, { method: 'DELETE' });
    if (!r.ok) {
      setError(r.error || 'Failed to delete');
      return;
    }
    if (selectedId === f.id) setSelectedId(null);
    await load();
  };

  const selected = fences.find((f) => f.id === selectedId);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            Geo-Fencing
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Define valid physical locations for mobile attendance clock-in.
          </p>
        </div>
        <button
          onClick={openNew}
          className="self-start flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Geofence
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-2 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : fences.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-cloud dark:border-nebula-purple/50 rounded-xl">
              No geo-fences configured yet
            </div>
          ) : (
            fences.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`p-4 bg-white dark:bg-stellar-blue rounded-xl border shadow-sm cursor-pointer transition-all group ${
                  selectedId === f.id
                    ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/30'
                    : 'border-cloud dark:border-nebula-purple/50 hover:border-indigo-300'
                } ${f.isActive ? '' : 'opacity-60'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`w-5 h-5 ${f.isActive ? 'text-emerald-500' : 'text-slate-400'}`}
                    />
                    <h3 className="font-bold text-ink-black dark:text-pearl">{f.name}</h3>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${f.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  />
                </div>

                {f.address && (
                  <p className="text-sm text-slate-500 mb-2 line-clamp-2">{f.address}</p>
                )}

                <div className="flex items-center justify-between text-xs text-silver-mist mb-3">
                  <span className="font-mono">{f.fenceType}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Navigation className="w-3 h-3" /> {f.radiusMeters}m
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-cloud dark:border-nebula-purple/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(f);
                    }}
                    className="flex-1 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(f);
                    }}
                    className="flex-1 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail / preview */}
        <div className="lg:col-span-2 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm min-h-[400px] p-6">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-ink-black dark:text-pearl">
                  {selected.name}
                </h2>
                {selected.description && (
                  <p className="text-sm text-slate-500 mt-1">{selected.description}</p>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Type" value={selected.fenceType} />
                <Field
                  label="Status"
                  value={selected.isActive ? 'Active' : 'Inactive'}
                  tone={selected.isActive ? 'success' : 'muted'}
                />
                <Field
                  label="Coordinates"
                  value={`${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}`}
                  mono
                />
                <Field label="Radius" value={`${selected.radiusMeters} m`} mono />
                <Field label="Strict mode" value={selected.strictMode ? 'On' : 'Off'} />
                {selected.address && <Field label="Address" value={selected.address} span={2} />}
              </dl>

              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                <p className="text-xs font-medium text-silver-mist mb-2">Preview</p>
                <div className="flex items-center justify-center p-6">
                  <div className="relative">
                    <div
                      className="rounded-full bg-indigo-500/15 border-2 border-indigo-500/40 flex items-center justify-center"
                      style={{ width: 200, height: 200 }}
                    >
                      <span className="absolute -top-7 text-xs font-bold text-indigo-600">
                        {selected.radiusMeters}m radius
                      </span>
                      <MapPin className="w-7 h-7 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-silver-mist">
                  Visual preview only — open an external map to see the actual region.
                </p>
                <div className="text-center mt-2">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=16/${selected.latitude}/${selected.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Open in OpenStreetMap →
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-silver-mist">
              {fences.length === 0
                ? 'Add a geofence to get started.'
                : 'Select a geofence from the list to view details.'}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <Drawer
          title={editing.id ? `Edit ${editing.name}` : 'New geofence'}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={saving}
        >
          <FormGrid>
            <TextField
              label="Name"
              required
              value={editing.name}
              onChange={(v) => setEditing({ ...editing, name: v })}
            />
            <SelectField
              label="Type"
              value={editing.fenceType}
              options={['OFFICE', 'BRANCH', 'SITE', 'CUSTOM']}
              onChange={(v) => setEditing({ ...editing, fenceType: v as Geofence['fenceType'] })}
            />
            <TextField
              label="Latitude"
              required
              placeholder="e.g. 25.204849"
              value={editing.latitude}
              onChange={(v) => setEditing({ ...editing, latitude: v })}
            />
            <TextField
              label="Longitude"
              required
              placeholder="e.g. 55.270782"
              value={editing.longitude}
              onChange={(v) => setEditing({ ...editing, longitude: v })}
            />
            <TextField
              label="Radius (meters)"
              required
              type="number"
              value={editing.radiusMeters}
              onChange={(v) => setEditing({ ...editing, radiusMeters: v })}
            />
            <TextField
              label="Address"
              value={editing.address}
              onChange={(v) => setEditing({ ...editing, address: v })}
            />
            <TextAreaField
              label="Description"
              value={editing.description}
              onChange={(v) => setEditing({ ...editing, description: v })}
              span={2}
            />
            <CheckboxField
              label="Active"
              checked={editing.isActive}
              onChange={(v) => setEditing({ ...editing, isActive: v })}
            />
            <CheckboxField
              label="Strict mode"
              checked={editing.strictMode}
              onChange={(v) => setEditing({ ...editing, strictMode: v })}
            />
          </FormGrid>
        </Drawer>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  tone,
  span,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: 'success' | 'muted';
  span?: number;
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-300'
      : tone === 'muted'
        ? 'text-slate-400'
        : 'text-ink-black dark:text-pearl';
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <dt className="text-xs font-medium text-silver-mist mb-0.5">{label}</dt>
      <dd className={`${mono ? 'font-mono' : 'font-medium'} ${toneClass}`}>{value}</dd>
    </div>
  );
}

function Drawer({
  title,
  onClose,
  onSave,
  saving,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-stellar-blue w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cloud dark:border-nebula-purple/30">
          <h3 className="font-bold text-ink-black dark:text-pearl">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-cloud dark:border-nebula-purple/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function TextField({
  label,
  value,
  onChange,
  required,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-silver-mist mb-1">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      <input
        type={type || 'text'}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-pearl dark:bg-slate-900/40 rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-indigo-200 outline-none"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  span?: number;
}) {
  return (
    <label className={`block ${span === 2 ? 'sm:col-span-2' : ''}`}>
      <span className="block text-xs font-medium text-silver-mist mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 bg-pearl dark:bg-slate-900/40 rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-silver-mist mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-pearl dark:bg-slate-900/40 rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-indigo-200 outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer mt-5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-indigo-600"
      />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </label>
  );
}
