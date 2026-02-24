/**
 * @module CalibrationMatrix
 * @description Interactive 9-box talent calibration grid (Performance × Potential)
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Star, TrendingUp, Target, Award, Shield, AlertTriangle, Layers, Gem } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type PerformanceLevel = 'low' | 'moderate' | 'high';
export type PotentialLevel = 'low' | 'moderate' | 'high';
export type BoxId = `${PotentialLevel}-${PerformanceLevel}`;

export interface CalibrationEmployee {
  id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  avatar: string;
  performanceRating: number; // 1–5
  potentialRating: number; // 1–5
  performanceLevel: PerformanceLevel;
  potentialLevel: PotentialLevel;
  boxId: BoxId;
  tenure: number;
  lastReviewDate: string;
  overallScore: number;
  isCalibrated: boolean;
}

export interface BoxConfig {
  id: BoxId;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  actionLabel: string;
  row: number; // 0 = top (high potential), 2 = bottom (low potential)
  col: number; // 0 = left (low perf), 2 = right (high perf)
}

interface CalibrationMatrixProps {
  employees: CalibrationEmployee[];
  onDropEmployee: (employeeId: string, targetBox: BoxId) => void;
  onSelectEmployee: (employee: CalibrationEmployee) => void;
  selectedEmployeeId: string | null;
  draggedEmployeeId: string | null;
  onDragStart: (employeeId: string) => void;
  onDragEnd: () => void;
}

// ── 9-Box Definitions ────────────────────────────────────────────────────────────

export const NINE_BOX_CONFIG: BoxConfig[] = [
  // Row 0: High Potential
  {
    id: 'high-low',
    title: 'Rough Diamond',
    description: 'High potential but underperforming',
    icon: Gem,
    color: 'text-sunset-amber',
    bgColor: 'bg-sunset-amber/5',
    borderColor: 'border-sunset-amber/20',
    actionLabel: 'Coach & Develop',
    row: 0,
    col: 0,
  },
  {
    id: 'high-moderate',
    title: 'Future Star',
    description: 'High potential, solid performance',
    icon: TrendingUp,
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/5',
    borderColor: 'border-celestial-indigo/20',
    actionLabel: 'Stretch Assignments',
    row: 0,
    col: 1,
  },
  {
    id: 'high-high',
    title: 'Star',
    description: 'Top talent — retain & promote',
    icon: Star,
    color: 'text-neural-mint',
    bgColor: 'bg-neural-mint/5',
    borderColor: 'border-neural-mint/20',
    actionLabel: 'Fast-Track',
    row: 0,
    col: 2,
  },
  // Row 1: Moderate Potential
  {
    id: 'moderate-low',
    title: 'Inconsistent',
    description: 'Some potential, low delivery',
    icon: AlertTriangle,
    color: 'text-silver-mist',
    bgColor: 'bg-silver-mist/5',
    borderColor: 'border-silver-mist/20',
    actionLabel: 'Performance Plan',
    row: 1,
    col: 0,
  },
  {
    id: 'moderate-moderate',
    title: 'Key Player',
    description: 'Reliable contributor',
    icon: Target,
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/5',
    borderColor: 'border-celestial-indigo/10',
    actionLabel: 'Engage & Grow',
    row: 1,
    col: 1,
  },
  {
    id: 'moderate-high',
    title: 'High Performer',
    description: 'Strong delivery, moderate growth',
    icon: Award,
    color: 'text-neural-mint',
    bgColor: 'bg-neural-mint/5',
    borderColor: 'border-neural-mint/10',
    actionLabel: 'Reward & Retain',
    row: 1,
    col: 2,
  },
  // Row 2: Low Potential
  {
    id: 'low-low',
    title: 'Talent Risk',
    description: 'Under-performing, limited growth',
    icon: AlertTriangle,
    color: 'text-coral-alert',
    bgColor: 'bg-coral-alert/5',
    borderColor: 'border-coral-alert/20',
    actionLabel: 'PIP / Transition',
    row: 2,
    col: 0,
  },
  {
    id: 'low-moderate',
    title: 'Effective',
    description: 'Steady performer in current role',
    icon: Layers,
    color: 'text-silver-mist',
    bgColor: 'bg-silver-mist/5',
    borderColor: 'border-silver-mist/10',
    actionLabel: 'Role Fit',
    row: 2,
    col: 1,
  },
  {
    id: 'low-high',
    title: 'Trusted Pro',
    description: 'Expert in role, limited upside',
    icon: Shield,
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/5',
    borderColor: 'border-celestial-indigo/10',
    actionLabel: 'Retain & Mentor',
    row: 2,
    col: 2,
  },
];

const AXIS_LABELS = {
  performance: ['Low', 'Moderate', 'High'],
  potential: ['High', 'Moderate', 'Low'],
};

// ── Component ────────────────────────────────────────────────────────────────────

export const CalibrationMatrix: React.FC<CalibrationMatrixProps> = ({
  employees,
  onDropEmployee,
  onSelectEmployee,
  selectedEmployeeId,
  draggedEmployeeId,
  onDragStart,
  onDragEnd,
}) => {
  const employeesByBox = useMemo(() => {
    const map: Record<BoxId, CalibrationEmployee[]> = {} as Record<BoxId, CalibrationEmployee[]>;
    NINE_BOX_CONFIG.forEach((box) => {
      map[box.id] = [];
    });
    employees.forEach((emp) => {
      if (map[emp.boxId]) map[emp.boxId].push(emp);
    });
    return map;
  }, [employees]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, boxId: BoxId) => {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData('text/plain');
    if (employeeId) {
      onDropEmployee(employeeId, boxId);
    }
  };

  const handleDragStartInternal = (e: React.DragEvent, emp: CalibrationEmployee) => {
    e.dataTransfer.setData('text/plain', emp.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(emp.id);
  };

  return (
    <div className="space-y-2">
      {/* Matrix Label */}
      <div className="flex items-end gap-2 mb-1">
        <div className="w-8" />
        <p className="text-[10px] font-bold text-silver-mist uppercase tracking-wider text-center flex-1">
          Performance →
        </p>
      </div>

      <div className="flex gap-2">
        {/* Y-Axis Labels */}
        <div className="flex flex-col w-8 shrink-0">
          <div className="flex-1 flex items-center">
            <p className="text-[10px] font-bold text-silver-mist -rotate-90 whitespace-nowrap origin-center">
              ← Potential
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 space-y-1.5">
          {/* Column headers */}
          <div className="grid grid-cols-3 gap-1.5 pl-0">
            {AXIS_LABELS.performance.map((label, i) => (
              <div key={i} className="text-center">
                <span className="text-[9px] font-semibold text-silver-mist">{label}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-1.5 items-stretch">
              {/* Row label */}
              <div className="w-0 flex items-center justify-end shrink-0">
                <span className="text-[9px] font-semibold text-silver-mist -rotate-90 whitespace-nowrap">
                  {AXIS_LABELS.potential[row]}
                </span>
              </div>

              {/* Boxes */}
              <div className="flex-1 grid grid-cols-3 gap-1.5">
                {NINE_BOX_CONFIG.filter((b) => b.row === row)
                  .sort((a, b) => a.col - b.col)
                  .map((box) => {
                    const boxEmployees = employeesByBox[box.id] || [];
                    const Icon = box.icon;
                    const isDragTarget = draggedEmployeeId !== null;

                    return (
                      <div
                        key={box.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, box.id)}
                        className={`rounded-xl border p-2 min-h-[120px] transition-all ${box.bgColor} ${box.borderColor} ${
                          isDragTarget ? 'ring-1 ring-celestial-indigo/30 ring-offset-1' : ''
                        }`}
                      >
                        {/* Box Header */}
                        <div className="flex items-center gap-1 mb-1.5">
                          <Icon className={`w-3 h-3 ${box.color}`} />
                          <span className={`text-[10px] font-bold ${box.color}`}>{box.title}</span>
                          <span className="ml-auto text-[9px] font-bold text-silver-mist bg-white dark:bg-deep-cosmos/20 px-1 py-0.5 rounded">
                            {boxEmployees.length}
                          </span>
                        </div>

                        {/* Employee Chips */}
                        <div className="flex flex-wrap gap-1">
                          {boxEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              draggable
                              onDragStart={(e) => handleDragStartInternal(e, emp)}
                              onDragEnd={onDragEnd}
                              onClick={() => onSelectEmployee(emp)}
                              className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:shadow-sm ${
                                selectedEmployeeId === emp.id
                                  ? 'border-celestial-indigo bg-celestial-indigo/10 shadow-sm'
                                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
                              } ${draggedEmployeeId === emp.id ? 'opacity-40 scale-95' : ''}`}
                            >
                              <div className="w-5 h-5 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[8px] font-bold text-celestial-indigo shrink-0">
                                {emp.avatar}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-semibold text-ink-black dark:text-pearl truncate leading-tight">
                                  {emp.name}
                                </p>
                                <p className="text-[7px] text-silver-mist truncate leading-tight">
                                  {emp.designation}
                                </p>
                              </div>
                              {emp.isCalibrated && (
                                <div
                                  className="w-1.5 h-1.5 rounded-full bg-neural-mint shrink-0"
                                  title="Calibrated"
                                />
                              )}
                            </div>
                          ))}

                          {boxEmployees.length === 0 && (
                            <div className="w-full py-4 flex items-center justify-center">
                              <span className="text-[9px] text-silver-mist/40 italic">
                                {isDragTarget ? 'Drop here' : 'Empty'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Box Footer */}
                        <p className="text-[7px] text-silver-mist/60 mt-1.5 truncate">
                          {box.description}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalibrationMatrix;
