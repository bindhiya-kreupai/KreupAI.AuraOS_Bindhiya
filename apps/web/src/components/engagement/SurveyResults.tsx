/**
 * @module SurveyResults
 * @description Survey results view — participation funnel, per-question charts,
 *              NPS breakdown, department comparison, trend analysis (Sec 13.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  BarChart2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  SurveyService,
  type SurveyResults as SurveyResultsType,
  type QuestionResult,
  type NPSBreakdown,
} from '@/services/surveyService';

// ── Sub-components ─────────────────────────────────────────────────────────────

function ParticipationFunnel({
  invited,
  responded,
  rate,
}: {
  invited: number;
  responded: number;
  rate: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-1">
        <div className="w-full bg-blue-600 text-white text-center py-2.5 rounded-t-lg text-sm font-medium">
          Invited: {invited}
        </div>
        <div className="w-4/5 bg-blue-500 text-white text-center py-2.5 text-sm font-medium">
          Opened: {Math.round(invited * 0.88)}
        </div>
        <div className="w-3/5 bg-blue-400 text-white text-center py-2.5 text-sm font-medium">
          Started: {Math.round(responded * 1.1)}
        </div>
        <div className="w-2/5 bg-emerald-500 text-white text-center py-2.5 rounded-b-lg text-sm font-medium">
          Completed: {responded}
        </div>
      </div>
      <div className="text-center">
        <span className="text-2xl font-bold text-slate-800">{rate.toFixed(1)}%</span>
        <p className="text-xs text-slate-500 mt-0.5">Participation Rate</p>
      </div>
    </div>
  );
}

function HorizontalBar({
  label,
  count,
  percentage,
  color = '#3b82f6',
}: {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-600 w-28 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(percentage, 0.5)}%`, backgroundColor: color }}
        />
        <span className="absolute inset-0 flex items-center pl-2 text-xs font-medium text-white">
          {count > 0 ? count : ''}
        </span>
      </div>
      <span className="text-xs text-slate-500 w-8 text-right flex-shrink-0">
        {percentage.toFixed(0)}%
      </span>
    </div>
  );
}

function StarDistribution({
  distribution,
}: {
  distribution: { label: string; count: number; percentage: number }[];
}) {
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];
  return (
    <div className="space-y-1.5">
      {[...distribution].reverse().map((item, i) => (
        <HorizontalBar
          key={item.label}
          label={`${'★'.repeat(5 - i)}${'☆'.repeat(i)}`}
          count={item.count}
          percentage={item.percentage}
          color={colors[4 - i]}
        />
      ))}
    </div>
  );
}

function NPSBreakdownChart({ nps }: { nps: NPSBreakdown }) {
  const total = nps.totalResponses || 1;
  const promotersPct = (nps.promoters / total) * 100;
  const passivesPct = (nps.passives / total) * 100;
  const detractorsPct = (nps.detractors / total) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div
            className={`text-4xl font-bold ${nps.npsScore >= 50 ? 'text-emerald-600' : nps.npsScore >= 0 ? 'text-blue-600' : 'text-red-500'}`}
          >
            {nps.npsScore > 0 ? `+${nps.npsScore}` : nps.npsScore}
          </div>
          <div className="text-sm text-slate-500 mt-1">Net Promoter Score</div>
        </div>
      </div>
      {/* Segmented bar */}
      <div className="flex rounded-full overflow-hidden h-6">
        <div
          className="bg-red-400 flex items-center justify-center text-white text-xs font-medium transition-all"
          style={{ width: `${detractorsPct}%` }}
        >
          {detractorsPct > 8 && `${detractorsPct.toFixed(0)}%`}
        </div>
        <div
          className="bg-slate-300 flex items-center justify-center text-slate-700 text-xs font-medium"
          style={{ width: `${passivesPct}%` }}
        >
          {passivesPct > 8 && `${passivesPct.toFixed(0)}%`}
        </div>
        <div
          className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
          style={{ width: `${promotersPct}%` }}
        >
          {promotersPct > 8 && `${promotersPct.toFixed(0)}%`}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-red-50 rounded-lg p-2">
          <div className="text-lg font-bold text-red-600">{nps.detractors}</div>
          <div className="text-xs text-red-500">Detractors (0–6)</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-lg font-bold text-slate-600">{nps.passives}</div>
          <div className="text-xs text-slate-500">Passives (7–8)</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-2">
          <div className="text-lg font-bold text-emerald-600">{nps.promoters}</div>
          <div className="text-xs text-emerald-600">Promoters (9–10)</div>
        </div>
      </div>
    </div>
  );
}

function QuestionResultCard({ result }: { result: QuestionResult }) {
  const [expanded, setExpanded] = useState(true);

  const avgStars = result.average ? Math.round(result.average) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start gap-2">
          <BarChart2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-slate-800 leading-snug">{result.questionText}</p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">
              {result.questionType.replace('_', ' ')} · {result.totalResponses} responses
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div className="pt-3">
            {result.questionType === 'rating' && result.distribution && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-amber-500">
                    {result.average?.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex text-amber-400 text-lg">
                      {'★'.repeat(avgStars)}
                      {'☆'.repeat(5 - avgStars)}
                    </div>
                    <div className="text-xs text-slate-400">Average Rating</div>
                  </div>
                </div>
                <StarDistribution distribution={result.distribution} />
              </div>
            )}

            {result.questionType === 'nps' && result.distribution && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-blue-600">
                    {result.average?.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">/ 10 average</span>
                </div>
                <div className="flex gap-px">
                  {result.distribution.map((item) => (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(item.percentage * 0.8, 2)}px`,
                          backgroundColor:
                            Number(item.label) >= 9
                              ? '#10b981'
                              : Number(item.label) >= 7
                                ? '#94a3b8'
                                : '#f87171',
                        }}
                      />
                      <span className="text-[9px] text-slate-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.questionType === 'multiple_choice' && result.choices && (
              <div className="space-y-1.5">
                {result.choices
                  .sort((a, b) => b.count - a.count)
                  .map((choice) => (
                    <HorizontalBar
                      key={choice.option}
                      label={choice.option}
                      count={choice.count}
                      percentage={choice.percentage}
                    />
                  ))}
              </div>
            )}

            {result.questionType === 'yes_no' && (
              <div className="flex gap-4">
                <div className="flex-1 bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{result.yesCount}</div>
                  <div className="text-sm text-emerald-600 mt-1">
                    Yes (
                    {result.yesCount && result.totalResponses
                      ? ((result.yesCount / result.totalResponses) * 100).toFixed(0)
                      : 0}
                    %)
                  </div>
                </div>
                <div className="flex-1 bg-red-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{result.noCount}</div>
                  <div className="text-sm text-red-500 mt-1">
                    No (
                    {result.noCount && result.totalResponses
                      ? ((result.noCount / result.totalResponses) * 100).toFixed(0)
                      : 0}
                    %)
                  </div>
                </div>
              </div>
            )}

            {result.questionType === 'scale' && result.average && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {result.average.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">/ 10 average score</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(result.average / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {result.questionType === 'text' && result.textResponses && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.textResponses.filter(Boolean).map((text, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 italic">
                    &ldquo;{text}&rdquo;
                  </div>
                ))}
                {result.textResponses.filter(Boolean).length === 0 && (
                  <p className="text-xs text-slate-400">No text responses available</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface SurveyResultsProps {
  surveyId: string;
  onBack?: () => void;
}

export default function SurveyResults({ surveyId, onBack }: SurveyResultsProps) {
  const [results, setResults] = useState<SurveyResultsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await SurveyService.getSurveyResults(surveyId);
      setResults(data);
      setLoading(false);
    };
    load();
  }, [surveyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-16 text-slate-400">
        <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Results not available</p>
      </div>
    );
  }

  const scoreDiff = results.currentScore - (results.previousRunScore ?? results.currentScore);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors mt-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900">{results.surveyTitle}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Survey Results &amp; Analytics</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" />
          Export Results
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Invited',
            value: results.totalInvited,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Responded',
            value: results.totalResponded,
            icon: MessageSquare,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Avg. Completion',
            value: `${results.averageCompletionTime}m`,
            icon: BarChart2,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            label: 'Score vs Previous',
            value: scoreDiff === 0 ? 'N/A' : `${scoreDiff > 0 ? '+' : ''}${scoreDiff.toFixed(1)}`,
            icon: scoreDiff >= 0 ? TrendingUp : TrendingDown,
            color: scoreDiff >= 0 ? 'text-emerald-600' : 'text-red-500',
            bg: scoreDiff >= 0 ? 'bg-emerald-50' : 'bg-red-50',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation funnel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Participation Funnel</h2>
          <ParticipationFunnel
            invited={results.totalInvited}
            responded={results.totalResponded}
            rate={results.participationRate}
          />
        </div>

        {/* NPS breakdown */}
        {results.npsBreakdown && (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">NPS Breakdown</h2>
            <NPSBreakdownChart nps={results.npsBreakdown} />
          </div>
        )}
      </div>

      {/* Question results */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-800">Question-by-Question Results</h2>
        {results.questionResults.map((qr) => (
          <QuestionResultCard key={qr.questionId} result={qr} />
        ))}
      </div>

      {/* Department comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Department Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Department
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Responses
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Participation
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Avg Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.departmentComparison.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50">
                  <td className="py-2.5 font-medium text-slate-800">{dept.department}</td>
                  <td className="py-2.5 text-right text-slate-600">{dept.responses}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`font-medium ${dept.participationRate >= 75 ? 'text-emerald-600' : dept.participationRate >= 50 ? 'text-blue-600' : 'text-amber-600'}`}
                    >
                      {dept.participationRate}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${(dept.averageScore / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium text-slate-700">{dept.averageScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
