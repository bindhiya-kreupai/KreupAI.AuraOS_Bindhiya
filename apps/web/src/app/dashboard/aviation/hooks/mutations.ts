import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CabinCrewService, PilotTrainingService, GroundOperationsService } from '../services';

// --- Cabin Crew Mutations ---
export const useCreateCrewMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: CabinCrewService.createCrewMember.bind(CabinCrewService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cabin-crew'] }),
  });
};

export const useUpdateCrewMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CabinCrewService.updateCrewMember(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cabin-crew'] }),
  });
};

export const useDeleteCrewMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: CabinCrewService.deleteCrewMember.bind(CabinCrewService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cabin-crew'] }),
  });
};

export const useCreateFlightAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: CabinCrewService.createFlightAssignment.bind(CabinCrewService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flight-assignments'] }),
  });
};

export const useUpdateFlightAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CabinCrewService.updateFlightAssignment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flight-assignments'] }),
  });
};

export const useDeleteFlightAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: CabinCrewService.deleteFlightAssignment.bind(CabinCrewService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flight-assignments'] }),
  });
};

// --- Pilot Training Mutations ---
export const useCreatePilot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: PilotTrainingService.createPilot.bind(PilotTrainingService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pilots'] }),
  });
};

export const useUpdatePilot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      PilotTrainingService.updatePilot(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pilots'] }),
  });
};

export const useDeletePilot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: PilotTrainingService.deletePilot.bind(PilotTrainingService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pilots'] }),
  });
};

// --- Ground Operations Mutations ---
export const useCreateTurnaround = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: GroundOperationsService.createTurnaround.bind(GroundOperationsService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turnarounds'] }),
  });
};

export const useUpdateTurnaround = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      GroundOperationsService.updateTurnaround(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turnarounds'] }),
  });
};

export const useDeleteTurnaround = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: GroundOperationsService.deleteTurnaround.bind(GroundOperationsService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turnarounds'] }),
  });
};

export const useCreateGroundStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: GroundOperationsService.createGroundStaff.bind(GroundOperationsService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ground-staff'] }),
  });
};

export const useUpdateGroundStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      GroundOperationsService.updateGroundStaff(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ground-staff'] }),
  });
};

export const useDeleteGroundStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: GroundOperationsService.deleteGroundStaff.bind(GroundOperationsService),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ground-staff'] }),
  });
};
