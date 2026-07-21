'use client';

import type { FormEvent } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Award, CalendarDays, Loader2, Plus, Search, X } from 'lucide-react';

import { useAviation } from '@/app/dashboard/aviation/hooks/useAviation';

interface PilotTrainingRow {
  id?: string;
  pilotId: string;
  trainingType: string;
  aircraftType?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  certificateNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface TrainingForm {
  pilotId: string;
  trainingType: string;
  aircraftType: string;
  startDate: string;
  endDate: string;
  status: string;
  certificateNumber: string;
}

const initialForm: TrainingForm = {
  pilotId: '',
  trainingType: 'RECURRENT',
  aircraftType: '',
  startDate: '',
  endDate: '',
  status: 'SCHEDULED',
  certificateNumber: '',
};

export default function PilotTrainingPage() {
  const { pilots, loading, error, createPilot, loadPilots } = useAviation();

  /*
   * useAviation old PilotProfile type use pannudhu.
   * Actual Prisma model AviationPilotTraining simple fields use pannudhu.
   */
  const trainingRows = pilots as unknown as PilotTrainingRow[];

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<TrainingForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPilots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return trainingRows;
    }

    return trainingRows.filter((row) => {
      return (
        row.pilotId?.toLowerCase().includes(query) ||
        row.trainingType?.toLowerCase().includes(query) ||
        row.aircraftType?.toLowerCase().includes(query) ||
        row.status?.toLowerCase().includes(query) ||
        row.certificateNumber?.toLowerCase().includes(query)
      );
    });
  }, [trainingRows, searchQuery]);

  const scheduledCount = trainingRows.filter((row) => row.status === 'SCHEDULED').length;

  const inProgressCount = trainingRows.filter((row) => row.status === 'IN_PROGRESS').length;

  const completedCount = trainingRows.filter((row) => row.status === 'COMPLETED').length;

  const expiredCount = trainingRows.filter((row) => {
    if (!row.endDate) {
      return false;
    }

    return new Date(row.endDate).getTime() < new Date().getTime();
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setForm(initialForm);
    setFormError('');
  };

  const handleAddTraining = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError('');
    setSuccessMessage('');

    if (!form.pilotId.trim() || !form.trainingType || !form.startDate) {
      setFormError('Pilot ID, Training Type and Start Date are required.');
      return;
    }

    if (form.endDate && new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
      setFormError('End Date cannot be earlier than Start Date.');
      return;
    }

    /*
     * AviationPilotTraining Prisma fields:
     *
     * pilotId
     * trainingType
     * aircraftType
     * startDate
     * endDate
     * status
     * certificateNumber
     *
     * tenantId and createdBy backend automatically add pannum.
     */
    const trainingPayload = {
      pilotId: form.pilotId.trim(),
      trainingType: form.trainingType,
      aircraftType: form.aircraftType.trim().toUpperCase() || null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      status: form.status,
      certificateNumber: form.certificateNumber.trim() || null,
    };

    try {
      setIsSubmitting(true);

      await createPilot(trainingPayload as any);

      setSuccessMessage('Pilot training record added successfully.');

      setForm(initialForm);
      setIsModalOpen(false);
    } catch (submitError: any) {
      console.error('Add pilot training error:', submitError);

      const errorMessage = getErrorMessage(submitError);

      setFormError(
        errorMessage || 'Failed to add pilot training record. Please check the API response.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && trainingRows.length === 0) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] flex-col space-y-5 pb-8 text-slate-900 dark:text-slate-100">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Award className="h-6 w-6 text-indigo-500" />
            Pilot Training
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage pilot certifications, training schedules and aircraft qualifications.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Training
        </button>
      </div>

      {/* Success */}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by pilot ID, training, aircraft, status or certificate..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {/* Summary cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Scheduled" value={scheduledCount} description="Upcoming training" />

        <SummaryCard label="In Progress" value={inProgressCount} description="Current sessions" />

        <SummaryCard label="Completed" value={completedCount} description="Finished training" />

        <SummaryCard label="Expired" value={expiredCount} description="End date passed" />
      </div>

      {/* Training table */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-6 dark:border-slate-800 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold">Training Compliance Matrix</h3>

            <p className="mt-1 text-sm text-slate-500">
              Pilot training records fetched directly from the database.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-500">{filteredRows.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Pilot ID</th>

                <th className="px-6 py-4">Training Type</th>

                <th className="px-6 py-4">Aircraft</th>

                <th className="px-6 py-4">Start Date</th>

                <th className="px-6 py-4">End Date</th>

                <th className="px-6 py-4">Certificate</th>

                <th className="px-6 py-4">Status</th>

                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.map((row, index) => (
                <tr
                  key={row.id || `${row.pilotId}-${index}`}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        {getPilotInitials(row.pilotId)}
                      </div>

                      <span className="font-bold">{row.pilotId}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">{formatLabel(row.trainingType)}</td>

                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {row.aircraftType || 'N/A'}
                    </span>
                  </td>

                  <td className="px-6 py-4">{formatDate(row.startDate)}</td>

                  <td className="px-6 py-4">
                    <span className={isExpired(row.endDate) ? 'font-medium text-rose-600' : ''}>
                      {formatDate(row.endDate)}
                    </span>
                  </td>

                  <td className="px-6 py-4">{row.certificateNumber || 'Not provided'}</td>

                  <td className="px-6 py-4">
                    <span className={getStatusClass(row.status)}>{formatLabel(row.status)}</span>
                  </td>

                  <td className="px-6 py-4 text-slate-500">{formatDate(row.createdAt)}</td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <Award className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                    <div className="font-bold text-slate-500">
                      {searchQuery
                        ? 'No training records match your search.'
                        : 'No pilot training records available.'}
                    </div>

                    {!searchQuery && (
                      <div className="mt-1 text-sm text-slate-400">
                        Click Add Training to create the first training record.
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Training Modal */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold">Add Pilot Training</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter pilot training and certification details.
                </p>
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

            <form onSubmit={handleAddTraining} className="space-y-5 p-6">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="Pilot ID"
                  name="pilotId"
                  value={form.pilotId}
                  onChange={handleInputChange}
                  placeholder="Example: PILOT1001"
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Training Type
                    <span className="ml-1 text-rose-500">*</span>
                  </label>

                  <select
                    name="trainingType"
                    value={form.trainingType}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="INITIAL">Initial</option>

                    <option value="RECURRENT">Recurrent</option>

                    <option value="UPGRADE">Upgrade</option>

                    <option value="TRANSITION">Transition</option>

                    <option value="PROFICIENCY_CHECK">Proficiency Check</option>
                  </select>
                </div>

                <FormField
                  label="Aircraft Type"
                  name="aircraftType"
                  value={form.aircraftType}
                  onChange={handleInputChange}
                  placeholder="Example: A380"
                />

                <FormField
                  label="Certificate Number"
                  name="certificateNumber"
                  value={form.certificateNumber}
                  onChange={handleInputChange}
                  placeholder="Example: CERT-1001"
                />

                <FormField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleInputChange}
                  required
                />

                <FormField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={form.endDate}
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
                    <option value="SCHEDULED">Scheduled</option>

                    <option value="IN_PROGRESS">In Progress</option>

                    <option value="COMPLETED">Completed</option>

                    <option value="FAILED">Failed</option>

                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />

                <span>Pilot ID, Training Type and Start Date required fields.</span>
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Training
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
  name: keyof TrainingForm;
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

function getPilotInitials(pilotId?: string): string {
  if (!pilotId) {
    return 'PL';
  }

  return pilotId.slice(0, 2).toUpperCase();
}

function getStatusClass(status?: string): string {
  const commonClass = 'inline-flex rounded-full px-3 py-1 text-xs font-bold';

  switch (status) {
    case 'SCHEDULED':
      return `${commonClass} bg-sky-100 text-sky-700`;

    case 'IN_PROGRESS':
      return `${commonClass} bg-amber-100 text-amber-700`;

    case 'COMPLETED':
      return `${commonClass} bg-emerald-100 text-emerald-700`;

    case 'FAILED':
      return `${commonClass} bg-rose-100 text-rose-700`;

    case 'CANCELLED':
      return `${commonClass} bg-slate-200 text-slate-600`;

    default:
      return `${commonClass} bg-slate-100 text-slate-600`;
  }
}

function isExpired(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < new Date().getTime();
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
