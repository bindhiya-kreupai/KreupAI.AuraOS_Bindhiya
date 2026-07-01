'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Users,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';

interface DataSourceMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  recordCount: number;
  columns: { id: string; name: string; type: string; category: string }[];
}

interface DataSourceSelectorProps {
  selectedSource?: string;
  onSelect?: (sourceId: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  Users: <Users className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
};

export function DataSourceSelector({ selectedSource, onSelect }: DataSourceSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedSource || '');
  const [sources, setSources] = useState<DataSourceMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/v1/reports/metadata')
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.success && json.data?.dataSources) {
          setSources(json.data.dataSources);
        } else {
          setError(json.error?.message || 'Failed to load data sources');
        }
      })
      .catch(() => active && setError('Failed to load data sources'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedSource !== undefined) setSelected(selectedSource);
  }, [selectedSource]);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Select Data Source</h3>
      </div>
      <p className="text-xs text-silver-mist">Choose the primary data source for your report</p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 text-celestial-indigo animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSelect(source.id)}
              className={`flex items-start gap-4 p-4 rounded-lg border text-left transition-colors ${
                selected === source.id
                  ? 'border-celestial-indigo bg-celestial-indigo/5'
                  : 'border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  selected === source.id
                    ? 'bg-celestial-indigo/10 text-celestial-indigo'
                    : 'bg-slate-50 dark:bg-deep-cosmos text-silver-mist'
                }`}
              >
                {ICONS[source.icon] || <Database className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{source.name}</p>
                <p className="text-xs text-silver-mist mt-0.5">{source.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-silver-mist">
                  <span>{source.columns.length} columns</span>
                  <span>{source.recordCount.toLocaleString()} records</span>
                </div>
              </div>
              <div className="flex-shrink-0 mt-1">
                {selected === source.id ? (
                  <CheckCircle2 className="w-5 h-5 text-celestial-indigo" />
                ) : (
                  <Circle className="w-5 h-5 text-cloud dark:text-nebula-purple/50" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
