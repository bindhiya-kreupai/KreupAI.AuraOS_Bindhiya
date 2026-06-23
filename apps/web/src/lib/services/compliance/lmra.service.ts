/**
 * Bahrain LMRA (Labour Market Regulatory Authority) Integration Service
 *
 * Closes EPIC-02-S14 by providing a first-class adapter for the LMRA
 * authority that the bahrainization-compliance, sio-compliance, and
 * immigration-compliance domains all consume. Mirrors the existing
 * Qiwa/Mudad/MOHRE adapters under `apps/web/src/lib/services/compliance/`.
 *
 * Surface:
 *  - OAuth2 client-credentials authentication against api.lmra.bh
 *  - Work-permit issue / renew / cancel + fee retrieval
 *  - Status polling and fee schedule lookup
 *  - Payload validation against Bahrain Labour Law (Law No. 36/2012)
 *  - Bilingual error-code mapping with retry classification
 *
 * Persistence + alert ladder (60/30/7 day) live in `immigration-compliance`
 * and `bahrainization-compliance` so this adapter only handles the wire
 * protocol and LMRA-specific business rules.
 */

export interface LmraConfiguration {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  employerCode: string; // LMRA employer registration
  cprPrefix?: string; // for issuing CPRs
  apiBaseUrl: string; // https://api.lmra.bh/v2
  callbackUrl: string;
  environment: 'SANDBOX' | 'UAT' | 'PRODUCTION';
  lastTokenRefresh?: Date;
  tokenExpiresAt?: Date;
}

export interface LmraAuthToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string;
  issuedAt: Date;
  expiresAt: Date;
}

export type LmraPermitType =
  | 'NEW_EXPATRIATE'
  | 'RENEWAL'
  | 'TRANSFER'
  | 'FLEXI_PERMIT'
  | 'DOMESTIC_WORKER'
  | 'CONSTRUCTION'
  | 'FOOD_SERVICE'
  | 'HEALTHCARE';

export type LmraPermitStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'FEES_PENDING'
  | 'FEES_PAID'
  | 'MEDICAL_PENDING'
  | 'ISSUED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'ERROR';

export type LmraFeeType = 'PERMIT_FEE' | 'CR_FEE' | 'INSURANCE' | 'MEDICAL' | 'CPR_ISSUE';

export interface LmraEmployee {
  cpr?: string; // 9-digit Bahraini Central Population Registration
  passportNumber: string;
  passportCountry: string; // ISO
  fullNameEn: string;
  fullNameAr: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE';
  nationality: string; // ISO
  occupationCode: string;
  isBahraini: boolean;
}

export interface LmraPermitPayload {
  employee: LmraEmployee;
  permitType: LmraPermitType;
  durationMonths: 12 | 24; // LMRA permits are 1 or 2 years
  jobTitleEn: string;
  jobTitleAr: string;
  basicSalary: number; // BHD
  totalSalary: number; // BHD
  workLocation: { governorate: string; area: string };
  sector: string; // e.g. CONSTRUCTION
}

export interface LmraFeeBreakdown {
  feeType: LmraFeeType;
  amount: number; // BHD
  description: string;
  descriptionAr: string;
}

export interface LmraSubmission {
  submissionId: string;
  tenantId: string;
  employeeId: string;
  permitNumber?: string;
  status: LmraPermitStatus;
  submittedAt: Date;
  lastPolledAt?: Date;
  lmraReferenceNumber?: string;
  fees: LmraFeeBreakdown[];
  totalFees: number;
  retryCount: number;
  lastError?: string;
}

export interface LmraApiResponse {
  responseId: string;
  timestamp: Date;
  statusCode: number;
  status: LmraPermitStatus;
  lmraReferenceNumber?: string;
  permitNumber?: string;
  expiryDate?: string;
  fees?: LmraFeeBreakdown[];
  message: string;
  messageAr: string;
  validationErrors?: Array<{ field: string; error: string; errorAr: string }>;
}

const LMRA_ENDPOINTS = {
  AUTH: '/oauth2/token',
  PERMITS: '/permits',
  PERMIT_STATUS: '/permits/:reference/status',
  PERMIT_FEES: '/permits/:reference/fees',
  PERMIT_CANCEL: '/permits/:reference/cancel',
  EMPLOYER: '/employers/:code',
} as const;

const LMRA_ERROR_CODES: Record<string, { message: string; messageAr: string; retryable: boolean }> =
  {
    'LM-001': {
      message: 'Invalid authentication credentials',
      messageAr: 'بيانات اعتماد المصادقة غير صالحة',
      retryable: false,
    },
    'LM-002': { message: 'Token expired', messageAr: 'انتهت صلاحية الرمز', retryable: true },
    'LM-003': {
      message: 'Employer not registered with LMRA',
      messageAr: 'صاحب العمل غير مسجل في LMRA',
      retryable: false,
    },
    'LM-004': {
      message: 'Bahrainisation quota not met — permit blocked',
      messageAr: 'نسبة البحرنة غير مستوفاة',
      retryable: false,
    },
    'LM-005': {
      message: 'Sector quota exhausted for nationality',
      messageAr: 'تم استنفاد حصة القطاع للجنسية',
      retryable: false,
    },
    'LM-006': { message: 'Rate limit exceeded', messageAr: 'تم تجاوز حد المعدل', retryable: true },
    'LM-007': {
      message: 'Service temporarily unavailable',
      messageAr: 'الخدمة غير متاحة مؤقتاً',
      retryable: true,
    },
    'LM-008': {
      message: 'Duplicate permit application',
      messageAr: 'طلب تصريح مكرر',
      retryable: false,
    },
    'LM-009': {
      message: 'Fee payment overdue',
      messageAr: 'دفع الرسوم متأخر',
      retryable: false,
    },
    'LM-010': {
      message: 'Medical examination not on file',
      messageAr: 'الفحص الطبي غير متوفر',
      retryable: false,
    },
  };

export class LmraService {
  private config: LmraConfiguration;
  private currentToken: LmraAuthToken | null = null;

  constructor(config: LmraConfiguration) {
    this.config = config;
  }

  async authenticate(): Promise<LmraAuthToken> {
    const endpoint = `${this.config.apiBaseUrl}${LMRA_ENDPOINTS.AUTH}`;
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
        scope: 'permits:write permits:read fees:read employers:read',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new LmraAuthError(
        `LMRA authentication failed: ${response.status}`,
        error.error_code || 'LM-001',
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

  async submitPermit(
    tenantId: string,
    employeeId: string,
    payload: LmraPermitPayload
  ): Promise<LmraSubmission> {
    const validationErrors = this.validatePermitPayload(payload);
    if (validationErrors.length > 0) {
      throw new LmraValidationError('LMRA permit validation failed', validationErrors);
    }

    const token = await this.getValidToken();
    const endpoint = `${this.config.apiBaseUrl}${LMRA_ENDPOINTS.PERMITS}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Employer-Code': this.config.employerCode,
        'Accept-Language': 'en,ar',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));
    const fees: LmraFeeBreakdown[] = responseData.fees ?? [];
    const totalFees = fees.reduce((sum, f) => sum + (f.amount ?? 0), 0);
    const status: LmraPermitStatus = response.ok ? 'FEES_PENDING' : 'REJECTED';
    return {
      submissionId: `LMRA-SUB-${tenantId}-${Date.now()}`,
      tenantId,
      employeeId,
      permitNumber: responseData.permit_number,
      status,
      submittedAt: new Date(),
      lmraReferenceNumber: responseData.reference_number,
      fees,
      totalFees,
      retryCount: 0,
      lastError: response.ok ? undefined : responseData.error_code || `HTTP_${response.status}`,
    };
  }

  async pollPermitStatus(referenceNumber: string): Promise<LmraApiResponse> {
    const token = await this.getValidToken();
    const endpoint = `${this.config.apiBaseUrl}${LMRA_ENDPOINTS.PERMIT_STATUS.replace(':reference', referenceNumber)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-Employer-Code': this.config.employerCode,
      },
    });
    const data = await response.json().catch(() => ({}));
    return {
      responseId: `LMRA-POLL-${Date.now()}`,
      timestamp: new Date(),
      statusCode: response.status,
      status: this.mapStatus(data.status),
      lmraReferenceNumber: referenceNumber,
      permitNumber: data.permit_number,
      expiryDate: data.expiry_date,
      message: data.message || (response.ok ? 'Status fetched' : 'Status fetch failed'),
      messageAr: data.message_ar || (response.ok ? 'تم جلب الحالة' : 'فشل جلب الحالة'),
    };
  }

  async getFeeSchedule(referenceNumber: string): Promise<LmraFeeBreakdown[]> {
    const token = await this.getValidToken();
    const endpoint = `${this.config.apiBaseUrl}${LMRA_ENDPOINTS.PERMIT_FEES.replace(':reference', referenceNumber)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-Employer-Code': this.config.employerCode,
      },
    });
    if (!response.ok) {
      throw new LmraAPIError(`Fee fetch failed: ${response.status}`, response.status);
    }
    const data = await response.json();
    return (data.fees ?? []) as LmraFeeBreakdown[];
  }

  async cancelPermit(referenceNumber: string, reason: string): Promise<LmraApiResponse> {
    const token = await this.getValidToken();
    const endpoint = `${this.config.apiBaseUrl}${LMRA_ENDPOINTS.PERMIT_CANCEL.replace(':reference', referenceNumber)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Employer-Code': this.config.employerCode,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await response.json().catch(() => ({}));
    return {
      responseId: `LMRA-CANCEL-${Date.now()}`,
      timestamp: new Date(),
      statusCode: response.status,
      status: response.ok ? 'CANCELLED' : 'ERROR',
      lmraReferenceNumber: referenceNumber,
      message: data.message || (response.ok ? 'Permit cancelled' : 'Cancellation failed'),
      messageAr: data.message_ar || (response.ok ? 'تم إلغاء التصريح' : 'فشل الإلغاء'),
    };
  }

  validatePermitPayload(
    payload: LmraPermitPayload
  ): Array<{ field: string; error: string; errorAr: string }> {
    const errors: Array<{ field: string; error: string; errorAr: string }> = [];
    const { employee, durationMonths, basicSalary, totalSalary } = payload;

    if (employee.cpr && !/^\d{9}$/.test(employee.cpr)) {
      errors.push({
        field: 'employee.cpr',
        error: 'Invalid CPR format (must be 9 digits)',
        errorAr: 'تنسيق رقم السجل السكاني غير صالح',
      });
    }
    if (durationMonths !== 12 && durationMonths !== 24) {
      errors.push({
        field: 'durationMonths',
        error: 'LMRA permits must be 12 or 24 months',
        errorAr: 'تصاريح LMRA يجب أن تكون 12 أو 24 شهراً',
      });
    }
    if (totalSalary <= 0) {
      errors.push({
        field: 'totalSalary',
        error: 'Total salary must be positive',
        errorAr: 'إجمالي الراتب يجب أن يكون إيجابياً',
      });
    }
    if (basicSalary > totalSalary) {
      errors.push({
        field: 'basicSalary',
        error: 'Basic salary cannot exceed total salary',
        errorAr: 'الراتب الأساسي لا يمكن أن يتجاوز الإجمالي',
      });
    }
    if (employee.isBahraini && payload.permitType === 'NEW_EXPATRIATE') {
      errors.push({
        field: 'permitType',
        error: 'Bahraini nationals cannot be issued NEW_EXPATRIATE permits',
        errorAr: 'لا يمكن إصدار تصاريح للوافدين للمواطنين البحرينيين',
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
    const errorInfo = LMRA_ERROR_CODES[errorCode] || {
      message: 'Unknown LMRA error',
      messageAr: 'خطأ غير معروف',
      retryable: false,
    };
    const shouldRetry = errorInfo.retryable && retryCount < 3;
    const retryAfterMs = shouldRetry ? 5000 * Math.pow(3, retryCount) : 0;
    return { shouldRetry, retryAfterMs, errorInfo };
  }

  private mapStatus(apiStatus: string): LmraPermitStatus {
    const map: Record<string, LmraPermitStatus> = {
      SUBMITTED: 'SUBMITTED',
      FEES_PENDING: 'FEES_PENDING',
      FEES_PAID: 'FEES_PAID',
      MEDICAL_PENDING: 'MEDICAL_PENDING',
      ISSUED: 'ISSUED',
      REJECTED: 'REJECTED',
      EXPIRED: 'EXPIRED',
      CANCELLED: 'CANCELLED',
    };
    return map[apiStatus] || 'ERROR';
  }

  static create(config: LmraConfiguration): LmraService {
    return new LmraService(config);
  }
}

export class LmraAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'LmraAuthError';
  }
}

export class LmraValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: Array<{ field: string; error: string; errorAr: string }>
  ) {
    super(message);
    this.name = 'LmraValidationError';
  }
}

export class LmraAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'LmraAPIError';
  }
}

export default LmraService;
