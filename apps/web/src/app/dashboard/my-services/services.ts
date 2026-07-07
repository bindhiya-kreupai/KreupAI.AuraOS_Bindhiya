class APIClient {
  private baseURL: string;
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  async get<T = any>(path: string): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }
  async post<T = any>(path: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }
  async put<T = any>(path: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }
}

const api = new APIClient('/api');

export class PersonalInfoService {
  static async getProfile() {
    return api.get('/my-services/profile');
  }
  static async updateProfile(data: any) {
    return api.put('/my-services/profile', data);
  }
  static async getEmployee(employeeId: string) {
    return api.get(`/v1/employees/${employeeId}`);
  }
}

export class LeaveApplicationService {
  static async getBalances(employeeId: string) {
    return api.get(`/v1/leave/balance/${employeeId}`);
  }
  static async getRequests(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/v1/leave/apply${query}`);
  }
  static async applyLeave(data: any) {
    return api.post('/v1/leave/apply', data);
  }
}

export class PayslipService {
  static async getPayslips(employeeId: string) {
    return api.get(`/v1/payslips/${employeeId}`);
  }
  static async getPayslipDetail(id: string) {
    return api.get(`/v1/payslips/detail/${id}`);
  }
  static async getPayrollHistory() {
    return api.get('/v1/payroll/history');
  }
}

export class TaxService {
  static async getTaxDocuments(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/v1/documents${query}`);
  }
  static async getDeclarations(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/v1/tax-declarations${query}`);
  }
  static async submitDeclaration(data: any) {
    return api.post('/v1/tax-declarations', data);
  }
}

export class BenefitsEnrollmentService {
  static async getEnrollments(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/benefits/enrollments${query}`);
  }
  static async getPlans() {
    return api.get('/benefits/plans');
  }
  static async enroll(data: any) {
    return api.post('/benefits/enrollments', data);
  }
  static async updateEnrollment(data: any) {
    return api.put('/benefits/enrollments', data);
  }
}

export class AttendanceViewService {
  static async getRecords(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/v1/attendance/report${query}`);
  }
  static async getAnomalies() {
    return api.get('/v1/attendance/anomalies');
  }
  static async clockIn(data: any) {
    return api.post('/v1/attendance/clock-in', data);
  }
  static async clockOut(data: any) {
    return api.post('/v1/attendance/clock-out', data);
  }
}

export class DocumentService {
  static async getDocuments(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/v1/documents${query}`);
  }
  static async uploadDocument(data: any) {
    return api.post('/v1/documents', data);
  }
}

export class LifeEventService {
  static async getEvents(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/v1/life-events${query}`);
  }
  static async reportEvent(data: any) {
    return api.post('/v1/life-events', data);
  }
}

export class DependentService {
  static async getDependents(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/benefits/dependents${query}`);
  }
  static async addDependent(data: any) {
    return api.post('/benefits/dependents', data);
  }
  static async updateDependent(data: any) {
    return api.put('/benefits/dependents', data);
  }
}

export class RequestCenterService {
  static async getRequests(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/my-services/requests${query}`);
  }
  static async createRequest(data: any) {
    return api.post('/my-services/requests', data);
  }
}

export class CareerInterestService {
  static async getInterests() {
    return api.get('/my-services/profile?section=career');
  }
  static async updateInterests(data: any) {
    return api.put('/my-services/profile', { careerInterests: data });
  }
  static async getOpenRoles(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/v1/positions${query}`);
  }
}

export class GrievanceService {
  static async getGrievances(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/my-services/grievances${query}`);
  }
  static async submitGrievance(data: any) {
    return api.post('/my-services/grievances', data);
  }
}
