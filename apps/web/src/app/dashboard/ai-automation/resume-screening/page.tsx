'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  BrainCircuit,
  Loader2,
  Sparkles,
  Upload,
  X,
  Trophy,
  FileUp,
} from 'lucide-react';
import {
  resumeScreening,
  type BulkScreeningResult,
  type ResumeScreeningJobOption,
  type ResumeScreeningListItem,
  type ResumeScreeningResult,
} from '@/lib/services/ai-automation-client';

const ACCEPT =
  '.txt,.md,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_FILES = 20;

function scoreTone(score: number) {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-indigo-600';
  if (score >= 55) return 'text-amber-600';
  return 'text-rose-600';
}

function barTone(score: number) {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-indigo-500';
  if (score >= 55) return 'bg-amber-500';
  return 'bg-rose-500';
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeScreeningPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenings, setScreenings] = useState<ResumeScreeningListItem[]>([]);
  const [jobs, setJobs] = useState<ResumeScreeningJobOption[]>([]);
  const [stats, setStats] = useState({
    processed: 0,
    avgMatchScore: 0,
    biasFlags: 0,
    interviewReady: 0,
    fairnessStatus: 'Pass',
  });
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [jobId, setJobId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, Node.js');
  const [minYears, setMinYears] = useState(3);
  const [batch, setBatch] = useState<BulkScreeningResult | null>(null);
  const [selectedRank, setSelectedRank] = useState<ResumeScreeningResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeScreening.list();
      if (!res.success || !res.data) {
        setError(res.error || 'Failed to load screenings');
        return;
      }
      setScreenings(res.data.screenings || []);
      setJobs(res.data.jobs || []);
      if (res.data.stats) setStats(res.data.stats);
      setAiEnabled(res.data.config?.aiEnabled ?? null);
      if (!jobId && res.data.jobs?.[0]) {
        const j = res.data.jobs[0];
        setJobId(j.id);
        setJobTitle(j.title);
        if (j.requiredSkills?.length) setRequiredSkills(j.requiredSkills.join(', '));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load resume screening data');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onJobChange = (id: string) => {
    setJobId(id);
    const j = jobs.find((x) => x.id === id);
    if (j) {
      setJobTitle(j.title);
      if (j.requiredSkills?.length) setRequiredSkills(j.requiredSkills.join(', '));
    }
  };

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    setFiles((prev) => {
      const map = new Map(prev.map((f) => [`${f.name}-${f.size}`, f]));
      for (const f of list) map.set(`${f.name}-${f.size}`, f);
      return Array.from(map.values()).slice(0, MAX_FILES);
    });
    setError(null);
  };

  const removeFile = (name: string, size: number) => {
    setFiles((prev) => prev.filter((f) => !(f.name === name && f.size === size)));
  };

  const handleScreen = async () => {
    if (!files.length) {
      setError('Upload at least one resume file (.txt, .pdf, .docx).');
      return;
    }
    if (aiEnabled === false) {
      setError('AI is required. Configure GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY.');
      return;
    }

    setScreening(true);
    setError(null);
    setBatch(null);
    setSelectedRank(null);
    try {
      const res = await resumeScreening.screenBulk({
        files,
        jobId: jobId || undefined,
        jobTitle: jobTitle || undefined,
        requiredSkills: requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        minYearsExperience: minYears,
      });
      if (!res.success || !res.data) {
        setError(res.error || 'Bulk screening failed');
        return;
      }
      setBatch(res.data);
      setSelectedRank(res.data.rankings[0] || null);
      await load();
    } catch (err) {
      console.error(err);
      setError('Screening request failed');
    } finally {
      setScreening(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return screenings;
    return screenings.filter(
      (s) =>
        s.candidateName.toLowerCase().includes(q) ||
        s.jobTitle.toLowerCase().includes(q) ||
        s.skills.some((sk) => sk.toLowerCase().includes(q))
    );
  }, [screenings, query]);

  const displayRows: Array<ResumeScreeningResult | ResumeScreeningListItem> = batch?.rankings
    ?.length
    ? batch.rankings
    : filtered;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-silver-mist">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
        Loading resume screenings…
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-celestial-indigo" />
            AI Resume Screening
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Upload multiple resumes, score them with LLM against a role, and get a ranked shortlist.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {aiEnabled !== null && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                aiEnabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
              }`}
            >
              {aiEnabled ? 'AI enabled' : 'AI required — add LLM API keys'}
            </span>
          )}
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">Fairness monitor · {stats.fairnessStatus}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30 px-4 py-2 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: 'Screenings', value: String(stats.processed), hint: 'This tenant' },
          { label: 'Avg match', value: `${stats.avgMatchScore}%`, hint: 'Recent runs' },
          { label: 'Interview ready', value: String(stats.interviewReady), hint: 'Score ≥ 55' },
          { label: 'Bias flags', value: String(stats.biasFlags), hint: 'Needs human review' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm"
          >
            <p className="text-xs text-silver-mist font-bold uppercase">{card.label}</p>
            <h3 className="text-3xl font-bold text-ink-black dark:text-pearl mt-1">{card.value}</h3>
            <p className="text-xs text-silver-mist mt-1">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <FileUp className="w-5 h-5 text-celestial-indigo" />
            Bulk upload & rank
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-silver-mist uppercase">Target role</label>
              <select
                value={jobId}
                onChange={(e) => onJobChange(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos/40"
              >
                <option value="">Custom / no requisition</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} · {j.department}
                  </option>
                ))}
              </select>
            </div>

            {!jobId && (
              <div>
                <label className="text-xs font-bold text-silver-mist uppercase">Job title</label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos/40"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-silver-mist uppercase">
                Required skills (comma-separated)
              </label>
              <input
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-silver-mist uppercase">
                Min years experience
              </label>
              <input
                type="number"
                min={0}
                max={40}
                value={minYears}
                onChange={(e) => setMinYears(Number(e.target.value) || 0)}
                className="mt-1 w-28 px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos/40"
              />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
              }}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                dragOver
                  ? 'border-celestial-indigo bg-celestial-indigo/5'
                  : 'border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos/30'
              }`}
            >
              <Upload className="w-8 h-8 text-celestial-indigo mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                Drop resumes here, or browse
              </p>
              <p className="text-[11px] text-silver-mist mt-1">
                .txt · .pdf · .docx · up to {MAX_FILES} files
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-white dark:hover:bg-stellar-blue"
              >
                <FileText className="w-4 h-4" />
                Choose files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-silver-mist uppercase">
                    Queue ({files.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                {files.map((f) => (
                  <div
                    key={`${f.name}-${f.size}`}
                    className="flex items-center gap-2 rounded-lg border border-cloud dark:border-nebula-purple/40 px-2.5 py-2 text-xs bg-white dark:bg-stellar-blue"
                  >
                    <FileText className="w-3.5 h-3.5 text-celestial-indigo shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink-black dark:text-pearl">
                        {f.name}
                      </div>
                      <div className="text-silver-mist">{formatBytes(f.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(f.name, f.size)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleScreen()}
              disabled={screening || files.length === 0 || aiEnabled === false}
              className="w-full py-3 bg-celestial-indigo text-white font-bold rounded-lg hover:bg-celestial-indigo/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {screening ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Screening {files.length} resume{files.length === 1 ? '' : 's'}…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Screen & rank {files.length || ''} resume{files.length === 1 ? '' : 's'}
                </>
              )}
            </button>

            {batch && (
              <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-3 bg-slate-50 dark:bg-deep-cosmos/30 text-xs space-y-1">
                <div className="font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Batch complete
                </div>
                <p className="text-silver-mist">
                  {batch.succeeded}/{batch.total} scored · {batch.failed} failed ·{' '}
                  {batch.processingTimeMs}ms
                </p>
                {batch.failures.length > 0 && (
                  <ul className="text-rose-600 list-disc pl-4">
                    {batch.failures.map((f) => (
                      <li key={`${f.fileName}-${f.error}`}>
                        {f.fileName}: {f.error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {selectedRank && (
              <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 bg-slate-50 dark:bg-deep-cosmos/30 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-silver-mist uppercase font-bold">
                      {selectedRank.rank ? `Rank #${selectedRank.rank}` : 'Selected'}
                    </p>
                    <h3 className="font-bold text-ink-black dark:text-pearl">
                      {selectedRank.extracted?.name || selectedRank.fileName || 'Candidate'}
                    </h3>
                    <p className="text-[11px] text-silver-mist mt-0.5">
                      {selectedRank.fileName || '—'} · {selectedRank.provider}
                      {selectedRank.model ? ` / ${selectedRank.model}` : ''}
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${scoreTone(selectedRank.overallScore)}`}>
                    {selectedRank.overallScore}%
                  </div>
                </div>
                {selectedRank.bias?.flagged ? (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Bias language flagged
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fairness check clean
                  </div>
                )}
                {selectedRank.strengths?.length > 0 && (
                  <ul className="text-xs space-y-1">
                    {selectedRank.strengths.slice(0, 4).map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
              {batch?.rankings?.length ? 'Ranked shortlist' : 'Screening history'}
            </h2>
            {!batch?.rankings?.length && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search candidates…"
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none w-full sm:w-64"
                />
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Match</th>
                  <th className="px-5 py-3">Skills</th>
                  <th className="px-5 py-3">Fairness</th>
                  <th className="px-5 py-3">Next</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-silver-mist text-sm">
                      Upload resumes on the left and click Screen & rank.
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row, i) => {
                    const isResult = 'extracted' in row;
                    const rank = isResult ? (row.rank ?? i + 1) : i + 1;
                    const name = isResult
                      ? row.extracted?.name || row.fileName || 'Candidate'
                      : row.candidateName;
                    const role = isResult ? row.job?.jobTitle : row.jobTitle;
                    const score = row.overallScore;
                    const skills = isResult
                      ? row.extracted?.skills || row.matchedSkills || []
                      : row.skills;
                    const biasFlagged = isResult ? row.bias?.flagged : row.biasFlagged;
                    const interview = row.interviewRecommended;
                    const recommendation = isResult ? row.recommendation : row.recommendation;

                    return (
                      <tr
                        key={isResult ? row.screeningId : row.id}
                        className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                          isResult && selectedRank?.screeningId === row.screeningId
                            ? 'bg-celestial-indigo/5'
                            : ''
                        } ${isResult ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (isResult) setSelectedRank(row);
                        }}
                      >
                        <td className="px-5 py-4 font-mono text-slate-400">#{rank}</td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-ink-black dark:text-pearl">{name}</div>
                          <div className="text-xs text-silver-mist">{role}</div>
                          {isResult && row.fileName && (
                            <div className="text-[10px] text-silver-mist mt-0.5 truncate max-w-[220px]">
                              {row.fileName}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-2 w-24 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barTone(score)}`}
                                style={{ width: `${Math.min(100, score)}%` }}
                              />
                            </div>
                            <span className={`font-bold ${scoreTone(score)}`}>{score}%</span>
                          </div>
                          <div className="text-[10px] text-silver-mist mt-1 capitalize">
                            {String(recommendation).replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1 flex-wrap max-w-[200px]">
                            {skills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {biasFlagged ? (
                            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 w-fit">
                              <AlertTriangle className="w-3 h-3" /> Review
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Clean
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-celestial-indigo">
                            {interview ? 'Interview' : 'Hold'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
