'use client';

/**
 * EPIC-31 Risk Heatmap + Drill-Down dashboard page.
 *
 * Renders the 2D (domain × country) risk heatmap and the recursive
 * Global → Country → Entity → Department drill-down tree side-by-side.
 *
 * Data is loaded from:
 *   GET /api/v1/compliance-dashboard/risk-heatmap?status=...&domain=...&country=...
 *   GET /api/v1/compliance-dashboard/drill-down?status=...
 *
 * Both endpoints aggregate the tenant's open RedFlagInstance rows
 * through the executive-compliance/drill-down service.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  DrillDownTree,
  RiskHeatmap,
  type DrillNode,
  type RiskHeatmapCell,
} from '@aura/ui/components/ui';

interface HeatmapResponse {
  cells: RiskHeatmapCell[];
  totals: {
    flagsInScope: number;
    cells: number;
    domains: number;
    countries: number;
  };
}

const STATUS_FILTERS = [
  { value: 'OPEN', label: 'Open only' },
  { value: 'OPEN,IN_PROGRESS', label: 'Open + In progress' },
  { value: 'IN_PROGRESS', label: 'In progress only' },
  { value: 'RESOLVED', label: 'Resolved (look-back)' },
];

export default function RiskHeatmapDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>('OPEN,IN_PROGRESS');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null);
  const [tree, setTree] = useState<DrillNode | null>(null);
  const [selectedCell, setSelectedCell] = useState<RiskHeatmapCell | null>(null);
  const [selectedNode, setSelectedNode] = useState<DrillNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const heatmapUrl = useMemo(() => {
    const params = new URLSearchParams();
    const statusList = statusFilter.split(',');
    if (statusList.length === 1) params.set('status', statusList[0]);
    if (domainFilter) params.set('domain', domainFilter);
    if (countryFilter) params.set('country', countryFilter);
    return `/api/v1/compliance-dashboard/risk-heatmap?${params.toString()}`;
  }, [statusFilter, domainFilter, countryFilter]);

  const drillUrl = useMemo(() => {
    const params = new URLSearchParams();
    const statusList = statusFilter.split(',');
    if (statusList.length === 1) params.set('status', statusList[0]);
    return `/api/v1/compliance-dashboard/drill-down?${params.toString()}`;
  }, [statusFilter]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [hRes, dRes] = await Promise.all([fetch(heatmapUrl), fetch(drillUrl)]);
        const hJson = await hRes.json();
        const dJson = await dRes.json();
        if (cancelled) return;
        if (hJson.success) setHeatmap(hJson.data);
        if (dJson.success) setTree(dJson.data);
        if (!hJson.success || !dJson.success) {
          setError(hJson.error?.message ?? dJson.error?.message ?? 'Failed to load');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [heatmapUrl, drillUrl]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Risk heatmap</h1>
        <p className="mt-1 text-sm text-gray-600">
          Open compliance risks aggregated by domain × country, with a recursive country → entity →
          department drill-down. Click a cell or a node to inspect.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Status</span>
          <select
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Domain</span>
          <input
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-32"
            placeholder="e.g. PAYROLL"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Country</span>
          <input
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-24"
            placeholder="e.g. AE"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          />
        </label>
        {heatmap && (
          <div className="ml-auto text-xs text-gray-600">
            {heatmap.totals.flagsInScope} flags · {heatmap.totals.domains} domains ×{' '}
            {heatmap.totals.countries} countries
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !heatmap && <div className="text-sm text-gray-500">Loading…</div>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Domain × Country</h2>
            {heatmap && (
              <RiskHeatmap cells={heatmap.cells} onCellClick={(c) => setSelectedCell(c)} />
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Drill-down</h2>
            {tree && <DrillDownTree root={tree} onNodeClick={(n) => setSelectedNode(n)} />}
          </div>
        </div>
      </div>

      {(selectedCell || selectedNode) && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Selection</h3>
            <button
              type="button"
              className="text-xs text-blue-700 hover:underline"
              onClick={() => {
                setSelectedCell(null);
                setSelectedNode(null);
              }}
            >
              Clear
            </button>
          </div>
          {selectedCell && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold">Domain × Country:</span> {selectedCell.domain} ×{' '}
                {selectedCell.country}
              </div>
              <div>
                <span className="font-semibold">Score:</span> {selectedCell.riskScore}
              </div>
              <div>
                <span className="font-semibold">Flags:</span> {selectedCell.flagCount}
              </div>
              <div>
                <span className="font-semibold">Max severity:</span>{' '}
                {selectedCell.maxSeverity ?? '—'}
              </div>
            </div>
          )}
          {selectedNode && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold">Node:</span> {selectedNode.label} (
                {selectedNode.level})
              </div>
              <div>
                <span className="font-semibold">Risk score:</span> {selectedNode.riskScore}
              </div>
              <div>
                <span className="font-semibold">Flag count:</span> {selectedNode.flagCount}
              </div>
              <div>
                <span className="font-semibold">Max severity:</span>{' '}
                {selectedNode.maxSeverity ?? '—'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
