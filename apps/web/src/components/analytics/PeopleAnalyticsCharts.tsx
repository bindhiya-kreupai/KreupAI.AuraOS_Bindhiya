/**
 * @module PeopleAnalyticsCharts
 * @description Hand-crafted SVG chart library for people analytics —
 *              LineChart, BarChart, DonutChart, HeatmapChart, FunnelChart (Sec 23.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';

// ============================================================================
// SHARED TYPES & UTILS
// ============================================================================

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface Series {
  name: string;
  data: number[];
  color: string;
}

const CHART_PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
];

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

// ============================================================================
// LINE CHART
// ============================================================================

interface LineChartProps {
  series: Series[];
  labels: string[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  yLabel?: string;
  title?: string;
}

export function LineChart({
  series,
  labels,
  height = 200,
  showLegend = true,
  showGrid = true,
  yLabel,
  title,
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    values: { name: string; value: number; color: string }[];
  } | null>(null);

  const W = 500;
  const H = height;
  const padL = yLabel ? 50 : 40;
  const padR = 20;
  const padT = title ? 30 : 15;
  const padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allValues) * 1.15 || 1;
  const minVal = Math.min(0, ...allValues);

  const toX = (i: number) => padL + (i / Math.max(labels.length - 1, 1)) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => minVal + f * (maxVal - minVal));

  return (
    <div className="relative w-full">
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid */}
        {showGrid &&
          gridLines.map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={toY(v)}
                x2={W - padR}
                y2={toY(v)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text x={padL - 4} y={toY(v) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                {formatNum(v)}
              </text>
            </g>
          ))}

        {/* Y label */}
        {yLabel && (
          <text
            x="10"
            y={H / 2}
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
            transform={`rotate(-90, 10, ${H / 2})`}
          >
            {yLabel}
          </text>
        )}

        {/* Area fills */}
        {series.map((s) => {
          if (s.data.length < 2) return null;
          const pts = s.data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
          const firstX = toX(0);
          const lastX = toX(s.data.length - 1);
          const baseY = toY(0);
          return (
            <polygon
              key={s.name + '-area'}
              points={`${firstX},${baseY} ${pts} ${lastX},${baseY}`}
              fill={s.color}
              fillOpacity="0.08"
            />
          );
        })}

        {/* Lines */}
        {series.map((s) => {
          if (s.data.length < 2) return null;
          const d = s.data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
          return (
            <path
              key={s.name}
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Data points + hover areas */}
        {labels.map((label, i) => (
          <g key={label}>
            {series.map((s) => (
              <circle key={s.name} cx={toX(i)} cy={toY(s.data[i] ?? 0)} r="4" fill={s.color} />
            ))}
            {/* Invisible hover area */}
            <rect
              x={toX(i) - 15}
              y={padT}
              width="30"
              height={chartH}
              fill="transparent"
              onMouseEnter={(e) => {
                const _rect = (e.target as SVGRectElement).closest('svg')!.getBoundingClientRect();
                setTooltip({
                  x: toX(i),
                  y: Math.min(...series.map((s) => toY(s.data[i] ?? 0))),
                  label,
                  values: series.map((s) => ({
                    name: s.name,
                    value: s.data[i] ?? 0,
                    color: s.color,
                  })),
                });
              }}
            />
          </g>
        ))}

        {/* X labels */}
        {labels.map((label, i) => (
          <text
            key={label}
            x={toX(i)}
            y={H - padB + 14}
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
          >
            {label.length > 8 ? label.slice(0, 7) + '…' : label}
          </text>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line
              x1={tooltip.x}
              y1={padT}
              x2={tooltip.x}
              y2={padT + chartH}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            <rect
              x={Math.min(tooltip.x + 6, W - 130)}
              y={tooltip.y - 10}
              width="120"
              height={16 + tooltip.values.length * 14}
              rx="6"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="1"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            <text
              x={Math.min(tooltip.x + 12, W - 124)}
              y={tooltip.y + 4}
              fontSize="9"
              fontWeight="600"
              fill="#475569"
            >
              {tooltip.label}
            </text>
            {tooltip.values.map((v, i) => (
              <g key={v.name}>
                <circle
                  cx={Math.min(tooltip.x + 14, W - 122)}
                  cy={tooltip.y + 16 + i * 14}
                  r="3"
                  fill={v.color}
                />
                <text
                  x={Math.min(tooltip.x + 20, W - 116)}
                  y={tooltip.y + 20 + i * 14}
                  fontSize="9"
                  fill="#475569"
                >
                  {v.name}: <tspan fontWeight="600">{formatNum(v.value)}</tspan>
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {showLegend && series.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-slate-500">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BAR CHART
// ============================================================================

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
  title?: string;
  color?: string;
}

export function BarChart({
  data,
  height = 180,
  horizontal = false,
  showValues = true,
  title,
  color = '#3b82f6',
}: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 500;
  const H = height;
  const padL = horizontal ? 80 : 30;
  const padR = 20;
  const padT = title ? 28 : 12;
  const padB = horizontal ? 24 : 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.value)) * 1.1 || 1;

  if (horizontal) {
    const barH = (chartH / data.length) * 0.6;
    const gap = (chartH / data.length) * 0.4;
    return (
      <div className="w-full">
        {title && <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
          {data.map((d, i) => {
            const barW = (d.value / maxVal) * chartW;
            const y = padT + i * (barH + gap) + gap / 2;
            const c = d.color || color;
            return (
              <g
                key={d.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <text
                  x={padL - 4}
                  y={y + barH / 2 + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748b"
                >
                  {d.label.length > 12 ? d.label.slice(0, 11) + '…' : d.label}
                </text>
                <rect
                  x={padL}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="3"
                  fill={c}
                  fillOpacity={hovered === i ? 1 : 0.85}
                />
                {showValues && (
                  <text
                    x={padL + barW + 4}
                    y={y + barH / 2 + 3}
                    fontSize="9"
                    fontWeight="600"
                    fill={c}
                  >
                    {formatNum(d.value)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  const barW = (chartW / data.length) * 0.6;
  const gap = (chartW / data.length) * 0.4;

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const v = f * maxVal;
          const y = padT + chartH - f * chartH;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                {formatNum(v)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = padL + i * (barW + gap) + gap / 2;
          const h = (d.value / maxVal) * chartH;
          const y = padT + chartH - h;
          const c = d.color || CHART_PALETTE[i % CHART_PALETTE.length];
          return (
            <g
              key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="3"
                fill={c}
                fillOpacity={hovered === i ? 1 : 0.85}
              />
              {showValues && (
                <text
                  x={x + barW / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill={c}
                >
                  {formatNum(d.value)}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={H - padB + 12}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                {d.label.length > 6 ? d.label.slice(0, 5) + '…' : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================================
// DONUT CHART
// ============================================================================

interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  showLegend?: boolean;
  title?: string;
}

export function DonutChart({
  data,
  size = 160,
  centerLabel,
  centerSubLabel,
  showLegend = true,
  title,
}: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const ir = size * 0.24;
  const strokeW = r - ir;

  let cumulative = 0;

  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;
    const outerR = hovered === i ? r + 4 : r;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    const pathD =
      pct >= 0.999
        ? `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.001} ${cy - outerR}`
        : `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`;
    return {
      ...d,
      i,
      pct,
      pathD,
      midAngle,
      color: d.color || CHART_PALETTE[i % CHART_PALETTE.length],
    };
  });

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg width={size} height={size} className="flex-shrink-0">
          {segments.map((seg) => (
            <path
              key={seg.label}
              d={seg.pathD}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeLinecap="butt"
              fillOpacity="0"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHovered(seg.i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {/* Center text */}
          {centerLabel && (
            <text
              x={cx}
              y={cy + (centerSubLabel ? -4 : 4)}
              textAnchor="middle"
              fontSize={size / 8}
              fontWeight="700"
              fill="#1e293b"
            >
              {hovered !== null ? formatNum(data[hovered].value) : centerLabel}
            </text>
          )}
          {centerSubLabel && (
            <text x={cx} y={cy + size / 10} textAnchor="middle" fontSize={size / 12} fill="#94a3b8">
              {hovered !== null
                ? `${((data[hovered].value / total) * 100).toFixed(1)}%`
                : centerSubLabel}
            </text>
          )}
        </svg>

        {showLegend && (
          <div className="flex-1 space-y-1.5">
            {segments.map((seg) => (
              <div
                key={seg.label}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${hovered !== null && hovered !== seg.i ? 'opacity-40' : 'opacity-100'}`}
                onMouseEnter={() => setHovered(seg.i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs text-slate-600 flex-1 truncate">{seg.label}</span>
                <span className="text-xs font-semibold text-slate-700">
                  {(seg.pct * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HEATMAP CHART
// ============================================================================

interface HeatmapChartProps {
  data: number[][]; // rows = days (Mon-Sun), cols = weeks (1..N)
  rowLabels?: string[];
  colLabels?: string[];
  colorScale?: [string, string]; // [low, high]
  title?: string;
  height?: number;
}

export function HeatmapChart({
  data,
  rowLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  colLabels,
  colorScale = ['#dbeafe', '#1d4ed8'],
  title,
  height = 120,
}: HeatmapChartProps) {
  const [tooltip, setTooltip] = useState<{ row: number; col: number; val: number } | null>(null);

  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const allVals = data.flat();
  const maxVal = Math.max(...allVals) || 1;

  const W = 500;
  const H = height;
  const padL = 32;
  const padT = colLabels ? 22 : 8;
  const padB = 8;
  const padR = 8;
  const cellW = (W - padL - padR) / cols;
  const cellH = (H - padT - padB) / rows;
  const gap = 2;

  // Interpolate between two hex colors
  const lerpColor = (t: number): string => {
    const parseHex = (hex: string) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const [r1, g1, b1] = parseHex(colorScale[0]);
    const [r2, g2, b2] = parseHex(colorScale[1]);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setTooltip(null)}
      >
        {colLabels &&
          colLabels.map((label, j) => (
            <text
              key={j}
              x={padL + j * cellW + cellW / 2}
              y={padT - 4}
              textAnchor="middle"
              fontSize="8"
              fill="#94a3b8"
            >
              {label}
            </text>
          ))}
        {rowLabels.map((label, i) => (
          <text
            key={i}
            x={padL - 3}
            y={padT + i * cellH + cellH / 2 + 3}
            textAnchor="end"
            fontSize="8"
            fill="#94a3b8"
          >
            {label}
          </text>
        ))}
        {data.map((row, i) =>
          row.map((val, j) => {
            const t = val / maxVal;
            return (
              <rect
                key={`${i}-${j}`}
                x={padL + j * cellW + gap / 2}
                y={padT + i * cellH + gap / 2}
                width={cellW - gap}
                height={cellH - gap}
                rx="3"
                fill={lerpColor(t)}
                onMouseEnter={() => setTooltip({ row: i, col: j, val })}
                className="cursor-pointer"
              />
            );
          })
        )}
        {tooltip && (
          <g>
            <rect
              x={padL + tooltip.col * cellW}
              y={padT + tooltip.row * cellH - 18}
              width="50"
              height="16"
              rx="4"
              fill="#1e293b"
            />
            <text
              x={padL + tooltip.col * cellW + 25}
              y={padT + tooltip.row * cellH - 7}
              textAnchor="middle"
              fontSize="9"
              fill="white"
            >
              {tooltip.val.toFixed(1)}%
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// FUNNEL CHART
// ============================================================================

interface FunnelChartProps {
  stages: { label: string; value: number; color?: string }[];
  title?: string;
  height?: number;
}

export function FunnelChart({ stages, title, height = 200 }: FunnelChartProps) {
  const maxVal = Math.max(...stages.map((s) => s.value)) || 1;
  const W = 400;
  const H = height;
  const padL = 10;
  const padR = 80;
  const padT = title ? 24 : 8;
  const padB = 8;
  const chartH = H - padT - padB;
  const stageH = chartH / stages.length;

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        {stages.map((stage, i) => {
          const topW = (stage.value / maxVal) * (W - padL - padR);
          const nextW =
            i < stages.length - 1
              ? (stages[i + 1].value / maxVal) * (W - padL - padR)
              : topW * 0.85;
          const cx = (W - padL - padR) / 2 + padL;
          const y = padT + i * stageH;
          const color = stage.color || CHART_PALETTE[i % CHART_PALETTE.length];
          const topLeft = cx - topW / 2;
          const topRight = cx + topW / 2;
          const botLeft = cx - nextW / 2;
          const botRight = cx + nextW / 2;
          const conversionPct =
            i > 0 ? ((stage.value / stages[i - 1].value) * 100).toFixed(0) : '100';

          return (
            <g key={stage.label}>
              <polygon
                points={`${topLeft},${y} ${topRight},${y} ${botRight},${y + stageH - 2} ${botLeft},${y + stageH - 2}`}
                fill={color}
                fillOpacity="0.85"
              />
              <text
                x={cx}
                y={y + stageH / 2 + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="white"
              >
                {stage.label}: {formatNum(stage.value)}
              </text>
              <text x={W - padR + 4} y={y + stageH / 2 + 4} fontSize="9" fill="#64748b">
                {i > 0 && `${conversionPct}%`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================================
// KPI CARD
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // positive = up, negative = down
  trendLabel?: string;
  icon?: React.ElementType;
  color?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  color = '#3b82f6',
}: KPICardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ color }}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
            >
              <span>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-slate-400 font-normal">{trendLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
}
