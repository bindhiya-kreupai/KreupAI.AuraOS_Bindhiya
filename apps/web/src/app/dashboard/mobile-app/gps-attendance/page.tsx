'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Navigation,
  LocateFixed,
  Scan,
  AlertTriangle,
  Plus,
  Users,
  X,
  Loader2,
} from 'lucide-react';
import { GPSAttendanceService } from '../services';

// Geofence shape returned by GET /api/v1/attendance/geofences
interface Geofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  address?: string | null;
  isActive: boolean;
}

async function apiFetch<T>(
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
      return { ok: false, error: json?.error?.message || `Request failed (${res.status})` };
    }
    return { ok: true, data: json?.data as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error' };
  }
}

export default function GlobalPositioningPage() {
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [showAddGeofence, setShowAddGeofence] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null
  );
  const kmlInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(null), 4000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configData, checkInsData, geofenceRes] = await Promise.all([
        GPSAttendanceService.getConfig(),
        GPSAttendanceService.getAllCheckIns(),
        apiFetch<{ geofences: Geofence[] }>('/api/v1/attendance/geofences'),
      ]);
      if (configData) {
        setConfig(configData);
        setTrackingEnabled(Boolean((configData as any).gpsEnabled));
      }
      setCheckIns(Array.isArray(checkInsData) ? checkInsData : []);
      if (geofenceRes.ok && geofenceRes.data) {
        setGeofences(geofenceRes.data.geofences || []);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: 'Failed to load GPS data.' });
    } finally {
      setLoading(false);
    }
  };

  // ---- Button: Live Tracking -> real-time tracking dashboard -----------------
  const handleLiveTracking = () => {
    router.push('/dashboard/attendance/live-tracking');
  };

  // ---- Button: Enable / Disable Tracking -------------------------------------
  const handleToggleTracking = async () => {
    setBusy('tracking');
    setStatusMsg(null);
    try {
      const next = !trackingEnabled;
      await GPSAttendanceService.updateConfig({ gpsEnabled: next } as any);
      setTrackingEnabled(next);
      setStatusMsg({
        kind: 'success',
        text: next ? 'GPS tracking enabled.' : 'GPS tracking disabled.',
      });
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to update tracking.' });
    } finally {
      setBusy(null);
    }
  };

  // ---- Button: Add Geofence (via modal) --------------------------------------
  const handleCreateGeofence = async (input: {
    name: string;
    lat: number;
    lng: number;
    radius: number;
    address?: string;
  }) => {
    setBusy('geofence');
    setStatusMsg(null);
    const res = await apiFetch<Geofence>('/api/v1/attendance/geofences', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setBusy(null);
    if (!res.ok) {
      setStatusMsg({ kind: 'error', text: res.error || 'Failed to create geofence.' });
      return;
    }
    setShowAddGeofence(false);
    await fetchData();
    setStatusMsg({ kind: 'success', text: `Geofence "${input.name}" created.` });
  };

  // ---- Button: Import KML -----------------------------------------------------
  const handleKmlSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setBusy('kml');
    setStatusMsg(null);
    try {
      const text = await file.text();
      const placemarks = parseKml(text);
      if (placemarks.length === 0) {
        setStatusMsg({ kind: 'error', text: 'No placemarks with coordinates found in KML.' });
        return;
      }
      const results = await Promise.allSettled(
        placemarks.map((p) =>
          apiFetch<Geofence>('/api/v1/attendance/geofences', {
            method: 'POST',
            body: JSON.stringify({
              name: p.name,
              lat: p.lat,
              lng: p.lng,
              radius: p.radius,
            }),
          })
        )
      );
      const created = results.filter((r) => r.status === 'fulfilled' && (r.value as any).ok).length;
      await fetchData();
      setStatusMsg({
        kind: created > 0 ? 'success' : 'error',
        text:
          created > 0
            ? `Imported ${created} geofence(s) from ${file.name}.`
            : 'Failed to import geofences from KML.',
      });
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: 'Could not read the KML file.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-500" />
            GPS Attendance
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor field staff locations and manage geofencing rules.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleLiveTracking}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <LocateFixed className="w-4 h-4" /> Live Tracking
          </button>
          <button
            type="button"
            onClick={() => setShowAddGeofence(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Geofence
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            statusMsg.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Geofence map summary + live location tags */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 h-[300px] relative overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <div className="font-bold text-slate-900 dark:text-slate-100">Location Overview</div>
              <div className="text-xs text-slate-500">
                {loading
                  ? 'Loading…'
                  : `${geofences.length} geofence(s) · ${checkIns.length} recent location tag(s)`}
              </div>
            </div>
          </div>

          {/* Live Location Tags from check-ins */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-bold">
              Recent Location Tags
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="px-6 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                </div>
              ) : checkIns.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  No location tags recorded yet.
                </div>
              ) : (
                checkIns.slice(0, 20).map((row: any, i: number) => {
                  const valid = row.insideGeofence !== false;
                  const name = row.userName || row.employeeName || row.userId || 'Unknown';
                  const place =
                    row.nearestLocation?.name ||
                    row.location?.address ||
                    (row.location
                      ? `${row.location.latitude ?? row.location.lat}, ${row.location.longitude ?? row.location.lng}`
                      : 'Unknown location');
                  const time = row.timestamp
                    ? new Date(row.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';
                  return (
                    <div
                      key={row.checkInId || i}
                      className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${valid ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        ></div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {place}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{time}</div>
                        <div
                          className={`text-xs font-medium ${valid ? 'text-emerald-600' : 'text-rose-600'}`}
                        >
                          {valid ? 'On-site' : 'Out of Bounds'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Geofence Rules (live) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Scan className="w-4 h-4 text-indigo-500" /> Geofence Configuration
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="py-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                </div>
              ) : geofences.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">
                  No geofences yet. Use “Add Geofence” to create one.
                </div>
              ) : (
                geofences.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm">{zone.name}</div>
                      <div
                        className={`w-2 h-2 rounded-full ${zone.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 group-hover:text-indigo-600">
                        <AlertTriangle className="w-3 h-3" /> {zone.radius}m
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3 h-3" />{' '}
                        {zone.address || `${zone.lat.toFixed(3)}, ${zone.lng.toFixed(3)}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <input
              ref={kmlInputRef}
              type="file"
              accept=".kml,application/vnd.google-earth.kml+xml,text/xml"
              onChange={handleKmlSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => kmlInputRef.current?.click()}
              disabled={busy === 'kml'}
              className="w-full mt-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy === 'kml' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Importing…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Import KML / Map Data
                </>
              )}
            </button>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold mb-1">Field Force Tracking</h3>
            <p className="text-indigo-200 text-xs mb-4">
              {trackingEnabled
                ? 'Real-time breadcrumbs are active for delivery and logistics teams.'
                : 'Enable real-time breadcrumbs for delivery and logistics teams.'}
            </p>
            <button
              type="button"
              onClick={handleToggleTracking}
              disabled={busy === 'tracking'}
              className={`px-4 py-2 rounded-lg text-sm font-bold w-full flex items-center justify-center gap-2 disabled:opacity-60 ${
                trackingEnabled
                  ? 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                  : 'bg-white text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              {busy === 'tracking' && <Loader2 className="w-4 h-4 animate-spin" />}
              {trackingEnabled ? 'Disable Tracking' : 'Enable Tracking'}
            </button>
          </div>
        </div>
      </div>

      {showAddGeofence && (
        <AddGeofenceModal
          saving={busy === 'geofence'}
          onClose={() => setShowAddGeofence(false)}
          onSave={handleCreateGeofence}
        />
      )}
    </div>
  );
}

// ---- Minimal KML parser: extracts <Placemark> name + first coordinate --------
function parseKml(text: string): Array<{ name: string; lat: number; lng: number; radius: number }> {
  const out: Array<{ name: string; lat: number; lng: number; radius: number }> = [];
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return out;
  try {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const placemarks = Array.from(doc.getElementsByTagName('Placemark'));
    placemarks.forEach((pm, idx) => {
      const name =
        pm.getElementsByTagName('name')[0]?.textContent?.trim() || `Imported Zone ${idx + 1}`;
      const coordEl = pm.getElementsByTagName('coordinates')[0];
      const raw = coordEl?.textContent?.trim();
      if (!raw) return;
      // KML coordinates are lng,lat[,alt]; take the first tuple.
      const first = raw.split(/\s+/)[0];
      const [lng, lat] = first.split(',').map((n) => parseFloat(n));
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        out.push({ name, lat, lng, radius: 200 });
      }
    });
  } catch {
    // ignore parse failures — caller surfaces an error
  }
  return out;
}

function AddGeofenceModal({
  saving,
  onClose,
  onSave,
}: {
  saving: boolean;
  onClose: () => void;
  onSave: (input: {
    name: string;
    lat: number;
    lng: number;
    radius: number;
    address?: string;
  }) => void;
}) {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('200');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    const radN = parseInt(radius, 10);
    if (!name.trim()) return setError('Name is required.');
    if (!Number.isFinite(latN) || latN < -90 || latN > 90)
      return setError('Latitude must be between -90 and 90.');
    if (!Number.isFinite(lngN) || lngN < -180 || lngN > 180)
      return setError('Longitude must be between -180 and 180.');
    if (!Number.isFinite(radN) || radN <= 0) return setError('Radius must be a positive number.');
    setError(null);
    onSave({
      name: name.trim(),
      lat: latN,
      lng: lngN,
      radius: radN,
      address: address.trim() || undefined,
    });
  };

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => setError('Could not read your current location.')
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold flex items-center gap-2">
            <Scan className="w-4 h-4 text-indigo-500" /> Add Geofence
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3 text-sm">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}
          <label className="block">
            <span className="block text-xs font-bold text-slate-500 mb-1 uppercase">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                Latitude
              </span>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                Longitude
              </span>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                inputMode="decimal"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <LocateFixed className="w-3 h-3" /> Use my current location
          </button>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                Radius (m)
              </span>
              <input
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                inputMode="numeric"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-500 mb-1 uppercase">Address</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
