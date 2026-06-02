'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Filter,
  Loader2,
  MessageSquare,
  Phone,
  Shield,
  Smile,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { BuddyAssignmentService } from '../services';
import type { BuddyAssignment } from '../types';

type DisplayBuddy = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  newHire: string;
  status: BuddyAssignment['status'];
  assignedDate: string;
  responsibilities: string[];
  avatar: string;
};

const STATUS_LABELS: Partial<Record<BuddyAssignment['status'], string>> = {
  assigned: 'Active',
  active: 'In Progress',
  completed: 'Completed',
  unassigned: 'Unassigned',
};

export default function BuddyAssignmentPage() {
  const [selectedBuddy, setSelectedBuddy] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<BuddyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | BuddyAssignment['status']>('all');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await BuddyAssignmentService.getAssignments();
      setAssignments(data || []);
    } catch (error: any) {
      console.error('Error fetching buddy assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const buddies: DisplayBuddy[] = useMemo(() => {
    return (assignments || []).map((a) => {
      const name = a.buddyName || 'Unassigned';
      return {
        id: a.id || `${a.buddyId}-${a.newHireId}`,
        name,
        email: a.buddyEmail,
        phone: a.buddyPhone,
        newHire: a.newHireName || 'Unknown new hire',
        status: a.status,
        assignedDate: a.assignedDate,
        responsibilities: a.responsibilities || [],
        avatar: name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
      };
    });
  }, [assignments]);

  const filtered =
    filterStatus === 'all' ? buddies : buddies.filter((b) => b.status === filterStatus);

  const acceptAssignment = async (id: string) => {
    try {
      await BuddyAssignmentService.updateAssignment(id, { status: 'active' } as any);
      await fetchAssignments();
    } catch (e: any) {
      alert(`Could not update: ${e?.message || e}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading buddy assignments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-500" />
            Buddy Assignment
          </h1>
          <p className="text-slate-500 text-sm">
            Assign a mentor to guide new hires through their first month.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium"
          >
            <option value="all">All statuses</option>
            <option value="assigned">Active</option>
            <option value="active">In Progress</option>
            <option value="completed">Completed</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <Shield className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">
            Buddy Assignments
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {buddies.length} active assignment{buddies.length !== 1 ? 's' : ''}. New assignments are
            created when an onboarding plan is started.
          </p>
        </div>
        <Link
          href="/dashboard/onboarding/induction-program"
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 dark:shadow-none transition-transform active:scale-95"
        >
          Open Induction
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
              No buddy assignments
            </h3>
            <p className="text-sm text-slate-500">
              {assignments.length === 0
                ? 'Buddy assignments will appear here once new hires are paired with mentors.'
                : 'No assignments match this status filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-indigo-500" /> Assigned Buddies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((buddy) => (
              <div
                key={buddy.id}
                onClick={() => setSelectedBuddy(buddy.id)}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border p-6 transition-all cursor-pointer hover:shadow-lg ${
                  selectedBuddy === buddy.id
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                }`}
              >
                {selectedBuddy === buddy.id && (
                  <div className="absolute top-4 right-4 text-indigo-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {buddy.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{buddy.name}</div>
                    <div className="text-xs text-slate-500">Buddy</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned to</span>
                    <span className="font-medium truncate ml-2">{buddy.newHire}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        buddy.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : buddy.status === 'unassigned'
                            ? 'bg-rose-100 text-rose-700'
                            : buddy.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {STATUS_LABELS[buddy.status] || buddy.status}
                    </span>
                  </div>
                  {buddy.assignedDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned</span>
                      <span className="font-medium">
                        {new Date(buddy.assignedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {buddy.responsibilities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                      Responsibilities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {buddy.responsibilities.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold"
                        >
                          {skill}
                        </span>
                      ))}
                      {buddy.responsibilities.length > 3 && (
                        <span className="text-xs text-slate-400 self-center">
                          +{buddy.responsibilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {(buddy.email || buddy.phone) && (
                  <div className="flex gap-2 text-xs text-slate-500 mb-3">
                    {buddy.email && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <a
                          href={`mailto:${buddy.email}`}
                          className="hover:text-indigo-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {buddy.email}
                        </a>
                      </span>
                    )}
                    {buddy.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {buddy.phone}
                      </span>
                    )}
                  </div>
                )}

                {buddy.status === 'assigned' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptAssignment(buddy.id);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Mark In Progress
                  </button>
                ) : (
                  <div className="w-full py-2.5 text-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase">
                    {STATUS_LABELS[buddy.status] || buddy.status}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
        <Award className="w-6 h-6 text-indigo-500 shrink-0" />
        <div>
          <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">
            Why Assign a Buddy?
          </h4>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
            Buddies help new hires navigate the company culture, answer informal questions, and feel
            welcomed. Research shows that structured buddy programs improve new-hire retention by
            over 40%.
          </p>
        </div>
      </div>
    </div>
  );
}
