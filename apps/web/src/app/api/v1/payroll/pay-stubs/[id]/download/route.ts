/**
 * @api GET /api/v1/payroll/pay-stubs/:id/download
 * @description Download PDF pay stub for a specific pay period
 */

import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // In production, this would:
  // 1. Fetch pay stub data from database
  // 2. Generate PDF using a library (e.g., PDFKit, Puppeteer, or jsPDF)
  // 3. Return the PDF binary

  const mockPayStubData = {
    id,
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    employeeAddress: '123 Main Street, San Francisco, CA 94102',
    ssn: '***-**-1234',
    companyName: 'Aura Technologies Inc.',
    companyAddress: '456 Market Street, San Francisco, CA 94105',
    ein: '12-3456789',
    payPeriod: {
      start: '2026-01-01',
      end: '2026-01-15',
      payDate: '2026-01-20',
    },
    earnings: {
      regular: { hours: 80, rate: 62.5, amount: 5000 },
      overtime: { hours: 4, rate: 93.75, amount: 375 },
      bonus: { amount: 500 },
      grossPay: 5875,
    },
    deductions: {
      federalTax: 882.75,
      stateTax: 411.25,
      socialSecurity: 364.25,
      medicare: 85.19,
      health: 140,
      dental: 0,
      vision: 0,
      retirement401k: 470,
      hsa: 200,
      totalDeductions: 2553.44,
    },
    netPay: 3321.56,
    ytd: {
      grossPay: 5875,
      federalTax: 882.75,
      stateTax: 411.25,
      socialSecurity: 364.25,
      medicare: 85.19,
      retirement401k: 470,
      netPay: 3321.56,
    },
    directDeposit: {
      bankName: 'Chase Bank',
      accountLast4: '4567',
      routingLast4: '0021',
      amount: 3321.56,
    },
  };

  // Generate mock PDF content
  const pdfContent = generateMockPDF(mockPayStubData);

  return new NextResponse(pdfContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="pay-stub-${id}.pdf"`,
      'Content-Length': pdfContent.length.toString(),
      'X-Pay-Stub-Id': id,
      'X-Pay-Period': `${mockPayStubData.payPeriod.start} to ${mockPayStubData.payPeriod.end}`,
    },
  });
}

function generateMockPDF(data: any): Buffer {
  // In production, use PDFKit or similar:
  // const doc = new PDFDocument();
  // doc.text(`PAY STUB - ${data.companyName}`);
  // doc.text(`Employee: ${data.employeeName}`);
  // doc.text(`Pay Period: ${data.payPeriod.start} - ${data.payPeriod.end}`);
  // ...

  const textContent = [
    `%PDF-1.4 (Mock PDF)`,
    `PAY STUB`,
    `Company: ${data.companyName}`,
    `Employee: ${data.employeeName}`,
    `Pay Period: ${data.payPeriod.start} to ${data.payPeriod.end}`,
    `Pay Date: ${data.payPeriod.payDate}`,
    ``,
    `EARNINGS:`,
    `  Regular: ${data.earnings.regular.hours}hrs @ $${data.earnings.regular.rate}/hr = $${data.earnings.regular.amount.toFixed(2)}`,
    `  Overtime: ${data.earnings.overtime.hours}hrs @ $${data.earnings.overtime.rate}/hr = $${data.earnings.overtime.amount.toFixed(2)}`,
    `  Bonus: $${data.earnings.bonus.amount.toFixed(2)}`,
    `  Gross Pay: $${data.earnings.grossPay.toFixed(2)}`,
    ``,
    `DEDUCTIONS:`,
    `  Federal Tax: $${data.deductions.federalTax.toFixed(2)}`,
    `  State Tax: $${data.deductions.stateTax.toFixed(2)}`,
    `  Social Security: $${data.deductions.socialSecurity.toFixed(2)}`,
    `  Medicare: $${data.deductions.medicare.toFixed(2)}`,
    `  Health Insurance: $${data.deductions.health.toFixed(2)}`,
    `  401(k): $${data.deductions.retirement401k.toFixed(2)}`,
    `  HSA: $${data.deductions.hsa.toFixed(2)}`,
    `  Total Deductions: $${data.deductions.totalDeductions.toFixed(2)}`,
    ``,
    `NET PAY: $${data.netPay.toFixed(2)}`,
    ``,
    `Direct Deposit: ${data.directDeposit.bankName} ****${data.directDeposit.accountLast4}`,
  ].join('\n');

  return Buffer.from(textContent, 'utf-8');
}
