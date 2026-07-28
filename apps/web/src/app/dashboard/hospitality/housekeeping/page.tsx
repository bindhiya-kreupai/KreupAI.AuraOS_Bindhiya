'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BedDouble,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  X,
  Loader2,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="space-y-4 w-full">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
        ></div>
      ))}
    </div>
    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No housekeeping assignments found. Assign a room to start tracking.</p>
  </div>
);

export default function HousekeepingPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [roomNumber, setRoomNumber] = useState('Room 101');
  const [roomType, setRoomType] = useState('Standard');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('Dirty');
  const [priority, setPriority] = useState('Normal');

  const { data, isLoading, error } = useQuery({
    queryKey: ['housekeepingTasks'],
    queryFn: async () => {
      const res = await fetch('/api/hospitality/housekeeping');
      if (!res.ok) throw new Error('Failed to fetch housekeeping tasks');
      return res.json();
    },
  });

  const tasks = data?.tasks || [];

  const createMutation = useMutation({
    mutationFn: async (newTask: any) => {
      const res = await fetch('/api/hospitality/housekeeping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error('Failed to assign room');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeepingTasks'] });
      toast.success('Room Assigned Successfully!');
      setIsModalOpen(false);
      setRoomNumber('');
      setAssignedTo('');
    },
    onError: () => {
      toast.error('Failed to assign room');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/hospitality/housekeeping/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete assignment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeepingTasks'] });
      toast.success('Assignment deleted');
    },
    onError: () => {
      toast.error('Failed to delete assignment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      roomNumber,
      roomType,
      assignedTo: assignedTo || 'Unassigned',
      status,
      priority,
    });
  };

  // Calculate dynamic stats
  const cleanCount = tasks.filter((t: any) => t.status === 'Clean').length;
  const dirtyCount = tasks.filter((t: any) => t.status === 'Dirty').length;
  const inspectingCount = tasks.filter((t: any) => t.status === 'Inspecting').length;
  const dndCount = tasks.filter((t: any) => t.status === 'Do Not Disturb').length;

  const stats = [
    { label: 'Clean', count: cleanCount, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { label: 'Dirty', count: dirtyCount, color: 'text-rose-500', bg: 'bg-rose-500' },
    { label: 'Inspecting', count: inspectingCount, color: 'text-amber-500', bg: 'bg-amber-500' },
    { label: 'Do Not Disturb', count: dndCount, color: 'text-slate-400', bg: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-indigo-500" />
            Housekeeping
          </h1>
          <p className="text-slate-500 text-sm">Track room status and cleaning assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Assign Room
        </button>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-bold">
          Error loading housekeeping data
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.count}</div>
                <div className="text-sm font-bold text-slate-500 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>

          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg">Priority List</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                {tasks.map((room: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-600">
                        {room.roomNumber.split(' ')[1] || room.roomNumber.substring(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold">
                          {room.roomNumber}{' '}
                          <span className="text-slate-400 font-normal">• {room.roomType}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Assigned{' '}
                          {new Date(room.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase">
                          Assigned To
                        </div>
                        <div className="font-bold text-sm">{room.assignedTo}</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold w-32 text-center ${
                          room.status === 'Dirty'
                            ? 'bg-rose-100 text-rose-600'
                            : room.status === 'Inspecting'
                              ? 'bg-amber-100 text-amber-600'
                              : room.status === 'Clean'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {room.status}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(room.id)}
                        className="text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition p-1"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Assign Room</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  placeholder="e.g. Room 402"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                >
                  <option value="Standard">Standard</option>
                  <option value="Double Queen">Double Queen</option>
                  <option value="King Deluxe">King Deluxe</option>
                  <option value="VIP Suite">VIP Suite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign To
                </label>
                <input
                  type="text"
                  required
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  placeholder="e.g. Maria R."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                >
                  <option value="Clean">Clean</option>
                  <option value="Dirty">Dirty</option>
                  <option value="Inspecting">Inspecting</option>
                  <option value="Do Not Disturb">Do Not Disturb</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
