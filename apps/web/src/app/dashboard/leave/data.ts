/**
 * Sample Leave Management Data
 * Comprehensive sample data for testing and development
 */

import type {
    LeaveType,
    LeavePolicy,
    LeaveBalance,
    LeaveRequest,
    Holiday,
    CompOff,
    LeaveEncashment,
    CarryForward,
    LeaveSettings,
} from './types';

// ============================================================================
// LEAVE TYPES
// ============================================================================

export const generateSampleLeaveTypes = (): LeaveType[] => [
    {
        id: 'lt_annual',
        code: 'AL',
        name: 'Annual Leave',
        description: 'Paid annual leave for vacation and personal time',
        color: '#3b82f6', // Blue
        annualQuota: 20,
        accrualMethod: 'monthly',
        accrualFrequency: 'monthly',
        maxAccrual: 40,
        minDaysNotice: 7,
        maxConsecutiveDays: 15,
        requiresApproval: true,
        approvalLevels: 2,
        isPaid: true,
        isCarryForwardAllowed: true,
        maxCarryForwardDays: 10,
        isEncashable: true,
        encashmentRules: {
            minBalanceRequired: 10,
            maxEncashableDays: 15,
            encashmentRate: 100,
        },
        availableFor: ['permanent', 'contract'],
        isActive: true,
        effectiveFrom: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'lt_sick',
        code: 'SL',
        name: 'Sick Leave',
        description: 'Paid leave for illness and medical appointments',
        color: '#ef4444', // Red
        annualQuota: 10,
        accrualMethod: 'monthly',
        accrualFrequency: 'monthly',
        maxAccrual: 20,
        minDaysNotice: 0, // Can be taken immediately
        maxConsecutiveDays: 7,
        requiresApproval: true,
        approvalLevels: 1,
        isPaid: true,
        isCarryForwardAllowed: true,
        maxCarryForwardDays: 5,
        isEncashable: false,
        availableFor: ['permanent', 'contract'],
        isActive: true,
        effectiveFrom: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'lt_casual',
        code: 'CL',
        name: 'Casual Leave',
        description: 'Short-term leave for personal emergencies',
        color: '#10b981', // Green
        annualQuota: 5,
        accrualMethod: 'annual',
        accrualFrequency: 'annual',
        maxAccrual: 5,
        minDaysNotice: 1,
        maxConsecutiveDays: 3,
        requiresApproval: true,
        approvalLevels: 1,
        isPaid: true,
        isCarryForwardAllowed: false,
        maxCarryForwardDays: 0,
        isEncashable: false,
        availableFor: ['all'],
        isActive: true,
        effectiveFrom: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'lt_maternity',
        code: 'ML',
        name: 'Maternity Leave',
        description: 'Paid leave for maternity',
        color: '#ec4899', // Pink
        annualQuota: 180, // 6 months
        accrualMethod: 'one_time',
        accrualFrequency: 'one_time',
        maxAccrual: 180,
        minDaysNotice: 30,
        maxConsecutiveDays: 180,
        requiresApproval: true,
        approvalLevels: 2,
        isPaid: true,
        isCarryForwardAllowed: false,
        maxCarryForwardDays: 0,
        isEncashable: false,
        availableFor: ['permanent'],
        genderSpecific: 'female',
        isActive: true,
        effectiveFrom: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'lt_paternity',
        code: 'PL',
        name: 'Paternity Leave',
        description: 'Paid leave for new fathers',
        color: '#8b5cf6', // Purple
        annualQuota: 10,
        accrualMethod: 'one_time',
        accrualFrequency: 'one_time',
        maxAccrual: 10,
        minDaysNotice: 7,
        maxConsecutiveDays: 10,
        requiresApproval: true,
        approvalLevels: 2,
        isPaid: true,
        isCarryForwardAllowed: false,
        maxCarryForwardDays: 0,
        isEncashable: false,
        availableFor: ['permanent'],
        genderSpecific: 'male',
        isActive: true,
        effectiveFrom: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

// ============================================================================
// LEAVE POLICIES
// ============================================================================

export const generateSamplePolicies = (): LeavePolicy[] => [
    {
        id: 'lp_standard',
        name: 'Standard Leave Policy',
        description: 'Default leave policy for all employees',
        applicableTo: ['all'],
        leaveTypes: ['lt_annual', 'lt_sick', 'lt_casual', 'lt_maternity', 'lt_paternity'],
        blackoutDates: ['2024-12-25', '2024-12-31'], // Christmas, New Year
        minGapBetweenLeaves: 7,
        weekendCounting: 'exclude',
        holidayCounting: 'exclude',
        managerApprovalRequired: true,
        hrApprovalRequired: false,
        escalationAfterDays: 3,
        carryForwardDeadline: '03-31', // March 31
        encashmentDeadline: '03-15', // March 15
        isActive: true,
        effectiveFrom: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

// ============================================================================
// LEAVE BALANCES
// ============================================================================

export const generateSampleBalances = (): LeaveBalance[] => [
    // Employee 1 - John Doe
    {
        id: 'lb_emp001_al',
        employeeId: 'emp001',
        employeeName: 'John Doe',
        leaveTypeId: 'lt_annual',
        leaveTypeName: 'Annual Leave',
        financialYear: '2024-25',
        openingBalance: 5,
        accrued: 16.67,
        availed: 8,
        pending: 2,
        lapsed: 0,
        carriedForward: 5,
        encashed: 0,
        availableBalance: 11.67,
        lastAccrualDate: '2024-12-01T00:00:00Z',
        nextAccrualDate: '2025-01-01T00:00:00Z',
        accrualPerMonth: 1.67,
        updatedAt: '2024-12-13T00:00:00Z',
    },
    {
        id: 'lb_emp001_sl',
        employeeId: 'emp001',
        employeeName: 'John Doe',
        leaveTypeId: 'lt_sick',
        leaveTypeName: 'Sick Leave',
        financialYear: '2024-25',
        openingBalance: 2,
        accrued: 8.33,
        availed: 5,
        pending: 0,
        lapsed: 0,
        carriedForward: 2,
        encashed: 0,
        availableBalance: 5.33,
        lastAccrualDate: '2024-12-01T00:00:00Z',
        nextAccrualDate: '2025-01-01T00:00:00Z',
        accrualPerMonth: 0.83,
        updatedAt: '2024-12-13T00:00:00Z',
    },
    {
        id: 'lb_emp001_cl',
        employeeId: 'emp001',
        employeeName: 'John Doe',
        leaveTypeId: 'lt_casual',
        leaveTypeName: 'Casual Leave',
        financialYear: '2024-25',
        openingBalance: 0,
        accrued: 5,
        availed: 3,
        pending: 0,
        lapsed: 0,
        carriedForward: 0,
        encashed: 0,
        availableBalance: 2,
        updatedAt: '2024-12-13T00:00:00Z',
    },

    // Employee 2 - Jane Smith
    {
        id: 'lb_emp002_al',
        employeeId: 'emp002',
        employeeName: 'Jane Smith',
        leaveTypeId: 'lt_annual',
        leaveTypeName: 'Annual Leave',
        financialYear: '2024-25',
        openingBalance: 8,
        accrued: 16.67,
        availed: 12,
        pending: 0,
        lapsed: 0,
        carriedForward: 8,
        encashed: 0,
        availableBalance: 12.67,
        lastAccrualDate: '2024-12-01T00:00:00Z',
        nextAccrualDate: '2025-01-01T00:00:00Z',
        accrualPerMonth: 1.67,
        updatedAt: '2024-12-13T00:00:00Z',
    },
    {
        id: 'lb_emp002_sl',
        employeeId: 'emp002',
        employeeName: 'Jane Smith',
        leaveTypeId: 'lt_sick',
        leaveTypeName: 'Sick Leave',
        financialYear: '2024-25',
        openingBalance: 3,
        accrued: 8.33,
        availed: 2,
        pending: 0,
        lapsed: 0,
        carriedForward: 3,
        encashed: 0,
        availableBalance: 9.33,
        lastAccrualDate: '2024-12-01T00:00:00Z',
        nextAccrualDate: '2025-01-01T00:00:00Z',
        accrualPerMonth: 0.83,
        updatedAt: '2024-12-13T00:00:00Z',
    },
    {
        id: 'lb_emp002_cl',
        employeeId: 'emp002',
        employeeName: 'Jane Smith',
        leaveTypeId: 'lt_casual',
        leaveTypeName: 'Casual Leave',
        financialYear: '2024-25',
        openingBalance: 0,
        accrued: 5,
        availed: 1,
        pending: 0,
        lapsed: 0,
        carriedForward: 0,
        encashed: 0,
        availableBalance: 4,
        updatedAt: '2024-12-13T00:00:00Z',
    },
];

// ============================================================================
// LEAVE REQUESTS
// ============================================================================

export const generateSampleRequests = (): LeaveRequest[] => [
    {
        id: 'lr_001',
        requestNumber: 'LR-2024-001',
        employeeId: 'emp001',
        employeeName: 'John Doe',
        department: 'Engineering',
        designation: 'Senior Developer',
        reportingManager: 'Jane Smith',
        leaveTypeId: 'lt_annual',
        leaveTypeName: 'Annual Leave',
        fromDate: '2024-12-20',
        toDate: '2024-12-24',
        totalDays: 5,
        halfDay: false,
        reason: 'Family vacation during Christmas holidays',
        contactDuringLeave: '+1-555-0101',
        attachments: [],
        status: 'pending_manager_approval',
        submittedAt: '2024-12-10T10:00:00Z',
        approvals: [
            {
                id: 'app1',
                approverRole: 'manager',
                status: 'pending',
                level: 1,
            },
        ],
        currentApprover: 'manager@company.com',
        isEmergencyLeave: false,
        isLossOfPay: false,
        createdAt: '2024-12-10T10:00:00Z',
        updatedAt: '2024-12-10T10:00:00Z',
    },
    {
        id: 'lr_002',
        requestNumber: 'LR-2024-002',
        employeeId: 'emp002',
        employeeName: 'Jane Smith',
        department: 'Marketing',
        designation: 'Marketing Manager',
        reportingManager: 'Mike Johnson',
        leaveTypeId: 'lt_sick',
        leaveTypeName: 'Sick Leave',
        fromDate: '2024-10-30',
        toDate: '2024-10-30',
        totalDays: 1,
        halfDay: false,
        reason: 'Flu and fever, doctor advised rest',
        attachments: [
            {
                id: 'att1',
                fileName: 'medical_certificate.pdf',
                fileUrl: 'https://storage.example.com/leave/medical_certificate.pdf',
                fileSize: 125000,
                uploadedAt: '2024-10-30T09:00:00Z',
            },
        ],
        status: 'approved',
        submittedAt: '2024-10-29T18:00:00Z',
        approvals: [
            {
                id: 'app2',
                approverRole: 'manager',
                approverId: 'mgr001',
                approverName: 'Mike Johnson',
                status: 'approved',
                comments: 'Approved. Get well soon!',
                actionDate: '2024-10-29T19:00:00Z',
                level: 1,
            },
        ],
        isEmergencyLeave: true,
        isLossOfPay: false,
        createdAt: '2024-10-29T18:00:00Z',
        updatedAt: '2024-10-29T19:00:00Z',
    },
    {
        id: 'lr_003',
        requestNumber: 'LR-2024-003',
        employeeId: 'emp003',
        employeeName: 'Mike Ross',
        department: 'Sales',
        designation: 'Sales Executive',
        reportingManager: 'David Lee',
        leaveTypeId: 'lt_casual',
        leaveTypeName: 'Casual Leave',
        fromDate: '2024-11-15',
        toDate: '2024-11-15',
        totalDays: 1,
        halfDay: false,
        reason: 'Personal work',
        attachments: [],
        status: 'approved',
        submittedAt: '2024-11-10T10:00:00Z',
        approvals: [
            {
                id: 'app3',
                approverRole: 'manager',
                approverId: 'mgr002',
                approverName: 'David Lee',
                status: 'approved',
                comments: 'Approved',
                actionDate: '2024-11-10T14:00:00Z',
                level: 1,
            },
        ],
        isEmergencyLeave: false,
        isLossOfPay: false,
        createdAt: '2024-11-10T10:00:00Z',
        updatedAt: '2024-11-10T14:00:00Z',
    },
];

// ============================================================================
// HOLIDAYS
// ============================================================================

export const generateSampleHolidays = (): Holiday[] => [
    {
        id: 'hol_001',
        name: 'New Year Day',
        date: '2025-01-01',
        type: 'public_holiday',
        description: 'New Year celebration',
        applicableLocations: ['All'],
        isOptional: false,
        isRestricted: false,
        isRecurring: true,
        recurrencePattern: 'annually',
        year: 2025,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'hol_002',
        name: 'Independence Day',
        date: '2025-07-04',
        type: 'national_day',
        description: 'National Independence Day',
        applicableLocations: ['All'],
        isOptional: false,
        isRestricted: false,
        isRecurring: true,
        recurrencePattern: 'annually',
        year: 2025,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'hol_003',
        name: 'Christmas Day',
        date: '2024-12-25',
        type: 'festival',
        description: 'Christmas celebration',
        applicableLocations: ['All'],
        isOptional: false,
        isRestricted: false,
        isRecurring: true,
        recurrencePattern: 'annually',
        year: 2024,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'hol_004',
        name: 'Thanksgiving',
        date: '2024-11-28',
        type: 'festival',
        description: 'Thanksgiving Day',
        applicableLocations: ['USA'],
        isOptional: false,
        isRestricted: false,
        isRecurring: true,
        recurrencePattern: 'annually',
        year: 2024,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

// ============================================================================
// COMP-OFFS
// ============================================================================

export const generateSampleCompOffs = (): CompOff[] => [
    {
        id: 'co_001',
        compOffNumber: 'CO-2024-001',
        employeeId: 'emp001',
        employeeName: 'John Doe',
        workedDate: '2024-11-16',
        workedReason: 'Critical production deployment',
        hoursWorked: 8,
        compOffDays: 1,
        earnedDate: '2024-11-16',
        expiryDate: '2025-02-16', // 90 days validity
        isExpired: false,
        status: 'approved',
        approvedBy: 'mgr001',
        approvedDate: '2024-11-17T00:00:00Z',
        isAvailed: false,
        createdAt: '2024-11-17T09:00:00Z',
        updatedAt: '2024-11-17T10:00:00Z',
    },
];

// ============================================================================
// ENCASHMENTS
// ============================================================================

export const generateSampleEncashments = (): LeaveEncashment[] => [
    {
        id: 'le_001',
        encashmentNumber: 'LE-2024-001',
        employeeId: 'emp002',
        employeeName: 'Jane Smith',
        leaveTypeId: 'lt_annual',
        leaveTypeName: 'Annual Leave',
        daysToEncash: 10,
        ratePerDay: 350, // Daily salary rate
        totalAmount: 3500,
        financialYear: '2023-24',
        paymentMonth: '2024-03',
        status: 'paid',
        requestedDate: '2024-02-15T00:00:00Z',
        approvedBy: 'hr@company.com',
        approvedDate: '2024-02-20T00:00:00Z',
        paidDate: '2024-03-31T00:00:00Z',
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-03-31T00:00:00Z',
    },
];

// ============================================================================
// CARRY FORWARDS
// ============================================================================

export const generateSampleCarryForwards = (): CarryForward[] => [
    {
        id: 'cf_001',
        employeeId: 'emp001',
        employeeName: 'John Doe',
        leaveTypeId: 'lt_annual',
        leaveTypeName: 'Annual Leave',
        fromYear: '2023-24',
        toYear: '2024-25',
        eligibleBalance: 12,
        maxAllowedCarryForward: 10,
        actualCarryForward: 10,
        lapsedBalance: 2,
        processedDate: '2024-03-31T00:00:00Z',
        processedBy: 'hr@company.com',
        expiryDate: '2024-12-31T00:00:00Z',
        status: 'processed',
        createdAt: '2024-03-31T00:00:00Z',
        updatedAt: '2024-03-31T00:00:00Z',
    },
    {
        id: 'cf_002',
        employeeId: 'emp002',
        employeeName: 'Jane Smith',
        leaveTypeId: 'lt_annual',
        leaveTypeName: 'Annual Leave',
        fromYear: '2023-24',
        toYear: '2024-25',
        eligibleBalance: 8,
        maxAllowedCarryForward: 10,
        actualCarryForward: 8,
        lapsedBalance: 0,
        processedDate: '2024-03-31T00:00:00Z',
        processedBy: 'hr@company.com',
        expiryDate: '2024-12-31T00:00:00Z',
        status: 'processed',
        createdAt: '2024-03-31T00:00:00Z',
        updatedAt: '2024-03-31T00:00:00Z',
    },
];

// ============================================================================
// LEAVE SETTINGS
// ============================================================================

export const generateSampleSettings = (): LeaveSettings => ({
    organizationId: 'org_001',
    financialYearStart: '04-01', // April 1st
    defaultAccrualMethod: 'monthly',
    proRataCalculation: true,
    weekendCounting: 'exclude',
    holidayCounting: 'exclude',
    autoApprovalThreshold: 0, // No auto-approval
    escalationEnabled: true,
    escalationAfterDays: 3,
    carryForwardEnabled: true,
    carryForwardDeadline: '03-31', // March 31
    defaultMaxCarryForwardDays: 10,
    encashmentEnabled: true,
    encashmentDeadline: '03-15', // March 15
    encashmentProcessingMonth: '03', // March
    notifyManagerOnRequest: true,
    notifyEmployeeOnApproval: true,
    notifyBeforeExpiry: true,
    expiryNotificationDaysBefore: 30,
    negativeLeavesAllowed: false,
    maxNegativeLeaveDays: 0,
    updatedAt: '2024-01-01T00:00:00Z',
    updatedBy: 'admin@company.com',
});
