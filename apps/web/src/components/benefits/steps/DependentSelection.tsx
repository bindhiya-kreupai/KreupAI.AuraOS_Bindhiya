"use client";

import React, { useState } from "react";
import { UserPlus, Check, X, Calendar } from "lucide-react";

interface Dependent {
  id: string;
  name: string;
  relationship: "Spouse" | "Child" | "Domestic Partner";
  dateOfBirth: string;
  selected: boolean;
}

const mockDependents: Dependent[] = [
  {
    id: "dep-1",
    name: "Jessica Martinez",
    relationship: "Spouse",
    dateOfBirth: "1990-03-15",
    selected: true,
  },
  {
    id: "dep-2",
    name: "Lucas Martinez",
    relationship: "Child",
    dateOfBirth: "2015-07-22",
    selected: true,
  },
  {
    id: "dep-3",
    name: "Emma Martinez",
    relationship: "Child",
    dateOfBirth: "2018-11-08",
    selected: false,
  },
];

export function DependentSelection() {
  const [dependents, setDependents] = useState<Dependent[]>(mockDependents);
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleDependent = (id: string) => {
    setDependents((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const calculateAge = (dateStr: string) => {
    const dob = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const selectedCount = dependents.filter((d) => d.selected).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Select Dependents</h2>
          <p className="text-sm text-silver-mist mt-1">
            Choose which dependents to include in your coverage ({selectedCount} selected).
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-celestial-indigo text-white text-xs font-medium hover:bg-celestial-indigo/90 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Dependent
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">New Dependent</h3>
            <button onClick={() => setShowAddForm(false)} className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-silver-mist mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
              />
            </div>
            <div>
              <label className="block text-xs text-silver-mist mb-1">Relationship</label>
              <select className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20">
                <option>Spouse</option>
                <option>Child</option>
                <option>Domestic Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-silver-mist mb-1">Date of Birth</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-celestial-indigo text-white text-xs font-medium hover:bg-celestial-indigo/90 transition-colors">
              Add Dependent
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {dependents.map((dep) => (
          <div
            key={dep.id}
            className={`bg-white dark:bg-stellar-blue rounded-xl border p-4 transition-all ${
              dep.selected
                ? "border-celestial-indigo/50"
                : "border-cloud dark:border-nebula-purple/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleDependent(dep.id)}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                  dep.selected
                    ? "bg-celestial-indigo border-celestial-indigo"
                    : "border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos"
                }`}
              >
                {dep.selected && <Check className="w-3 h-3 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-ink-black dark:text-pearl">{dep.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo font-medium">
                    {dep.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-silver-mist">
                    <Calendar className="w-3 h-3" />
                    <span>DOB: {formatDate(dep.dateOfBirth)}</span>
                  </div>
                  <span className="text-xs text-silver-mist">
                    Age: {calculateAge(dep.dateOfBirth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dependents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-silver-mist">No dependents added yet.</p>
        </div>
      )}
    </div>
  );
}
