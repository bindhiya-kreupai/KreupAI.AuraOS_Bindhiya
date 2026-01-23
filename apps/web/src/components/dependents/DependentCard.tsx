"use client";

import React from "react";
import { Pencil, Trash2, UserCheck, UserX, Calendar, User } from "lucide-react";

interface DependentCardProps {
  firstName?: string;
  lastName?: string;
  relationship?: string;
  dateOfBirth?: string;
  eligible?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
}

export default function DependentCard({
  firstName = "Jane",
  lastName = "Doe",
  relationship = "Spouse",
  dateOfBirth = "1990-05-15",
  eligible = true,
  onEdit,
  onRemove,
}: DependentCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = () => {
    return `${ firstName[0] || ""}${ lastName[0] || ""}`.toUpperCase();
  };

  const getAge = (dateStr: string) => {
    const today = new Date();
    const birth = new Date(dateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="w-full max-w-sm p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
            <span className="text-celestial-indigo font-bold text-lg">{getInitials()}</span>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-ink-black dark:text-pearl">
              {firstName} {lastName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <User className="w-3.5 h-3.5 text-silver-mist" />
              <span className="text-sm text-silver-mist">{relationship}</span>
            </div>
          </div>
        </div>

        {/* Eligibility Badge */}
        <span
          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
            eligible
              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          }`}
        >
          {eligible ? (
            <UserCheck className="w-3 h-3" />
          ) : (
            <UserX className="w-3 h-3" />
          )}
          {eligible ? "Eligible" : "Ineligible"}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-silver-mist">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(dateOfBirth)}</span>
        </div>
        <span className="text-silver-mist">Age: {getAge(dateOfBirth)}</span>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/50 flex items-center gap-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors font-medium"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}
