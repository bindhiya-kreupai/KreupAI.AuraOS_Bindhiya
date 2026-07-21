export type AccrualProjection = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  current: number;
  accrued: number;
  projected: number;
  status: 'Normal' | 'Warning';
  reason?: string;
};

export type AccrualDashboard = {
  rules: Array<{ id: string; name: string; logic: string }>;
  projections: AccrualProjection[];
  summary: { recentAccruals: number; totalDays: number; nextCycle: string };
};
