/**
 * @module InsightCard
 * @description Individual AI insight card with severity indicators, metrics, and actions
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  TrendingUp,
  Shield,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { AIInsight, InsightType, InsightSeverity } from '@/hooks/useAIInsights';

interface InsightCardProps {
  insight: AIInsight;
  onDismiss: (id: string) => void;
}

const TYPE_CONFIG: Record<InsightType, { icon: LucideIcon; label: string }> = {
  turnover_risk: { icon: AlertTriangle, label: 'Turnover Risk' },
  performance_trend: { icon: TrendingUp, label: 'Performance Trend' },
  compliance_alert: { icon: Shield, label: 'Compliance Alert' },
  training_recommendation: { icon: BookOpen, label: 'Training Recommendation' },
};

const SEVERITY_STYLES: Record<
  InsightSeverity,
  { border: string; bg: string; badge: string; icon: string }
> = {
  critical: {
    border: 'border-quantum-rose/40',
    bg: 'bg-quantum-rose/5 dark:bg-quantum-rose/10',
    badge: 'bg-quantum-rose/10 text-quantum-rose',
    icon: 'text-quantum-rose',
  },
  warning: {
    border: 'border-sunset-amber/40',
    bg: 'bg-sunset-amber/5 dark:bg-sunset-amber/10',
    badge: 'bg-sunset-amber/10 text-sunset-amber',
    icon: 'text-sunset-amber',
  },
  info: {
    border: 'border-celestial-indigo/40',
    bg: 'bg-celestial-indigo/5 dark:bg-celestial-indigo/10',
    badge: 'bg-celestial-indigo/10 text-celestial-indigo',
    icon: 'text-celestial-indigo',
  },
  success: {
    border: 'border-neural-mint/40',
    bg: 'bg-neural-mint/5 dark:bg-neural-mint/10',
    badge: 'bg-neural-mint/10 text-neural-mint',
    icon: 'text-neural-mint',
  },
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = TYPE_CONFIG[insight.type];
  const severityStyle = SEVERITY_STYLES[insight.severity];
  const Icon = typeConfig.icon;

  return (
    <div
      className={`rounded-xl border ${severityStyle.border} ${severityStyle.bg} transition-all hover:shadow-sm`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg bg-white dark:bg-stellar-blue ${severityStyle.icon} shrink-0`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${severityStyle.badge}`}
              >
                {typeConfig.label}
              </span>
              <span className="text-[9px] text-silver-mist flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>
            <h4 className="text-sm font-bold text-ink-black dark:text-pearl leading-tight">
              {insight.title}
            </h4>
            <p className="text-xs text-silver-mist mt-1 leading-relaxed">{insight.summary}</p>
          </div>
          <button
            onClick={() => onDismiss(insight.id)}
            className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-stellar-blue/50 transition-colors shrink-0"
            title="Dismiss insight"
          >
            <X className="w-3.5 h-3.5 text-silver-mist" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {insight.metrics.slice(0, 4).map((metric) => (
            <div
              key={metric.name}
              className="bg-white/60 dark:bg-stellar-blue/60 rounded-lg px-2.5 py-1.5"
            >
              <p className="text-[9px] text-silver-mist truncate">{metric.name}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-ink-black dark:text-pearl">
                  {metric.value}
                </span>
                {metric.change !== undefined && (
                  <span
                    className={`text-[9px] font-medium ${
                      metric.trend === 'up'
                        ? 'text-neural-mint'
                        : metric.trend === 'down'
                          ? 'text-quantum-rose'
                          : 'text-silver-mist'
                    }`}
                  >
                    {metric.change > 0 ? '+' : ''}
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse & Action */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-cloud/30 dark:border-nebula-purple/20">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] font-medium text-celestial-indigo hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" /> Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> View details & recommendations
              </>
            )}
          </button>
          {insight.actionUrl && (
            <Link
              href={insight.actionUrl}
              className="flex items-center gap-1 text-[10px] font-medium text-celestial-indigo hover:underline"
            >
              Take action <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-cloud/30 dark:border-nebula-purple/20 pt-3">
          {/* Detailed Analysis */}
          <div>
            <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1.5">
              Analysis
            </p>
            <div className="text-xs text-ink-black/80 dark:text-pearl/80 leading-relaxed whitespace-pre-line">
              {insight.details}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1.5">
              Recommendations
            </p>
            <ul className="space-y-1.5">
              {insight.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-ink-black/80 dark:text-pearl/80"
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${severityStyle.badge}`}
                  >
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightCard;
