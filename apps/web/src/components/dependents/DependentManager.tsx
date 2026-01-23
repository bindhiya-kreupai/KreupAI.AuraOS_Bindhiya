"use client";

import React, { useState } from "react";
import { Users, Plus, UserCheck, UserX } from "lucide-react";

interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  eligible: boolean;
}

const mockDependents: Dependent[] = [
  {
    id: "1",
    firstName: "Jane",
    lastName: "Doe",
    relationship: "Spouse",
    dateOfBirth: "1990-05-15",
    eligible: true,
  },
  {
    id: "2",
    firstName: "Alex",
    lastName: "Doe",
    relationship: "Child",
    dateOfBirth: "2015-09-22",
    eligible: true,
  },
  {
    id: "3",
    firstName: "Sam",
    lastName: "Doe",
    relationship: "Child",
    dateOfBirth: "2002-01-10",
    eligible: false,
  },
];

export default function DependentManager() {
  const [dependents] = useState<Dependent[]>(mockDependents);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            My Dependents
          </h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Dependent
        </button>
      </div>

      <div className="space-y-4">
        {dependents.map((dep) => (
          <div
            key={dep.id}
            className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                  <span className="text-celestial-indigo font-semibold text-sm">
                    {dep.firstName[0]}
                    {dep.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-ink-black dark:text-pearl">
                    {dep.firstName} {dep.lastName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-silver-mist">{dep.relationship}</span>
                    <span className="text-xs text-silver-mist">
                      DOB: {formatDate(dep.dateOfBirth)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    dep.eligible
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {dep.eligible ? (
                    <UserCheck className="w-3 h-3" />
                  ) : (
                    <UserX className="w-3 h-3" />
                  )}
                  {dep.eligible ? "Eligible" : "Ineligible"}
                </span>
                <button className="text-sm text-celestial-indigo hover:underline font-medium">
                  Edit
                </button>
                <button className="text-sm text-red-500 hover:underline font-medium">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dependents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-silver-mist mx-auto mb-3" />
          <p className="text-silver-mist">No dependents added yet.</p>
        </div>
      )}
    </div>
  );
}
