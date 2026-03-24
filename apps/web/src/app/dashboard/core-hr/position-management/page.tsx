'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Briefcase, Plus, X, MoreHorizontal } from 'lucide-react';
import { PositionService } from '../services';

export default function PositionManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [positionsData, setPositionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Form refs for the Create Position modal
  const titleRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const departmentRef = useRef<HTMLInputElement>(null);
  const fteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const data = await PositionService.getAllPositions();
      setPositionsData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize status values for consistent comparison (API may return OPEN, FILLED, FROZEN, CLOSED, DRAFT)
  const normalizeStatus = (status: string): string => {
    const upper = (status || '').toUpperCase();
    if (upper === 'OPEN' || upper === 'DRAFT') return 'Open';
    if (upper === 'FILLED') return 'Filled';
    if (upper === 'FROZEN') return 'Frozen';
    if (upper === 'CLOSED') return 'Closed';
    // Fallback: capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Compute stats dynamically
  const stats = useMemo(() => {
    const total = positionsData.length;
    const filled = positionsData.filter((p) => normalizeStatus(p.status) === 'Filled').length;
    const open = positionsData.filter((p) => normalizeStatus(p.status) === 'Open').length;
    const frozen = positionsData.filter((p) => normalizeStatus(p.status) === 'Frozen').length;
    return { total, filled, open, frozen };
  }, [positionsData]);

  // Map position data to table-friendly format
  const positions = useMemo(() => {
    return positionsData.map((p) => ({
      id: p.positionCode || p.id,
      title: p.title || p.positionTitle || '',
      dept: p.department?.name || p.department || '',
      manager: p.reportsTo || p.jobProfile?.title || '-',
      fte: p.fte ?? 1.0,
      status: normalizeStatus(p.status || p.positionStatus || ''),
    }));
  }, [positionsData]);

  const filteredPositions = positions.filter(
    (p) => filterStatus === 'All' || p.status === filterStatus
  );

  const handleCreatePosition = async () => {
    const title = titleRef.current?.value?.trim();
    const code = codeRef.current?.value?.trim();
    if (!title) return;

    try {
      setCreating(true);
      await PositionService.createPosition({
        positionTitle: title,
        positionCode: code || title.replace(/\s+/g, '-').toUpperCase(),
      } as any);
      setShowCreateModal(false);
      await fetchPositions();
    } catch (error) {
      console.error('Error creating position:', error);
      setCreateError('Failed to create position. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Position Management
          </h1>
          <p className="text-slate-500 text-sm">
            Design, track, and manage job positions and vacancies.
          </p>
        </div>
        <button
          onClick={() => {
            setCreateError('');
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Position
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && positionsData.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Briefcase className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No positions found</p>
          <p className="text-sm">Data will appear here once records are added.</p>
        </div>
      )}

      {/* Content */}
      {!loading && positionsData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Stats */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Positions</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Filled</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.filled}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Open Vacancies</div>
              <div className="text-2xl font-bold text-indigo-600">{stats.open}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Frozen</div>
              <div className="text-2xl font-bold text-slate-400">{stats.frozen}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-4 flex gap-2 overflow-x-auto pb-1">
            {['All', 'Open', 'Filled', 'Frozen'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Position ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Reports To</th>
                    <th className="px-6 py-4">FTE</th>
                    <th className="px-6 py-4 center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPositions.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {row.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.dept}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {row.manager}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.fte}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold
                                                    ${
                                                      row.status === 'Filled'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : row.status === 'Open'
                                                          ? 'bg-indigo-100 text-indigo-700'
                                                          : 'bg-slate-100 text-slate-600'
                                                    }
                                                `}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPositions.length === 0 && (
              <div className="p-8 text-center text-slate-500 italic">
                No positions found for this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Position Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Position</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Position Title
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Data Scientist"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Position Code</label>
                <input
                  ref={codeRef}
                  type="text"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. POS-ENG-010"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                  <input
                    ref={departmentRef}
                    type="text"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">FTE</label>
                  <input
                    ref={fteRef}
                    type="number"
                    defaultValue={1}
                    step={0.5}
                    min={0.5}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            {createError && (
              <div className="mx-6 mb-0 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-600 dark:text-rose-400">
                {createError}
              </div>
            )}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePosition}
                disabled={creating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
