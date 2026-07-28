'use client';

import type { FormEvent } from 'react';
import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Globe,
  Languages,
  Loader2,
  Plane,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';

import { useAviation } from '@/app/dashboard/aviation/hooks/useAviation';

interface CabinCrewRow {
  id?: string;
  employeeId: string;
  certification?: string | null;
  languages: string[];
  baseAirport?: string | null;
  status: string;
  certExpiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface RecruitCrewForm {
  employeeId: string;
  certification: string;
  languages: string;
  baseAirport: string;
  status: string;
  certExpiresAt: string;
}

const initialForm: RecruitCrewForm = {
  employeeId: '',
  certification: '',
  languages: '',
  baseAirport: '',
  status: 'ACTIVE',
  certExpiresAt: '',
};

export default function CabinCrewPage() {
  const { flightAssignments, crewMembers, loading, error, createCrewMember } = useAviation();

  /*
   * useAviation old CrewMemberProfile type use pannudhu.
   * Actual Prisma model simple fields use pannudhu.
   * Adhanala DB response-ai local CabinCrewRow type-ku convert panrom.
   */
  const crewRows = crewMembers as unknown as CabinCrewRow[];

  const [searchQuery, setSearchQuery] = useState('');
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const [form, setForm] = useState<RecruitCrewForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredCrew = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return crewRows;
    }

    return crewRows.filter((crew) => {
      const languageText = Array.isArray(crew.languages)
        ? crew.languages.join(' ').toLowerCase()
        : '';

      return (
        crew.employeeId?.toLowerCase().includes(query) ||
        crew.certification?.toLowerCase().includes(query) ||
        crew.baseAirport?.toLowerCase().includes(query) ||
        crew.status?.toLowerCase().includes(query) ||
        languageText.includes(query)
      );
    });
  }, [crewRows, searchQuery]);

  const activeCrewCount = crewRows.filter((crew) => crew.status === 'ACTIVE').length;

  const trainingCrewCount = crewRows.filter((crew) => crew.status === 'TRAINING').length;

  const expiringSoonCount = crewRows.filter((crew) => {
    if (!crew.certExpiresAt) {
      return false;
    }

    const expiryDate = new Date(crew.certExpiresAt);
    const today = new Date();

    const differenceInDays = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    return differenceInDays >= 0 && differenceInDays <= 60;
  }).length;

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError('');
  };

  const openModal = () => {
    setForm(initialForm);
    setFormError('');
    setSuccessMessage('');
    setIsRecruitModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsRecruitModalOpen(false);
    setForm(initialForm);
    setFormError('');
  };

  const handleRecruitCrew = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError('');
    setSuccessMessage('');

    if (!form.employeeId.trim() || !form.languages.trim() || !form.baseAirport.trim()) {
      setFormError('Employee ID, Languages and Base Airport are required.');
      return;
    }

    const languageList = form.languages
      .split(',')
      .map((language) => language.trim())
      .filter(Boolean);

    if (languageList.length === 0) {
      setFormError('Please enter at least one language.');
      return;
    }

    /*
     * Actual AviationCabinCrewMember Prisma fields:
     *
     * employeeId
     * certification
     * languages
     * baseAirport
     * status
     * certExpiresAt
     *
     * tenantId and createdBy backend route-la automatically add aagum.
     */
    const crewPayload = {
      employeeId: form.employeeId.trim(),
      certification: form.certification.trim() || null,
      languages: languageList,
      baseAirport: form.baseAirport.trim().toUpperCase(),
      status: form.status,
      certExpiresAt: form.certExpiresAt ? new Date(form.certExpiresAt).toISOString() : null,
    };

    try {
      setIsSubmitting(true);

      await createCrewMember(crewPayload as any);

      setSuccessMessage('Crew member recruited successfully.');
      setForm(initialForm);
      setIsRecruitModalOpen(false);
    } catch (submitError: any) {
      console.error('Recruit crew error:', submitError);

      const errorMessage = getErrorMessage(submitError);

      setFormError(errorMessage || 'Failed to recruit crew member. Please check the API response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && crewRows.length === 0) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] flex-col space-y-5 pb-8 text-slate-900 dark:text-slate-100">
      {/* Header */}

      <div className="flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6 text-indigo-500" />
            Cabin Crew
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage cabin crew records and flight assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Recruit Crew
        </button>
      </div>

      {/* Success message */}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* API error */}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by employee ID, language, certification, base or status..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {/* Summary cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Crew"
          value={crewRows.length}
          description="All cabin crew records"
        />

        <SummaryCard
          label="Active Crew"
          value={activeCrewCount}
          description="Available active crew"
        />

        <SummaryCard
          label="In Training"
          value={trainingCrewCount}
          description="Crew currently training"
        />

        <SummaryCard
          label="Expiry Due"
          value={expiringSoonCount}
          description="Within next 60 days"
        />
      </div>

      {/* Main cards */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Flight assignments */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Active Flights (Today)</h3>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {flightAssignments.length} Flights
            </span>
          </div>

          <div className="max-h-[360px] space-y-4 overflow-y-auto pr-2">
            {flightAssignments.map((flight, index) => (
              <div
                key={flight.assignmentId || index}
                className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-slate-800">
                    <Plane className="h-6 w-6 -rotate-45" />
                  </div>

                  <div>
                    <div className="font-bold">{flight.flightNumber}</div>

                    <div className="font-mono text-xs text-slate-500">
                      {flight.departure?.airportCode || 'N/A'} -{' '}
                      {flight.arrival?.airportCode || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 md:mt-0">
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400">Director</div>

                    <div className="text-sm font-bold">
                      {flight.crewComplement?.cabinDirector || 'Not assigned'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400">Crew</div>

                    <div className="text-sm font-bold">{flight.crewComplement?.totalCrew || 0}</div>
                  </div>

                  <span className="rounded bg-indigo-100 px-2 py-1 text-center text-xs font-bold text-indigo-600">
                    {formatLabel(flight.status)}
                  </span>
                </div>
              </div>
            ))}

            {flightAssignments.length === 0 && (
              <div className="py-20 text-center font-bold text-slate-400">
                No active flights recorded.
              </div>
            )}
          </div>
        </div>

        {/* Network card */}

        <div className="space-y-4">
          <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-xl">
            <div className="mb-2 flex items-center gap-2 opacity-80">
              <Globe className="h-5 w-5" />

              <span className="text-sm font-bold uppercase">Network Status</span>
            </div>

            <h3 className="mb-1 text-3xl font-bold">98.2%</h3>

            <p className="mb-4 text-sm text-indigo-100">
              Crew assignment coverage for the next 48 hours.
            </p>

            <button
              type="button"
              className="w-full rounded-lg bg-white/20 py-2 text-sm font-bold transition hover:bg-white/30"
            >
              View Gaps (2)
            </button>
          </div>
        </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-indigo-500" />

              <h3 className="text-lg font-bold">Language Coverage</h3>
            </div>

            <div className="space-y-3">
              {getLanguageSummary(crewRows)
                .slice(0, 5)
                .map(([language, count]) => (
                  <div
                    key={language}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
                  >
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {language}
                    </span>

                    <span className="font-bold">{count}</span>
                  </div>
                ))}

              {getLanguageSummary(crewRows).length === 0 && (
                <div className="py-5 text-center text-sm text-slate-400">
                  No language data available.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Crew Roster</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {crewMembers.map((crew, i) => (
                  <div
                    key={crew.crewId || i}
                    className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {crew.crewType?.substring(0, 2).toUpperCase() || 'CC'}
                      </div>
                      <span className="font-bold">
                        {crew.personalInfo?.firstName} {crew.personalInfo?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          crew.dutyStatus === 'available'
                            ? 'bg-emerald-100 text-emerald-600'
                            : crew.dutyStatus === 'standby'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {crew.dutyStatus}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCrew(crew);
                            setCrewModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-indigo-500"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete crew?')) deleteCrewMutation.mutate(crew.crewId);
                          }}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {crewMembers.length === 0 && (
                  <div className="text-xs text-slate-400 py-4 text-center italic">
                    No crew members found.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-bold uppercase">Network Status</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">98.2%</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Crew assignment coverage for next 48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crew directory */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-6 dark:border-slate-800 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold">Crew Directory</h3>

            <p className="mt-1 text-sm text-slate-500">
              Cabin crew records fetched directly from the database.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-500">{filteredCrew.length} members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Languages</th>
                <th className="px-6 py-4">Certification</th>
                <th className="px-6 py-4">Base Airport</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Certification Expiry</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCrew.map((crew, index) => (
                <tr
                  key={crew.id || crew.employeeId || index}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        {getEmployeeInitials(crew.employeeId)}
                      </div>

                      <span className="font-bold">{crew.employeeId}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex max-w-[260px] flex-wrap gap-1">
                      {Array.isArray(crew.languages) && crew.languages.length > 0 ? (
                        crew.languages.map((language) => (
                          <span
                            key={language}
                            className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700"
                          >
                            {language}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">{crew.certification || 'Not provided'}</td>

                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {crew.baseAirport || 'N/A'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={getStatusClass(crew.status)}>{formatLabel(crew.status)}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={isExpired(crew.certExpiresAt) ? 'font-medium text-rose-600' : ''}
                    >
                      {formatDate(crew.certExpiresAt)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-500">{formatDate(crew.createdAt)}</td>
                </tr>
              ))}

              {filteredCrew.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                    <div className="font-bold text-slate-500">
                      {searchQuery
                        ? 'No crew members match your search.'
                        : 'No crew members available.'}
                    </div>

                    {!searchQuery && (
                      <div className="mt-1 text-sm text-slate-400">
                        Click Recruit Crew to add the first crew member.
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruit modal */}

      {isRecruitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold">Recruit Crew Member</h2>

                <p className="mt-1 text-sm text-slate-500">Enter the new cabin crew details.</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecruitCrew} className="space-y-5 p-6">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="Employee ID"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleInputChange}
                  placeholder="Example: CC1001"
                  required
                />

                <FormField
                  label="Base Airport"
                  name="baseAirport"
                  value={form.baseAirport}
                  onChange={handleInputChange}
                  placeholder="Example: CJB"
                  required
                />

                <FormField
                  label="Certification"
                  name="certification"
                  value={form.certification}
                  onChange={handleInputChange}
                  placeholder="Example: Cabin Safety"
                />

                <FormField
                  label="Languages"
                  name="languages"
                  value={form.languages}
                  onChange={handleInputChange}
                  placeholder="English, Tamil, Hindi"
                  required
                />

                <FormField
                  label="Certification Expiry"
                  name="certExpiresAt"
                  type="date"
                  value={form.certExpiresAt}
                  onChange={handleInputChange}
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="TRAINING">Training</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Multiple languages enter panna comma use pannu. Example: English, Tamil, Hindi.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recruiting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Recruit Crew
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: keyof RecruitCrewForm;
  value: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormField({
  label,
  name,
  value,
  type = 'text',
  placeholder,
  required,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800"
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  description: string;
}

function SummaryCard({ label, value, description }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm font-bold uppercase text-slate-500">{label}</div>

      <div className="mt-2 text-3xl font-bold">{value}</div>

      <div className="mt-1 text-xs text-slate-400">{description}</div>
    </div>
  );
}

function formatLabel(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString('en-GB');
}

function getEmployeeInitials(employeeId?: string): string {
  if (!employeeId) {
    return 'CC';
  }

  return employeeId.slice(0, 2).toUpperCase();
}

function getStatusClass(status?: string): string {
  const commonClass = 'inline-flex rounded-full px-3 py-1 text-xs font-bold';

  switch (status) {
    case 'ACTIVE':
      return `${commonClass} bg-emerald-100 text-emerald-700`;

    case 'TRAINING':
      return `${commonClass} bg-amber-100 text-amber-700`;

    case 'ON_LEAVE':
      return `${commonClass} bg-sky-100 text-sky-700`;

    case 'INACTIVE':
      return `${commonClass} bg-slate-200 text-slate-600`;

    default:
      return `${commonClass} bg-slate-100 text-slate-600`;
  }
}

function isExpired(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  const expiryDate = new Date(value);

  if (Number.isNaN(expiryDate.getTime())) {
    return false;
  }

  return expiryDate.getTime() < new Date().getTime();
}

function getLanguageSummary(crewRows: CabinCrewRow[]): Array<[string, number]> {
  const languageCounts = new Map<string, number>();

  crewRows.forEach((crew) => {
    if (!Array.isArray(crew.languages)) {
      return;
    }

    crew.languages.forEach((language) => {
      const cleanLanguage = language.trim();

      if (!cleanLanguage) {
        return;
      }

      languageCounts.set(cleanLanguage, (languageCounts.get(cleanLanguage) || 0) + 1);
    });
  });

  return Array.from(languageCounts.entries()).sort((first, second) => second[1] - first[1]);
}

function getErrorMessage(error: any): string | null {
  if (!error) {
    return null;
  }

  if (typeof error.message === 'string' && error.message !== '[object Object]') {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return null;
}
