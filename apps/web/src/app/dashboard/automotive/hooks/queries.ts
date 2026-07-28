import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TechnicianService,
  ShiftService,
  PartService,
  InventoryMovementService,
  SalesPersonService,
  PurchaseOrderService,
} from '../services';
import type {
  Technician,
  TechnicianShift,
  Part,
  InventoryMovement,
  SalesPerson,
  PurchaseOrder,
} from '../types';

export function useTechnicians() {
  return useQuery({
    queryKey: ['automotive', 'technicians'],
    queryFn: () => TechnicianService.getAllTechnicians(),
  });
}

export function useCreateTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Technician>) => TechnicianService.createTechnician(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'technicians'] });
    },
  });
}

export function useUpdateTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Technician> }) =>
      TechnicianService.updateTechnician(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'technicians'] });
    },
  });
}

export function useDeleteTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TechnicianService.deleteTechnician(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'technicians'] });
    },
  });
}

export function useShifts() {
  return useQuery({
    queryKey: ['automotive', 'shifts'],
    queryFn: () => ShiftService.getAllShifts(),
  });
}

export function useParts() {
  return useQuery({
    queryKey: ['automotive', 'parts'],
    queryFn: () => PartService.getAllParts(),
  });
}

export function useLowStockParts() {
  return useQuery({
    queryKey: ['automotive', 'parts', 'low-stock'],
    queryFn: () => PartService.getLowStockParts(),
  });
}

export function useInventoryMovements() {
  return useQuery({
    queryKey: ['automotive', 'inventory-movements'],
    queryFn: () => InventoryMovementService.getAllMovements(),
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Part>) => PartService.createPart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'parts'] });
    },
  });
}

export function useUpdatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Part> }) =>
      PartService.updatePart(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'parts'] });
    },
  });
}

export function useDeletePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PartService.deletePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'parts'] });
    },
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['automotive', 'purchase-orders'],
    queryFn: () => PurchaseOrderService.getAllPurchaseOrders(),
  });
}

// Additional hooks can be added here for Sales Commissions, Purchase Orders, etc.

export function useSalesPeople() {
  return useQuery({
    queryKey: ['automotive', 'sales-people'],
    queryFn: () => SalesPersonService.getAllSalesPeople(),
  });
}

export function useCreateSalesPerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SalesPerson>) => SalesPersonService.createSalesPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'sales-people'] });
    },
  });
}

// Ensure services.ts exports updateSalesPerson and deleteSalesPerson
// if we use them in hooks.
export function useUpdateSalesPerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SalesPerson> }) =>
      (SalesPersonService as any).updateSalesPerson(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'sales-people'] });
    },
  });
}

export function useDeleteSalesPerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => (SalesPersonService as any).deleteSalesPerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotive', 'sales-people'] });
    },
  });
}
