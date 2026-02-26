/**
 * @module OrgChart
 * @description Hierarchical org chart — CSS/flexbox tree, expand/collapse,
 *              zoom controls, department filter, search highlight (Sec 17.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Users,
} from 'lucide-react';
import {
  DirectoryService,
  type OrgChartNode,
  type DirectoryEmployee,
} from '@/services/directoryService';
import { EmployeeProfileCard } from './EmployeeProfileCard';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NodeState {
  [nodeId: string]: boolean; // expanded?
}

// ── Org Node Component ────────────────────────────────────────────────────────

function OrgNode({
  node,
  nodeStates,
  onToggle,
  onSelectEmployee,
  highlightIds,
  deptFilter,
}: {
  node: OrgChartNode;
  nodeStates: NodeState;
  onToggle: (id: string) => void;
  onSelectEmployee: (emp: DirectoryEmployee) => void;
  highlightIds: Set<string>;
  deptFilter: string;
}) {
  const e = node.employee;
  const isExpanded = nodeStates[e.id] ?? node.isExpanded;
  const isHighlighted = highlightIds.has(e.id);

  // Filter by department if set
  const visibleChildren = deptFilter
    ? node.children.filter((c) => {
        const hasDept = (n: OrgChartNode): boolean => {
          if (n.employee.departmentId === deptFilter) return true;
          return n.children.some(hasDept);
        };
        return hasDept(c);
      })
    : node.children;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="relative group">
        <button
          onClick={() => onSelectEmployee(e)}
          className={`relative rounded-xl border-2 p-3 w-36 text-center transition-all hover:shadow-lg ${
            isHighlighted
              ? 'border-amber-400 bg-amber-50 shadow-amber-200 shadow-md'
              : node.level === 0
                ? 'border-indigo-400 bg-indigo-50 shadow-md'
                : node.level === 1
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full ${e.avatarColor} flex items-center justify-center mx-auto mb-2`}
          >
            <span className="text-white text-sm font-bold">{e.avatarInitials}</span>
          </div>
          <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">
            {e.fullName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{e.designation}</p>
          {e.directReportsCount > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{e.directReportsCount}</span>
            </div>
          )}
        </button>

        {/* Expand/collapse button */}
        {visibleChildren.length > 0 && (
          <button
            onClick={() => onToggle(e.id)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all z-10"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Children */}
      {visibleChildren.length > 0 && isExpanded && (
        <div className="mt-6 relative">
          {/* Vertical connector from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-px h-4 w-0.5 bg-gray-200" />

          {/* Horizontal line across children */}
          {visibleChildren.length > 1 && (
            <div
              className="absolute top-4 h-0.5 bg-gray-200"
              style={{
                left: `calc(50% - (${visibleChildren.length * 152}px / 2 - 68px))`,
                width: `${(visibleChildren.length - 1) * 152}px`,
              }}
            />
          )}

          {/* Children row */}
          <div className="flex items-start gap-4 pt-4">
            {visibleChildren.map((child) => (
              <div key={child.employee.id} className="relative flex flex-col items-center">
                {/* Vertical connector to child */}
                <div className="absolute top-0 left-1/2 -translate-x-px h-4 w-0.5 bg-gray-200" />
                <div className="pt-4">
                  <OrgNode
                    node={child}
                    nodeStates={nodeStates}
                    onToggle={onToggle}
                    onSelectEmployee={onSelectEmployee}
                    highlightIds={highlightIds}
                    deptFilter={deptFilter}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function OrgChart() {
  const [orgRoot, setOrgRoot] = useState<OrgChartNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodeStates, setNodeStates] = useState<NodeState>({});
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<DirectoryEmployee | null>(null);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const [root, depts] = await Promise.all([
        DirectoryService.getOrgChart(),
        DirectoryService.getDepartments(),
      ]);
      setOrgRoot(root);
      setDepartments(depts);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!search || !orgRoot) {
      setHighlightIds(new Set());
      return;
    }
    const q = search.toLowerCase();
    const ids = new Set<string>();
    const findMatches = (node: OrgChartNode) => {
      if (
        node.employee.fullName.toLowerCase().includes(q) ||
        node.employee.designation.toLowerCase().includes(q) ||
        node.employee.department.toLowerCase().includes(q)
      ) {
        ids.add(node.employee.id);
      }
      node.children.forEach(findMatches);
    };
    findMatches(orgRoot);
    setHighlightIds(ids);
    // Auto-expand nodes with matches
    const expandedNodes: NodeState = { ...nodeStates };
    const expandToMatch = (node: OrgChartNode): boolean => {
      const hasMatch = ids.has(node.employee.id) || node.children.some(expandToMatch);
      if (hasMatch) expandedNodes[node.employee.id] = true;
      return hasMatch;
    };
    expandToMatch(orgRoot);
    setNodeStates(expandedNodes);
  }, [search, orgRoot]);

  const toggleNode = useCallback((id: string) => {
    setNodeStates((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const resetZoom = () => setZoom(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading org chart...</p>
        </div>
      </div>
    );
  }

  if (!orgRoot) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Org chart data not available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Chart</h1>
            <p className="text-sm text-gray-500 mt-0.5">Visual org hierarchy</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, title, department..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Dept Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="pl-8 pr-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1.5 rounded-lg hover:bg-white transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={resetZoom}
              className="px-2 text-xs font-medium text-gray-600 min-w-12 text-center"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="p-1.5 rounded-lg hover:bg-white transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1.5 rounded-lg hover:bg-white transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search Results count */}
        {search && (
          <p className="text-xs text-amber-600 mt-2">
            {highlightIds.size} match{highlightIds.size !== 1 ? 'es' : ''} highlighted
          </p>
        )}
      </div>

      {/* Chart Area */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
        >
          <OrgNode
            node={orgRoot}
            nodeStates={nodeStates}
            onToggle={toggleNode}
            onSelectEmployee={setSelectedEmployee}
            highlightIds={highlightIds}
            deptFilter={deptFilter}
          />
        </div>
      </div>

      {/* Profile Flyout */}
      {selectedEmployee && (
        <EmployeeProfileCard
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}

export default OrgChart;
