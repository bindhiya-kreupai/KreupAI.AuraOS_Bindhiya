'use client';

import type { FormEvent } from 'react';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Plus,
  Search,
  Truck,
  Users,
  X,
} from 'lucide-react';

import { useAviation } from '@/app/dashboard/aviation/hooks/useAviation';

interface GroundStaffRow {
  id?: string;
  employeeId: string;
  role: string;
  baseAirport: string;
  certifications: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface TurnaroundRow {
  id?: string;
  flightNumber: string;
  airport: string;
  arrivedAt: string;
  departedAt?: string | null;
  targetMinutes: number;
  actualMinutes?: number | null;
  status: string;
  assignedStaff: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface StaffForm {
  employeeId: string;
  role: string;
  baseAirport: string;
  certifications: string;
}

interface TurnaroundForm {
  flightNumber: string;
  airport: string;
  arrivedAt: string;
  departedAt: string;
  targetMinutes: string;
  actualMinutes: string;
  status: string;
  assignedStaff: string;
}

const initialStaffForm: StaffForm = {
  employeeId: '',
  role: 'RAMP_AGENT',
  baseAirport: '',
  certifications: '',
};

const initialTurnaroundForm: TurnaroundForm = {
  flightNumber: '',
  airport: '',
  arrivedAt: '',
  departedAt: '',
  targetMinutes: '45',
  actualMinutes: '',
  status: 'IN_PROGRESS',
  assignedStaff: '',
};

function GroundOpsContent() {
  const {
    turnarounds,
    groundStaff,
    loading,
    error,
    createGroundStaff,
    createTurnaround,
    loadGroundStaff,
    loadTurnarounds,
  } = useAviation();

  const staffRows = groundStaff as unknown as GroundStaffRow[];

  const turnaroundRows = turnarounds as unknown as TurnaroundRow[];

  const [searchQuery, setSearchQuery] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isTurnaroundModalOpen, setIsTurnaroundModalOpen] = useState(false);

  const [staffForm, setStaffForm] = useState<StaffForm>(initialStaffForm);

  const [turnaroundForm, setTurnaroundForm] = useState<TurnaroundForm>(initialTurnaroundForm);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadGroundStaff();
    loadTurnarounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return staffRows;
    }

    return staffRows.filter((staff) => {
      const certificationText = Array.isArray(staff.certifications)
        ? staff.certifications.join(' ').toLowerCase()
        : '';

      return (
        staff.employeeId?.toLowerCase().includes(query) ||
        staff.role?.toLowerCase().includes(query) ||
        staff.baseAirport?.toLowerCase().includes(query) ||
        certificationText.includes(query)
      );
    });
  }, [staffRows, searchQuery]);

  const filteredTurnarounds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return turnaroundRows;
    }

    return turnaroundRows.filter((turnaround) => {
      const staffText = Array.isArray(turnaround.assignedStaff)
        ? turnaround.assignedStaff.join(' ').toLowerCase()
        : '';

      return (
        turnaround.flightNumber?.toLowerCase().includes(query) ||
        turnaround.airport?.toLowerCase().includes(query) ||
        turnaround.status?.toLowerCase().includes(query) ||
        staffText.includes(query)
      );
    });
  }, [turnaroundRows, searchQuery]);

  const avgTurnaround =
    turnaroundRows.length > 0
      ? Math.round(
          turnaroundRows.reduce(
            (total, turnaround) => total + (turnaround.actualMinutes ?? turnaround.targetMinutes),
            0
          ) / turnaroundRows.length
        )
      : 0;

  const activeTurnarounds = turnaroundRows.filter(
    (turnaround) => turnaround.status === 'IN_PROGRESS'
  ).length;

  const completedTurnarounds = turnaroundRows.filter(
    (turnaround) => turnaround.status === 'COMPLETED'
  ).length;

  const baggageHandlers = staffRows.filter((staff) => staff.role === 'BAGGAGE_HANDLER').length;

  const rampAgents = staffRows.filter((staff) => staff.role === 'RAMP_AGENT').length;

  const cleaners = staffRows.filter((staff) => staff.role === 'AIRCRAFT_CLEANER').length;

  const handleStaffInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setStaffForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError('');
  };

  const handleTurnaroundInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setTurnaroundForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError('');
  };

  const closeModals = () => {
    if (isSubmitting) {
      return;
    }

    setIsStaffModalOpen(false);
    setIsTurnaroundModalOpen(false);
    setStaffForm(initialStaffForm);
    setTurnaroundForm(initialTurnaroundForm);
    setFormError('');
  };

  const handleAddStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError('');
    setSuccessMessage('');

    if (!staffForm.employeeId.trim() || !staffForm.role || !staffForm.baseAirport.trim()) {
      setFormError('Employee ID, Role and Base Airport are required.');
      return;
    }

    const certifications = staffForm.certifications
      .split(',')
      .map((certification) => certification.trim())
      .filter(Boolean);

    const staffPayload = {
      employeeId: staffForm.employeeId.trim(),
      role: staffForm.role,
      baseAirport: staffForm.baseAirport.trim().toUpperCase(),
      certifications,
    };

    try {
      setIsSubmitting(true);

      await createGroundStaff(staffPayload as any);

      setSuccessMessage('Ground staff member added successfully.');

      setStaffForm(initialStaffForm);
      setIsStaffModalOpen(false);
    } catch (submitError: any) {
      console.error('Add ground staff error:', submitError);

      setFormError(
        getErrorMessage(submitError) || 'Failed to add ground staff. Please check the API response.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTurnaround = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError('');
    setSuccessMessage('');

    if (
      !turnaroundForm.flightNumber.trim() ||
      !turnaroundForm.airport.trim() ||
      !turnaroundForm.arrivedAt ||
      !turnaroundForm.targetMinutes
    ) {
      setFormError('Flight Number, Airport, Arrival Time and Target Minutes are required.');
      return;
    }

    const targetMinutes = Number(turnaroundForm.targetMinutes);

    const actualMinutes = turnaroundForm.actualMinutes.trim()
      ? Number(turnaroundForm.actualMinutes)
      : null;

    if (Number.isNaN(targetMinutes) || targetMinutes <= 0) {
      setFormError('Target Minutes must be greater than zero.');
      return;
    }

    if (actualMinutes !== null && (Number.isNaN(actualMinutes) || actualMinutes < 0)) {
      setFormError('Actual Minutes must be a valid number.');
      return;
    }

    const assignedStaff = turnaroundForm.assignedStaff
      .split(',')
      .map((staff) => staff.trim())
      .filter(Boolean);

    const turnaroundPayload = {
      flightNumber: turnaroundForm.flightNumber.trim().toUpperCase(),
      airport: turnaroundForm.airport.trim().toUpperCase(),
      arrivedAt: new Date(turnaroundForm.arrivedAt).toISOString(),
      departedAt: turnaroundForm.departedAt
        ? new Date(turnaroundForm.departedAt).toISOString()
        : null,
      targetMinutes,
      actualMinutes,
      status: turnaroundForm.status,
      assignedStaff,
    };

    try {
      setIsSubmitting(true);

      await createTurnaround(turnaroundPayload as any);

      setSuccessMessage('Turnaround record added successfully.');

      setTurnaroundForm(initialTurnaroundForm);
      setIsTurnaroundModalOpen(false);
    } catch (submitError: any) {
      console.error('Add turnaround error:', submitError);

      setFormError(
        getErrorMessage(submitError) || 'Failed to add turnaround. Please check the API response.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && staffRows.length === 0 && turnaroundRows.length === 0) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] flex-col space-y-5 pb-8 text-slate-900 dark:text-slate-100">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Truck className="h-6 w-6 text-orange-500" />
            Ground Operations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage ground staff, ramp activity and aircraft turnarounds.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setSuccessMessage('');
              setIsStaffModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Ground Staff
          </button>

          <button
            type="button"
            onClick={() => {
              setFormError('');
              setSuccessMessage('');
              setIsTurnaroundModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add Turnaround
          </button>
        </div>
      </div>

      {/* Messages */}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

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
          placeholder="Search staff, flight, airport, role, status..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Ground Staff"
          value={staffRows.length}
          description="Total staff records"
        />

        <SummaryCard
          label="Active Turnarounds"
          value={activeTurnarounds}
          description="Currently in progress"
        />

        <SummaryCard
          label="Completed"
          value={completedTurnarounds}
          description="Finished operations"
        />

        <SummaryCard
          label="Avg Turnaround"
          value={`${avgTurnaround}m`}
          description="Average completion time"
        />
      </div>

      {/* Live activity and roster */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Live Ramp Activity</h3>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
              {filteredTurnarounds.length} records
            </span>
          </div>

          <div className="max-h-[430px] space-y-4 overflow-y-auto pr-2">
            {filteredTurnarounds.map((turnaround, index) => (
              <div
                key={turnaround.id || `${turnaround.flightNumber}-${index}`}
                className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                    {turnaround.flightNumber?.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="font-bold">{turnaround.flightNumber}</div>

                    <div className="text-xs text-slate-500">Airport: {turnaround.airport}</div>

                    <div className="mt-1 text-xs text-slate-400">
                      Staff: {turnaround.assignedStaff?.length || 0}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 md:mt-0">
                  <div className="text-right">
                    <div className="font-bold">
                      {turnaround.actualMinutes ?? turnaround.targetMinutes}m
                    </div>

                    <div className="text-[10px] font-bold uppercase text-slate-400">Duration</div>
                  </div>

                  <span className={getTurnaroundStatusClass(turnaround.status)}>
                    {formatLabel(turnaround.status)}
                  </span>
                </div>
              </div>
            ))}

            {filteredTurnarounds.length === 0 && (
              <div className="py-20 text-center font-bold text-slate-400">
                No turnaround records available.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Users className="h-5 w-5 text-indigo-500" />
              Ground Crew Roster
            </h3>

            <div className="space-y-3">
              <RosterRow label="Baggage Handlers" value={baggageHandlers} />

              <RosterRow label="Ramp Agents" value={rampAgents} />

              <RosterRow label="Aircraft Cleaners" value={cleaners} />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-6 dark:border-rose-900/30 dark:bg-rose-900/20">
            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400" />

            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300">
                Ramp Safety Alert
              </h3>

              <p className="mt-1 text-xs text-rose-800 dark:text-rose-400">
                Follow standard ramp safety protocol during all aircraft movements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff table */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold">Ground Staff Directory</h3>

            <p className="mt-1 text-sm text-slate-500">
              Ground staff records fetched from the database.
            </p>
          </div>

          <span className="text-sm text-slate-500">{filteredStaff.length} members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Base Airport</th>
                <th className="px-6 py-4">Certifications</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStaff.map((staff, index) => (
                <tr
                  key={staff.id || staff.employeeId || index}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4 font-bold">{staff.employeeId}</td>

                  <td className="px-6 py-4">{formatLabel(staff.role)}</td>

                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-bold dark:bg-slate-800">
                      {staff.baseAirport}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {staff.certifications?.length
                      ? staff.certifications.join(', ')
                      : 'Not provided'}
                  </td>

                  <td className="px-6 py-4 text-slate-500">{formatDate(staff.createdAt)}</td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-bold text-slate-400">
                    No ground staff records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ground Staff Modal */}

      {isStaffModalOpen && (
        <ModalContainer
          title="Add Ground Staff"
          description="Enter ground staff details."
          onClose={closeModals}
          disabled={isSubmitting}
        >
          <form onSubmit={handleAddStaff} className="space-y-5">
            {formError && <ErrorMessage message={formError} />}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Employee ID"
                name="employeeId"
                value={staffForm.employeeId}
                onChange={handleStaffInputChange}
                placeholder="Example: GS1001"
                required
              />

              <FormField
                label="Base Airport"
                name="baseAirport"
                value={staffForm.baseAirport}
                onChange={handleStaffInputChange}
                placeholder="Example: CJB"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-bold">Role *</label>

                <select
                  name="role"
                  value={staffForm.role}
                  onChange={handleStaffInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="RAMP_AGENT">Ramp Agent</option>
                  <option value="BAGGAGE_HANDLER">Baggage Handler</option>
                  <option value="PUSHBACK_DRIVER">Pushback Driver</option>
                  <option value="REFUELER">Refueler</option>
                  <option value="AIRCRAFT_CLEANER">Aircraft Cleaner</option>
                  <option value="CARGO_LOADER">Cargo Loader</option>
                  <option value="SUPERVISOR">Supervisor</option>
                </select>
              </div>

              <FormField
                label="Certifications"
                name="certifications"
                value={staffForm.certifications}
                onChange={handleStaffInputChange}
                placeholder="Safety, Security"
              />
            </div>

            <ModalActions loading={isSubmitting} onCancel={closeModals} submitLabel="Add Staff" />
          </form>
        </ModalContainer>
      )}

      {/* Add Turnaround Modal */}

      {isTurnaroundModalOpen && (
        <ModalContainer
          title="Add Turnaround"
          description="Enter aircraft turnaround details."
          onClose={closeModals}
          disabled={isSubmitting}
        >
          <form onSubmit={handleAddTurnaround} className="space-y-5">
            {formError && <ErrorMessage message={formError} />}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Flight Number"
                name="flightNumber"
                value={turnaroundForm.flightNumber}
                onChange={handleTurnaroundInputChange}
                placeholder="Example: AI101"
                required
              />

              <FormField
                label="Airport"
                name="airport"
                value={turnaroundForm.airport}
                onChange={handleTurnaroundInputChange}
                placeholder="Example: CJB"
                required
              />

              <FormField
                label="Arrival Time"
                name="arrivedAt"
                type="datetime-local"
                value={turnaroundForm.arrivedAt}
                onChange={handleTurnaroundInputChange}
                required
              />

              <FormField
                label="Departure Time"
                name="departedAt"
                type="datetime-local"
                value={turnaroundForm.departedAt}
                onChange={handleTurnaroundInputChange}
              />

              <FormField
                label="Target Minutes"
                name="targetMinutes"
                type="number"
                value={turnaroundForm.targetMinutes}
                onChange={handleTurnaroundInputChange}
                required
              />

              <FormField
                label="Actual Minutes"
                name="actualMinutes"
                type="number"
                value={turnaroundForm.actualMinutes}
                onChange={handleTurnaroundInputChange}
              />

              <FormField
                label="Assigned Staff"
                name="assignedStaff"
                value={turnaroundForm.assignedStaff}
                onChange={handleTurnaroundInputChange}
                placeholder="GS1001, GS1002"
              />

              <div>
                <label className="mb-2 block text-sm font-bold">Status</label>

                <select
                  name="status"
                  value={turnaroundForm.status}
                  onChange={handleTurnaroundInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <ModalActions
              loading={isSubmitting}
              onCancel={closeModals}
              submitLabel="Add Turnaround"
            />
          </form>
        </ModalContainer>
      )}
    </div>
  );
}

export default function GroundOpsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <GroundOpsContent />
    </Suspense>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
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
      <label className="mb-2 block text-sm font-bold">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <input
        name={name}
        value={value}
        type={type}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm font-bold uppercase text-slate-500">{label}</div>

      <div className="mt-2 text-3xl font-bold">{value}</div>

      <div className="mt-1 text-xs text-slate-400">{description}</div>
    </div>
  );
}

function RosterRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
      <span className="text-sm font-medium">{label}</span>

      <span className="font-bold text-emerald-600">{value}</span>
    </div>
  );
}

function ModalContainer({
  title,
  description,
  children,
  onClose,
  disabled,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
  disabled: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>

            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  loading,
  onCancel,
  submitLabel,
}: {
  loading: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            {submitLabel}
          </>
        )}
      </button>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
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

function getTurnaroundStatusClass(status?: string): string {
  const common = 'rounded-full px-3 py-1 text-xs font-bold';

  switch (status) {
    case 'COMPLETED':
      return `${common} bg-emerald-100 text-emerald-700`;

    case 'IN_PROGRESS':
      return `${common} bg-orange-100 text-orange-700`;

    case 'DELAYED':
      return `${common} bg-rose-100 text-rose-700`;

    case 'SCHEDULED':
      return `${common} bg-sky-100 text-sky-700`;

    default:
      return `${common} bg-slate-100 text-slate-600`;
  }
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
