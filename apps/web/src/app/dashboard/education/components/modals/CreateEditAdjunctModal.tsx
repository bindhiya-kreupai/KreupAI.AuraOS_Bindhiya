import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';

const adjunctSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  department: z.string().min(2, 'Department is required'),
  coursesTaught: z.preprocess((val) => Number(val), z.number().min(0)),
  backgroundCheckStatus: z.enum(['Pending', 'Cleared', 'Failed']),
  active: z.boolean(),
});

type AdjunctFormValues = z.infer<typeof adjunctSchema>;

interface CreateEditAdjunctModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any | null;
  isLoading?: boolean;
}

export function CreateEditAdjunctModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CreateEditAdjunctModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjunctFormValues>({
    resolver: zodResolver(adjunctSchema),
    defaultValues: {
      active: true,
      backgroundCheckStatus: 'Pending',
      coursesTaught: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        department: initialData.department,
        coursesTaught: Number(initialData.coursesTaught || 0),
        backgroundCheckStatus: initialData.backgroundCheckStatus || 'Pending',
        active: initialData.active ?? true,
      });
    } else {
      reset({
        name: '',
        department: '',
        coursesTaught: 0,
        backgroundCheckStatus: 'Pending',
        active: true,
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: AdjunctFormValues) => {
    onSubmit({
      ...data,
      ...(initialData ? { id: initialData.id } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {initialData ? 'Edit Adjunct Faculty' : 'Add Adjunct Faculty'}
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
                placeholder="Prof. Severus Snape"
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
                placeholder="Potions"
              />
              {errors.department && (
                <p className="text-xs text-rose-500">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Courses Taught
              </label>
              <input
                type="number"
                {...register('coursesTaught')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Background Check
              </label>
              <select
                {...register('backgroundCheckStatus')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Cleared">Cleared</option>
                <option value="Failed">Failed</option>
              </select>
              {errors.backgroundCheckStatus && (
                <p className="text-xs text-rose-500">{errors.backgroundCheckStatus.message}</p>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                <input
                  type="checkbox"
                  {...register('active')}
                  className="rounded text-indigo-500 focus:ring-indigo-500"
                />
                Currently Active
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
              {isLoading ? 'Saving...' : initialData ? 'Update Adjunct' : 'Add Adjunct'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
