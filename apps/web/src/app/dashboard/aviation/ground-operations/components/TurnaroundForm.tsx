'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormModal, Field, inputClass } from '../../components/FormModal';
import { useCreateTurnaround, useUpdateTurnaround } from '../../hooks/mutations';
import type { TurnaroundAssignment } from '../../types';

interface TurnaroundFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: TurnaroundAssignment | null;
}

export const TurnaroundForm: React.FC<TurnaroundFormProps> = ({ open, onClose, initialData }) => {
  const { register, handleSubmit, reset } = useForm<Partial<TurnaroundAssignment>>();

  const createMutation = useCreateTurnaround();
  const updateMutation = useUpdateTurnaround();
  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          ...initialData,
          scheduledArrival: initialData.scheduledArrival
            ? new Date(initialData.scheduledArrival).toISOString().slice(0, 16)
            : '',
          scheduledDeparture: initialData.scheduledDeparture
            ? new Date(initialData.scheduledDeparture).toISOString().slice(0, 16)
            : '',
        } as any);
      } else {
        reset({
          flightNumber: '',
          aircraftRegistration: '',
          aircraftType: 'B737',
          gate: '',
          status: 'pending',
          turnaroundTime: 45,
          scheduledArrival: new Date().toISOString().slice(0, 16),
          scheduledDeparture: new Date(Date.now() + 45 * 60000).toISOString().slice(0, 16),
        } as any);
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      turnaroundTime: parseInt(data.turnaroundTime, 10) || 45,
      scheduledArrival: new Date(data.scheduledArrival).toISOString(),
      scheduledDeparture: new Date(data.scheduledDeparture).toISOString(),
    };

    if (initialData?.assignmentId) {
      updateMutation.mutate(
        { id: initialData.assignmentId, data: payload },
        {
          onSuccess: () => {
            onClose();
            reset();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Turnaround' : 'New Turnaround'}
      submitting={submitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Flight Number">
          <input
            {...register('flightNumber')}
            className={inputClass}
            placeholder="AA100"
            required
          />
        </Field>
        <Field label="Gate">
          <input {...register('gate')} className={inputClass} placeholder="A12" required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Aircraft Type">
          <input {...register('aircraftType')} className={inputClass} placeholder="B737" required />
        </Field>
        <Field label="Registration">
          <input
            {...register('aircraftRegistration')}
            className={inputClass}
            placeholder="N123AA"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Arrival Time">
          <input
            type="datetime-local"
            {...register('scheduledArrival')}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Departure Time">
          <input
            type="datetime-local"
            {...register('scheduledDeparture')}
            className={inputClass}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Target Time (mins)">
          <input
            type="number"
            {...register('turnaroundTime')}
            className={inputClass}
            min="15"
            required
          />
        </Field>
        <Field label="Status">
          <select {...register('status')} className={inputClass}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </select>
        </Field>
      </div>
    </FormModal>
  );
};
