"use client";

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { DependentService } from '../services';

interface Dependent {
  id: string;
  name: string;
  relationship: string;
  dob: string;
  age: number;
  coveredBenefits: string[];
  ssn: string;
  status: 'active' | 'inactive';
}

export default function DependentsPage() {
  const [fetching, setFetching] = useState(true);
  const [dependents, setDependents] = useState<Dependent[]>([]);

  useEffect(() => {
    const fetchDependents = async () => {
      try {
        const res = await DependentService.getDependents();
        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map((d: any) => ({
            id: d.id,
            name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Unknown',
            relationship: d.relationship || 'Other',
            dob: d.dateOfBirth || d.dob ? new Date(d.dateOfBirth || d.dob).toLocaleDateString('en', { month: 'short', day: '2-digit', year: 'numeric' }) : '',
            age: d.age || (d.dateOfBirth ? Math.floor((Date.now() - new Date(d.dateOfBirth).getTime()) / 31557600000) : 0),
            coveredBenefits: d.coveredBenefits || d.benefits || [],
            ssn: d.ssn || d.maskedSSN || '***-**-****',
            status: d.status || 'active',
          }));
          setDependents(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch dependents:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchDependents();
  }, []);

  const getRelationshipColor = (rel: string) => {
    switch (rel) {
      case 'Spouse': return 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400';
      case 'Child': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Dependents</h1>
          <p className="text-sm text-silver-mist mt-1">Manage family members enrolled in your benefits</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Dependent
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Dependents</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{dependents.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Active Coverage</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{dependents.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Coverage Type</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{dependents.length > 0 ? 'Family' : 'Employee'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Enrolled Dependents</h3>
        </div>
        {dependents.length > 0 ? (
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {dependents.map((dep) => (
              <div key={dep.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-celestial-indigo" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">{dep.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getRelationshipColor(dep.relationship)}`}>
                        {dep.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> DOB: {dep.dob}</span>
                      <span>Age: {dep.age}</span>
                      <span>SSN: {dep.ssn}</span>
                    </div>
                    {dep.coveredBenefits.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {dep.coveredBenefits.map((benefit) => (
                          <span key={benefit} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full font-medium">
                            <Shield className="w-2.5 h-2.5" /> {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-silver-mist hover:text-red-500 transition-colors" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-silver-mist mx-auto mb-3" />
            <p className="text-sm text-silver-mist">No dependents added yet</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Age-Out Reminder</p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
            Dependents age out of coverage at age 26. Review your family coverage annually to ensure accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}

