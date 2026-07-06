'use client';

import { useEffect, useState } from 'react';

interface TransportRoute {
  id: string;
  siteId: string;
  routeCode: string;
  label: string;
  vehicleType: string | null;
  capacity: number | null;
  distanceKm: number | null;
  isActive: boolean;
}

interface Clinic {
  id: string;
  siteId: string;
  clinicCode: string;
  label: string;
  isOnSite: boolean;
  nearestHospital: string | null;
  isActive: boolean;
}

interface MaintenanceTicket {
  id: string;
  siteId: string;
  ticketCode: string;
  category: string;
  severity: string;
  status: string;
  description: string;
}

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function AccommodationOpsPage() {
  const [message, setMessage] = useState('');

  // Transport routes
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [routeSiteFilter, setRouteSiteFilter] = useState('');
  const [routeForm, setRouteForm] = useState({
    siteId: '',
    routeCode: '',
    label: '',
    vehicleType: '',
    capacity: '',
    distanceKm: '',
    isActive: true,
  });

  // Clinics
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicSiteFilter, setClinicSiteFilter] = useState('');
  const [clinicForm, setClinicForm] = useState({
    siteId: '',
    clinicCode: '',
    label: '',
    isOnSite: true,
    nearestHospital: '',
    nearestHospitalDistanceKm: '',
    operatingHours: '',
    isActive: true,
  });
  const [inspectionResult, setInspectionResult] = useState<Record<string, string>>({});

  // Maintenance
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [ticketFilter, setTicketFilter] = useState({ status: '', severity: '', siteId: '' });
  const [ticketForm, setTicketForm] = useState({
    siteId: '',
    ticketCode: '',
    category: '',
    severity: 'MEDIUM',
    description: '',
  });
  const [resolveNotes, setResolveNotes] = useState<Record<string, string>>({});

  async function loadRoutes() {
    const url = new URL('/api/v1/workforce-extensions/transport-routes', window.location.origin);
    if (routeSiteFilter) url.searchParams.set('siteId', routeSiteFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRoutes((p.data?.items ?? []) as TransportRoute[]);
  }

  async function loadClinics() {
    const url = new URL('/api/v1/workforce-extensions/clinics', window.location.origin);
    if (clinicSiteFilter) url.searchParams.set('siteId', clinicSiteFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setClinics((p.data?.items ?? []) as Clinic[]);
  }

  async function loadTickets() {
    const url = new URL('/api/v1/workforce-extensions/maintenance', window.location.origin);
    if (ticketFilter.status) url.searchParams.set('status', ticketFilter.status);
    if (ticketFilter.severity) url.searchParams.set('severity', ticketFilter.severity);
    if (ticketFilter.siteId) url.searchParams.set('siteId', ticketFilter.siteId);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setTickets((p.data?.items ?? []) as MaintenanceTicket[]);
  }

  useEffect(() => {
    loadRoutes();
  }, [routeSiteFilter]);
  useEffect(() => {
    loadClinics();
  }, [clinicSiteFilter]);
  useEffect(() => {
    loadTickets();
  }, [ticketFilter.status, ticketFilter.severity, ticketFilter.siteId]);

  async function saveRoute() {
    const r = await fetch('/api/v1/workforce-extensions/transport-routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        siteId: routeForm.siteId,
        routeCode: routeForm.routeCode,
        label: routeForm.label,
        vehicleType: routeForm.vehicleType || undefined,
        capacity: routeForm.capacity ? Number(routeForm.capacity) : undefined,
        distanceKm: routeForm.distanceKm ? Number(routeForm.distanceKm) : undefined,
        isActive: routeForm.isActive,
      }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Saved');
      loadRoutes();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  async function saveClinic() {
    const r = await fetch('/api/v1/workforce-extensions/clinics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        siteId: clinicForm.siteId,
        clinicCode: clinicForm.clinicCode,
        label: clinicForm.label,
        isOnSite: clinicForm.isOnSite,
        nearestHospital: clinicForm.nearestHospital || undefined,
        nearestHospitalDistanceKm: clinicForm.nearestHospitalDistanceKm
          ? Number(clinicForm.nearestHospitalDistanceKm)
          : undefined,
        operatingHours: clinicForm.operatingHours || undefined,
        isActive: clinicForm.isActive,
      }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Saved');
      loadClinics();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  async function recordInspection(id: string) {
    const result = inspectionResult[id] ?? 'PASS';
    const r = await fetch('/api/v1/workforce-extensions/clinics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record-inspection', id, result }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Inspection recorded');
      loadClinics();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  async function openTicket() {
    const r = await fetch('/api/v1/workforce-extensions/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'open',
        siteId: ticketForm.siteId,
        ticketCode: ticketForm.ticketCode,
        category: ticketForm.category,
        severity: ticketForm.severity,
        description: ticketForm.description,
      }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Opened');
      loadTickets();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  async function resolveTicket(id: string) {
    const notes = resolveNotes[id] ?? '';
    const r = await fetch('/api/v1/workforce-extensions/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', id, notes }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Resolved');
      loadTickets();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Workforce Extensions · AURA-540</p>
          <h1 className="text-2xl font-semibold">
            Accommodation Ops — Transport, Clinics, Maintenance
          </h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        {/* Transport Routes */}
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Transport Routes</h2>
          <label className="text-sm">
            Filter siteId
            <input
              value={routeSiteFilter}
              onChange={(e) => setRouteSiteFilter(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <input
              placeholder="siteId"
              value={routeForm.siteId}
              onChange={(e) => setRouteForm((f) => ({ ...f, siteId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="routeCode"
              value={routeForm.routeCode}
              onChange={(e) => setRouteForm((f) => ({ ...f, routeCode: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="label"
              value={routeForm.label}
              onChange={(e) => setRouteForm((f) => ({ ...f, label: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="vehicleType"
              value={routeForm.vehicleType}
              onChange={(e) => setRouteForm((f) => ({ ...f, vehicleType: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="capacity"
              type="number"
              value={routeForm.capacity}
              onChange={(e) => setRouteForm((f) => ({ ...f, capacity: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="distanceKm"
              type="number"
              value={routeForm.distanceKm}
              onChange={(e) => setRouteForm((f) => ({ ...f, distanceKm: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={routeForm.isActive}
                onChange={(e) => setRouteForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              isActive
            </label>
          </div>
          <div>
            <button
              type="button"
              onClick={saveRoute}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save Route
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2">siteId</th>
                  <th>routeCode</th>
                  <th>label</th>
                  <th>vehicleType</th>
                  <th>capacity</th>
                  <th>distanceKm</th>
                  <th>isActive</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2">{row.siteId}</td>
                    <td className="font-mono text-xs">{row.routeCode}</td>
                    <td>{row.label}</td>
                    <td>{row.vehicleType ?? '—'}</td>
                    <td>{row.capacity ?? '—'}</td>
                    <td>{row.distanceKm ?? '—'}</td>
                    <td>{row.isActive ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-3 text-slate-500">
                      No routes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Clinics */}
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Clinics</h2>
          <label className="text-sm">
            Filter siteId
            <input
              value={clinicSiteFilter}
              onChange={(e) => setClinicSiteFilter(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <input
              placeholder="siteId"
              value={clinicForm.siteId}
              onChange={(e) => setClinicForm((f) => ({ ...f, siteId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="clinicCode"
              value={clinicForm.clinicCode}
              onChange={(e) => setClinicForm((f) => ({ ...f, clinicCode: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="label"
              value={clinicForm.label}
              onChange={(e) => setClinicForm((f) => ({ ...f, label: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="nearestHospital"
              value={clinicForm.nearestHospital}
              onChange={(e) => setClinicForm((f) => ({ ...f, nearestHospital: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="nearestHospitalDistanceKm"
              type="number"
              value={clinicForm.nearestHospitalDistanceKm}
              onChange={(e) =>
                setClinicForm((f) => ({ ...f, nearestHospitalDistanceKm: e.target.value }))
              }
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="operatingHours"
              value={clinicForm.operatingHours}
              onChange={(e) => setClinicForm((f) => ({ ...f, operatingHours: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clinicForm.isOnSite}
                onChange={(e) => setClinicForm((f) => ({ ...f, isOnSite: e.target.checked }))}
              />
              isOnSite
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clinicForm.isActive}
                onChange={(e) => setClinicForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              isActive
            </label>
          </div>
          <div>
            <button
              type="button"
              onClick={saveClinic}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save Clinic
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2">siteId</th>
                  <th>clinicCode</th>
                  <th>label</th>
                  <th>isOnSite</th>
                  <th>nearestHospital</th>
                  <th>isActive</th>
                  <th>Inspection</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2">{row.siteId}</td>
                    <td className="font-mono text-xs">{row.clinicCode}</td>
                    <td>{row.label}</td>
                    <td>{row.isOnSite ? 'Yes' : 'No'}</td>
                    <td>{row.nearestHospital ?? '—'}</td>
                    <td>{row.isActive ? 'Yes' : 'No'}</td>
                    <td className="flex items-center gap-2 py-2">
                      <select
                        value={inspectionResult[row.id] ?? 'PASS'}
                        onChange={(e) =>
                          setInspectionResult((s) => ({ ...s, [row.id]: e.target.value }))
                        }
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                      >
                        <option value="PASS">PASS</option>
                        <option value="FAIL">FAIL</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => recordInspection(row.id)}
                        className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                      >
                        Record
                      </button>
                    </td>
                  </tr>
                ))}
                {clinics.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-3 text-slate-500">
                      No clinics yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Maintenance Tickets */}
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Maintenance Tickets</h2>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              Status
              <select
                value={ticketFilter.status}
                onChange={(e) => setTicketFilter((f) => ({ ...f, status: e.target.value }))}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Severity
              <select
                value={ticketFilter.severity}
                onChange={(e) => setTicketFilter((f) => ({ ...f, severity: e.target.value }))}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="">All</option>
                {SEVERITIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              siteId
              <input
                value={ticketFilter.siteId}
                onChange={(e) => setTicketFilter((f) => ({ ...f, siteId: e.target.value }))}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <input
              placeholder="siteId"
              value={ticketForm.siteId}
              onChange={(e) => setTicketForm((f) => ({ ...f, siteId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="ticketCode"
              value={ticketForm.ticketCode}
              onChange={(e) => setTicketForm((f) => ({ ...f, ticketCode: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="category"
              value={ticketForm.category}
              onChange={(e) => setTicketForm((f) => ({ ...f, category: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={ticketForm.severity}
              onChange={(e) => setTicketForm((f) => ({ ...f, severity: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {SEVERITIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              placeholder="description"
              value={ticketForm.description}
              onChange={(e) => setTicketForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm md:col-span-2"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={openTicket}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Open Ticket
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2">siteId</th>
                  <th>ticketCode</th>
                  <th>category</th>
                  <th>severity</th>
                  <th>status</th>
                  <th>description</th>
                  <th>Resolve</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2">{row.siteId}</td>
                    <td className="font-mono text-xs">{row.ticketCode}</td>
                    <td>{row.category}</td>
                    <td>{row.severity}</td>
                    <td>{row.status}</td>
                    <td>{row.description}</td>
                    <td className="flex items-center gap-2 py-2">
                      <input
                        placeholder="notes"
                        value={resolveNotes[row.id] ?? ''}
                        onChange={(e) =>
                          setResolveNotes((s) => ({ ...s, [row.id]: e.target.value }))
                        }
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => resolveTicket(row.id)}
                        className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-3 text-slate-500">
                      No tickets yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
