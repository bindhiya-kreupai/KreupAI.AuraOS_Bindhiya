'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CabinCrewService, PilotTrainingService, GroundOperationsService } from '../services';

// --- Cabin Crew ---
export const useCabinCrew = () => {
  return useQuery({
    queryKey: ['cabin-crew'],
    queryFn: () => CabinCrewService.getAllCrewMembers(),
  });
};

export const useFlightAssignments = () => {
  return useQuery({
    queryKey: ['flight-assignments'],
    queryFn: () => CabinCrewService.getAllFlightAssignments(),
  });
};

export const useDutyTimes = () => {
  return useQuery({
    queryKey: ['duty-times'],
    queryFn: () => CabinCrewService.getAllDutyTimes(),
  });
};

export const useRestPeriods = () => {
  return useQuery({
    queryKey: ['rest-periods'],
    queryFn: () => CabinCrewService.getAllRestPeriods(),
  });
};

// --- Pilot Training ---
export const usePilots = () => {
  return useQuery({
    queryKey: ['pilots'],
    queryFn: () => PilotTrainingService.getAllPilots(),
  });
};

export const useTrainingRecords = () => {
  return useQuery({
    queryKey: ['training-records'],
    queryFn: () => PilotTrainingService.getAllTrainingRecords(),
  });
};

export const useSimulatorSessions = () => {
  return useQuery({
    queryKey: ['simulator-sessions'],
    queryFn: () => PilotTrainingService.getAllSimulatorSessions(),
  });
};

export const useProficiencyChecks = () => {
  return useQuery({
    queryKey: ['proficiency-checks'],
    queryFn: () => PilotTrainingService.getAllProficiencyChecks(),
  });
};

// --- Ground Operations ---
export const useGroundStaff = () => {
  return useQuery({
    queryKey: ['ground-staff'],
    queryFn: () => GroundOperationsService.getAllGroundStaff(),
  });
};

export const useTurnarounds = () => {
  return useQuery({
    queryKey: ['turnarounds'],
    queryFn: () => GroundOperationsService.getAllTurnarounds(),
  });
};

export const useGroundEquipment = () => {
  return useQuery({
    queryKey: ['ground-equipment'],
    queryFn: () => GroundOperationsService.getAllEquipment(),
  });
};

export const useRampProcedures = () => {
  return useQuery({
    queryKey: ['ramp-procedures'],
    queryFn: () => GroundOperationsService.getAllProcedures(),
  });
};

export const useSafetyCompliance = () => {
  return useQuery({
    queryKey: ['safety-compliance'],
    queryFn: () => GroundOperationsService.getAllSafetyCompliance(),
  });
};
