/**
 * UAE MOHRE (Ministry of Human Resources & Emiratisation) Integration Service
 *
 * Closes EPIC-02-S04 by providing a first-class adapter for the MOHRE
 * authority that the immigration-compliance and emiratisation-compliance
 * domains both consume. Mirrors the shape of the existing Qiwa/Mudad/SIO
 * adapters under `apps/web/src/lib/services/compliance/`.
 *
 * Surface:
 *  - OAuth2 client-credentials authentication against api.mohre.gov.ae
 *  - Establishment / labour-contract / work-permit lifecycle calls
 *  - Status polling + cancellation
 *  - Payload validation against UAE Federal Decree-Law No. 33/2021
 *  - Bilingual error-code mapping with retry / backoff classification
 *
 * Persistence + alert ladder (60/30/7 day) live in `immigration-compliance`
 * service so this adapter only handles the wire protocol.
 */

export interface MohreConfiguration {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  establishmentNumber: string; // MOHRE establishment registration
  unifiedNumber: string;
  apiBaseUrl: string; // https://api.mohre.gov.ae/v1
  callbackUrl: string;
  environment: 'SANDBOX' | 'UAT' | 'PRODUCTION';
  lastTokenRefresh?: Date;
  tokenExpiresAt?: Date;
}

export interface MohreAuthToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string;
  issuedAt: Date;
  expiresAt: Date;
}

export type MohreContractType = 'LIMITED' | 'UNLIMITED' | 'PART_TIME' | 'TEMPORARY' | 'FLEXI_WORK';

export type MohrePermitType =
  | 'STANDARD'
  | 'MISSION'
  | 'PART_TIME'
  | 'TEMPORARY'
  | 'STUDENT'
  | 'TRAINING'
  | 'JUVENILE';

export type MohreSubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_EMPLOYEE'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'ERROR';

export interface MohreEmployee {
  emiratesId?: string; // 15 digits with hyphens
  passportNumber: string;
  passportCountry: string; // ISO
  fullNameEn: string;
  fullNameAr: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE';
  nationality: string; // ISO
  occupationCode: string; // ISCO/MOHRE occupation
  educationLevel: string;
}

export interface MohreLabourContract {
  contractNumber?: string;
  contractType: MohreContractType;
  startDate: string;
  endDate?: string;
  probationDays: number; // Max 180 (Decree-Law 33/2021 Art. 9)
  weeklyWorkHours: number; // Max 48; Ramadan adjusted by working-hours engine
  basicSalary: number; // AED
  allowances: number;
  totalSalary: number;
  paymentFrequency: 'MONTHLY' | 'WEEKLY' | 'DAILY';
  workLocation: { emirate: string; city: string; isRemote: boolean };
  benefits: {
    annualLeaveDays: number; // Min 30 days
    sickLeaveDays: number;
    airTicketsPerYear?: number;
    endOfServiceBenefit: boolean;
    medicalInsurance: boolean;
  };
}

export interface MohreWorkPermitPayload {
  employee: MohreEmployee;
  contract: MohreLabourContract;
  permitType: MohrePermitType;
  isEmirati: boolean; // gating for Emiratisation share
}

export interface MohreSubmission {
  submissionId: string;
  tenantId: string;
  employeeId: string;
  permitNumber?: string;
  status: MohreSubmissionStatus;
  submittedAt: Date;
  lastPolledAt?: Date;
  mohreReferenceNumber?: string;
  retryCount: number;
  lastError?: string;
}

export interface MohreApiResponse {
  responseId: string;
  timestamp: Date;
  statusCode: number;
  status: MohreSubmissionStatus;
  mohreReferenceNumber?: string;
  permitNumber?: string;
  expiryDate?: string;
  message: string;
  messageAr: string;
  validationErrors?: Array<{ field: string; error: string; errorAr: string }>;
}

const MOHRE_ENDPOINTS = {
  AUTH: '/oauth2/token',
  ESTABLISHMENT: '/establishments/:unifiedNumber',
  CONTRACTS: '/labour-contracts',
  CONTRACT_STATUS: '/labour-contracts/:reference/status',
  PERMITS: '/work-permits',
  PERMIT_STATUS: '/work-permits/:reference/status',
  PERMIT_CANCEL: '/work-permits/:reference/cancel',
} as const;

const MOHRE_ERROR_CODES: Record<
  string,
  { message: string; messageAr: string; retryable: boolean }
> = {
  'MH-001': {
    message: 'Invalid authentication credentials',
    messageAr: 'بيانات اعتماد المصادقة غير صالحة',
    retryable: false,
  },
  'MH-002': { message: 'Token expired', messageAr: 'انتهت صلاحية الرمز', retryable: true },
  'MH-003': {
    message: 'Establishment not active',
    messageAr: 'المنشأة غير نشطة',
    retryable: false,
  },
  'MH-004': {
    message: 'Quota limit exceeded for nationality',
    messageAr: 'تم تجاوز الحصة للجنسية',
    retryable: false,
  },
  'MH-005': {
    message: 'Emiratisation ratio below required threshold',
    messageAr: 'نسبة التوطين أقل من الحد المطلوب',
    retryable: false,
  },
  'MH-006': { message: 'Rate limit exceeded', messageAr: 'تم تجاوز حد المعدل', retryable: true },
  'MH-007': {
    message: 'Service temporarily unavailable',
    messageAr: 'الخدمة غير متاحة مؤقتاً',
    retryable: true,
  },
  'MH-008': {
    message: 'Duplicate permit application',
    messageAr: 'طلب تصريح مكرر',
    retryable: false,
  },
  'MH-009': {
    message: 'Probation period exceeds 180 days',
    messageAr: 'فترة التجربة تتجاوز 180 يوماً',
    retryable: false,
  },
  'MH-010': {
    message: 'Annual leave below 30-day minimum',
    messageAr: 'الإجازة السنوية أقل من 30 يوماً',
    retryable: false,
  },
};

export class MohreService {
  private config: MohreConfiguration;
  private currentToken: MohreAuthToken | null = null;

  constructor(config: MohreConfiguration) {
    this.config = config;
  }

  async authenticate(): Promise<MohreAuthToken> {
    const endpoint = `${this.config.apiBaseUrl}${MOHRE_ENDPOINTS.AUTH}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope:
          'contracts:write contracts:read permits:write permits:read establishments:read emiratisation:read',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new MohreAuthError(
        `MOHRE authentication failed: ${response.status}`,
        error.error_code || 'MH-001',
        response.status
      );
    }

    const data = await response.json();
    const now = new Date();
    this.currentToken = {
      accessToken: data.access_token,
      tokenType: 'Bearer',
      expiresIn: data.expires_in,
      scope: data.scope,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + data.expires_in * 1000),
    };
    return this.currentToken;
  }

  private async getValidToken(): Promise<string> {
    if (!this.currentToken || new Date() >= this.currentToken.expiresAt) {
      await this.authenticate();
    }
    return this.currentToken!.accessToken;
  }

  async submitWorkPermit(
    tenantId: string,
    employeeId: string,
    payload: MohreWorkPermitPayload
  ): Promise<MohreSubmission> {
    const validationErrors = this.validatePermitPayload(payload);
    if (validationErrors.length > 0) {
      throw new MohreValidationError('MOHRE permit validation failed', validationErrors);
    }

    const token = await this.getValidToken();
    const endpoint = `${this.config.apiBaseUrl}${MOHRE_ENDPOINTS.PERMITS}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Establishment-Number': this.config.establishmentNumber,
        'X-Unified-Number': this.config.unifiedNumber,
        'Accept-Language': 'en,ar',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));
    const status: MohreSubmissionStatus = response.ok ? 'SUBMITTED' : 'REJECTED';
    return {
      submissionId: `MOHRE-SUB-${tenantId}-${Date.now()}`,
      tenantId,
      employeeId,
      permitNumber: responseData.permit_number,
      status,
      submittedAt: new Date(),
      mohreReferenceNumber: responseData.reference_number,
      retryCount: 0,
      lastError: response.ok ? undefined : responseData.error_code || `HTTP_${response.status}`,
    };
  }

  async pollPermitStatus(referenceNumber: string): Promise<MohreApiResponse> {
    const token = await this.getValidToken();
    const endpoint = `${this.config.apiBaseUrl}${MOHRE_ENDPOINTS.PERMIT_STATUS.replace(':reference', referenceNumber)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-Establishment-Number': this.config.establishmentNumber,
      },
    });
    const data = await response.json().catch(() => ({}));
    return {
      responseId: `MOHRE-POLL-${Date.now()}`,
      timestamp: new Date(),
      statusCode: response.status,
      status: this.mapStatus(data.status),
      mohreReferenceNumber: referenceNumber,
      permitNumber: data.permit_number,
      expiryDate: data.expiry_date,
      message: data.message || (response.ok ? 'Status fetched' : 'Status fetch failed'),
      messageAr: data.message_ar || (response.ok ? 'تم جلب الحالة' : 'فشل جلب الحالة'),
    };
  }

  async cancelPermit(referenceNumber: string, reason: string): Promise<MohreApiResponse> {
    const token = await this.getValidToken();
    const endpoint = `${this.config.apiBaseUrl}${MOHRE_ENDPOINTS.PERMIT_CANCEL.replace(':reference', referenceNumber)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Establishment-Number': this.config.establishmentNumber,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await response.json().catch(() => ({}));
    return {
      responseId: `MOHRE-CANCEL-${Date.now()}`,
      timestamp: new Date(),
      statusCode: response.status,
      status: response.ok ? 'CANCELLED' : 'ERROR',
      mohreReferenceNumber: referenceNumber,
      message: data.message || (response.ok ? 'Permit cancelled' : 'Cancellation failed'),
      messageAr: data.message_ar || (response.ok ? 'تم إلغاء التصريح' : 'فشل الإلغاء'),
    };
  }

  validatePermitPayload(
    payload: MohreWorkPermitPayload
  ): Array<{ field: string; error: string; errorAr: string }> {
    const errors: Array<{ field: string; error: string; errorAr: string }> = [];
    const { employee, contract } = payload;

    if (employee.emiratesId && !/^\d{3}-\d{4}-\d{7}-\d$/.test(employee.emiratesId)) {
      errors.push({
        field: 'employee.emiratesId',
        error: 'Invalid Emirates ID format (xxx-xxxx-xxxxxxx-x)',
        errorAr: 'تنسيق رقم الهوية الإماراتية غير صالح',
      });
    }
    if (contract.probationDays > 180) {
      errors.push({
        field: 'contract.probationDays',
        error: 'Probation period cannot exceed 180 days (Decree-Law 33/2021 Art. 9)',
        errorAr: 'فترة التجربة لا يمكن أن تتجاوز 180 يوماً',
      });
    }
    if (contract.weeklyWorkHours > 48) {
      errors.push({
        field: 'contract.weeklyWorkHours',
        error: 'Weekly work hours cannot exceed 48 (Art. 17)',
        errorAr: 'ساعات العمل الأسبوعية لا يمكن أن تتجاوز 48',
      });
    }
    if (contract.benefits.annualLeaveDays < 30) {
      errors.push({
        field: 'contract.benefits.annualLeaveDays',
        error: 'Annual leave cannot be less than 30 days (Art. 29)',
        errorAr: 'الإجازة السنوية لا يمكن أن تقل عن 30 يوماً',
      });
    }
    if (contract.totalSalary <= 0) {
      errors.push({
        field: 'contract.totalSalary',
        error: 'Total salary must be positive',
        errorAr: 'إجمالي الراتب يجب أن يكون إيجابياً',
      });
    }
    if (contract.contractType === 'LIMITED' && !contract.endDate) {
      errors.push({
        field: 'contract.endDate',
        error: 'End date required for limited-term contracts',
        errorAr: 'تاريخ الانتهاء مطلوب للعقود محددة المدة',
      });
    }
    return errors;
  }

  handleError(
    errorCode: string,
    retryCount: number
  ): {
    shouldRetry: boolean;
    retryAfterMs: number;
    errorInfo: { message: string; messageAr: string };
  } {
    const errorInfo = MOHRE_ERROR_CODES[errorCode] || {
      message: 'Unknown MOHRE error',
      messageAr: 'خطأ غير معروف',
      retryable: false,
    };
    const shouldRetry = errorInfo.retryable && retryCount < 3;
    const retryAfterMs = shouldRetry ? 5000 * Math.pow(3, retryCount) : 0;
    return { shouldRetry, retryAfterMs, errorInfo };
  }

  private mapStatus(apiStatus: string): MohreSubmissionStatus {
    const map: Record<string, MohreSubmissionStatus> = {
      SUBMITTED: 'SUBMITTED',
      UNDER_REVIEW: 'UNDER_REVIEW',
      PENDING_EMPLOYEE: 'PENDING_EMPLOYEE',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      EXPIRED: 'EXPIRED',
      CANCELLED: 'CANCELLED',
    };
    return map[apiStatus] || 'ERROR';
  }

  static create(config: MohreConfiguration): MohreService {
    return new MohreService(config);
  }
}

export class MohreAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'MohreAuthError';
  }
}

export class MohreValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: Array<{ field: string; error: string; errorAr: string }>
  ) {
    super(message);
    this.name = 'MohreValidationError';
  }
}

export class MohreAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'MohreAPIError';
  }
}

export default MohreService;
