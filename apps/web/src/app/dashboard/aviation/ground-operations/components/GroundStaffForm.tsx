'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormModal, Field, inputClass } from '../../components/FormModal';
import { useCreateGroundStaff, useUpdateGroundStaff } from '../../hooks/mutations';
import type { GroundStaffMember } from '../../types';

interface GroundStaffFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: GroundStaffMember | null;
}

export const GroundStaffForm: React.FC<GroundStaffFormProps> = ({ open, onClose, initialData }) => {
  const { register, handleSubmit, reset } = useForm<Partial<GroundStaffMember>>();

  const createMutation = useCreateGroundStaff();
  const updateMutation = useUpdateGroundStaff();
  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          employeeId: '',
          role: 'ramp_agent',
          station: 'JFK',
          status: 'active',
          personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '1990-01-01',
          },
        } as any);
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      personalInfo: {
        firstName: data['personalInfo.firstName'] || data.personalInfo?.firstName || '',
        lastName: data['personalInfo.lastName'] || data.personalInfo?.lastName || '',
      },
    };

    if (initialData?.staffId) {
      updateMutation.mutate(
        { id: initialData.staffId, data: payload },
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
      title={initialData ? 'Edit Ground Staff' : 'Add Ground Staff'}
      submitting={submitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Employee ID">
          <input {...register('employeeId')} className={inputClass} placeholder="GS-001" required />
        </Field>
        <Field label="Role">
          <select {...register('role')} className={inputClass}>
            <option value="dispatcher">Dispatcher</option>
            <option value="ramp_agent">Ramp Agent</option>
            <option value="baggage_handler">Baggage Handler</option>
            <option value="aircraft_cleaner">Aircraft Cleaner</option>
            <option value="fueler">Fueler</option>
            <option value="caterer">Caterer</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name">
          <input {...register('personalInfo.firstName')} className={inputClass} required />
        </Field>
        <Field label="Last Name">
          <input {...register('personalInfo.lastName')} className={inputClass} required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Station">
          <input {...register('station')} className={inputClass} placeholder="JFK" required />
        </Field>
        <Field label="Status">
          <select {...register('status')} className={inputClass}>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </div>
    </FormModal>
  );
};
