import type { EmailCategory, ParsedEmail } from './email-parsing-types';

const CATEGORY_KEYWORDS: Record<EmailCategory, string[]> = {
  LEAVE_REQUEST: ['leave', 'vacation', 'annual leave', 'time off', 'sick leave'],
  EXPENSE: ['expense', 'invoice', 'receipt', 'reimbursement', 'amount due'],
  TICKET: ['ticket', 'incident', 'issue', 'support', 'help desk'],
  OTHER: [],
};

function isoDate(value: string): string | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

export function parseEmailWithRules(content: string): ParsedEmail {
  const lower = content.toLowerCase();
  const scores = Object.entries(CATEGORY_KEYWORDS).map(
    ([category, words]) =>
      [category as EmailCategory, words.filter((word) => lower.includes(word)).length] as const
  );
  const [category, hits] = scores.sort((a, b) => b[1] - a[1])[0];
  const dates = [
    ...content.matchAll(
      /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?)\b/gi
    ),
  ]
    .map((match) => isoDate(match[0]))
    .filter(Boolean);
  const amount = content.match(/(?:[$€£]|AED\s?|SAR\s?)([\d,]+(?:\.\d{2})?)/i)?.[1];
  const employeeRef = content.match(
    /\b(?:employee(?:\s*(?:id|#|code))?|emp(?:loyee)?\s*#?)\s*[:#-]?\s*([A-Z]{2,10}[- ]?\d{2,10})\b/i
  )?.[1];
  const entities = {
    dates,
    amount: amount ? Number(amount.replace(/,/g, '')) : undefined,
    employeeRef,
    email: content.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0],
  };
  const action =
    category === 'LEAVE_REQUEST'
      ? 'CREATE_LEAVE_REQUEST_DRAFT'
      : category === 'EXPENSE'
        ? 'CREATE_EXPENSE_DRAFT'
        : category === 'TICKET'
          ? 'CREATE_SUPPORT_TICKET_DRAFT'
          : 'ROUTE_FOR_REVIEW';
  return {
    category,
    confidence: hits ? Math.min(0.95, 0.6 + hits * 0.12) : 0.35,
    entities,
    suggestedActions: [{ action, confidence: hits ? 0.8 : 0.4, requiresHumanConfirmation: true }],
    provider: 'rules',
  };
}
