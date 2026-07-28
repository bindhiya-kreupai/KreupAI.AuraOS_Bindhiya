'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormModal, Field, inputClass } from '../../components/FormModal';
import { useCreateCrewMember, useUpdateCrewMember } from '../../hooks/mutations';
import type { CrewMemberProfile } from '../../types';

interface CrewMemberFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: CrewMemberProfile | null;
}

export const CrewMemberForm: React.FC<CrewMemberFormProps> = ({ open, onClose, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<CrewMemberProfile>>();

  const createMutation = useCreateCrewMember();
  const updateMutation = useUpdateCrewMember();
  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          employeeId: '',
          crewType: 'flight_attendant',
          status: 'active',
          dutyStatus: 'available',
          personalInfo: {
            firstName: '',
            lastName: '',
            dateOfBirth: '1990-01-01',
            nationality: 'US',
            passportNumber: '',
            passportExpiry: '2030-01-01',
            homeBase: 'JFK',
            email: '',
            phone: '',
            emergencyContact: { name: '', relationship: '', phone: '' },
          },
        } as any);
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: any) => {
    // For nested fields like personalInfo, react-hook-form handles standard dot notation if we registered it properly.
    // However, since we're keeping this simple, we'll build the payload.
    const payload = {
      ...data,
      personalInfo: {
        firstName: data['personalInfo.firstName'] || data.personalInfo?.firstName || '',
        lastName: data['personalInfo.lastName'] || data.personalInfo?.lastName || '',
        homeBase: data['personalInfo.homeBase'] || data.personalInfo?.homeBase || '',
      },
    };

    if (initialData?.crewId) {
      updateMutation.mutate(
        { id: initialData.crewId, data: payload },
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
      title={initialData ? 'Edit Crew Member' : 'Add Crew Member'}
      submitting={submitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Field label="Employee ID">
        <input
          {...register('employeeId')}
          className={inputClass}
          placeholder="EMP-12345"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name">
          <input {...register('personalInfo.firstName')} className={inputClass} required />
        </Field>
        <Field label="Last Name">
          <input {...register('personalInfo.lastName')} className={inputClass} required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Home Base">
          <input
            {...register('personalInfo.homeBase')}
            className={inputClass}
            placeholder="e.g. JFK, LHR"
            required
          />
        </Field>
        <Field label="Role">
          <select {...register('crewType')} className={inputClass}>
            <option value="flight_attendant">Flight Attendant</option>
            <option value="senior_flight_attendant">Senior Flight Attendant</option>
            <option value="purser">Purser</option>
            <option value="cabin_director">Cabin Director</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select {...register('status')} className={inputClass}>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="medical_hold">Medical Hold</option>
            <option value="training">Training</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
        <Field label="Duty Status">
          <select {...register('dutyStatus')} className={inputClass}>
            <option value="available">Available</option>
            <option value="standby">Standby</option>
            <option value="on_duty">On Duty</option>
            <option value="in_flight">In Flight</option>
            <option value="rest">Rest</option>
          </select>
        </Field>
      </div>
    </FormModal>
  );
};
