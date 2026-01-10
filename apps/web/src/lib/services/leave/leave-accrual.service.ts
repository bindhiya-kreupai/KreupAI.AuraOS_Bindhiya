/**
 * Leave Accrual Service
 * Phase 2: Core Enhancement - Advanced Leave System
 *
 * Handles automatic leave accrual, encashment, and carry forward processing
 */

import type {
  LeavePolicy,
  LeavePolicyEntitlement,
  LeaveTypeCode,
  AccrualRunInput,
  AccrualResult,
  AccrualRun,
  AccrualError,
  EncashmentRequest,
  EncashmentCalculation,
  CarryForwardRun,
  CarryForwardResult,
  CarryForwardError} from './types';
import {
  LeaveBalance,
  LeaveType
} from './types';
import type { SupportedCountryCode } from '../compliance/types';
import { LabourLawService } from '../compliance/labour-law.service';

// ============================================================================
// LEAVE ACCRUAL SERVICE
// ============================================================================

export class LeaveAccrualService {
  /**
   * Process monthly accrual for all employees
   */
  static async processMonthlyAccrual(input: AccrualRunInput): Promise<AccrualRun> {
    const { tenantId, processDate, employeeIds, leaveTypeIds } = input;

    // Get all active employees
    const employees = await this.getActiveEmployees(tenantId, employeeIds);

    // Get leave policies
    const policies = await this.getLeavePolicies(tenantId, leaveTypeIds);

    const results: AccrualResult[] = [];
    const errors: AccrualError[] = [];

    // Process each employee
    for (const employee of employees) {
      // Get applicable policies for employee's country
      const applicablePolicies = policies.filter(
        p => p.countryCode === employee.countryCode && p.accrualType === 'MONTHLY'
      );

      for (const policy of applicablePolicies) {
        try {
          const result = await this.calculateEmployeeAccrual(employee, policy, processDate);
          results.push(result);

          // Update balance
          await this.updateLeaveBalance(employee.id, policy.leaveTypeCode, result, processDate);
        } catch (error) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.name,
            leaveTypeCode: policy.leaveTypeCode,
            errorCode: 'ACCRUAL_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Create accrual run record
    const accrualRun: AccrualRun = {
      id: this.generateId(),
      tenantId,
      processDate,
      totalEmployees: employees.length,
      totalAccrued: results.reduce((sum, r) => sum + r.accrued, 0),
      byLeaveType: this.summarizeByLeaveType(results),
      status: errors.length === 0 ? 'COMPLETED' : errors.length < results.length ? 'PARTIAL' : 'FAILED',
      errors,
      createdAt: new Date(),
      completedAt: new Date(),
    };

    return accrualRun;
  }

  /**
   * Calculate accrual for a single employee and policy
   */
  static async calculateEmployeeAccrual(
    employee: EmployeeData,
    policy: LeavePolicy,
    processDate: Date
  ): Promise<AccrualResult> {
    const notes: string[] = [];

    // Calculate years of service
    const yearsOfService = this.calculateYearsOfService(employee.joiningDate, processDate);

    // Get applicable entitlement tier
    const entitlement = this.getApplicableEntitlement(policy.entitlements, yearsOfService);

    if (!entitlement) {
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        leaveTypeCode: policy.leaveTypeCode,
        previousBalance: 0,
        accrued: 0,
        newBalance: 0,
        daysWorked: 0,
        proRataFactor: 0,
        notes: ['No applicable entitlement found for years of service'],
      };
    }

    // Check probation
    if (employee.isOnProbation && !policy.accrualDuringProbation) {
      notes.push('Accrual skipped - Employee on probation');
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        leaveTypeCode: policy.leaveTypeCode,
        previousBalance: 0,
        accrued: 0,
        newBalance: 0,
        daysWorked: 0,
        proRataFactor: 0,
        notes,
      };
    }

    // Get current balance
    const currentBalance = await this.getCurrentBalance(
      employee.id,
      policy.leaveTypeCode,
      processDate.getFullYear()
    );

    // Calculate monthly accrual
    let monthlyAccrual = entitlement.daysPerMonth;

    // Pro-rata for mid-month joiners
    let proRataFactor = 1;
    const joiningMonthEnd = new Date(employee.joiningDate);
    joiningMonthEnd.setMonth(joiningMonthEnd.getMonth() + 1, 0);

    if (
      employee.joiningDate.getMonth() === processDate.getMonth() &&
      employee.joiningDate.getFullYear() === processDate.getFullYear() &&
      policy.proRataOnJoining
    ) {
      const daysInMonth = joiningMonthEnd.getDate();
      const daysWorked = daysInMonth - employee.joiningDate.getDate() + 1;
      proRataFactor = daysWorked / daysInMonth;
      monthlyAccrual = monthlyAccrual * proRataFactor;
      notes.push(`Pro-rata applied for joining month: ${proRataFactor.toFixed(2)}`);
    }

    // Apply LOP deduction if any
    if (employee.lopDays && employee.lopDays > 0) {
      const lopFactor = 1 - employee.lopDays / 30;
      monthlyAccrual = monthlyAccrual * Math.max(0, lopFactor);
      notes.push(`LOP deduction applied: ${employee.lopDays} days`);
    }

    // Round based on policy
    monthlyAccrual = this.roundAccrual(monthlyAccrual, policy.accrualRoundingType);

    const newBalance = currentBalance + monthlyAccrual;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      leaveTypeCode: policy.leaveTypeCode,
      previousBalance: currentBalance,
      accrued: monthlyAccrual,
      newBalance,
      daysWorked: 30 - (employee.lopDays || 0),
      proRataFactor,
      notes,
    };
  }

  /**
   * Calculate leave entitlement based on country labour law
   */
  static calculateLegalEntitlement(
    countryCode: SupportedCountryCode,
    yearsOfService: number,
    leaveType: LeaveTypeCode
  ): number {
    const labourLaw = LabourLawService.getConfig(countryCode);
    const { leave } = labourLaw;

    switch (leaveType) {
      case 'ANNUAL':
        if (countryCode === 'AE' && yearsOfService < 1) {
          // UAE: 2 days per month in first year
          return Math.floor(yearsOfService * 12) * 2;
        }
        return yearsOfService >= leave.annualThresholdYears
          ? leave.annualAfterYears
          : leave.annualFirstYear;

      case 'SICK':
        return leave.sickFullPay + leave.sickHalfPay;

      case 'MATERNITY':
        return leave.maternity;

      case 'PATERNITY':
        return leave.paternity;

      case 'BEREAVEMENT':
        return Math.max(leave.bereavementSpouse, leave.bereavementFamily);

      case 'HAJJ':
        return leave.hajj || 0;

      case 'MARRIAGE':
        return leave.marriage || 0;

      case 'STUDY':
        return leave.study || 0;

      default:
        return 0;
    }
  }

  /**
   * Process year-end carry forward
   */
  static async processCarryForward(
    tenantId: string,
    fromYear: number,
    toYear: number
  ): Promise<CarryForwardRun> {
    const employees = await this.getActiveEmployees(tenantId);
    const policies = await this.getLeavePolicies(tenantId);

    const results: CarryForwardResult[] = [];
    const errors: CarryForwardError[] = [];

    for (const employee of employees) {
      const applicablePolicies = policies.filter(
        p => p.countryCode === employee.countryCode && p.carryForward.isAllowed
      );

      for (const policy of applicablePolicies) {
        try {
          const result = await this.processEmployeeCarryForward(
            employee,
            policy,
            fromYear,
            toYear
          );
          results.push(result);
        } catch (error) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.name,
            leaveTypeCode: policy.leaveTypeCode,
            errorCode: 'CARRY_FORWARD_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Summarize by leave type
    const byLeaveType = this.summarizeCarryForward(results);

    const carryForwardRun: CarryForwardRun = {
      id: this.generateId(),
      tenantId,
      fromYear,
      toYear,
      processDate: new Date(),
      totalEmployees: employees.length,
      totalCarried: results.reduce((sum, r) => sum + r.carryForwardApplied, 0),
      totalLapsed: results.reduce((sum, r) => sum + r.lapsed, 0),
      byLeaveType,
      status: errors.length === 0 ? 'COMPLETED' : 'PARTIAL',
      errors,
      createdAt: new Date(),
    };

    return carryForwardRun;
  }

  /**
   * Process carry forward for a single employee
   */
  private static async processEmployeeCarryForward(
    employee: EmployeeData,
    policy: LeavePolicy,
    fromYear: number,
    toYear: number
  ): Promise<CarryForwardResult> {
    // Get end of year balance
    const yearEndBalance = await this.getYearEndBalance(
      employee.id,
      policy.leaveTypeCode,
      fromYear
    );

    // Calculate carry forward
    const carryForwardEligible = Math.min(yearEndBalance, policy.carryForward.maxDays);
    const lapsed = yearEndBalance - carryForwardEligible;

    // Calculate expiry date
    const expiryDate = new Date(toYear, policy.carryForward.expiryMonths, 1);

    // Create new year balance with carry forward
    await this.createNewYearBalance(employee.id, policy.leaveTypeCode, toYear, {
      carriedForward: carryForwardEligible,
      expiryDate,
    });

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      leaveTypeCode: policy.leaveTypeCode,
      previousYearBalance: yearEndBalance,
      carryForwardEligible,
      carryForwardApplied: carryForwardEligible,
      lapsed,
      expiryDate,
    };
  }

  /**
   * Calculate encashment eligibility and amount
   */
  static async calculateEncashment(
    employeeId: string,
    leaveTypeCode: LeaveTypeCode,
    requestedDays: number,
    trigger: EncashmentRequest['trigger']
  ): Promise<EncashmentCalculation> {
    // Get employee data
    const employee = await this.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get policy
    const policy = await this.getPolicyForEmployee(employee, leaveTypeCode);
    if (!policy || !policy.encashment.isAllowed) {
      throw new Error('Encashment not allowed for this leave type');
    }

    // Validate trigger
    if (!policy.encashment.triggers.includes(trigger)) {
      throw new Error(`Encashment not allowed for trigger: ${trigger}`);
    }

    // Get current balance
    const currentBalance = await this.getCurrentBalance(
      employeeId,
      leaveTypeCode,
      new Date().getFullYear()
    );

    // Calculate eligible days
    const minRetention = policy.encashment.minBalanceToRetain;
    const maxEncashable = Math.min(
      currentBalance - minRetention,
      policy.encashment.maxDays
    );
    const eligibleDays = Math.max(0, Math.min(requestedDays, maxEncashable));

    // Calculate daily rate
    const basisAmount = policy.encashment.basis === 'BASIC'
      ? employee.basicSalary
      : employee.grossSalary;
    const dailyRate = (basisAmount / 30) * (policy.encashment.encashmentRate / 100);

    // Calculate total amount
    const totalAmount = eligibleDays * dailyRate;

    return {
      employeeId,
      leaveTypeCode,
      currentBalance,
      minRetention,
      maxEncashable,
      eligibleDays,
      dailyRate: Math.round(dailyRate * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      basis: policy.encashment.basis,
      basisAmount,
    };
  }

  /**
   * Process encashment request
   */
  static async processEncashment(
    request: EncashmentRequest
  ): Promise<EncashmentRequest> {
    // Validate and calculate
    const calculation = await this.calculateEncashment(
      request.employeeId,
      request.leaveTypeCode,
      request.requestedDays,
      request.trigger
    );

    // Update leave balance
    await this.deductLeaveBalance(
      request.employeeId,
      request.leaveTypeCode,
      calculation.eligibleDays,
      'ENCASHMENT'
    );

    // Update request
    const processedRequest: EncashmentRequest = {
      ...request,
      eligibleDays: calculation.eligibleDays,
      approvedDays: calculation.eligibleDays,
      dailyRate: calculation.dailyRate,
      totalAmount: calculation.totalAmount,
      calculationBasis: calculation.basis,
      status: 'PROCESSED',
      processedAt: new Date(),
    };

    return processedRequest;
  }

  /**
   * Get leave balance forecast
   */
  static async getBalanceForecast(
    employeeId: string,
    leaveTypeCode: LeaveTypeCode,
    months: number = 12
  ): Promise<BalanceForecast[]> {
    const employee = await this.getEmployee(employeeId);
    if (!employee) throw new Error('Employee not found');

    const policy = await this.getPolicyForEmployee(employee, leaveTypeCode);
    if (!policy) throw new Error('No applicable policy found');

    const yearsOfService = this.calculateYearsOfService(
      employee.joiningDate,
      new Date()
    );
    const entitlement = this.getApplicableEntitlement(policy.entitlements, yearsOfService);
    if (!entitlement) throw new Error('No entitlement found');

    const currentBalance = await this.getCurrentBalance(
      employeeId,
      leaveTypeCode,
      new Date().getFullYear()
    );

    const forecasts: BalanceForecast[] = [];
    let runningBalance = currentBalance;
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      runningBalance += entitlement.daysPerMonth;

      forecasts.push({
        month: forecastDate.toISOString().substring(0, 7),
        accrual: entitlement.daysPerMonth,
        projectedUsage: 0, // Would be based on historical patterns
        projectedBalance: runningBalance,
      });
    }

    return forecasts;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static calculateYearsOfService(joiningDate: Date, asOfDate: Date): number {
    const diffTime = asOfDate.getTime() - joiningDate.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, diffYears);
  }

  private static getApplicableEntitlement(
    entitlements: LeavePolicyEntitlement[],
    yearsOfService: number
  ): LeavePolicyEntitlement | null {
    const sorted = entitlements.sort((a, b) => a.fromYears - b.fromYears);

    for (const entitlement of sorted) {
      if (yearsOfService >= entitlement.fromYears && yearsOfService < entitlement.toYears) {
        return entitlement;
      }
    }

    // Return highest tier if exceeded
    return sorted[sorted.length - 1] || null;
  }

  private static roundAccrual(
    value: number,
    roundingType: 'UP' | 'DOWN' | 'NEAREST'
  ): number {
    const precision = 0.5; // Round to nearest 0.5

    switch (roundingType) {
      case 'UP':
        return Math.ceil(value / precision) * precision;
      case 'DOWN':
        return Math.floor(value / precision) * precision;
      case 'NEAREST':
      default:
        return Math.round(value / precision) * precision;
    }
  }

  private static summarizeByLeaveType(results: AccrualResult[]): AccrualRun['byLeaveType'] {
    const map = new Map<string, { total: number; count: number }>();

    results.forEach(r => {
      const existing = map.get(r.leaveTypeCode) || { total: 0, count: 0 };
      map.set(r.leaveTypeCode, {
        total: existing.total + r.accrued,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries()).map(([leaveType, data]) => ({
      leaveType,
      totalAccrued: data.total,
      employeeCount: data.count,
    }));
  }

  private static summarizeCarryForward(
    results: CarryForwardResult[]
  ): CarryForwardRun['byLeaveType'] {
    const map = new Map<LeaveTypeCode, { carried: number; lapsed: number; count: number }>();

    results.forEach(r => {
      const existing = map.get(r.leaveTypeCode) || { carried: 0, lapsed: 0, count: 0 };
      map.set(r.leaveTypeCode, {
        carried: existing.carried + r.carryForwardApplied,
        lapsed: existing.lapsed + r.lapsed,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries()).map(([code, data]) => ({
      leaveTypeCode: code,
      leaveTypeName: code,
      employeeCount: data.count,
      totalCarried: data.carried,
      totalLapsed: data.lapsed,
      averageCarried: data.count > 0 ? data.carried / data.count : 0,
    }));
  }

  private static generateId(): string {
    return `acr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // ============================================================================
  // DATABASE OPERATIONS (Stubs - to be connected to actual database)
  // ============================================================================

  private static async getActiveEmployees(
    tenantId: string,
    employeeIds?: string[]
  ): Promise<EmployeeData[]> {
    // Would fetch from database
    return [];
  }

  private static async getLeavePolicies(
    tenantId: string,
    leaveTypeIds?: string[]
  ): Promise<LeavePolicy[]> {
    // Would fetch from database
    return [];
  }

  private static async getCurrentBalance(
    employeeId: string,
    leaveTypeCode: LeaveTypeCode,
    year: number
  ): Promise<number> {
    // Would fetch from database
    return 0;
  }

  private static async getYearEndBalance(
    employeeId: string,
    leaveTypeCode: LeaveTypeCode,
    year: number
  ): Promise<number> {
    // Would fetch from database
    return 0;
  }

  private static async updateLeaveBalance(
    employeeId: string,
    leaveTypeCode: LeaveTypeCode,
    result: AccrualResult,
    processDate: Date
  ): Promise<void> {
    // Would update database
  }

  private static async createNewYearBalance(
    employeeId: string,
    leaveTypeCode: LeaveTypeCode,
    year: number,
    carryForward: { carriedForward: number; expiryDate: Date }
  ): Promise<void> {
    // Would create in database
  }

  private static async deductLeaveBalance(
    employeeId: string,
    leaveTypeCode: LeaveTypeCode,
    days: number,
    reason: string
  ): Promise<void> {
    // Would update database
  }

  private static async getEmployee(employeeId: string): Promise<EmployeeData | null> {
    // Would fetch from database
    return null;
  }

  private static async getPolicyForEmployee(
    employee: EmployeeData,
    leaveTypeCode: LeaveTypeCode
  ): Promise<LeavePolicy | null> {
    // Would fetch from database
    return null;
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

interface EmployeeData {
  id: string;
  name: string;
  countryCode: SupportedCountryCode;
  joiningDate: Date;
  isOnProbation: boolean;
  lopDays?: number;
  basicSalary: number;
  grossSalary: number;
}

interface BalanceForecast {
  month: string;
  accrual: number;
  projectedUsage: number;
  projectedBalance: number;
}

export default LeaveAccrualService;
