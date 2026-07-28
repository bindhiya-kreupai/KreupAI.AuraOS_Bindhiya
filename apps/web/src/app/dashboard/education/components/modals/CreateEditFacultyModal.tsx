import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Calendar } from 'lucide-react';

const facultySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  department: z.string().min(2, 'Department is required'),
  title: z.string().min(2, 'Title is required'),
  tenureStatus: z.enum(['Tenured', 'Tenure-Track', 'Non-Tenure-Track']),
  joinDate: z.string().min(1, 'Join date is required'),
  publications: z.preprocess((val) => Number(val), z.number().min(0)),
  isActive: z.boolean(),
  userId: z.string().optional(),
});

type FacultyFormValues = z.infer<typeof facultySchema>;

interface CreateEditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any | null;
  isLoading?: boolean;
}

export function CreateEditFacultyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CreateEditFacultyModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      tenureStatus: 'Tenure-Track',
      isActive: true,
      publications: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        department: initialData.department,
        title: initialData.title,
        tenureStatus: initialData.tenureStatus,
        joinDate: initialData.joinDate ? initialData.joinDate.split('T')[0] : '',
        publications: Number(initialData.publications || 0),
        isActive: initialData.isActive ?? true,
        userId: initialData.userId || '',
      });
    } else {
      reset({
        name: '',
        department: '',
        title: '',
        tenureStatus: 'Tenure-Track',
        joinDate: new Date().toISOString().split('T')[0],
        publications: 0,
        isActive: true,
        userId: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: FacultyFormValues) => {
    onSubmit({
      ...data,
      joinDate: new Date(data.joinDate).toISOString(),
      ...(initialData ? { id: initialData.id } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {initialData ? 'Edit Faculty Member' : 'Add Faculty Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="Dr. Jane Doe"
              />
              {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Department
              </label>
              <input
                {...register('department')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="Computer Science"
              />
              {errors.department && (
                <p className="text-xs text-rose-500">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Title
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="Associate Professor"
              />
              {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tenure Status
              </label>
              <select
                {...register('tenureStatus')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="Tenure-Track">Tenure Track</option>
                <option value="Tenured">Tenured</option>
                <option value="Non-Tenure-Track">Non-Tenure Track</option>
              </select>
              {errors.tenureStatus && (
                <p className="text-xs text-rose-500">{errors.tenureStatus.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Join Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('joinDate')}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.joinDate && (
                <p className="text-xs text-rose-500">{errors.joinDate.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Publications (Count)
              </label>
              <input
                type="number"
                {...register('publications')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mt-6">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="rounded text-indigo-500 focus:ring-indigo-500"
                />
                Is Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update Faculty' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
