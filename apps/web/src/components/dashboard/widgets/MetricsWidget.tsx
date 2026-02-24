/**
 * @module MetricsWidget
 * @description Key HR metrics summary widget
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
  isPositive: boolean;
}

export const MetricsWidget: React.FC = () => {
  // Mock data – in production, fetch from analytics API
  const metrics: Metric[] = [
    { label: 'Headcount', value: '1,234', change: '+2.1%', trend: 'up', isPositive: true },
    { label: 'Attrition', value: '2.4%', change: '-0.5%', trend: 'down', isPositive: true },
    { label: 'Avg. Tenure', value: '3.2 yrs', change: '+0.1', trend: 'up', isPositive: true },
    { label: 'Engagement', value: '87%', change: '+3%', trend: 'up', isPositive: true },
    { label: 'Time to Hire', value: '28 days', change: '-2 days', trend: 'down', isPositive: true },
    { label: 'Cost/Hire', value: '$4.2k', change: '+$200', trend: 'up', isPositive: false },
  ];

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-sunset-amber" />
        HR Metrics
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-pearl/30 dark:bg-deep-cosmos/30 rounded-lg p-2.5">
            <p className="text-[10px] text-silver-mist mb-1">{metric.label}</p>
            <p className="text-base font-bold text-ink-black dark:text-pearl">{metric.value}</p>
            <div
              className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${
                metric.isPositive ? 'text-neural-mint' : 'text-quantum-rose'
              }`}
            >
              <TrendIcon trend={metric.trend} />
              {metric.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsWidget;
