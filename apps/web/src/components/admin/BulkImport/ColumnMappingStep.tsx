'use client';

/**
 * @module ColumnMappingStep
 * @description Step 2 of BulkImportWizard — map source CSV/Excel columns to
 *   canonical target fields.  Auto-detects likely mappings with confidence
 *   indicators and supports manual override via dropdowns.
 */

import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import {
  type ColumnMappingEntry,
  type ImportEntityType,
  type ParsedFile,
  type TargetFieldDef,
  mapColumns,
  enrichMappingsWithSamples,
  getTargetFields,
} from '@/services/bulkImportService';

interface ColumnMappingStepProps {
  parsedFile: ParsedFile;
  entityType: ImportEntityType;
  onMappingsConfirmed: (mappings: ColumnMappingEntry[]) => void;
}

export default function ColumnMappingStep({
  parsedFile,
  entityType,
  onMappingsConfirmed,
}: ColumnMappingStepProps) {
  const [mappings, setMappings] = useState<ColumnMappingEntry[]>([]);
  const targetFields: TargetFieldDef[] = getTargetFields(entityType);

  // Auto-detect on mount / when file changes
  useEffect(() => {
    const raw = mapColumns(parsedFile.columns, entityType);
    const enriched = enrichMappingsWithSamples(raw.mappings, parsedFile.rows, 3);
    setMappings(enriched);
    onMappingsConfirmed(enriched);
  }, [parsedFile, entityType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTargetChange = (sourceColumn: string, newTarget: string) => {
    const updated = mappings.map((m) =>
      m.sourceColumn === sourceColumn
        ? { ...m, targetField: newTarget === '' ? null : newTarget, confidence: 1.0 }
        : m
    );
    setMappings(updated);
    onMappingsConfirmed(updated);
  };

  // Count mapped required fields
  const mappedTargets = new Set(mappings.map((m) => m.targetField).filter(Boolean));
  const requiredFields = targetFields.filter((f) => f.required);
  const missingRequired = requiredFields.filter((f) => !mappedTargets.has(f.name));
  const autoDetected = mappings.filter((m) => m.targetField && m.confidence < 1.0).length;

  const confidenceColor = (c: number) => {
    if (c >= 0.9) return 'text-aurora-green';
    if (c >= 0.6) return 'text-amber-500';
    return 'text-silver-mist';
  };

  const confidenceLabel = (c: number) => {
    if (c >= 0.9) return 'High';
    if (c >= 0.6) return 'Medium';
    if (c > 0) return 'Low';
    return '';
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Map Columns</h3>
        <p className="text-sm text-silver-mist mt-0.5">
          Match your file columns to the system fields. Auto-detection is shown with a confidence
          indicator.
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-aurora-green/10 border border-aurora-green/30 rounded-full text-xs font-medium text-aurora-green">
          <CheckCircle2 className="w-3 h-3" />
          {mappedTargets.size} mapped
        </span>
        {autoDetected > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-celestial-indigo/10 border border-celestial-indigo/30 rounded-full text-xs font-medium text-celestial-indigo">
            <Sparkles className="w-3 h-3" />
            {autoDetected} auto-detected
          </span>
        )}
        {missingRequired.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs font-medium text-rose-600">
            <AlertCircle className="w-3 h-3" />
            {missingRequired.length} required field{missingRequired.length > 1 ? 's' : ''} unmapped
          </span>
        )}
      </div>

      {/* Mapping table */}
      <div className="overflow-x-auto rounded-xl border border-cloud dark:border-nebula-purple/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/30">
              <th className="text-left py-2.5 px-4 font-semibold text-ink-black dark:text-pearl w-40">
                Source Column
              </th>
              <th className="w-6" />
              <th className="text-left py-2.5 px-4 font-semibold text-ink-black dark:text-pearl">
                Target Field
              </th>
              <th className="text-left py-2.5 px-4 font-semibold text-ink-black dark:text-pearl hidden md:table-cell">
                Confidence
              </th>
              <th className="text-left py-2.5 px-4 font-semibold text-ink-black dark:text-pearl hidden lg:table-cell">
                Sample Values
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
            {mappings.map((m) => (
              <tr
                key={m.sourceColumn}
                className="hover:bg-gray-50/50 dark:hover:bg-deep-cosmos/50 transition-colors"
              >
                {/* Source column */}
                <td className="py-2.5 px-4">
                  <code className="text-xs bg-gray-100 dark:bg-deep-cosmos px-2 py-1 rounded font-mono text-ink-black dark:text-pearl">
                    {m.sourceColumn}
                  </code>
                </td>

                {/* Arrow */}
                <td className="px-1">
                  <ArrowRight className="w-4 h-4 text-silver-mist" />
                </td>

                {/* Target field dropdown */}
                <td className="py-2.5 px-4">
                  <select
                    value={m.targetField ?? ''}
                    onChange={(e) => handleTargetChange(m.sourceColumn, e.target.value)}
                    className={`px-2 py-1.5 bg-white dark:bg-deep-cosmos border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40 ${
                      m.targetField
                        ? 'border-celestial-indigo/40 text-ink-black dark:text-pearl'
                        : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                    }`}
                  >
                    <option value="">-- Skip this column --</option>
                    {targetFields.map((tf) => (
                      <option key={tf.name} value={tf.name}>
                        {tf.label}
                        {tf.required ? ' *' : ''}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Confidence */}
                <td className="py-2.5 px-4 hidden md:table-cell">
                  {m.targetField && m.confidence > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            m.confidence >= 0.9
                              ? 'bg-aurora-green'
                              : m.confidence >= 0.6
                                ? 'bg-amber-400'
                                : 'bg-silver-mist'
                          }`}
                          style={{ width: `${Math.round(m.confidence * 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${confidenceColor(m.confidence)}`}>
                        {confidenceLabel(m.confidence)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-silver-mist">—</span>
                  )}
                </td>

                {/* Sample values */}
                <td className="py-2.5 px-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {m.sampleValues.slice(0, 3).map((sv, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-gray-100 dark:bg-deep-cosmos px-1.5 py-0.5 rounded text-silver-mist max-w-[100px] truncate"
                        title={sv}
                      >
                        {sv || '—'}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Missing required fields warning */}
      {missingRequired.length > 0 && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Required fields not mapped: </span>
            {missingRequired.map((f) => f.label).join(', ')}. Map or provide these fields before
            continuing.
          </div>
        </div>
      )}

      <p className="text-xs text-silver-mist">
        Fields marked with <span className="font-semibold">*</span> are required. Columns set to
        &quot;Skip&quot; will not be imported.
      </p>
    </div>
  );
}
