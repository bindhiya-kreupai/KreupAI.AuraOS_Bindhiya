/**
 * GraphQL Schema Definition
 * Type-safe GraphQL schema using GraphQL.js
 */

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLID,
} from 'graphql';

// ============================================================================
// Enums
// ============================================================================

const EmployeeStatusEnum = new GraphQLEnumType({
  name: 'EmployeeStatus',
  values: {
    ACTIVE: { value: 'ACTIVE' },
    INACTIVE: { value: 'INACTIVE' },
    TERMINATED: { value: 'TERMINATED' },
    ON_LEAVE: { value: 'ON_LEAVE' },
  },
});

const EmploymentTypeEnum = new GraphQLEnumType({
  name: 'EmploymentType',
  values: {
    PERMANENT: { value: 'PERMANENT' },
    CONTRACT: { value: 'CONTRACT' },
    PROBATION: { value: 'PROBATION' },
    INTERN: { value: 'INTERN' },
  },
});

const LeaveStatusEnum = new GraphQLEnumType({
  name: 'LeaveStatus',
  values: {
    PENDING: { value: 'PENDING' },
    APPROVED: { value: 'APPROVED' },
    REJECTED: { value: 'REJECTED' },
    CANCELLED: { value: 'CANCELLED' },
  },
});

const AttendanceStatusEnum = new GraphQLEnumType({
  name: 'AttendanceStatus',
  values: {
    PRESENT: { value: 'PRESENT' },
    ABSENT: { value: 'ABSENT' },
    LATE: { value: 'LATE' },
    HALF_DAY: { value: 'HALF_DAY' },
    ON_LEAVE: { value: 'ON_LEAVE' },
  },
});

// ============================================================================
// Types
// ============================================================================

const DepartmentType = new GraphQLObjectType({
  name: 'Department',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    code: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    parentDepartmentId: { type: GraphQLID },
    managerId: { type: GraphQLID },
    manager: { type: EmployeeType },
    costCenterId: { type: GraphQLID },
    status: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const PositionType = new GraphQLObjectType({
  name: 'Position',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    code: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    departmentId: { type: GraphQLID },
    department: { type: DepartmentType },
    level: { type: GraphQLInt },
    minSalary: { type: GraphQLFloat },
    maxSalary: { type: GraphQLFloat },
    status: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    employeeCode: { type: new GraphQLNonNull(GraphQLString) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    middleName: { type: GraphQLString },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    fullName: {
      type: GraphQLString,
      resolve: (employee: any) =>
        [employee.firstName, employee.middleName, employee.lastName]
          .filter(Boolean)
          .join(' '),
    },
    email: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: GraphQLString },
    dateOfBirth: { type: GraphQLString },
    gender: { type: GraphQLString },
    maritalStatus: { type: GraphQLString },
    hireDate: { type: GraphQLString },
    departmentId: { type: GraphQLID },
    department: { type: DepartmentType },
    positionId: { type: GraphQLID },
    position: { type: PositionType },
    reportingManagerId: { type: GraphQLID },
    reportingManager: { type: EmployeeType },
    employmentType: { type: EmploymentTypeEnum },
    status: { type: EmployeeStatusEnum },
    basicSalary: { type: GraphQLFloat },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const LeaveRequestType = new GraphQLObjectType({
  name: 'LeaveRequest',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    employeeId: { type: new GraphQLNonNull(GraphQLID) },
    employee: { type: EmployeeType },
    leaveTypeId: { type: new GraphQLNonNull(GraphQLID) },
    startDate: { type: new GraphQLNonNull(GraphQLString) },
    endDate: { type: new GraphQLNonNull(GraphQLString) },
    numberOfDays: { type: new GraphQLNonNull(GraphQLFloat) },
    reason: { type: GraphQLString },
    status: { type: LeaveStatusEnum },
    approvedBy: { type: GraphQLID },
    approver: { type: EmployeeType },
    approvedAt: { type: GraphQLString },
    rejectionReason: { type: GraphQLString },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const AttendanceType = new GraphQLObjectType({
  name: 'Attendance',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    employeeId: { type: new GraphQLNonNull(GraphQLID) },
    employee: { type: EmployeeType },
    date: { type: new GraphQLNonNull(GraphQLString) },
    clockIn: { type: GraphQLString },
    clockOut: { type: GraphQLString },
    workHours: { type: GraphQLFloat },
    status: { type: AttendanceStatusEnum },
    isLate: { type: GraphQLBoolean },
    remarks: { type: GraphQLString },
  }),
});

const PayslipType = new GraphQLObjectType({
  name: 'Payslip',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    employeeId: { type: new GraphQLNonNull(GraphQLID) },
    employee: { type: EmployeeType },
    month: { type: new GraphQLNonNull(GraphQLString) },
    basicSalary: { type: new GraphQLNonNull(GraphQLFloat) },
    grossPay: { type: new GraphQLNonNull(GraphQLFloat) },
    totalDeductions: { type: new GraphQLNonNull(GraphQLFloat) },
    netPay: { type: new GraphQLNonNull(GraphQLFloat) },
    generatedAt: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const PaginationInfoType = new GraphQLObjectType({
  name: 'PaginationInfo',
  fields: {
    page: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
    total: { type: new GraphQLNonNull(GraphQLInt) },
    totalPages: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const EmployeeConnectionType = new GraphQLObjectType({
  name: 'EmployeeConnection',
  fields: {
    employees: { type: new GraphQLNonNull(new GraphQLList(EmployeeType)) },
    pageInfo: { type: new GraphQLNonNull(PaginationInfoType) },
  },
});

const LeaveRequestConnectionType = new GraphQLObjectType({
  name: 'LeaveRequestConnection',
  fields: {
    leaveRequests: { type: new GraphQLNonNull(new GraphQLList(LeaveRequestType)) },
    pageInfo: { type: new GraphQLNonNull(PaginationInfoType) },
  },
});

// ============================================================================
// Input Types
// ============================================================================

const CreateEmployeeInput = new GraphQLInputObjectType({
  name: 'CreateEmployeeInput',
  fields: {
    employeeCode: { type: new GraphQLNonNull(GraphQLString) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    middleName: { type: GraphQLString },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: GraphQLString },
    dateOfBirth: { type: GraphQLString },
    gender: { type: GraphQLString },
    hireDate: { type: GraphQLString },
    departmentId: { type: GraphQLID },
    positionId: { type: GraphQLID },
    reportingManagerId: { type: GraphQLID },
    employmentType: { type: EmploymentTypeEnum },
    basicSalary: { type: GraphQLFloat },
  },
});

const UpdateEmployeeInput = new GraphQLInputObjectType({
  name: 'UpdateEmployeeInput',
  fields: {
    firstName: { type: GraphQLString },
    middleName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    departmentId: { type: GraphQLID },
    positionId: { type: GraphQLID },
    reportingManagerId: { type: GraphQLID },
    status: { type: EmployeeStatusEnum },
    basicSalary: { type: GraphQLFloat },
  },
});

const CreateLeaveRequestInput = new GraphQLInputObjectType({
  name: 'CreateLeaveRequestInput',
  fields: {
    employeeId: { type: new GraphQLNonNull(GraphQLID) },
    leaveTypeId: { type: new GraphQLNonNull(GraphQLID) },
    startDate: { type: new GraphQLNonNull(GraphQLString) },
    endDate: { type: new GraphQLNonNull(GraphQLString) },
    reason: { type: GraphQLString },
  },
});

// ============================================================================
// Root Query
// ============================================================================

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Employee Queries
    employee: {
      type: EmployeeType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_: any, { id }: any, context: any) => {
        // TODO: Implement with actual service
        return context.services.employee.getById(id);
      },
    },
    employees: {
      type: EmployeeConnectionType,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 20 },
        status: { type: EmployeeStatusEnum },
        departmentId: { type: GraphQLID },
        search: { type: GraphQLString },
      },
      resolve: async (_: any, args: any, context: any) => {
        // TODO: Implement with actual service
        return context.services.employee.list(args);
      },
    },

    // Department Queries
    department: {
      type: DepartmentType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }: any, context) => {
        return context.services.department.getById(id);
      },
    },
    departments: {
      type: new GraphQLList(DepartmentType),
      resolve: async (_, args: any, context) => {
        return context.services.department.list();
      },
    },

    // Leave Queries
    leaveRequest: {
      type: LeaveRequestType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }: any, context) => {
        return context.services.leave.getRequestById(id);
      },
    },
    leaveRequests: {
      type: LeaveRequestConnectionType,
      args: {
        employeeId: { type: GraphQLID },
        status: { type: LeaveStatusEnum },
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 20 },
      },
      resolve: async (_, args, context) => {
        return context.services.leave.listRequests(args);
      },
    },

    // Attendance Queries
    attendance: {
      type: new GraphQLList(AttendanceType),
      args: {
        employeeId: { type: new GraphQLNonNull(GraphQLID) },
        startDate: { type: new GraphQLNonNull(GraphQLString) },
        endDate: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args, context) => {
        return context.services.attendance.getForEmployee(args);
      },
    },

    // Payslip Queries
    payslip: {
      type: PayslipType,
      args: {
        employeeId: { type: new GraphQLNonNull(GraphQLID) },
        month: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args, context) => {
        return context.services.payroll.getPayslip(args);
      },
    },
  },
});

// ============================================================================
// Root Mutation
// ============================================================================

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Employee Mutations
    createEmployee: {
      type: EmployeeType,
      args: { input: { type: new GraphQLNonNull(CreateEmployeeInput) } },
      resolve: async (_, { input }: any, context) => {
        return context.services.employee.create(input);
      },
    },
    updateEmployee: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(UpdateEmployeeInput) },
      },
      resolve: async (_, { id, input }: any, context) => {
        return context.services.employee.update(id, input);
      },
    },
    deleteEmployee: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }, context) => {
        await context.services.employee.delete(id);
        return true;
      },
    },

    // Leave Mutations
    createLeaveRequest: {
      type: LeaveRequestType,
      args: { input: { type: new GraphQLNonNull(CreateLeaveRequestInput) } },
      resolve: async (_, { input }: any, context) => {
        return context.services.leave.createRequest(input);
      },
    },
    approveLeaveRequest: {
      type: LeaveRequestType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        approverId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id, approverId }: any, context) => {
        return context.services.leave.approveRequest(id, approverId);
      },
    },
    rejectLeaveRequest: {
      type: LeaveRequestType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        approverId: { type: new GraphQLNonNull(GraphQLID) },
        reason: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id, approverId, reason }: any, context) => {
        return context.services.leave.rejectRequest(id, approverId, reason);
      },
    },

    // Attendance Mutations
    clockIn: {
      type: AttendanceType,
      args: {
        employeeId: { type: new GraphQLNonNull(GraphQLID) },
        location: { type: GraphQLString },
      },
      resolve: async (_, { employeeId, location }: any, context) => {
        return context.services.attendance.clockIn({ employeeId, location });
      },
    },
    clockOut: {
      type: AttendanceType,
      args: {
        employeeId: { type: new GraphQLNonNull(GraphQLID) },
        location: { type: GraphQLString },
      },
      resolve: async (_, { employeeId, location }: any, context) => {
        return context.services.attendance.clockOut({ employeeId, location });
      },
    },
  },
});

// ============================================================================
// Schema Export
// ============================================================================

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
