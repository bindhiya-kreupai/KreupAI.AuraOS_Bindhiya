export interface Shift {
  id: string;
  scheduleId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number; // minutes
  role: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'swapped';
  createdAt: string;
  updatedAt: string;
}

export interface AssignShiftParams {
  scheduleId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  role: string;
  location?: string;
  notes?: string;
}

export interface SwapShiftParams {
  shiftId: string;
  requestedBy: string;
  targetEmployeeId: string;
  reason?: string;
}

export interface ShiftSwapRequest {
  id: string;
  originalShiftId: string;
  requestedBy: string;
  targetEmployeeId: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  resolvedAt?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  organizationId: string;
  shifts: TemplateShift[];
  recurrence: 'weekly' | 'biweekly' | 'monthly';
  createdAt: string;
}

export interface TemplateShift {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string;
  endTime: string;
  breakDuration: number;
  role: string;
  headcount: number;
}

export interface ApplyTemplateParams {
  templateId: string;
  scheduleId: string;
  startDate: string;
  endDate: string;
  employeeIds: string[];
}

export class ShiftService {
  private shifts: Map<string, Shift> = new Map();
  private swapRequests: Map<string, ShiftSwapRequest> = new Map();
  private templates: Map<string, ShiftTemplate> = new Map();

  /**
   * Assign a shift to an employee
   */
  async assignShift(params: AssignShiftParams): Promise<Shift> {
    const shift: Shift = {
      id: 'sft_' + Date.now().toString(),
      scheduleId: params.scheduleId,
      employeeId: params.employeeId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      breakDuration: params.breakDuration || 30,
      role: params.role,
      location: params.location,
      notes: params.notes,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.shifts.set(shift.id, shift);
    return shift;
  }

  /**
   * Request a shift swap between two employees
   */
  async requestSwap(params: SwapShiftParams): Promise<ShiftSwapRequest> {
    const shift = this.shifts.get(params.shiftId);
    if (!shift) {
      throw new Error('Shift not found: ' + params.shiftId);
    }

    if (shift.employeeId !== params.requestedBy) {
      throw new Error('Only the assigned employee can request a swap');
    }

    const swapRequest: ShiftSwapRequest = {
      id: 'swp_' + Date.now().toString(),
      originalShiftId: params.shiftId,
      requestedBy: params.requestedBy,
      targetEmployeeId: params.targetEmployeeId,
      reason: params.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.swapRequests.set(swapRequest.id, swapRequest);

    // Mock notification to target employee and manager
    console.log(`[Notification] Shift swap requested by ${params.requestedBy} for shift ${params.shiftId}. Target: ${params.targetEmployeeId}.`);
    
    return swapRequest;
  }

  /**
   * Approve a shift swap request
   */
  async approveSwap(swapId: string): Promise<ShiftSwapRequest> {
    const swap = this.swapRequests.get(swapId);
    if (!swap) {
      throw new Error('Swap request not found: ' + swapId);
    }

    if (swap.status !== 'pending') {
      throw new Error('Swap request is no longer pending');
    }

    // Update the original shift's employee
    const shift = this.shifts.get(swap.originalShiftId);
    if (shift) {
      shift.employeeId = swap.targetEmployeeId;
      shift.status = 'swapped';
      shift.updatedAt = new Date().toISOString();
    }

    swap.status = 'approved';
    swap.resolvedAt = new Date().toISOString();

    return swap;
  }

  /**
   * Reject a shift swap request
   */
  async rejectSwap(swapId: string): Promise<ShiftSwapRequest> {
    const swap = this.swapRequests.get(swapId);
    if (!swap) {
      throw new Error('Swap request not found: ' + swapId);
    }

    swap.status = 'rejected';
    swap.resolvedAt = new Date().toISOString();
    return swap;
  }

  /**
   * Create a shift template for recurring schedules
   */
  async createTemplate(
    name: string,
    organizationId: string,
    shifts: TemplateShift[],
    recurrence: 'weekly' | 'biweekly' | 'monthly'
  ): Promise<ShiftTemplate> {
    const template: ShiftTemplate = {
      id: 'tpl_' + Date.now().toString(),
      name,
      organizationId,
      shifts,
      recurrence,
      createdAt: new Date().toISOString(),
    };

    this.templates.set(template.id, template);
    return template;
  }

  /**
   * Apply a template to generate shifts for a schedule
   */
  async applyTemplate(params: ApplyTemplateParams): Promise<Shift[]> {
    const template = this.templates.get(params.templateId);
    if (!template) {
      throw new Error('Template not found: ' + params.templateId);
    }

    const generatedShifts: Shift[] = [];

    const start = new Date(params.startDate);
    const end = new Date(params.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      
      const dayShifts = template.shifts.filter(s => s.dayOfWeek === dayOfWeek);
      for (const tShift of dayShifts) {
        for (let i = 0; i < tShift.headcount; i++) {
          const employeeId = params.employeeIds[i % params.employeeIds.length] || 'unassigned';
          
          const newShift: Shift = {
            id: 'sft_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
            scheduleId: params.scheduleId,
            employeeId,
            date: d.toISOString().split('T')[0],
            startTime: tShift.startTime,
            endTime: tShift.endTime,
            breakDuration: tShift.breakDuration,
            role: tShift.role,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.shifts.set(newShift.id, newShift);
          generatedShifts.push(newShift);
        }
      }
    }

    return generatedShifts;
  }

  /**
   * Get shifts for an employee within a date range
   */
  async getEmployeeShifts(employeeId: string, startDate: string, endDate: string): Promise<Shift[]> {
    const result: Shift[] = [];
    for (const shift of this.shifts.values()) {
      if (
        shift.employeeId === employeeId &&
        shift.date >= startDate &&
        shift.date <= endDate
      ) {
        result.push(shift);
      }
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get all pending swap requests for an employee
   */
  async getPendingSwaps(employeeId: string): Promise<ShiftSwapRequest[]> {
    const result: ShiftSwapRequest[] = [];
    for (const swap of this.swapRequests.values()) {
      if (
        swap.status === 'pending' &&
        (swap.requestedBy === employeeId || swap.targetEmployeeId === employeeId)
      ) {
        result.push(swap);
      }
    }
    return result;
  }
}

export default new ShiftService();
