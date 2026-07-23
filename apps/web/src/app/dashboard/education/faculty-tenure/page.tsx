'use client';

import React, { useState } from 'react';
import { GraduationCap, FileCheck, Clock, UserCheck, Edit, Trash2, Plus } from 'lucide-react';
import { useFaculty, useCreateFaculty, useUpdateFaculty, useDeleteFaculty } from '../hooks/queries';
import { CreateEditFacultyModal } from '../components/modals/CreateEditFacultyModal';

export default function FacultyTenurePage() {
  const { data: faculty = [], isLoading } = useFaculty();
  const { mutateAsync: createFaculty, isPending: isCreating } = useCreateFaculty();
  const { mutateAsync: updateFaculty, isPending: isUpdating } = useUpdateFaculty();
  const { mutateAsync: deleteFaculty, isPending: isDeleting } = useDeleteFaculty();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null);

  const handleCreate = async (data: any) => {
    await createFaculty(data);
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: any) => {
    await updateFaculty(data);
    setIsModalOpen(false);
    setEditingFaculty(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      await deleteFaculty(id);
    }
  };

  const openEdit = (f: any) => {
    setEditingFaculty(f);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-500" />
            Faculty Tenure
          </h1>
          <p className="text-slate-500 text-sm">Track tenure track progress and reviews.</p>
        </div>
        <button
          onClick={() => {
            setEditingFaculty(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Faculty
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-y-auto">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Tenure Review Pipeline</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-4 text-center text-slate-500">Loading faculty...</div>
              ) : faculty.length === 0 ? (
                <div className="p-4 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                  No faculty members found.
                </div>
              ) : (
                faculty.map((prof: any, i: number) => {
                  // Use tenureStatus as status if available, fallback to some default
                  const status = prof.tenureStatus || 'Review In Progress';
                  return (
                    <div
                      key={prof.id || i}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          {prof.name ? prof.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <div className="font-bold">{prof.name}</div>
                          <div className="text-xs text-slate-500">
                            {prof.department} • {prof.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            status === 'Tenured'
                              ? 'bg-emerald-100 text-emerald-600'
                              : status === 'Tenure-Track'
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {status}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(prof)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prof.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4">
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-indigo-800 dark:text-indigo-200">
                    Dossier Submission
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    Oct 30 • {faculty.length} Faculty members
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-indigo-800 dark:text-indigo-200">
                    Committee Vote
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    Nov 15 • Mathematics Dept
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-indigo-800 dark:text-indigo-200">
                    Provost Review
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    Dec 01 • Final approvals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEditFacultyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFaculty(null);
        }}
        onSubmit={editingFaculty ? handleUpdate : handleCreate}
        initialData={editingFaculty}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
