'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Search, AlertCircle, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface OrgNode {
  nodeId: string;
  positionId: string;
  positionTitle: string;
  positionCode: string;
  department: string;
  parentNodeId?: string;
  isVacant: boolean;
  employeeName?: string;
  directReports: number;
  status: string;
}

interface ChartResponse {
  nodes: OrgNode[];
  totalPositions: number;
  totalVacancies: number;
  totalEmployees: number;
}

interface TreeNode extends OrgNode {
  children: TreeNode[];
}

function buildTree(nodes: OrgNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  nodes.forEach((n) => map.set(n.nodeId, { ...n, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parentNodeId && map.has(node.parentNodeId)) {
      map.get(node.parentNodeId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function NodeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  return (
    <div>
      <div
        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 transition-colors mb-2"
        style={{ marginLeft: depth * 24 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-slate-400 hover:text-indigo-600"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            node.isVacant
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50'
          }`}
        >
          {node.isVacant ? '?' : (node.employeeName ?? '?').charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{node.positionTitle}</div>
          <div className="text-xs text-slate-500 truncate">
            {node.isVacant ? 'Vacant' : node.employeeName} · {node.department || 'No department'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {node.isVacant ? (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
              Vacant
            </span>
          ) : null}
          {node.directReports > 0 ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
              {node.directReports} reports
            </span>
          ) : null}
        </div>
      </div>
      {expanded &&
        node.children.map((child) => <NodeRow key={child.nodeId} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function OrgChartBuilderPage() {
  const [data, setData] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/org-design/chart');
      setData(APIClient.unwrapItem<ChartResponse>(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load org chart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tree = useMemo(() => buildTree(data?.nodes ?? []), [data]);

  const flatFiltered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return (data?.nodes ?? []).filter(
      (n) =>
        n.positionTitle.toLowerCase().includes(q) ||
        (n.employeeName ?? '').toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <div className="space-y-4 pb-6 min-h-screen flex flex-col text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Org Chart Builder
          </h1>
          <p className="text-slate-500 text-sm">
            Live position hierarchy with occupants and vacancies.
          </p>
        </div>
        {data ? (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100">
              {data.totalPositions} positions
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
              {data.totalEmployees} filled
            </span>
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold border border-amber-100">
              {data.totalVacancies} vacant
            </span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading org chart...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : (data?.nodes.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
          <Users className="w-10 h-10" />
          <p className="text-sm">No positions defined yet.</p>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl p-2 mb-4 border border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 ml-1" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search positions or people..."
              className="w-full bg-transparent outline-none text-sm font-medium"
            />
          </div>

          {flatFiltered ? (
            <div className="space-y-2">
              {flatFiltered.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No matches</p>
              ) : (
                flatFiltered.map((n) => (
                  <NodeRow key={n.nodeId} node={{ ...n, children: [] }} depth={0} />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {tree.map((root) => (
                <NodeRow key={root.nodeId} node={root} depth={0} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
