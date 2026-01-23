"use client";

import React from "react";
import { GripVertical, Star, User } from "lucide-react";

export interface EmployeePlacementData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  currentRating: number;
  maxRating: number;
  department: string;
}

const mockEmployees: EmployeePlacementData[] = [
  {
    id: "1",
    name: "Alice Chen",
    role: "Senior Engineer",
    avatar: "AC",
    currentRating: 4.5,
    maxRating: 5,
    department: "Engineering",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    role: "Product Manager",
    avatar: "MJ",
    currentRating: 3.8,
    maxRating: 5,
    department: "Product",
  },
  {
    id: "3",
    name: "Sarah Williams",
    role: "UX Designer",
    avatar: "SW",
    currentRating: 4.2,
    maxRating: 5,
    department: "Design",
  },
  {
    id: "4",
    name: "Elena Rodriguez",
    role: "Tech Lead",
    avatar: "ER",
    currentRating: 4.8,
    maxRating: 5,
    department: "Engineering",
  },
  {
    id: "5",
    name: "David Park",
    role: "Software Engineer",
    avatar: "DP",
    currentRating: 3.2,
    maxRating: 5,
    department: "Engineering",
  },
  {
    id: "6",
    name: "Priya Sharma",
    role: "QA Lead",
    avatar: "PS",
    currentRating: 4.0,
    maxRating: 5,
    department: "Quality",
  },
];

function RatingStars({
  rating,
  maxRating,
}: {
  rating: number;
  maxRating: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            className={`w-3 h-3 ${
              filled
                ? "text-amber-400 fill-amber-400"
                : half
                ? "text-amber-400 fill-amber-400/50"
                : "text-cloud dark:text-nebula-purple/50"
            }`}
          />
        );
      })}
      <span className="ml-1 text-xs text-silver-mist">{rating.toFixed(1)}</span>
    </div>
  );
}

export function EmployeePlacement() {
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Employee Placement
        </h2>
        <span className="ml-auto text-xs text-silver-mist">
          Drag to place in matrix
        </span>
      </div>

      <div className="space-y-3">
        {mockEmployees.map((employee) => (
          <div
            key={employee.id}
            draggable
            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/50 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
          >
            {/* Drag Indicator */}
            <div className="flex-shrink-0 text-silver-mist group-hover:text-celestial-indigo transition-colors">
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo flex-shrink-0">
              {employee.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                  {employee.name}
                </span>
                <span className="text-xs text-silver-mist bg-white dark:bg-stellar-blue px-2 py-0.5 rounded-full border border-cloud dark:border-nebula-purple/50">
                  {employee.department}
                </span>
              </div>
              <p className="text-xs text-silver-mist truncate">{employee.role}</p>
            </div>

            {/* Rating */}
            <div className="flex-shrink-0">
              <RatingStars
                rating={employee.currentRating}
                maxRating={employee.maxRating}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
