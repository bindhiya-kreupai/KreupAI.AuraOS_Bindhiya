/**
 * Arabic Localization Service
 * Comprehensive Arabic/RTL support for GCC market
 * Handles translations, RTL layout, Arabic number formatting,
 * Hijri dates, and Arabic form validation
 */

// ============================================================================
// TYPES
// ============================================================================

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface TranslationEntry {
  key: string;
  en: string;
  ar: string;
  context?: string;
  module?: string;
}

export interface LocaleConfig {
  locale: Locale;
  direction: Direction;
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: (currency: string) => Intl.NumberFormatOptions;
  calendarType: 'gregorian' | 'hijri' | 'both';
}

export interface ArabicValidation {
  isValid: boolean;
  errors: Array<{ field: string; message: string; messageAr: string }>;
}

// ============================================================================
// LOCALE CONFIGURATIONS
// ============================================================================

const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: {
    locale: 'en',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0 },
    currencyFormat: (currency: string) => ({
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }),
    calendarType: 'gregorian',
  },
  ar: {
    locale: 'ar',
    direction: 'rtl',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, useGrouping: true },
    currencyFormat: (currency: string) => ({
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }),
    calendarType: 'both',
  },
};

// ============================================================================
// CORE TRANSLATIONS - HCM MODULE
// ============================================================================

const CORE_TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.employees': { en: 'Employees', ar: 'الموظفون' },
  'nav.payroll': { en: 'Payroll', ar: 'الرواتب' },
  'nav.leave': { en: 'Leave', ar: 'الإجازات' },
  'nav.attendance': { en: 'Attendance', ar: 'الحضور' },
  'nav.recruitment': { en: 'Recruitment', ar: 'التوظيف' },
  'nav.performance': { en: 'Performance', ar: 'الأداء' },
  'nav.training': { en: 'Training', ar: 'التدريب' },
  'nav.compliance': { en: 'Compliance', ar: 'الامتثال' },
  'nav.reports': { en: 'Reports', ar: 'التقارير' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات' },
  'nav.organization': { en: 'Organization', ar: 'المنظمة' },
  'nav.benefits': { en: 'Benefits', ar: 'المزايا' },
  'nav.documents': { en: 'Documents', ar: 'المستندات' },
  'nav.approvals': { en: 'Approvals', ar: 'الموافقات' },
  'nav.announcements': { en: 'Announcements', ar: 'الإعلانات' },
  'nav.helpdesk': { en: 'Help Desk', ar: 'مكتب المساعدة' },
  'nav.assets': { en: 'Assets', ar: 'الأصول' },
  'nav.expenses': { en: 'Expenses', ar: 'المصروفات' },

  // Common Actions
  'action.save': { en: 'Save', ar: 'حفظ' },
  'action.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'action.delete': { en: 'Delete', ar: 'حذف' },
  'action.edit': { en: 'Edit', ar: 'تعديل' },
  'action.create': { en: 'Create', ar: 'إنشاء' },
  'action.search': { en: 'Search', ar: 'بحث' },
  'action.filter': { en: 'Filter', ar: 'تصفية' },
  'action.export': { en: 'Export', ar: 'تصدير' },
  'action.import': { en: 'Import', ar: 'استيراد' },
  'action.print': { en: 'Print', ar: 'طباعة' },
  'action.download': { en: 'Download', ar: 'تحميل' },
  'action.upload': { en: 'Upload', ar: 'رفع' },
  'action.approve': { en: 'Approve', ar: 'موافقة' },
  'action.reject': { en: 'Reject', ar: 'رفض' },
  'action.submit': { en: 'Submit', ar: 'إرسال' },
  'action.view': { en: 'View', ar: 'عرض' },
  'action.back': { en: 'Back', ar: 'رجوع' },
  'action.next': { en: 'Next', ar: 'التالي' },
  'action.previous': { en: 'Previous', ar: 'السابق' },
  'action.confirm': { en: 'Confirm', ar: 'تأكيد' },
  'action.close': { en: 'Close', ar: 'إغلاق' },
  'action.refresh': { en: 'Refresh', ar: 'تحديث' },
  'action.reset': { en: 'Reset', ar: 'إعادة تعيين' },

  // Common Labels
  'label.name': { en: 'Name', ar: 'الاسم' },
  'label.email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'label.phone': { en: 'Phone', ar: 'الهاتف' },
  'label.address': { en: 'Address', ar: 'العنوان' },
  'label.date': { en: 'Date', ar: 'التاريخ' },
  'label.time': { en: 'Time', ar: 'الوقت' },
  'label.status': { en: 'Status', ar: 'الحالة' },
  'label.type': { en: 'Type', ar: 'النوع' },
  'label.description': { en: 'Description', ar: 'الوصف' },
  'label.notes': { en: 'Notes', ar: 'ملاحظات' },
  'label.amount': { en: 'Amount', ar: 'المبلغ' },
  'label.total': { en: 'Total', ar: 'المجموع' },
  'label.department': { en: 'Department', ar: 'القسم' },
  'label.designation': { en: 'Designation', ar: 'المسمى الوظيفي' },
  'label.company': { en: 'Company', ar: 'الشركة' },
  'label.branch': { en: 'Branch', ar: 'الفرع' },
  'label.country': { en: 'Country', ar: 'الدولة' },
  'label.city': { en: 'City', ar: 'المدينة' },
  'label.gender': { en: 'Gender', ar: 'الجنس' },
  'label.nationality': { en: 'Nationality', ar: 'الجنسية' },

  // Employee Module
  'employee.firstName': { en: 'First Name', ar: 'الاسم الأول' },
  'employee.lastName': { en: 'Last Name', ar: 'اسم العائلة' },
  'employee.middleName': { en: 'Middle Name', ar: 'الاسم الأوسط' },
  'employee.employeeId': { en: 'Employee ID', ar: 'رقم الموظف' },
  'employee.joiningDate': { en: 'Joining Date', ar: 'تاريخ الالتحاق' },
  'employee.exitDate': { en: 'Exit Date', ar: 'تاريخ المغادرة' },
  'employee.dateOfBirth': { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  'employee.maritalStatus': { en: 'Marital Status', ar: 'الحالة الاجتماعية' },
  'employee.manager': { en: 'Manager', ar: 'المدير' },
  'employee.probation': { en: 'Probation', ar: 'فترة الاختبار' },
  'employee.contract': { en: 'Contract', ar: 'العقد' },
  'employee.workPermit': { en: 'Work Permit', ar: 'تصريح العمل' },
  'employee.visa': { en: 'Visa', ar: 'التأشيرة' },
  'employee.emergencyContact': { en: 'Emergency Contact', ar: 'جهة اتصال طوارئ' },

  // Payroll Module
  'payroll.basicSalary': { en: 'Basic Salary', ar: 'الراتب الأساسي' },
  'payroll.grossSalary': { en: 'Gross Salary', ar: 'الراتب الإجمالي' },
  'payroll.netSalary': { en: 'Net Salary', ar: 'صافي الراتب' },
  'payroll.allowance': { en: 'Allowance', ar: 'البدل' },
  'payroll.deduction': { en: 'Deduction', ar: 'الخصم' },
  'payroll.overtime': { en: 'Overtime', ar: 'العمل الإضافي' },
  'payroll.bonus': { en: 'Bonus', ar: 'المكافأة' },
  'payroll.payslip': { en: 'Payslip', ar: 'كشف الراتب' },
  'payroll.payrollRun': { en: 'Payroll Run', ar: 'دورة الرواتب' },
  'payroll.salaryStructure': { en: 'Salary Structure', ar: 'هيكل الراتب' },
  'payroll.hra': { en: 'Housing Allowance', ar: 'بدل السكن' },
  'payroll.transport': { en: 'Transport Allowance', ar: 'بدل النقل' },
  'payroll.eosb': { en: 'End of Service Benefits', ar: 'مكافأة نهاية الخدمة' },
  'payroll.gratuity': { en: 'Gratuity', ar: 'مكافأة نهاية الخدمة' },
  'payroll.wps': { en: 'Wage Protection System', ar: 'نظام حماية الأجور' },
  'payroll.gosi': { en: 'Social Insurance (GOSI)', ar: 'التأمينات الاجتماعية' },

  // Leave Module
  'leave.annual': { en: 'Annual Leave', ar: 'إجازة سنوية' },
  'leave.sick': { en: 'Sick Leave', ar: 'إجازة مرضية' },
  'leave.maternity': { en: 'Maternity Leave', ar: 'إجازة أمومة' },
  'leave.paternity': { en: 'Paternity Leave', ar: 'إجازة أبوة' },
  'leave.hajj': { en: 'Hajj Leave', ar: 'إجازة حج' },
  'leave.bereavement': { en: 'Bereavement Leave', ar: 'إجازة وفاة' },
  'leave.marriage': { en: 'Marriage Leave', ar: 'إجازة زواج' },
  'leave.unpaid': { en: 'Unpaid Leave', ar: 'إجازة بدون راتب' },
  'leave.compOff': { en: 'Compensatory Off', ar: 'إجازة تعويضية' },
  'leave.study': { en: 'Study Leave', ar: 'إجازة دراسية' },
  'leave.balance': { en: 'Leave Balance', ar: 'رصيد الإجازات' },
  'leave.accrual': { en: 'Leave Accrual', ar: 'استحقاق الإجازات' },
  'leave.encashment': { en: 'Leave Encashment', ar: 'صرف الإجازات' },
  'leave.carryForward': { en: 'Carry Forward', ar: 'ترحيل الرصيد' },

  // Attendance Module
  'attendance.clockIn': { en: 'Clock In', ar: 'تسجيل حضور' },
  'attendance.clockOut': { en: 'Clock Out', ar: 'تسجيل انصراف' },
  'attendance.present': { en: 'Present', ar: 'حاضر' },
  'attendance.absent': { en: 'Absent', ar: 'غائب' },
  'attendance.late': { en: 'Late', ar: 'متأخر' },
  'attendance.earlyOut': { en: 'Early Out', ar: 'خروج مبكر' },
  'attendance.overtime': { en: 'Overtime', ar: 'وقت إضافي' },
  'attendance.shift': { en: 'Shift', ar: 'الوردية' },
  'attendance.roster': { en: 'Roster', ar: 'جدول المناوبات' },
  'attendance.regularization': { en: 'Regularization', ar: 'تسوية الحضور' },
  'attendance.biometric': { en: 'Biometric', ar: 'البصمة' },
  'attendance.gps': { en: 'GPS Location', ar: 'موقع GPS' },

  // Compliance Module
  'compliance.wps': { en: 'WPS Compliance', ar: 'امتثال نظام حماية الأجور' },
  'compliance.gosi': { en: 'GOSI Compliance', ar: 'امتثال التأمينات الاجتماعية' },
  'compliance.nitaqat': { en: 'Nitaqat (Saudization)', ar: 'نطاقات (السعودة)' },
  'compliance.emiratisation': { en: 'Emiratisation', ar: 'التوطين' },
  'compliance.labour': { en: 'Labour Law', ar: 'قانون العمل' },
  'compliance.ramadan': { en: 'Ramadan Hours', ar: 'ساعات رمضان' },

  // Recruitment Module
  'recruitment.jobPosting': { en: 'Job Posting', ar: 'إعلان وظيفة' },
  'recruitment.application': { en: 'Application', ar: 'طلب توظيف' },
  'recruitment.candidate': { en: 'Candidate', ar: 'مرشح' },
  'recruitment.interview': { en: 'Interview', ar: 'مقابلة' },
  'recruitment.offer': { en: 'Offer Letter', ar: 'عرض التوظيف' },
  'recruitment.onboarding': { en: 'Onboarding', ar: 'تهيئة الموظف الجديد' },

  // Status Labels
  'status.active': { en: 'Active', ar: 'نشط' },
  'status.inactive': { en: 'Inactive', ar: 'غير نشط' },
  'status.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  'status.approved': { en: 'Approved', ar: 'تمت الموافقة' },
  'status.rejected': { en: 'Rejected', ar: 'مرفوض' },
  'status.cancelled': { en: 'Cancelled', ar: 'ملغي' },
  'status.completed': { en: 'Completed', ar: 'مكتمل' },
  'status.draft': { en: 'Draft', ar: 'مسودة' },
  'status.processing': { en: 'Processing', ar: 'جاري المعالجة' },
  'status.onHold': { en: 'On Hold', ar: 'معلق' },

  // Messages
  'msg.saveSuccess': { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
  'msg.deleteSuccess': { en: 'Deleted successfully', ar: 'تم الحذف بنجاح' },
  'msg.updateSuccess': { en: 'Updated successfully', ar: 'تم التحديث بنجاح' },
  'msg.submitSuccess': { en: 'Submitted successfully', ar: 'تم الإرسال بنجاح' },
  'msg.approveSuccess': { en: 'Approved successfully', ar: 'تمت الموافقة بنجاح' },
  'msg.rejectSuccess': { en: 'Rejected', ar: 'تم الرفض' },
  'msg.error': { en: 'An error occurred', ar: 'حدث خطأ' },
  'msg.notFound': { en: 'Not found', ar: 'غير موجود' },
  'msg.unauthorized': { en: 'Unauthorized', ar: 'غير مصرح' },
  'msg.forbidden': { en: 'Access denied', ar: 'الوصول مرفوض' },
  'msg.validationError': { en: 'Validation error', ar: 'خطأ في التحقق' },
  'msg.confirmDelete': { en: 'Are you sure you want to delete?', ar: 'هل أنت متأكد من الحذف؟' },
  'msg.noData': { en: 'No data available', ar: 'لا توجد بيانات' },
  'msg.loading': { en: 'Loading...', ar: 'جاري التحميل...' },

  // Time Periods
  'time.today': { en: 'Today', ar: 'اليوم' },
  'time.yesterday': { en: 'Yesterday', ar: 'أمس' },
  'time.thisWeek': { en: 'This Week', ar: 'هذا الأسبوع' },
  'time.thisMonth': { en: 'This Month', ar: 'هذا الشهر' },
  'time.thisYear': { en: 'This Year', ar: 'هذه السنة' },
  'time.lastMonth': { en: 'Last Month', ar: 'الشهر الماضي' },
  'time.lastYear': { en: 'Last Year', ar: 'السنة الماضية' },
  'time.custom': { en: 'Custom Range', ar: 'نطاق مخصص' },
};

// ============================================================================
// ARABIC NUMBER UTILITIES
// ============================================================================

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const EASTERN_ARABIC_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

// ============================================================================
// ARABIC LOCALIZATION SERVICE
// ============================================================================

export class ArabicLocalizationService {
  private static currentLocale: Locale = 'en';
  private static customTranslations: Map<string, { en: string; ar: string }> = new Map();

  /**
   * Set the active locale
   */
  static setLocale(locale: Locale): void {
    this.currentLocale = locale;
  }

  /**
   * Get the active locale
   */
  static getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Get locale configuration
   */
  static getLocaleConfig(locale?: Locale): LocaleConfig {
    return LOCALE_CONFIGS[locale || this.currentLocale];
  }

  /**
   * Get text direction for current locale
   */
  static getDirection(locale?: Locale): Direction {
    return LOCALE_CONFIGS[locale || this.currentLocale].direction;
  }

  /**
   * Translate a key
   */
  static t(key: string, locale?: Locale): string {
    const lang = locale || this.currentLocale;

    // Check custom translations first
    const custom = this.customTranslations.get(key);
    if (custom) return custom[lang];

    // Check core translations
    const core = CORE_TRANSLATIONS[key];
    if (core) return core[lang];

    // Return key as fallback
    return key;
  }

  /**
   * Translate with bilingual output
   */
  static tb(key: string): { en: string; ar: string } {
    const custom = this.customTranslations.get(key);
    if (custom) return custom;

    const core = CORE_TRANSLATIONS[key];
    if (core) return core;

    return { en: key, ar: key };
  }

  /**
   * Register custom translations (for tenant-specific terms)
   */
  static registerTranslations(translations: Array<{ key: string; en: string; ar: string }>): void {
    for (const t of translations) {
      this.customTranslations.set(t.key, { en: t.en, ar: t.ar });
    }
  }

  /**
   * Format number based on locale
   */
  static formatNumber(value: number, locale?: Locale, options?: Intl.NumberFormatOptions): string {
    const lang = locale || this.currentLocale;
    const localeTag = lang === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(localeTag, options).format(value);
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string, locale?: Locale): string {
    const lang = locale || this.currentLocale;
    const localeTag = lang === 'ar' ? 'ar-SA' : 'en-US';
    const config = LOCALE_CONFIGS[lang];
    return new Intl.NumberFormat(localeTag, config.currencyFormat(currency)).format(amount);
  }

  /**
   * Convert Western digits to Arabic digits
   */
  static toArabicDigits(input: string | number): string {
    return String(input).replace(/\d/g, d => ARABIC_DIGITS[parseInt(d)]);
  }

  /**
   * Convert Arabic digits to Western digits
   */
  static fromArabicDigits(input: string): string {
    let result = input;
    ARABIC_DIGITS.forEach((digit, i) => {
      result = result.replace(new RegExp(digit, 'g'), String(i));
    });
    EASTERN_ARABIC_DIGITS.forEach((digit, i) => {
      result = result.replace(new RegExp(digit, 'g'), String(i));
    });
    return result;
  }

  /**
   * Format date based on locale
   */
  static formatDate(date: Date, locale?: Locale, options?: Intl.DateTimeFormatOptions): string {
    const lang = locale || this.currentLocale;
    const localeTag = lang === 'ar' ? 'ar-SA' : 'en-US';
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(localeTag, options || defaultOptions).format(date);
  }

  /**
   * Format relative time (e.g., "3 days ago")
   */
  static formatRelativeTime(date: Date, locale?: Locale): string {
    const lang = locale || this.currentLocale;
    const localeTag = lang === 'ar' ? 'ar-SA' : 'en-US';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(localeTag, { numeric: 'auto' });

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return rtf.format(-diffMinutes, 'minute');
      }
      return rtf.format(-diffHours, 'hour');
    }
    if (diffDays < 30) return rtf.format(-diffDays, 'day');
    if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
    return rtf.format(-Math.floor(diffDays / 365), 'year');
  }

  // ============================================================================
  // ARABIC FORM VALIDATION
  // ============================================================================

  /**
   * Validate Arabic name (accepts Arabic characters, spaces, common punctuation)
   */
  static validateArabicName(name: string): boolean {
    if (!name || name.trim().length === 0) return false;
    // Allow Arabic chars, spaces, and common diacritics
    return /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-.]+$/.test(name);
  }

  /**
   * Validate Emirates ID format (784-YYYY-NNNNNNN-C)
   */
  static validateEmiratesId(id: string): boolean {
    return /^784-\d{4}-\d{7}-\d$/.test(id);
  }

  /**
   * Validate Saudi National ID (Iqama/National ID - 10 digits)
   */
  static validateSaudiId(id: string): boolean {
    return /^[12]\d{9}$/.test(id);
  }

  /**
   * Validate Bahrain CPR (9 digits)
   */
  static validateBahrainCPR(cpr: string): boolean {
    return /^\d{9}$/.test(cpr);
  }

  /**
   * Validate Qatar QID (11 digits)
   */
  static validateQatarQID(qid: string): boolean {
    return /^\d{11}$/.test(qid);
  }

  /**
   * Validate Indian Aadhaar (12 digits)
   */
  static validateAadhaar(aadhaar: string): boolean {
    return /^[2-9]\d{11}$/.test(aadhaar.replace(/\s/g, ''));
  }

  /**
   * Validate Indian PAN (ABCDE1234F format)
   */
  static validatePAN(pan: string): boolean {
    return /^[A-Z]{5}\d{4}[A-Z]$/.test(pan.toUpperCase());
  }

  /**
   * Validate GCC mobile number
   */
  static validateGCCMobile(phone: string, countryCode?: string): boolean {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    const patterns: Record<string, RegExp> = {
      AE: /^(\+971|00971|971)?5\d{8}$/,
      SA: /^(\+966|00966|966)?5\d{8}$/,
      BH: /^(\+973|00973|973)?3\d{7}$/,
      QA: /^(\+974|00974|974)?[3567]\d{7}$/,
      OM: /^(\+968|00968|968)?[79]\d{7}$/,
      KW: /^(\+965|00965|965)?[569]\d{7}$/,
      IN: /^(\+91|0091|91)?[6-9]\d{9}$/,
    };

    if (countryCode && patterns[countryCode]) {
      return patterns[countryCode].test(cleaned);
    }

    return Object.values(patterns).some(p => p.test(cleaned));
  }

  /**
   * Validate IBAN for GCC countries
   */
  static validateIBAN(iban: string, countryCode?: string): boolean {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    const lengths: Record<string, number> = {
      AE: 23, SA: 24, BH: 22, QA: 29, OM: 23, KW: 30,
    };

    if (countryCode && lengths[countryCode]) {
      return cleaned.length === lengths[countryCode] &&
        cleaned.startsWith(countryCode);
    }

    // Generic IBAN validation
    return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned);
  }

  /**
   * Comprehensive form validation for Arabic/GCC forms
   */
  static validateForm(
    data: Record<string, any>,
    rules: Array<{
      field: string;
      type: 'arabicName' | 'emiratesId' | 'saudiId' | 'bahrainCPR' | 'qatarQID' |
            'aadhaar' | 'pan' | 'gccMobile' | 'iban' | 'required' | 'email';
      countryCode?: string;
    }>
  ): ArabicValidation {
    const errors: ArabicValidation['errors'] = [];

    for (const rule of rules) {
      const value = data[rule.field];

      if (rule.type === 'required' && (!value || String(value).trim() === '')) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
          messageAr: `الحقل ${rule.field} مطلوب`,
        });
        continue;
      }

      if (!value) continue;

      const strValue = String(value);

      const validators: Record<string, () => boolean> = {
        arabicName: () => this.validateArabicName(strValue),
        emiratesId: () => this.validateEmiratesId(strValue),
        saudiId: () => this.validateSaudiId(strValue),
        bahrainCPR: () => this.validateBahrainCPR(strValue),
        qatarQID: () => this.validateQatarQID(strValue),
        aadhaar: () => this.validateAadhaar(strValue),
        pan: () => this.validatePAN(strValue),
        gccMobile: () => this.validateGCCMobile(strValue, rule.countryCode),
        iban: () => this.validateIBAN(strValue, rule.countryCode),
        email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue),
      };

      const validator = validators[rule.type];
      if (validator && !validator()) {
        errors.push({
          field: rule.field,
          message: `Invalid ${rule.type} format for ${rule.field}`,
          messageAr: `تنسيق غير صالح للحقل ${rule.field}`,
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // ============================================================================
  // RTL UTILITIES
  // ============================================================================

  /**
   * Get CSS class for text alignment based on locale
   */
  static getTextAlign(locale?: Locale): string {
    return (locale || this.currentLocale) === 'ar' ? 'text-right' : 'text-left';
  }

  /**
   * Get CSS direction attribute
   */
  static getDirAttribute(locale?: Locale): 'rtl' | 'ltr' {
    return (locale || this.currentLocale) === 'ar' ? 'rtl' : 'ltr';
  }

  /**
   * Mirror a CSS property name for RTL (e.g., 'margin-left' → 'margin-right')
   */
  static mirrorCSSProperty(property: string, locale?: Locale): string {
    if ((locale || this.currentLocale) !== 'ar') return property;

    const mirrors: Record<string, string> = {
      'margin-left': 'margin-right',
      'margin-right': 'margin-left',
      'padding-left': 'padding-right',
      'padding-right': 'padding-left',
      'border-left': 'border-right',
      'border-right': 'border-left',
      left: 'right',
      right: 'left',
      'text-align: left': 'text-align: right',
      'text-align: right': 'text-align: left',
      'float: left': 'float: right',
      'float: right': 'float: left',
    };

    return mirrors[property] || property;
  }

  /**
   * Get all translation keys for a module
   */
  static getModuleTranslations(module: string): Array<{ key: string; en: string; ar: string }> {
    const prefix = module + '.';
    const result: Array<{ key: string; en: string; ar: string }> = [];

    for (const [key, value] of Object.entries(CORE_TRANSLATIONS)) {
      if (key.startsWith(prefix)) {
        result.push({ key, ...value });
      }
    }

    return result;
  }

  /**
   * Get all available translation keys
   */
  static getAllTranslationKeys(): string[] {
    return Object.keys(CORE_TRANSLATIONS);
  }

  /**
   * Get translation coverage statistics
   */
  static getTranslationCoverage(): {
    totalKeys: number;
    modules: Array<{ module: string; keyCount: number }>;
  } {
    const modules = new Map<string, number>();

    for (const key of Object.keys(CORE_TRANSLATIONS)) {
      const module = key.split('.')[0];
      modules.set(module, (modules.get(module) || 0) + 1);
    }

    return {
      totalKeys: Object.keys(CORE_TRANSLATIONS).length,
      modules: Array.from(modules.entries()).map(([module, keyCount]) => ({
        module,
        keyCount,
      })),
    };
  }
}

export default ArabicLocalizationService;
