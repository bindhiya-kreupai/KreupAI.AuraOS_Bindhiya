# Bilingual Strategy (English/Arabic)

**Related Documents:**
- [Executive Summary](./00-EXECUTIVE-SUMMARY.md)
- [Labour Law Compliance](./03-LABOUR-LAW-COMPLIANCE.md)
- [Implementation Roadmap](./05-IMPLEMENTATION-ROADMAP.md)

---

## Overview

This document outlines the comprehensive strategy for implementing full English/Arabic bilingual support in AuraOS, a critical requirement for MENA market success.

---

## Current State Analysis

### Existing i18n Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| i18n Package (`@aura/i18n`) | Implemented | Framework ready |
| Arabic Language (ar-SA) | Configured | Basic setup done |
| RTL Support | Partial | Framework exists |
| Translation Files | Minimal | Structure exists |
| Date/Time Localization | Partial | Gregorian only |
| Currency Formatting | Partial | AED, SAR configured |

### Current Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| Complete Arabic UI translations | Critical | Phase 1 |
| RTL layout optimization | Critical | Phase 1 |
| Arabic form validation | High | Phase 1 |
| Hijri calendar support | High | Phase 2 |
| Arabic reports/documents | High | Phase 2 |
| Arabic email templates | High | Phase 2 |
| Arabic chatbot/NLP | Medium | Phase 3 |
| Arabic search optimization | Medium | Phase 3 |

---

## Bilingual Architecture

### 1. Language Configuration

```typescript
// packages/@aura/i18n/src/config.ts

interface LanguageConfig {
  code: string;           // ISO 639-1
  name: string;           // English name
  nativeName: string;     // Native script name
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: {
    decimal: string;
    thousand: string;
  };
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  calendar: 'gregorian' | 'hijri';
  firstDayOfWeek: 0 | 1 | 5 | 6; // Sun, Mon, Fri, Sat
}

const languages: Record<string, LanguageConfig> = {
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    numberFormat: { decimal: '.', thousand: ',' },
    currency: { code: 'USD', symbol: '$', position: 'before' },
    calendar: 'gregorian',
    firstDayOfWeek: 0
  },
  'ar-SA': {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    numberFormat: { decimal: '.', thousand: ',' },
    currency: { code: 'SAR', symbol: 'ر.س', position: 'after' },
    calendar: 'hijri',
    firstDayOfWeek: 0 // Sunday
  },
  'ar-AE': {
    code: 'ar-AE',
    name: 'Arabic (UAE)',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    numberFormat: { decimal: '.', thousand: ',' },
    currency: { code: 'AED', symbol: 'د.إ', position: 'after' },
    calendar: 'gregorian', // UAE commonly uses Gregorian for business
    firstDayOfWeek: 0
  }
};
```

### 2. Translation File Structure

```
packages/@aura/i18n/src/locales/
├── en-US/
│   ├── common.json           # Common UI elements
│   ├── auth.json             # Authentication
│   ├── dashboard.json        # Dashboard
│   ├── employee.json         # Employee management
│   ├── payroll.json          # Payroll module
│   ├── leave.json            # Leave management
│   ├── attendance.json       # Attendance
│   ├── recruitment.json      # Recruitment
│   ├── performance.json      # Performance
│   ├── competency.json       # Competency library
│   ├── reports.json          # Reports
│   ├── settings.json         # Settings
│   ├── notifications.json    # Notifications
│   ├── errors.json           # Error messages
│   └── validation.json       # Validation messages
│
├── ar-SA/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── employee.json
│   ├── payroll.json
│   ├── leave.json
│   ├── attendance.json
│   ├── recruitment.json
│   ├── performance.json
│   ├── competency.json
│   ├── reports.json
│   ├── settings.json
│   ├── notifications.json
│   ├── errors.json
│   └── validation.json
│
└── ar-AE/
    └── ... (inherits from ar-SA with overrides)
```

### 3. Translation Examples

**English (en-US/common.json):**
```json
{
  "app": {
    "name": "AuraOS",
    "tagline": "Human Capital Management"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "employees": "Employees",
    "payroll": "Payroll",
    "leave": "Leave",
    "attendance": "Attendance",
    "recruitment": "Recruitment",
    "performance": "Performance",
    "reports": "Reports",
    "settings": "Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "import": "Import",
    "submit": "Submit",
    "approve": "Approve",
    "reject": "Reject"
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected"
  }
}
```

**Arabic (ar-SA/common.json):**
```json
{
  "app": {
    "name": "أورا أو إس",
    "tagline": "إدارة رأس المال البشري"
  },
  "navigation": {
    "dashboard": "لوحة التحكم",
    "employees": "الموظفون",
    "payroll": "الرواتب",
    "leave": "الإجازات",
    "attendance": "الحضور",
    "recruitment": "التوظيف",
    "performance": "الأداء",
    "reports": "التقارير",
    "settings": "الإعدادات"
  },
  "actions": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "add": "إضافة",
    "search": "بحث",
    "filter": "تصفية",
    "export": "تصدير",
    "import": "استيراد",
    "submit": "إرسال",
    "approve": "موافقة",
    "reject": "رفض"
  },
  "status": {
    "active": "نشط",
    "inactive": "غير نشط",
    "pending": "قيد الانتظار",
    "approved": "موافق عليه",
    "rejected": "مرفوض"
  }
}
```

**Employee Module (ar-SA/employee.json):**
```json
{
  "employee": {
    "title": "الموظفون",
    "addNew": "إضافة موظف جديد",
    "editEmployee": "تعديل بيانات الموظف",
    "profile": "الملف الشخصي",
    "personalInfo": "المعلومات الشخصية",
    "employmentInfo": "معلومات التوظيف",
    "documents": "المستندات",
    "salary": "الراتب",
    "bankDetails": "تفاصيل البنك"
  },
  "fields": {
    "employeeId": "رقم الموظف",
    "firstName": "الاسم الأول",
    "lastName": "اسم العائلة",
    "firstNameAr": "الاسم الأول (بالعربية)",
    "lastNameAr": "اسم العائلة (بالعربية)",
    "email": "البريد الإلكتروني",
    "phone": "رقم الهاتف",
    "mobile": "رقم الجوال",
    "dateOfBirth": "تاريخ الميلاد",
    "gender": "الجنس",
    "nationality": "الجنسية",
    "maritalStatus": "الحالة الاجتماعية",
    "department": "القسم",
    "designation": "المسمى الوظيفي",
    "joiningDate": "تاريخ الالتحاق",
    "manager": "المدير المباشر",
    "workLocation": "مقر العمل"
  },
  "gender": {
    "male": "ذكر",
    "female": "أنثى"
  },
  "maritalStatus": {
    "single": "أعزب/عزباء",
    "married": "متزوج/متزوجة",
    "divorced": "مطلق/مطلقة",
    "widowed": "أرمل/أرملة"
  }
}
```

---

## 4. RTL (Right-to-Left) Implementation

### CSS Strategy

```css
/* Base RTL Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Tailwind RTL Plugin Configuration */
/* tailwind.config.js */
module.exports = {
  plugins: [
    require('tailwindcss-rtl'),
  ],
}

/* RTL-aware spacing utilities */
.ms-4 { margin-inline-start: 1rem; }  /* margin-left in LTR, margin-right in RTL */
.me-4 { margin-inline-end: 1rem; }    /* margin-right in LTR, margin-left in RTL */
.ps-4 { padding-inline-start: 1rem; }
.pe-4 { padding-inline-end: 1rem; }

/* RTL-aware flexbox */
[dir="rtl"] .flex-row { flex-direction: row-reverse; }
[dir="rtl"] .flex-row-reverse { flex-direction: row; }

/* RTL-aware icons and transforms */
[dir="rtl"] .icon-arrow-right { transform: scaleX(-1); }
[dir="rtl"] .icon-arrow-left { transform: scaleX(-1); }

/* Form elements */
[dir="rtl"] input,
[dir="rtl"] textarea,
[dir="rtl"] select {
  text-align: right;
}

/* Tables */
[dir="rtl"] th,
[dir="rtl"] td {
  text-align: right;
}

[dir="rtl"] table {
  direction: rtl;
}

/* Navigation */
[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
  border-left: 1px solid var(--border-color);
  border-right: none;
}

[dir="rtl"] .main-content {
  margin-left: 0;
  margin-right: var(--sidebar-width);
}
```

### Component RTL Patterns

```tsx
// components/ui/Button.tsx
import { useTranslation } from '@aura/i18n';

export function Button({ children, icon, iconPosition = 'start' }) {
  const { dir } = useTranslation();

  const iconClass = dir === 'rtl'
    ? iconPosition === 'start' ? 'me-2' : 'ms-2'
    : iconPosition === 'start' ? 'me-2' : 'ms-2';

  return (
    <button className="flex items-center">
      {iconPosition === 'start' && icon && <span className={iconClass}>{icon}</span>}
      {children}
      {iconPosition === 'end' && icon && <span className={iconClass}>{icon}</span>}
    </button>
  );
}

// components/layout/Sidebar.tsx
export function Sidebar() {
  const { dir } = useTranslation();

  return (
    <aside className={cn(
      "fixed top-0 h-full w-64 bg-white shadow-lg",
      dir === 'rtl' ? 'right-0' : 'left-0'
    )}>
      {/* sidebar content */}
    </aside>
  );
}
```

---

## 5. Hijri Calendar Support

### Implementation

```typescript
// lib/calendar/hijri.ts
import { toHijri, toGregorian } from 'hijri-converter';

interface HijriDate {
  year: number;
  month: number;
  day: number;
}

export class HijriCalendar {
  static toHijri(gregorian: Date): HijriDate {
    const result = toHijri(
      gregorian.getFullYear(),
      gregorian.getMonth() + 1,
      gregorian.getDate()
    );
    return {
      year: result.hy,
      month: result.hm,
      day: result.hd
    };
  }

  static toGregorian(hijri: HijriDate): Date {
    const result = toGregorian(hijri.year, hijri.month, hijri.day);
    return new Date(result.gy, result.gm - 1, result.gd);
  }

  static format(date: HijriDate, locale: 'ar' | 'en' = 'ar'): string {
    const months = {
      ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى',
           'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
      en: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula',
           'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah']
    };

    const monthName = months[locale][date.month - 1];
    return locale === 'ar'
      ? `${date.day} ${monthName} ${date.year} هـ`
      : `${date.day} ${monthName} ${date.year} AH`;
  }

  static isRamadan(date: Date): boolean {
    const hijri = this.toHijri(date);
    return hijri.month === 9; // Ramadan is 9th month
  }

  static getDaysInMonth(year: number, month: number): number {
    // Hijri months alternate between 29 and 30 days
    // with some variations in the 12th month
    if (month === 12) {
      // Check if leap year
      return this.isLeapYear(year) ? 30 : 29;
    }
    return month % 2 === 1 ? 30 : 29;
  }

  static isLeapYear(year: number): boolean {
    return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(year % 30);
  }
}

// Date picker component with dual calendar
export function DatePicker({ value, onChange, showHijri = true }) {
  const [viewMode, setViewMode] = useState<'gregorian' | 'hijri'>('gregorian');

  return (
    <div className="date-picker">
      {showHijri && (
        <div className="calendar-toggle">
          <button onClick={() => setViewMode('gregorian')}>Gregorian</button>
          <button onClick={() => setViewMode('hijri')}>Hijri</button>
        </div>
      )}
      {viewMode === 'gregorian' ? (
        <GregorianCalendar value={value} onChange={onChange} />
      ) : (
        <HijriCalendarView value={value} onChange={onChange} />
      )}
      {/* Show both dates */}
      <div className="date-display">
        <span className="gregorian">{formatGregorian(value)}</span>
        <span className="hijri">{HijriCalendar.format(HijriCalendar.toHijri(value))}</span>
      </div>
    </div>
  );
}
```

---

## 6. Arabic Form Validation

```typescript
// lib/validation/arabic.ts

export const arabicPatterns = {
  // Arabic letters only (including special characters)
  arabicText: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/,

  // Arabic letters with numbers
  arabicAlphanumeric: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0660-\u0669\s0-9]+$/,

  // Arabic name (first, middle, last)
  arabicName: /^[\u0600-\u06FF\s]{2,50}$/,

  // Arabic or English text
  bilingualText: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z\s]+$/,

  // UAE phone number
  uaePhone: /^(\+971|00971|0)?[5][0-9]{8}$/,

  // Saudi phone number
  saudiPhone: /^(\+966|00966|0)?[5][0-9]{8}$/,

  // Emirates ID
  emiratesId: /^784-[0-9]{4}-[0-9]{7}-[0-9]$/,

  // Saudi National ID (Iqama)
  saudiIqama: /^[12][0-9]{9}$/,

  // GCC passport number
  gccPassport: /^[A-Z0-9]{6,9}$/
};

// Zod validators
import { z } from 'zod';

export const arabicNameSchema = z.string()
  .min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  .max(50, { message: 'الاسم يجب ألا يتجاوز 50 حرفًا' })
  .regex(arabicPatterns.arabicName, {
    message: 'يرجى إدخال الاسم بالعربية فقط'
  });

export const emiratesIdSchema = z.string()
  .regex(arabicPatterns.emiratesId, {
    message: 'صيغة رقم الهوية الإماراتية غير صحيحة'
  });

export const uaePhoneSchema = z.string()
  .regex(arabicPatterns.uaePhone, {
    message: 'صيغة رقم الهاتف غير صحيحة'
  });

// Employee validation schema with Arabic
export const employeeArabicSchema = z.object({
  firstNameEn: z.string().min(2).max(50),
  lastNameEn: z.string().min(2).max(50),
  firstNameAr: arabicNameSchema,
  lastNameAr: arabicNameSchema,
  emiratesId: emiratesIdSchema.optional(),
  phone: uaePhoneSchema,
  // ... other fields
});
```

---

## 7. Arabic Search & Text Processing

```typescript
// lib/search/arabic.ts

export class ArabicTextProcessor {
  // Normalize Arabic text (remove diacritics, normalize characters)
  static normalize(text: string): string {
    return text
      // Remove Arabic diacritics (tashkeel)
      .replace(/[\u064B-\u065F]/g, '')
      // Normalize Alef variations
      .replace(/[أإآ]/g, 'ا')
      // Normalize Yaa variations
      .replace(/[ى]/g, 'ي')
      // Normalize Taa marbuta
      .replace(/[ة]/g, 'ه')
      // Remove tatweel
      .replace(/ـ/g, '')
      // Trim whitespace
      .trim();
  }

  // Prepare text for search indexing
  static prepareForSearch(text: string): string[] {
    const normalized = this.normalize(text);
    const words = normalized.split(/\s+/);

    // Generate variations for better matching
    const variations: string[] = [];
    words.forEach(word => {
      variations.push(word);
      // Add without definite article
      if (word.startsWith('ال')) {
        variations.push(word.substring(2));
      }
    });

    return variations;
  }

  // Check if text is Arabic
  static isArabic(text: string): boolean {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  }

  // Get text direction
  static getDirection(text: string): 'rtl' | 'ltr' {
    return this.isArabic(text) ? 'rtl' : 'ltr';
  }
}

// Search implementation with Arabic support
export async function searchEmployees(query: string): Promise<Employee[]> {
  const isArabic = ArabicTextProcessor.isArabic(query);
  const normalizedQuery = ArabicTextProcessor.normalize(query);

  if (isArabic) {
    return prisma.employee.findMany({
      where: {
        OR: [
          { firstNameAr: { contains: normalizedQuery } },
          { lastNameAr: { contains: normalizedQuery } },
          { fullNameAr: { contains: normalizedQuery } },
        ]
      }
    });
  } else {
    return prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ]
      }
    });
  }
}
```

---

## 8. Arabic Reports & Documents

### Report Template Structure

```typescript
// lib/reports/bilingual.ts

interface BilingualReportConfig {
  title: { en: string; ar: string };
  headers: { en: string; ar: string }[];
  dateFormat: { en: string; ar: string };
  currencyFormat: { en: string; ar: string };
  direction: 'ltr' | 'rtl';
}

const payslipTemplate: BilingualReportConfig = {
  title: {
    en: 'Salary Slip',
    ar: 'كشف الراتب'
  },
  headers: [
    { en: 'Employee Name', ar: 'اسم الموظف' },
    { en: 'Employee ID', ar: 'رقم الموظف' },
    { en: 'Department', ar: 'القسم' },
    { en: 'Designation', ar: 'المسمى الوظيفي' },
    { en: 'Month', ar: 'الشهر' },
    { en: 'Basic Salary', ar: 'الراتب الأساسي' },
    { en: 'Allowances', ar: 'البدلات' },
    { en: 'Deductions', ar: 'الاستقطاعات' },
    { en: 'Net Salary', ar: 'صافي الراتب' },
  ],
  dateFormat: {
    en: 'MMMM YYYY',
    ar: 'MMMM YYYY'
  },
  currencyFormat: {
    en: 'AED #,###.##',
    ar: '#,###.## د.إ'
  },
  direction: 'rtl'
};

// PDF generation with Arabic support
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function generateArabicPayslip(employee: Employee, month: string): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Load Arabic font
  doc.addFont('fonts/NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
  doc.setFont('NotoSansArabic');

  // Set RTL direction
  doc.setR2L(true);

  // Company header (bilingual)
  doc.setFontSize(20);
  doc.text(company.nameAr, 190, 20, { align: 'right' });
  doc.setFontSize(12);
  doc.text(company.nameEn, 20, 20, { align: 'left' });

  // Title
  doc.setFontSize(16);
  doc.text(payslipTemplate.title.ar, 105, 40, { align: 'center' });

  // Employee details table
  doc.autoTable({
    startY: 50,
    head: [['', '']],
    body: [
      [employee.fullNameAr, payslipTemplate.headers[0].ar],
      [employee.employeeId, payslipTemplate.headers[1].ar],
      [employee.department.nameAr, payslipTemplate.headers[2].ar],
      [employee.designation.nameAr, payslipTemplate.headers[3].ar],
    ],
    styles: { font: 'NotoSansArabic', halign: 'right' },
    columnStyles: { 0: { halign: 'left' } }
  });

  // Salary breakdown
  // ... continue with salary details

  return doc.output('arraybuffer');
}
```

---

## 9. Arabic Email Templates

```typescript
// lib/email/templates/arabic/

// Welcome email template (Arabic)
export const welcomeEmailAr = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Noto Sans Arabic', 'Arial', sans-serif;
      direction: rtl;
      text-align: right;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <h1>مرحباً بك في {{companyName}}</h1>

  <p>عزيزي/عزيزتي {{employeeName}}،</p>

  <p>يسعدنا انضمامك إلى فريق {{companyName}}. نتمنى لك التوفيق والنجاح في مسيرتك المهنية معنا.</p>

  <h3>معلومات حسابك:</h3>
  <ul>
    <li>البريد الإلكتروني: {{email}}</li>
    <li>رابط تسجيل الدخول: <a href="{{loginUrl}}">{{loginUrl}}</a></li>
  </ul>

  <p>لتفعيل حسابك، يرجى النقر على الرابط التالي:</p>
  <a href="{{activationLink}}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    تفعيل الحساب
  </a>

  <p>مع أطيب التحيات،<br>فريق الموارد البشرية</p>
</body>
</html>
`;

// Leave approval email (Arabic)
export const leaveApprovalAr = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h2>تمت الموافقة على طلب الإجازة</h2>

  <p>عزيزي/عزيزتي {{employeeName}}،</p>

  <p>نود إبلاغك بأنه تمت الموافقة على طلب إجازتك.</p>

  <table border="1" cellpadding="10" style="border-collapse: collapse; direction: rtl;">
    <tr>
      <th>نوع الإجازة</th>
      <td>{{leaveType}}</td>
    </tr>
    <tr>
      <th>من تاريخ</th>
      <td>{{startDate}}</td>
    </tr>
    <tr>
      <th>إلى تاريخ</th>
      <td>{{endDate}}</td>
    </tr>
    <tr>
      <th>عدد الأيام</th>
      <td>{{numberOfDays}}</td>
    </tr>
    <tr>
      <th>تمت الموافقة بواسطة</th>
      <td>{{approverName}}</td>
    </tr>
  </table>

  <p>الرصيد المتبقي: {{remainingBalance}} يوم</p>

  <p>مع أطيب التحيات،<br>فريق الموارد البشرية</p>
</body>
</html>
`;
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Task | Priority | Effort |
|------|----------|--------|
| Complete Arabic translation files | Critical | High |
| RTL CSS framework implementation | Critical | Medium |
| RTL-aware component library | Critical | High |
| Language switcher component | Critical | Low |
| Arabic font integration (Noto Sans Arabic) | Critical | Low |

### Phase 2: Core Modules (Weeks 5-8)

| Task | Priority | Effort |
|------|----------|--------|
| Dashboard Arabic UI | High | Medium |
| Employee management Arabic | High | Medium |
| Leave management Arabic | High | Medium |
| Attendance Arabic | High | Medium |
| Arabic form validation | High | Medium |

### Phase 3: Advanced Features (Weeks 9-12)

| Task | Priority | Effort |
|------|----------|--------|
| Hijri calendar implementation | High | Medium |
| Arabic report generation | High | High |
| Arabic email templates | High | Medium |
| Arabic PDF generation | High | High |
| Payroll Arabic | High | Medium |

### Phase 4: AI & Search (Weeks 13-16)

| Task | Priority | Effort |
|------|----------|--------|
| Arabic text search optimization | Medium | Medium |
| Arabic NLP for chatbot | Medium | High |
| Arabic voice recognition (future) | Low | High |

---

## 11. Testing Strategy

### RTL Testing Checklist

- [ ] All text renders correctly in Arabic
- [ ] Layout flips correctly for RTL
- [ ] Icons/arrows flip appropriately
- [ ] Tables render RTL
- [ ] Forms align correctly
- [ ] Navigation flows RTL
- [ ] Modals/dialogs RTL
- [ ] Date pickers work with Hijri
- [ ] Numbers display correctly
- [ ] Currency formatting correct
- [ ] PDF generation RTL
- [ ] Email templates RTL

### Testing Tools

```typescript
// Cypress RTL tests
describe('RTL Support', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.switchLanguage('ar-SA');
  });

  it('should render RTL layout', () => {
    cy.get('html').should('have.attr', 'dir', 'rtl');
    cy.get('.sidebar').should('have.css', 'right', '0px');
  });

  it('should display Arabic text correctly', () => {
    cy.get('[data-testid="dashboard-title"]')
      .should('contain', 'لوحة التحكم');
  });

  it('should handle Arabic form input', () => {
    cy.get('[data-testid="employee-name-ar"]')
      .type('محمد أحمد')
      .should('have.value', 'محمد أحمد');
  });
});
```

---

## 12. Quality Assurance

### Arabic Content Review

1. **Professional Translation**
   - Use native Arabic speakers for translation
   - HR domain expertise required
   - Legal terminology accuracy

2. **Cultural Adaptation**
   - Appropriate greetings
   - Gender-neutral where appropriate
   - Islamic considerations (Hajj, Ramadan)

3. **Consistency**
   - Terminology glossary maintenance
   - Style guide for Arabic content
   - Regular translation audits

---

**Next:** [Implementation Roadmap](./05-IMPLEMENTATION-ROADMAP.md)
