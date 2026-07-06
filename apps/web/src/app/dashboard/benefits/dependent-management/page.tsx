'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Baby,
  UserPlus,
  FileText,
  MoreVertical,
  Loader2,
  Pencil,
  BadgeCheck,
  Trash2,
  X,
} from 'lucide-react';
import { DependentService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

const RELATIONSHIP_OPTIONS = [
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'DOMESTIC_PARTNER', label: 'Domestic Partner' },
  { value: 'CHILD', label: 'Child' },
  { value: 'STEPCHILD', label: 'Stepchild' },
  { value: 'ADOPTED_CHILD', label: 'Adopted Child' },
  { value: 'FOSTER_CHILD', label: 'Foster Child' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'OTHER', label: 'Other' },
];

interface DependentFormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  gender: string;
  email: string;
  phone: string;
  isStudent: boolean;
  isDisabled: boolean;
  notes: string;
}

const EMPTY_FORM: DependentFormState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  relationship: 'CHILD',
  gender: '',
  email: '',
  phone: '',
  isStudent: false,
  isDisabled: false,
  notes: '',
};

export default function DependentManagementPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const { toasts, removeToast, success, error: errorToast } = useToast();

  const [dependents, setDependents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingDep, setEditingDep] = useState<any | null>(null);
  const [form, setForm] = useState<DependentFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Row dropdown menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Confirm remove
  const [confirmRemoveDep, setConfirmRemoveDep] = useState<any | null>(null);
  const [removing, setRemoving] = useState(false);

  // Upload docs modal
  const [docsDep, setDocsDep] = useState<any | null>(null);
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchDependents = useCallback(async (employeeId?: string) => {
    try {
      setLoading(true);
      const response = await DependentService.getDependents(
        employeeId ? { employeeId } : undefined
      );
      const data = response?.data ?? [];
      setDependents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching dependents:', err);
      setDependents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    void fetchDependents(user.employeeId);
  }, [authLoading, user, fetchDependents]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const getDisplayName = (dep: any) => {
    if (dep.name) return dep.name;
    return [dep.firstName, dep.lastName].filter(Boolean).join(' ') || 'Unknown';
  };

  const getRelation = (dep: any) => dep.relation || dep.relationship || 'Unknown';
  const getDob = (dep: any) => {
    const d = dep.dob || dep.dateOfBirth;
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString();
  };
  const getStatus = (dep: any) => dep.status || 'pending_verification';
  const getCoverage = (dep: any) => {
    if (Array.isArray(dep.coverage)) return dep.coverage;
    if (Array.isArray(dep.enrolledPlans)) return dep.enrolledPlans;
    return [];
  };
  const isDepVerified = (dep: any) => {
    const status = getStatus(dep);
    return (
      status === 'Verified' || status === 'verified' || status === 'VERIFIED' || status === 'ACTIVE'
    );
  };

  const openCreateModal = () => {
    setEditingDep(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditModal = (dep: any) => {
    setOpenMenuId(null);
    setEditingDep(dep);
    const dob = dep.dateOfBirth || dep.dob;
    setForm({
      firstName: dep.firstName || '',
      lastName: dep.lastName || '',
      dateOfBirth: dob ? new Date(dob).toISOString().slice(0, 10) : '',
      relationship: (dep.relationship || 'CHILD') as string,
      gender: dep.gender || '',
      email: dep.email || '',
      phone: dep.phone || '',
      isStudent: Boolean(dep.isStudent),
      isDisabled: Boolean(dep.isDisabled),
      notes: dep.notes || '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingDep(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dateOfBirth ||
      !form.relationship
    ) {
      errorToast('First name, last name, date of birth and relationship are required.');
      return;
    }

    const payload: Record<string, unknown> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      dateOfBirth: new Date(form.dateOfBirth).toISOString(),
      relationship: form.relationship,
      isStudent: form.isStudent,
      isDisabled: form.isDisabled,
    };
    if (form.gender) payload.gender = form.gender;
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();

    setSaving(true);
    try {
      if (editingDep) {
        const response = await DependentService.updateDependent(editingDep.id, payload);
        if (response?.success) {
          success('Dependent updated successfully.');
          closeForm();
          if (user) void fetchDependents(user.employeeId);
        } else {
          errorToast('Failed to update dependent.');
        }
      } else {
        if (!user) {
          errorToast('You must be signed in to add a dependent.');
          return;
        }
        const response = await DependentService.createDependent({
          ...payload,
          employeeId: user.employeeId,
        } as any);
        if (response?.success) {
          success('Dependent added successfully.');
          closeForm();
          void fetchDependents(user.employeeId);
        } else {
          errorToast('Failed to add dependent.');
        }
      }
    } catch (err) {
      console.error('Error saving dependent:', err);
      errorToast('An error occurred while saving the dependent.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (dep: any) => {
    setOpenMenuId(null);
    if (!user) {
      errorToast('You must be signed in to verify a dependent.');
      return;
    }
    try {
      const response = await DependentService.verifyDependent(dep.id, user.employeeId);
      if (response?.success) {
        success('Dependent verified successfully.');
        void fetchDependents(user.employeeId);
      } else {
        errorToast('Failed to verify dependent.');
      }
    } catch (err) {
      console.error('Error verifying dependent:', err);
      errorToast('An error occurred while verifying the dependent.');
    }
  };

  const handleConfirmRemove = async () => {
    if (!confirmRemoveDep || removing) return;
    setRemoving(true);
    try {
      const response = await DependentService.deleteDependent(confirmRemoveDep.id);
      if (response?.success) {
        success(response.message || 'Dependent removed successfully.');
        setConfirmRemoveDep(null);
        if (user) void fetchDependents(user.employeeId);
      } else {
        errorToast('Failed to remove dependent.');
      }
    } catch (err) {
      console.error('Error removing dependent:', err);
      errorToast('An error occurred while removing the dependent.');
    } finally {
      setRemoving(false);
    }
  };

  const openDocsModal = (dep: any) => {
    setDocsDep(dep);
    setDocName('');
    setDocUrl('');
  };

  const handleSubmitDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docsDep || uploadingDoc) return;
    if (!docUrl.trim()) {
      errorToast('A document reference or URL is required.');
      return;
    }
    const existing = Array.isArray(docsDep.verificationDocuments)
      ? docsDep.verificationDocuments
      : [];
    const newDoc = {
      name: docName.trim() || 'Verification document',
      url: docUrl.trim(),
      uploadedAt: new Date().toISOString(),
    };
    setUploadingDoc(true);
    try {
      const response = await DependentService.updateDependent(docsDep.id, {
        verificationDocuments: [...existing, newDoc],
        status: 'PENDING_VERIFICATION',
      } as any);
      if (response?.success) {
        success('Verification document reference recorded.');
        setDocsDep(null);
        if (user) void fetchDependents(user.employeeId);
      } else {
        errorToast('Failed to record verification document.');
      }
    } catch (err) {
      console.error('Error recording document:', err);
      errorToast('An error occurred while recording the document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="w-6 h-6 text-indigo-500" />
            Dependent Management
          </h1>
          <p className="text-slate-500 text-sm">
            Add and verify family members for insurance coverage.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          disabled={authLoading || !user}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" /> Add Dependent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pb-20">
        {loading || authLoading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : dependents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <Baby className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">
              No Dependents Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Add family members to enroll them in your benefit plans.
            </p>
          </div>
        ) : (
          dependents.map((dep, i) => {
            const name = getDisplayName(dep);
            const status = getStatus(dep);
            const isVerified = isDepVerified(dep);
            const coverage = getCoverage(dep);
            const depId = dep.id || `dep-${i}`;

            return (
              <div
                key={dep.id || i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative"
              >
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === depId ? null : depId)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Dependent actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === depId && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => openEditModal(dep)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={() => handleVerify(dep)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <BadgeCheck className="w-4 h-4" /> Verify
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          setConfirmRemoveDep(dep);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">{getRelation(dep)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-sm text-slate-500">{getDob(dep)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-sm font-bold text-slate-500">Status</span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded uppercase ${isVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
                    >
                      {status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {coverage.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-2">
                        Covered Under
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {coverage.map((c: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!isVerified && (
                  <button
                    type="button"
                    onClick={() => openDocsModal(dep)}
                    className="w-full mt-6 py-2 border border-dashed border-slate-300 text-slate-500 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Upload Verification Docs
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">
                {editingDep ? 'Edit Dependent' : 'Add Dependent'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Relationship *
                  </label>
                  <select
                    value={form.relationship}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="">Not specified</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isStudent}
                    onChange={(e) => setForm({ ...form, isStudent: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  Student
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isDisabled}
                    onChange={(e) => setForm({ ...form, isDisabled: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  Disabled
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingDep ? 'Save Changes' : 'Add Dependent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Verification Docs Modal */}
      {docsDep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">Upload Verification Docs</h2>
              <button
                type="button"
                onClick={() => setDocsDep(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitDocs} className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Record a document reference or URL for{' '}
                <span className="font-bold">{getDisplayName(docsDep)}</span>. This does not upload
                the file itself.
              </p>
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Birth certificate"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Document Reference / URL *
                </label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://... or reference ID"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDocsDep(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingDoc && <Loader2 className="w-4 h-4 animate-spin" />}
                  Record Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Remove Modal */}
      {confirmRemoveDep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-2">Remove Dependent</h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to remove{' '}
              <span className="font-bold">{getDisplayName(confirmRemoveDep)}</span>? This action can
              be reversed by re-adding the dependent.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmRemoveDep(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={removing}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removing && <Loader2 className="w-4 h-4 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
