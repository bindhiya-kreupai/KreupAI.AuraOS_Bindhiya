/**
 * @module DependentSelection
 * @description Step 3 — Add/manage dependents and assign them to selected plans
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import { UserPlus, Check, Users, Calendar, Trash2 } from 'lucide-react';
import type {
  BenefitDependent,
  BenefitCategory,
  EnrollmentSelection,
} from '@/services/benefitsService';
import { CATEGORY_META, COVERAGE_LABELS } from '@/services/benefitsService';

interface DependentSelectionProps {
  dependents: BenefitDependent[];
  selections: Record<string, EnrollmentSelection | null>;
  onSetDependentIds: (category: BenefitCategory, ids: string[]) => void;
  onAddDependent: (dep: Omit<BenefitDependent, 'id'>) => Promise<BenefitDependent>;
  onRemoveDependent: (id: string) => Promise<void>;
}

export const DependentSelection: React.FC<DependentSelectionProps> = ({
  dependents,
  selections,
  onSetDependentIds,
  onAddDependent,
  onRemoveDependent,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    relationship: 'spouse' as BenefitDependent['relationship'],
    dateOfBirth: '',
    gender: 'female' as BenefitDependent['gender'],
  });

  // Categories that need dependents (non employee_only)
  const categoriesNeedingDependents = Object.entries(selections)
    .filter(([, sel]) => sel && sel.coverageLevel !== 'employee_only')
    .map(([cat, sel]) => ({ category: cat as BenefitCategory, selection: sel! }));

  const handleSubmitDependent = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) return;
    await onAddDependent(formData);
    setFormData({
      firstName: '',
      lastName: '',
      relationship: 'spouse',
      dateOfBirth: '',
      gender: 'female',
    });
    setShowAddForm(false);
  };

  const toggleDependent = (category: BenefitCategory, depId: string) => {
    const sel = selections[category];
    if (!sel) return;
    const ids = sel.dependentIds.includes(depId)
      ? sel.dependentIds.filter((id) => id !== depId)
      : [...sel.dependentIds, depId];
    onSetDependentIds(category, ids);
  };

  return (
    <div className="space-y-6">
      {/* Dependents list */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-ink-black dark:text-pearl">Your Dependents</h4>
            <p className="text-[10px] text-silver-mist mt-0.5">
              {dependents.length} dependent{dependents.length !== 1 ? 's' : ''} on file
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Dependent
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="mb-4 p-3 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/30 border border-cloud dark:border-nebula-purple/20 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-silver-mist font-medium">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                  className="mt-0.5 w-full px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-[10px] text-silver-mist font-medium">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                  className="mt-0.5 w-full px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-silver-mist font-medium">Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      relationship: e.target.value as BenefitDependent['relationship'],
                    }))
                  }
                  className="mt-0.5 w-full px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="domestic_partner">Domestic Partner</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-silver-mist font-medium">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  className="mt-0.5 w-full px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                />
              </div>
              <div>
                <label className="text-[10px] text-silver-mist font-medium">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      gender: e.target.value as BenefitDependent['gender'],
                    }))
                  }
                  className="mt-0.5 w-full px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDependent}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
              >
                Add Dependent
              </button>
            </div>
          </div>
        )}

        {/* Dependent cards */}
        {dependents.length === 0 ? (
          <p className="text-xs text-silver-mist text-center py-6">
            No dependents added yet. Add dependents to enroll them in your benefits.
          </p>
        ) : (
          <div className="space-y-2">
            {dependents.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between p-3 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/20 border border-cloud/50 dark:border-nebula-purple/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-celestial-indigo" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                      {dep.firstName} {dep.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-silver-mist capitalize">
                        {dep.relationship.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-silver-mist">·</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-silver-mist">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(dep.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveDependent(dep.id)}
                  className="p-1.5 rounded-lg text-silver-mist hover:text-coral-alert hover:bg-coral-alert/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign dependents to plans */}
      {categoriesNeedingDependents.length > 0 && dependents.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-ink-black dark:text-pearl">
            Assign Dependents to Plans
          </h4>
          {categoriesNeedingDependents.map(({ category, selection }) => {
            const meta = CATEGORY_META[category];
            return (
              <div
                key={category}
                className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${meta.color}`}>
                    <div className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                      {meta.label}
                    </p>
                    <p className="text-[10px] text-silver-mist">
                      {COVERAGE_LABELS[selection.coverageLevel]}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {dependents.map((dep) => {
                    const isAssigned = selection.dependentIds.includes(dep.id);
                    return (
                      <button
                        key={dep.id}
                        onClick={() => toggleDependent(category, dep.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${
                          isAssigned
                            ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                            : 'border-cloud dark:border-nebula-purple/20 hover:border-celestial-indigo/40'
                        }`}
                      >
                        <span className="text-xs text-ink-black dark:text-pearl">
                          {dep.firstName} {dep.lastName}
                          <span className="text-silver-mist ml-1.5 capitalize">
                            ({dep.relationship.replace('_', ' ')})
                          </span>
                        </span>
                        {isAssigned && <Check className="w-4 h-4 text-celestial-indigo" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {categoriesNeedingDependents.length === 0 && (
        <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-3">
          <p className="text-xs text-silver-mist">
            All your selected plans are &quot;Employee Only&quot; coverage. Change coverage level in
            the previous step to add dependents to a plan.
          </p>
        </div>
      )}
    </div>
  );
};

export default DependentSelection;
