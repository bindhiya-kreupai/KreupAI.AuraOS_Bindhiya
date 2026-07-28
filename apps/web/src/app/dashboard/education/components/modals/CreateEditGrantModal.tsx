import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Calendar } from 'lucide-react';

const grantSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  principalInvestigatorId: z.string().min(1, 'PI ID is required'),
  fundingAgency: z.string().min(2, 'Funding agency is required'),
  amount: z.preprocess((val) => Number(val), z.number().min(0)),
  awardedAmount: z.preprocess((val) => (val ? Number(val) : 0), z.number().optional()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['Draft', 'Submitted', 'Awarded', 'Closed']),
});

type GrantFormValues = z.infer<typeof grantSchema>;

interface CreateEditGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any | null;
  isLoading?: boolean;
}

export function CreateEditGrantModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CreateEditGrantModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema),
    defaultValues: {
      status: 'Draft',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        principalInvestigatorId: initialData.principalInvestigatorId,
        fundingAgency: initialData.fundingAgency,
        amount: Number(initialData.amount || 0),
        awardedAmount: Number(initialData.awardedAmount || 0),
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        status: initialData.status,
      });
    } else {
      reset({
        title: '',
        principalInvestigatorId: '',
        fundingAgency: '',
        amount: 0,
        awardedAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Draft',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: GrantFormValues) => {
    onSubmit({
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      ...(initialData ? { id: initialData.id } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {initialData ? 'Edit Grant' : 'Add Research Grant'}
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
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Grant Title
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="Quantum Computing Initiative"
              />
              {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Principal Investigator ID
              </label>
              <input
                {...register('principalInvestigatorId')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="PI-12345"
              />
              {errors.principalInvestigatorId && (
                <p className="text-xs text-rose-500">{errors.principalInvestigatorId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Funding Agency
              </label>
              <input
                {...register('fundingAgency')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="NSF"
              />
              {errors.fundingAgency && (
                <p className="text-xs text-rose-500">{errors.fundingAgency.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Requested Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amount')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Awarded Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('awardedAmount')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Awarded">Awarded</option>
                <option value="Closed">Closed</option>
              </select>
              {errors.status && <p className="text-xs text-rose-500">{errors.status.message}</p>}
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
              {isLoading ? 'Saving...' : initialData ? 'Update Grant' : 'Add Grant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
