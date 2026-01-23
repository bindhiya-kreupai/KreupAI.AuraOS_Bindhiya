"use client";

import React, { useState } from "react";
import { Radar, Eye, EyeOff } from "lucide-react";

interface SkillPoint {
  name: string;
  current: number;
  required: number;
}

const mockSkills: SkillPoint[] = [
  { name: "System Design", current: 65, required: 90 },
  { name: "Cloud Architecture", current: 55, required: 85 },
  { name: "Code Quality", current: 80, required: 90 },
  { name: "Leadership", current: 50, required: 75 },
  { name: "Communication", current: 60, required: 80 },
  { name: "Security", current: 45, required: 80 },
  { name: "Performance", current: 70, required: 85 },
  { name: "Agile/Process", current: 75, required: 85 },
];

function getPolygonPoints(
  skills: SkillPoint[],
  key: "current" | "required",
  centerX: number,
  centerY: number,
  radius: number
): string {
  const n = skills.length;
  return skills
    .map((skill, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const value = skill[key] / 100;
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");
}

function getAxisEndpoint(
  index: number,
  total: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function getLabelPosition(
  index: number,
  total: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number; anchor: string } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const labelRadius = radius + 20;
  const x = centerX + labelRadius * Math.cos(angle);
  const y = centerY + labelRadius * Math.sin(angle);
  let anchor = "middle";
  if (Math.cos(angle) > 0.3) anchor = "start";
  if (Math.cos(angle) < -0.3) anchor = "end";
  return { x, y, anchor };
}

export default function SkillRadarChart() {
  const [showCurrent, setShowCurrent] = useState(true);
  const [showRequired, setShowRequired] = useState(true);

  const centerX = 200;
  const centerY = 200;
  const radius = 140;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const currentPoints = getPolygonPoints(mockSkills, "current", centerX, centerY, radius);
  const requiredPoints = getPolygonPoints(mockSkills, "required", centerX, centerY, radius);

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radar className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Skill Radar Chart
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCurrent(!showCurrent)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showCurrent
                ? "bg-celestial-indigo/10 text-celestial-indigo"
                : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist"
            }`}
          >
            {showCurrent ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Current
          </button>
          <button
            onClick={() => setShowRequired(!showRequired)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showRequired
                ? "bg-aurora-green/10 text-aurora-green"
                : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist"
            }`}
          >
            {showRequired ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Required
          </button>
        </div>
      </div>

      {/* Radar Chart using SVG */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-[400px] h-auto"
        >
          {/* Background rings */}
          {rings.map((ring) => (
            <polygon
              key={ring}
              points={mockSkills
                .map((_, i) => {
                  const angle = (Math.PI * 2 * i) / mockSkills.length - Math.PI / 2;
                  const x = centerX + radius * ring * Math.cos(angle);
                  const y = centerY + radius * ring * Math.sin(angle);
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="currentColor"
              className="text-cloud dark:text-nebula-purple/30"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {mockSkills.map((_, i) => {
            const end = getAxisEndpoint(i, mockSkills.length, centerX, centerY, radius);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={end.x}
                y2={end.y}
                stroke="currentColor"
                className="text-cloud dark:text-nebula-purple/30"
                strokeWidth="1"
              />
            );
          })}

          {/* Required polygon (outlined) */}
          {showRequired && (
            <polygon
              points={requiredPoints}
              fill="rgba(74, 222, 128, 0.08)"
              stroke="rgba(74, 222, 128, 0.8)"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )}

          {/* Current polygon (filled) */}
          {showCurrent && (
            <polygon
              points={currentPoints}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="rgba(99, 102, 241, 0.9)"
              strokeWidth="2.5"
            />
          )}

          {/* Data points - Current */}
          {showCurrent &&
            mockSkills.map((skill, i) => {
              const angle = (Math.PI * 2 * i) / mockSkills.length - Math.PI / 2;
              const value = skill.current / 100;
              const x = centerX + radius * value * Math.cos(angle);
              const y = centerY + radius * value * Math.sin(angle);
              return (
                <circle
                  key={`current-${i}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="rgba(99, 102, 241, 1)"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}

          {/* Data points - Required */}
          {showRequired &&
            mockSkills.map((skill, i) => {
              const angle = (Math.PI * 2 * i) / mockSkills.length - Math.PI / 2;
              const value = skill.required / 100;
              const x = centerX + radius * value * Math.cos(angle);
              const y = centerY + radius * value * Math.sin(angle);
              return (
                <circle
                  key={`required-${i}`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="rgba(74, 222, 128, 1)"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}

          {/* Labels */}
          {mockSkills.map((skill, i) => {
            const pos = getLabelPosition(i, mockSkills.length, centerX, centerY, radius);
            return (
              <text
                key={`label-${i}`}
                x={pos.x}
                y={pos.y}
                textAnchor={pos.anchor}
                dominantBaseline="middle"
                className="text-[11px] fill-current text-ink-black/70 dark:text-pearl/70 font-medium"
              >
                {skill.name}
              </text>
            );
          })}

          {/* Ring labels */}
          {rings.map((ring) => (
            <text
              key={`ring-${ring}`}
              x={centerX + 4}
              y={centerY - radius * ring + 4}
              className="text-[9px] fill-current text-silver-mist"
              textAnchor="start"
            >
              {Math.round(ring * 100)}%
            </text>
          ))}
        </svg>
      </div>

      {/* Skill Details Table */}
      <div className="mt-6 pt-4 border-t border-cloud dark:border-nebula-purple/30">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mockSkills.map((skill) => {
            const gap = skill.required - skill.current;
            return (
              <div
                key={skill.name}
                className="p-3 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg"
              >
                <div className="text-xs font-medium text-ink-black dark:text-pearl mb-1 truncate">
                  {skill.name}
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-celestial-indigo font-semibold">{skill.current}%</span>
                  <span className="text-silver-mist">/</span>
                  <span className="text-aurora-green font-semibold">{skill.required}%</span>
                </div>
                <div className={`text-[10px] font-semibold mt-0.5 ${
                  gap > 25 ? "text-coral-alert" : gap > 15 ? "text-amber-600 dark:text-amber-400" : "text-aurora-green"
                }`}>
                  {gap > 0 ? `-${gap}% gap` : "On track"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full bg-celestial-indigo" />
          <span className="text-xs text-silver-mist">Current Skills</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full bg-aurora-green border-dashed" style={{ borderTop: "2px dashed rgb(74, 222, 128)", height: 0 }} />
          <span className="text-xs text-silver-mist">Required Skills</span>
        </div>
      </div>
    </div>
  );
}
