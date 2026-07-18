'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormModal, Field, inputClass } from '../../components/FormModal';
import { useCreatePilot, useUpdatePilot } from '../../hooks/mutations';
import type { PilotProfile } from '../../types';

interface PilotFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: PilotProfile | null;
}

export const PilotForm: React.FC<PilotFormProps> = ({ open, onClose, initialData }) => {
  const { register, handleSubmit, reset } = useForm<Partial<PilotProfile>>();

  const createMutation = useCreatePilot();
  const updateMutation = useUpdatePilot();
  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          employeeId: '',
          rank: 'first_officer',
          status: 'active',
          personalInfo: {
            firstName: '',
            lastName: '',
            dateOfBirth: '1980-01-01',
            nationality: 'US',
            email: '',
            phone: '',
          },
          license: {
            licenseNumber: '',
            licenseType: 'ATPL',
            issueDate: '2020-01-01',
            expiryDate: '2030-01-01',
            issuingAuthority: 'FAA',
          },
          typeRatings: [],
          flightHours: { total: 0, pic: 0, sic: 0, night: 0, ifr: 0, instructor: 0, simulator: 0 },
        } as any);
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      pilotId: data.employeeId,
      pilotType: data.pilotType || 'COMMERCIAL',
      baseAirport: data.baseAirport || 'LHR',
      licenses: data.license ? [data.license] : [],
      personalInfo: {
        ...(data.personalInfo || {}),
        firstName: data['personalInfo.firstName'] || data.personalInfo?.firstName || '',
        lastName: data['personalInfo.lastName'] || data.personalInfo?.lastName || '',
      },
      flightHours: {
        ...(data.flightHours || {}),
        total: parseInt(data['flightHours.total'] || data.flightHours?.total || '0', 10),
        pic: parseInt(data['flightHours.pic'] || data.flightHours?.pic || '0', 10),
      },
    };

    if (initialData?.pilotId) {
      updateMutation.mutate(
        { id: initialData.pilotId, data: payload },
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
      title={initialData ? 'Edit Pilot' : 'Add Pilot'}
      submitting={submitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Employee ID">
          <input
            {...register('employeeId')}
            className={inputClass}
            placeholder="PILOT-001"
            required
          />
        </Field>
        <Field label="Rank">
          <select {...register('rank')} className={inputClass}>
            <option value="captain">Captain</option>
            <option value="first_officer">First Officer</option>
            <option value="second_officer">Second Officer</option>
            <option value="cadet">Cadet</option>
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
        <Field label="Status">
          <select {...register('status')} className={inputClass}>
            <option value="active">Active</option>
            <option value="training">Training</option>
            <option value="medical_hold">Medical Hold</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
        <Field label="Total Flight Hours">
          <input type="number" {...register('flightHours.total')} className={inputClass} />
        </Field>
      </div>
    </FormModal>
  );
};
