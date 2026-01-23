"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const metrics = [
  { label: 'Headcount', value: '1,234', change: '+12', trend: 'up' },
  { label: 'Attrition', value: '2.4%', change: '-0.5%', trend: 'down' },
  { label: 'Avg Tenure', value: '3.2y', change: '+0.1', trend: 'up' },
  { label: 'eNPS', value: '72', change: '+5', trend: 'up' },
];

export function MetricsWidget() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="p-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
          <p className="text-[10px] text-silver-mist uppercase font-medium">{metric.label}</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-lg font-bold text-ink-black dark:text-pearl">{metric.value}</p>
            <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
              metric.trend === 'up' ? 'text-emerald-500' :
              metric.trend === 'down' ? 'text-coral-alert' :
              'text-silver-mist'
            }`}>
              {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
               metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
               <Minus className="w-3 h-3" />}
              {metric.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
