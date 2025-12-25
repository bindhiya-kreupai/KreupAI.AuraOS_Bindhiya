/**
 * Payslip PDF Generator Service
 * Phase 2: Core Enhancement - Bilingual PDF Generation
 *
 * Generates professional payslips with Arabic/English support
 */

import type { Payslip, TaxDetails } from './types';
import { PayslipLine, StatutoryLine } from './types';
import { SupportedCountryCode, COUNTRY_NAMES, COUNTRY_CURRENCIES } from '../compliance/types';

// ============================================================================
// PDF TEMPLATE TYPES
// ============================================================================

export interface PayslipPDFOptions {
  language: 'en' | 'ar' | 'bilingual';
  showYTD: boolean;
  showBankDetails: boolean;
  showStatutoryBreakdown: boolean;
  showTaxDetails: boolean;
  companyLogo?: string;
  companyName: string;
  companyNameAr?: string;
  companyAddress?: string;
  companyAddressAr?: string;
  footerText?: string;
  footerTextAr?: string;
}

export interface PDFContent {
  html: string;
  css: string;
  isRTL: boolean;
}

// ============================================================================
// PAYSLIP PDF GENERATOR
// ============================================================================

export class PayslipPDFGenerator {
  /**
   * Generate payslip PDF content
   */
  static generate(payslip: Payslip, options: PayslipPDFOptions): PDFContent {
    const isRTL = options.language === 'ar';
    const isBilingual = options.language === 'bilingual';

    const css = this.generateCSS(isRTL);
    const html = this.generateHTML(payslip, options, isBilingual);

    return { html, css, isRTL };
  }

  /**
   * Generate CSS for payslip
   */
  private static generateCSS(isRTL: boolean): string {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: ${isRTL ? "'Noto Sans Arabic', 'Inter', sans-serif" : "'Inter', 'Noto Sans Arabic', sans-serif"};
        font-size: 10pt;
        color: #1a1a1a;
        direction: ${isRTL ? 'rtl' : 'ltr'};
        line-height: 1.4;
      }

      .payslip-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 15mm;
        background: #fff;
      }

      /* Header */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }

      .company-info {
        flex: 1;
      }

      .company-name {
        font-size: 18pt;
        font-weight: 700;
        color: #0066cc;
        margin-bottom: 5px;
      }

      .company-name-ar {
        font-size: 16pt;
        font-weight: 600;
        color: #333;
        font-family: 'Noto Sans Arabic', sans-serif;
      }

      .company-address {
        font-size: 9pt;
        color: #666;
      }

      .payslip-title {
        text-align: ${isRTL ? 'left' : 'right'};
      }

      .payslip-title h1 {
        font-size: 14pt;
        color: #0066cc;
        margin-bottom: 5px;
      }

      .payslip-month {
        font-size: 12pt;
        font-weight: 600;
      }

      /* Employee Info */
      .employee-section {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .info-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
      }

      .info-label {
        font-size: 9pt;
        color: #666;
        font-weight: 500;
      }

      .info-value {
        font-size: 10pt;
        font-weight: 600;
        color: #1a1a1a;
      }

      /* Tables */
      .section-title {
        font-size: 11pt;
        font-weight: 700;
        color: #0066cc;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #e0e0e0;
      }

      .earnings-deductions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9pt;
      }

      th {
        background: #f0f4f8;
        padding: 8px 10px;
        text-align: ${isRTL ? 'right' : 'left'};
        font-weight: 600;
        color: #333;
        border-bottom: 2px solid #0066cc;
      }

      th.amount {
        text-align: ${isRTL ? 'left' : 'right'};
      }

      td {
        padding: 6px 10px;
        border-bottom: 1px solid #e8e8e8;
      }

      td.amount {
        text-align: ${isRTL ? 'left' : 'right'};
        font-weight: 500;
        font-family: 'Inter', sans-serif;
      }

      tr.total {
        background: #f0f4f8;
        font-weight: 700;
      }

      tr.total td {
        border-bottom: 2px solid #0066cc;
        padding: 10px;
      }

      /* Summary Box */
      .summary-box {
        background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
        color: white;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }

      .summary-row:last-child {
        border-bottom: none;
      }

      .summary-row.net-pay {
        font-size: 14pt;
        font-weight: 700;
        padding-top: 10px;
        margin-top: 10px;
        border-top: 2px solid rgba(255,255,255,0.5);
      }

      /* Statutory */
      .statutory-section {
        margin-bottom: 20px;
      }

      .statutory-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }

      .statutory-item {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 6px;
        text-align: center;
      }

      .statutory-label {
        font-size: 8pt;
        color: #666;
        margin-bottom: 3px;
      }

      .statutory-value {
        font-size: 11pt;
        font-weight: 700;
        color: #1a1a1a;
      }

      /* YTD Section */
      .ytd-section {
        background: #fff3cd;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .ytd-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        text-align: center;
      }

      .ytd-item .ytd-label {
        font-size: 8pt;
        color: #856404;
      }

      .ytd-item .ytd-value {
        font-size: 12pt;
        font-weight: 700;
        color: #856404;
      }

      /* Bank Details */
      .bank-section {
        background: #e8f4e8;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .bank-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }

      /* Footer */
      .footer {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #e0e0e0;
        font-size: 8pt;
        color: #666;
        text-align: center;
      }

      .footer-note {
        font-style: italic;
      }

      /* Print styles */
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .payslip-container {
          padding: 10mm;
        }
      }

      /* Bilingual support */
      .bilingual-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .text-en {
        font-family: 'Inter', sans-serif;
      }

      .text-ar {
        font-family: 'Noto Sans Arabic', sans-serif;
        font-size: 9pt;
        color: #555;
      }
    `;
  }

  /**
   * Generate HTML content for payslip
   */
  private static generateHTML(
    payslip: Payslip,
    options: PayslipPDFOptions,
    isBilingual: boolean
  ): string {
    const t = this.getTranslations(options.language);
    const currencySymbol = this.getCurrencySymbol(payslip.currency);

    return `
      <div class="payslip-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            ${options.companyLogo ? `<img src="${options.companyLogo}" alt="Logo" style="height: 50px; margin-bottom: 10px;">` : ''}
            <div class="company-name">${options.companyName}</div>
            ${options.companyNameAr ? `<div class="company-name-ar">${options.companyNameAr}</div>` : ''}
            ${options.companyAddress ? `<div class="company-address">${options.companyAddress}</div>` : ''}
          </div>
          <div class="payslip-title">
            <h1>${t.payslipTitle}</h1>
            <div class="payslip-month">${this.formatMonth(payslip.month)}</div>
          </div>
        </div>

        <!-- Employee Information -->
        <div class="employee-section">
          <div class="info-group">
            <div class="info-row">
              <span class="info-label">${t.employeeName}</span>
              <span class="info-value">${isBilingual && payslip.employeeNameAr
                ? `${payslip.employeeName} / ${payslip.employeeNameAr}`
                : payslip.employeeName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.employeeCode}</span>
              <span class="info-value">${payslip.employeeCode}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.department}</span>
              <span class="info-value">${payslip.department}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.designation}</span>
              <span class="info-value">${payslip.designation}</span>
            </div>
          </div>
          <div class="info-group">
            <div class="info-row">
              <span class="info-label">${t.workingDays}</span>
              <span class="info-value">${payslip.daysWorked} / ${payslip.totalWorkingDays}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.paidLeave}</span>
              <span class="info-value">${payslip.paidLeaveDays}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.unpaidLeave}</span>
              <span class="info-value">${payslip.unpaidLeaveDays}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.lop}</span>
              <span class="info-value">${payslip.lopDays}</span>
            </div>
          </div>
        </div>

        <!-- Earnings & Deductions -->
        <div class="earnings-deductions">
          <!-- Earnings -->
          <div class="earnings-column">
            <div class="section-title">${t.earnings}</div>
            <table>
              <thead>
                <tr>
                  <th>${t.description}</th>
                  <th class="amount">${t.amount} (${currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                ${payslip.earnings.map(e => `
                  <tr>
                    <td>${isBilingual
                      ? `<div class="bilingual-text"><span class="text-en">${e.componentName}</span><span class="text-ar">${e.componentNameAr}</span></div>`
                      : (options.language === 'ar' ? e.componentNameAr : e.componentName)}</td>
                    <td class="amount">${this.formatCurrency(e.calculatedAmount)}</td>
                  </tr>
                `).join('')}
                <tr class="total">
                  <td>${t.totalEarnings}</td>
                  <td class="amount">${this.formatCurrency(payslip.totalEarnings)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Deductions -->
          <div class="deductions-column">
            <div class="section-title">${t.deductions}</div>
            <table>
              <thead>
                <tr>
                  <th>${t.description}</th>
                  <th class="amount">${t.amount} (${currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                ${payslip.deductions.map(d => `
                  <tr>
                    <td>${isBilingual
                      ? `<div class="bilingual-text"><span class="text-en">${d.componentName}</span><span class="text-ar">${d.componentNameAr}</span></div>`
                      : (options.language === 'ar' ? d.componentNameAr : d.componentName)}</td>
                    <td class="amount">${this.formatCurrency(d.calculatedAmount)}</td>
                  </tr>
                `).join('')}
                ${payslip.statutoryDeductions.filter(s => s.employeeAmount > 0).map(s => `
                  <tr>
                    <td>${isBilingual
                      ? `<div class="bilingual-text"><span class="text-en">${s.name}</span><span class="text-ar">${s.nameAr}</span></div>`
                      : (options.language === 'ar' ? s.nameAr : s.name)}</td>
                    <td class="amount">${this.formatCurrency(s.employeeAmount)}</td>
                  </tr>
                `).join('')}
                ${payslip.taxDetails ? `
                  <tr>
                    <td>${t.incomeTax}</td>
                    <td class="amount">${this.formatCurrency(payslip.taxDetails.monthlyTds)}</td>
                  </tr>
                ` : ''}
                <tr class="total">
                  <td>${t.totalDeductions}</td>
                  <td class="amount">${this.formatCurrency(payslip.totalDeductions + payslip.totalStatutory + (payslip.taxDetails?.monthlyTds || 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Net Pay Summary -->
        <div class="summary-box">
          <div class="summary-row">
            <span>${t.grossEarnings}</span>
            <span>${currencySymbol} ${this.formatCurrency(payslip.grossSalary)}</span>
          </div>
          <div class="summary-row">
            <span>${t.totalDeductions}</span>
            <span>${currencySymbol} ${this.formatCurrency(payslip.totalDeductions + payslip.totalStatutory + (payslip.taxDetails?.monthlyTds || 0))}</span>
          </div>
          <div class="summary-row net-pay">
            <span>${t.netPay}</span>
            <span>${currencySymbol} ${this.formatCurrency(payslip.netSalary)}</span>
          </div>
        </div>

        ${options.showStatutoryBreakdown && payslip.statutoryDeductions.length > 0 ? `
          <!-- Statutory Breakdown -->
          <div class="statutory-section">
            <div class="section-title">${t.statutoryContributions}</div>
            <div class="statutory-grid">
              ${payslip.statutoryDeductions.map(s => `
                <div class="statutory-item">
                  <div class="statutory-label">${options.language === 'ar' ? s.nameAr : s.name}</div>
                  <div class="statutory-value">
                    ${t.employee}: ${currencySymbol} ${this.formatCurrency(s.employeeAmount)}<br>
                    ${t.employer}: ${currencySymbol} ${this.formatCurrency(s.employerAmount)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${options.showYTD ? `
          <!-- YTD Summary -->
          <div class="ytd-section">
            <div class="section-title">${t.ytdSummary}</div>
            <div class="ytd-grid">
              <div class="ytd-item">
                <div class="ytd-label">${t.ytdGross}</div>
                <div class="ytd-value">${currencySymbol} ${this.formatCurrency(payslip.ytdGross)}</div>
              </div>
              <div class="ytd-item">
                <div class="ytd-label">${t.ytdDeductions}</div>
                <div class="ytd-value">${currencySymbol} ${this.formatCurrency(payslip.ytdDeductions)}</div>
              </div>
              <div class="ytd-item">
                <div class="ytd-label">${t.ytdTax}</div>
                <div class="ytd-value">${currencySymbol} ${this.formatCurrency(payslip.ytdTax)}</div>
              </div>
              <div class="ytd-item">
                <div class="ytd-label">${t.ytdNet}</div>
                <div class="ytd-value">${currencySymbol} ${this.formatCurrency(payslip.ytdNet)}</div>
              </div>
            </div>
          </div>
        ` : ''}

        ${options.showBankDetails && payslip.bankAccountNumber ? `
          <!-- Bank Details -->
          <div class="bank-section">
            <div class="section-title">${t.bankDetails}</div>
            <div class="bank-grid">
              <div>
                <div class="info-label">${t.bankName}</div>
                <div class="info-value">${payslip.bankName || '-'}</div>
              </div>
              <div>
                <div class="info-label">${t.accountNumber}</div>
                <div class="info-value">${this.maskAccountNumber(payslip.bankAccountNumber)}</div>
              </div>
              ${payslip.bankIBAN ? `
                <div>
                  <div class="info-label">${t.iban}</div>
                  <div class="info-value">${this.maskIBAN(payslip.bankIBAN)}</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${options.showTaxDetails && payslip.taxDetails ? this.renderTaxDetails(payslip.taxDetails, t, currencySymbol) : ''}

        <!-- Footer -->
        <div class="footer">
          <p class="footer-note">${options.language === 'ar'
            ? (options.footerTextAr || 'هذا كشف راتب تم إنشاؤه تلقائياً ولا يتطلب توقيعاً')
            : (options.footerText || 'This is a computer-generated payslip and does not require a signature')}</p>
          <p>Generated on ${new Date().toLocaleDateString('en-GB')} | AuraOS HR</p>
        </div>
      </div>
    `;
  }

  /**
   * Render tax details section (India)
   */
  private static renderTaxDetails(
    taxDetails: TaxDetails,
    t: Record<string, string>,
    currencySymbol: string
  ): string {
    return `
      <div class="tax-section" style="margin-bottom: 20px;">
        <div class="section-title">${t.taxDetails} (${taxDetails.regime === 'NEW' ? 'New Regime' : 'Old Regime'})</div>
        <table>
          <tbody>
            <tr>
              <td>Annual Gross Income</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.annualGross)}</td>
            </tr>
            <tr>
              <td>Total Exemptions</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.totalExemptions)}</td>
            </tr>
            <tr>
              <td>Taxable Income</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.taxableIncome)}</td>
            </tr>
            <tr>
              <td>Gross Tax</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.grossTax)}</td>
            </tr>
            ${taxDetails.rebate87A > 0 ? `
              <tr>
                <td>Less: Section 87A Rebate</td>
                <td class="amount">- ${currencySymbol} ${this.formatCurrency(taxDetails.rebate87A)}</td>
              </tr>
            ` : ''}
            ${taxDetails.surcharge > 0 ? `
              <tr>
                <td>Add: Surcharge</td>
                <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.surcharge)}</td>
              </tr>
            ` : ''}
            <tr>
              <td>Add: Health & Education Cess (4%)</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.healthEducationCess)}</td>
            </tr>
            <tr class="total">
              <td>Total Annual Tax</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.totalTax)}</td>
            </tr>
            <tr>
              <td>TDS This Month</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.monthlyTds)}</td>
            </tr>
            <tr>
              <td>TDS Paid YTD</td>
              <td class="amount">${currencySymbol} ${this.formatCurrency(taxDetails.ytdTds)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Get translations based on language
   */
  private static getTranslations(language: 'en' | 'ar' | 'bilingual'): Record<string, string> {
    const translations: Record<string, Record<string, string>> = {
      en: {
        payslipTitle: 'Payslip',
        employeeName: 'Employee Name',
        employeeCode: 'Employee ID',
        department: 'Department',
        designation: 'Designation',
        workingDays: 'Working Days',
        paidLeave: 'Paid Leave',
        unpaidLeave: 'Unpaid Leave',
        lop: 'Loss of Pay',
        earnings: 'Earnings',
        deductions: 'Deductions',
        description: 'Description',
        amount: 'Amount',
        totalEarnings: 'Total Earnings',
        totalDeductions: 'Total Deductions',
        grossEarnings: 'Gross Earnings',
        netPay: 'Net Pay',
        statutoryContributions: 'Statutory Contributions',
        employee: 'Employee',
        employer: 'Employer',
        ytdSummary: 'Year-to-Date Summary',
        ytdGross: 'YTD Gross',
        ytdDeductions: 'YTD Deductions',
        ytdTax: 'YTD Tax',
        ytdNet: 'YTD Net',
        bankDetails: 'Bank Details',
        bankName: 'Bank Name',
        accountNumber: 'Account Number',
        iban: 'IBAN',
        taxDetails: 'Tax Details',
        incomeTax: 'Income Tax (TDS)',
      },
      ar: {
        payslipTitle: 'كشف الراتب',
        employeeName: 'اسم الموظف',
        employeeCode: 'رقم الموظف',
        department: 'القسم',
        designation: 'المسمى الوظيفي',
        workingDays: 'أيام العمل',
        paidLeave: 'إجازة مدفوعة',
        unpaidLeave: 'إجازة غير مدفوعة',
        lop: 'خصم الغياب',
        earnings: 'المستحقات',
        deductions: 'الاستقطاعات',
        description: 'الوصف',
        amount: 'المبلغ',
        totalEarnings: 'إجمالي المستحقات',
        totalDeductions: 'إجمالي الاستقطاعات',
        grossEarnings: 'إجمالي الراتب',
        netPay: 'صافي الراتب',
        statutoryContributions: 'المساهمات القانونية',
        employee: 'الموظف',
        employer: 'صاحب العمل',
        ytdSummary: 'ملخص من بداية السنة',
        ytdGross: 'إجمالي من بداية السنة',
        ytdDeductions: 'استقطاعات من بداية السنة',
        ytdTax: 'ضرائب من بداية السنة',
        ytdNet: 'صافي من بداية السنة',
        bankDetails: 'تفاصيل البنك',
        bankName: 'اسم البنك',
        accountNumber: 'رقم الحساب',
        iban: 'رقم الآيبان',
        taxDetails: 'تفاصيل الضريبة',
        incomeTax: 'ضريبة الدخل',
      },
    };

    return translations[language === 'bilingual' ? 'en' : language];
  }

  /**
   * Format currency with thousand separators
   */
  private static formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Get currency symbol
   */
  private static getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      AED: 'AED',
      SAR: 'SAR',
      BHD: 'BHD',
      QAR: 'QAR',
      OMR: 'OMR',
      KWD: 'KWD',
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return symbols[currency] || currency;
  }

  /**
   * Format month for display
   */
  private static formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Mask bank account number
   */
  private static maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  }

  /**
   * Mask IBAN
   */
  private static maskIBAN(iban: string): string {
    if (iban.length <= 8) return iban;
    return iban.slice(0, 4) + '*'.repeat(iban.length - 8) + iban.slice(-4);
  }
}

export default PayslipPDFGenerator;
