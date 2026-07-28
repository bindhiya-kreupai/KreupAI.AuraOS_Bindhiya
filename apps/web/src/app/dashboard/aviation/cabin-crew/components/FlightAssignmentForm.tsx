'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormModal, Field, inputClass } from '../../components/FormModal';
import { useCreateFlightAssignment, useUpdateFlightAssignment } from '../../hooks/mutations';
import type { FlightAssignment } from '../../types';

interface FlightAssignmentFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: FlightAssignment | null;
}

export const FlightAssignmentForm: React.FC<FlightAssignmentFormProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const { register, handleSubmit, reset } = useForm<Partial<FlightAssignment>>();

  const createMutation = useCreateFlightAssignment();
  const updateMutation = useUpdateFlightAssignment();
  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          ...initialData,
          scheduledDeparture: initialData.scheduledDeparture
            ? new Date(initialData.scheduledDeparture).toISOString().slice(0, 16)
            : '',
          scheduledArrival: initialData.scheduledArrival
            ? new Date(initialData.scheduledArrival).toISOString().slice(0, 16)
            : '',
        } as any);
      } else {
        reset({
          flightNumber: '',
          status: 'scheduled',
          aircraftType: 'B737-800',
          departure: { airportCode: '', gate: '' },
          arrival: { airportCode: '', gate: '' },
          scheduledDeparture: new Date().toISOString().slice(0, 16),
          scheduledArrival: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
          crewComplement: { totalCrew: 4, cabinDirector: 'TBD' },
        } as any);
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      departure: {
        airportCode: data['departure.airportCode'] || data.departure?.airportCode || '',
      },
      arrival: { airportCode: data['arrival.airportCode'] || data.arrival?.airportCode || '' },
      crewComplement: {
        totalCrew: parseInt(
          data['crewComplement.totalCrew'] || data.crewComplement?.totalCrew || '4'
        ),
        cabinDirector:
          data['crewComplement.cabinDirector'] || data.crewComplement?.cabinDirector || 'TBD',
      },
      scheduledDeparture: new Date(data.scheduledDeparture).toISOString(),
      scheduledArrival: new Date(data.scheduledArrival).toISOString(),
      reportTime: new Date(new Date(data.scheduledDeparture).getTime() - 90 * 60000).toISOString(),
      clearTime: new Date(new Date(data.scheduledArrival).getTime() + 30 * 60000).toISOString(),
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
      title={initialData ? 'Edit Flight Assignment' : 'Add Flight Assignment'}
      submitting={submitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Flight Number">
          <input
            {...register('flightNumber')}
            className={inputClass}
            placeholder="e.g. AA100"
            required
          />
        </Field>
        <Field label="Status">
          <select {...register('status')} className={inputClass}>
            <option value="scheduled">Scheduled</option>
            <option value="boarding">Boarding</option>
            <option value="in_flight">In Flight</option>
            <option value="arrived">Arrived</option>
            <option value="cancelled">Cancelled</option>
            <option value="delayed">Delayed</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Departure Airport">
          <input
            {...register('departure.airportCode')}
            className={inputClass}
            placeholder="JFK"
            required
          />
        </Field>
        <Field label="Arrival Airport">
          <input
            {...register('arrival.airportCode')}
            className={inputClass}
            placeholder="LHR"
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Departure Time">
          <input
            type="datetime-local"
            {...register('scheduledDeparture')}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Arrival Time">
          <input
            type="datetime-local"
            {...register('scheduledArrival')}
            className={inputClass}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Aircraft Type">
          <input
            {...register('aircraftType')}
            className={inputClass}
            placeholder="e.g. B737-800"
            required
          />
        </Field>
        <Field label="Total Crew">
          <input
            type="number"
            {...register('crewComplement.totalCrew')}
            className={inputClass}
            required
            min="1"
          />
        </Field>
      </div>
    </FormModal>
  );
};
