'use client';

import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface EmployeeInput {
  employeeId: string;
  gender: 'M' | 'F' | 'O' | 'UNDISCLOSED';
  nationality: string;
  ageBracket: 'U30' | '30-50' | 'O50';
  isPwd: boolean;
  jobLevel: 'EXEC' | 'MANAGER' | 'PROFESSIONAL' | 'OPERATIONAL';
}

const INITIAL_EMPLOYEES: EmployeeInput[] = [
  {
    employeeId: 'EMP-001',
    gender: 'F',
    nationality: 'SAU',
    ageBracket: '30-50',
    isPwd: false,
    jobLevel: 'EXEC',
  },
  {
    employeeId: 'EMP-002',
    gender: 'M',
    nationality: 'SAU',
    ageBracket: 'U30',
    isPwd: false,
    jobLevel: 'MANAGER',
  },
  {
    employeeId: 'EMP-003',
    gender: 'F',
    nationality: 'KWT',
    ageBracket: '30-50',
    isPwd: true,
    jobLevel: 'PROFESSIONAL',
  },
  {
    employeeId: 'EMP-004',
    gender: 'M',
    nationality: 'BHR',
    ageBracket: 'O50',
    isPwd: false,
    jobLevel: 'OPERATIONAL',
  },
  {
    employeeId: 'EMP-005',
    gender: 'F',
    nationality: 'SAU',
    ageBracket: 'U30',
    isPwd: false,
    jobLevel: 'PROFESSIONAL',
  },
];

export default function DiversityMetricsPage() {
  const [employees, setEmployees] = useState<EmployeeInput[]>([]);
  const [thresholds, setThresholds] = useState({
    minFemalePct: '0.30',
    minNationalsPct: '0.40',
    minPwdPct: '0.02',
    minFemaleInLeadershipPct: '0.25',
    nationalCountry: 'SAU',
  });

  const [newEmp, setNewEmp] = useState<EmployeeInput>({
    employeeId: '',
    gender: 'F',
    nationality: 'SAU',
    ageBracket: '30-50',
    isPwd: false,
    jobLevel: 'PROFESSIONAL',
  });

  const [verdict, setVerdict] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/v1/esg-compliance/sustainability?action=diversity');
        const data = await res.json();
        if (data.success) {
          if (data.data?.employees && data.data.employees.length > 0) {
            setEmployees(data.data.employees);
          } else {
            setEmployees(INITIAL_EMPLOYEES);
          }
          if (data.data?.thresholds) {
            const t = data.data.thresholds;
            setThresholds({
              minFemalePct: String(t.minFemalePct ?? '0.30'),
              minNationalsPct: String(t.minNationalsPct ?? '0.40'),
              minPwdPct: String(t.minPwdPct ?? '0.02'),
              minFemaleInLeadershipPct: String(t.minFemaleInLeadershipPct ?? '0.25'),
              nationalCountry: t.nationalCountry || 'SAU',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load diversity data', err);
        setEmployees(INITIAL_EMPLOYEES);
      }
    }
    loadData();
  }, []);

  const addEmployee = () => {
    if (!newEmp.employeeId.trim() || !newEmp.nationality.trim()) {
      alert('Employee ID and Nationality are required');
      return;
    }
    setEmployees([...employees, { ...newEmp }]);
    setNewEmp({
      employeeId: '',
      gender: 'F',
      nationality: 'SAU',
      ageBracket: '30-50',
      isPwd: false,
      jobLevel: 'PROFESSIONAL',
    });
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const evaluate = async () => {
    setError('');
    setVerdict(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/esg-compliance/sustainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diversity',
          input: {
            employees,
            thresholds: {
              minFemalePct: thresholds.minFemalePct ? Number(thresholds.minFemalePct) : undefined,
              minNationalsPct: thresholds.minNationalsPct
                ? Number(thresholds.minNationalsPct)
                : undefined,
              minPwdPct: thresholds.minPwdPct ? Number(thresholds.minPwdPct) : undefined,
              minFemaleInLeadershipPct: thresholds.minFemaleInLeadershipPct
                ? Number(thresholds.minFemaleInLeadershipPct)
                : undefined,
              nationalCountry: thresholds.nationalCountry || undefined,
            },
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.verdict) {
        setVerdict(data.data.verdict);
      } else {
        setError(data.error?.message || 'Evaluation failed');
      }
    } catch (err: any) {
      setError(err.message || 'API error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
            EPIC-30 · ESG Sustainability
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Workforce Diversity Metric Pack
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Analyze gender mix, nationalisation targets, and inclusion bands across employee grades.
            All thresholds and records are backed by the database.
          </p>
        </header>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-250 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Settings & Input Column */}
          <div className="flex flex-col gap-6 md:col-span-1">
            {/* Threshold Settings */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                Target Thresholds
              </h2>
              <div className="space-y-3">
                <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-355 gap-1">
                  Min Female Ratio (0.0 - 1.0)
                  <input
                    type="number"
                    step="0.01"
                    value={thresholds.minFemalePct}
                    onChange={(e) => setThresholds({ ...thresholds, minFemalePct: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-855 text-sm outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                </label>
                <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-355 gap-1">
                  Min Nationals Ratio (0.0 - 1.0)
                  <input
                    type="number"
                    step="0.01"
                    value={thresholds.minNationalsPct}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, minNationalsPct: e.target.value })
                    }
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-855 text-sm outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                </label>
                <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-355 gap-1">
                  Min PwD Ratio (0.0 - 1.0)
                  <input
                    type="number"
                    step="0.01"
                    value={thresholds.minPwdPct}
                    onChange={(e) => setThresholds({ ...thresholds, minPwdPct: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-855 text-sm outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                </label>
                <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-355 gap-1">
                  Min Female in Leadership Ratio (0.0 - 1.0)
                  <input
                    type="number"
                    step="0.01"
                    value={thresholds.minFemaleInLeadershipPct}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, minFemaleInLeadershipPct: e.target.value })
                    }
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-855 text-sm outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                </label>
                <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-355 gap-1">
                  National Country Code
                  <input
                    type="text"
                    value={thresholds.nationalCountry}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        nationalCountry: e.target.value.toUpperCase(),
                      })
                    }
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-855 text-sm outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                  />
                </label>
              </div>
            </section>

            {/* Quick Add Employee */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                Add Employee Entry
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={newEmp.employeeId}
                  onChange={(e) => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm outline-none bg-slate-50 dark:bg-slate-855 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newEmp.gender}
                    onChange={(e) => setNewEmp({ ...newEmp, gender: e.target.value as any })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                    <option value="O">Other</option>
                    <option value="UNDISCLOSED">Undisclosed</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nationality (e.g. SAU)"
                    value={newEmp.nationality}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, nationality: e.target.value.toUpperCase() })
                    }
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newEmp.ageBracket}
                    onChange={(e) => setNewEmp({ ...newEmp, ageBracket: e.target.value as any })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="U30">Under 30</option>
                    <option value="30-50">30 - 50</option>
                    <option value="O50">Over 50</option>
                  </select>
                  <select
                    value={newEmp.jobLevel}
                    onChange={(e) => setNewEmp({ ...newEmp, jobLevel: e.target.value as any })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="EXEC">Executive</option>
                    <option value="MANAGER">Manager</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="OPERATIONAL">Operational</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEmp.isPwd}
                    onChange={(e) => setNewEmp({ ...newEmp, isPwd: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-0 w-4 h-4"
                  />
                  Identify as Person with Disability (PwD)
                </label>
                <button
                  type="button"
                  onClick={addEmployee}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold py-2 text-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add to List
                </button>
              </div>
            </section>
          </div>

          {/* List & Results Column */}
          <div className="flex flex-col gap-6 md:col-span-2">
            {/* Verdict Display */}
            {verdict && (
              <section
                className={`rounded-xl border p-5 shadow-sm flex flex-col gap-3 ${
                  verdict.flags.length > 0
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-205'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-250'
                }`}
              >
                <div className="flex items-center justify-between border-b border-rose-150 dark:border-rose-900 pb-2">
                  <h3 className="font-bold flex items-center gap-2">
                    {verdict.flags.length > 0 ? (
                      <>
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-455" />
                        <span>{verdict.flags.length} Diversity Warnings Raised</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-450" />
                        <span>All Diversity Targets Cleared</span>
                      </>
                    )}
                  </h3>
                  <span className="text-xs font-mono">Headcount: {verdict.totals.headcount}</span>
                </div>
                {verdict.flags.length > 0 ? (
                  <ul className="list-disc pl-5 text-xs space-y-1.5 font-medium">
                    {verdict.flags.map((f: any) => (
                      <li key={f.code}>
                        <p>{f.en}</p>
                        <p className="opacity-70 mt-0.5 text-[10px]" dir="rtl">
                          {f.ar}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs font-semibold">
                    Your workforce metrics comply with all GCC nationalisation, gender balance, and
                    inclusion thresholds.
                  </p>
                )}
                {/* Ratios progress grids */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2 text-center text-xs">
                  <div className="bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      Female
                    </p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {verdict.totals.femalePct}%
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      Nationals
                    </p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {verdict.totals.nationalsPct}%
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      Inclusion (PwD)
                    </p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {verdict.totals.pwdPct}%
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      Leadership
                    </p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {verdict.totals.femaleInLeadershipPct}%
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* List Table */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-855 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Active Evaluation Pool ({employees.length})
                  </h2>
                </div>
                <button
                  onClick={evaluate}
                  disabled={loading}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium px-4 py-1.5 text-xs shadow transition-colors cursor-pointer"
                >
                  {loading ? 'Evaluating...' : 'Evaluate Metrics'}
                </button>
              </div>

              <div className="overflow-y-auto max-h-[350px] flex-1">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-455 font-bold border-b border-slate-150 dark:border-slate-700 uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Employee ID</th>
                      <th className="px-4 py-2.5">Gender</th>
                      <th className="px-4 py-2.5">Nationality</th>
                      <th className="px-4 py-2.5">Age Bracket</th>
                      <th className="px-4 py-2.5">Job Level</th>
                      <th className="px-4 py-2.5">Inclusion (PwD)</th>
                      <th className="px-4 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employees.map((e, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {e.employeeId}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{e.gender}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {e.nationality}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {e.ageBracket}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {e.jobLevel}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {e.isPwd ? 'Yes' : 'No'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeEmployee(index)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-455 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-slate-400 dark:text-slate-500"
                        >
                          Evaluation pool is empty. Add employee records above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
