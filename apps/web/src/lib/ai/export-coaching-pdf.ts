import { jsPDF } from 'jspdf';
import { getMessageReferences } from './coaching-references';

export type CoachingPdfMessage = {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  provider?: string;
  sources?: {
    index: number;
    title: string;
    source: string;
    snippet?: string;
    similarity?: number;
    policyId?: string;
    href?: string;
  }[];
  citations?: { title: string; source: string; policyId?: string; href?: string }[];
  decisions?: {
    title: string;
    context: string;
    options: { label: string; pros: string[]; cons: string[]; recommendation?: boolean }[];
    recommendedAction?: string;
  };
  employeeContext?: {
    name: string;
    employeeCode: string;
    department?: string;
    jobTitle?: string;
    pendingLeaveRequests?: number;
    approvedLeaveDaysYtd?: number;
    latestPerformanceRating?: number;
    tenureMonths?: number;
  };
};

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^##\s+/gm, '')
    .replace(/^-\s+/gm, '• ');
}

function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'hr-coach'
  );
}

function createPdfWriter(doc: jsPDF) {
  const margin = 14;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addText = (text: string, fontSize = 10, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    if (!text) {
      y += fontSize * 0.25;
      return;
    }
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    const lineHeight = fontSize * 0.42;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += 2;
  };

  return { addText };
}

function appendMessageContent(
  message: CoachingPdfMessage,
  writer: ReturnType<typeof createPdfWriter>
) {
  const { addText } = writer;
  const role = message.type === 'user' ? 'You' : 'Aura HR Coach';
  addText(`${role} · ${new Date(message.timestamp).toLocaleString()}`, 9, 'italic');
  if (message.type === 'bot' && message.provider) {
    addText(`Provider: ${message.provider}`, 8, 'italic');
  }
  addText(stripMarkdown(message.content), 10);

  if (message.decisions) {
    addText(message.decisions.title, 11, 'bold');
    addText(message.decisions.context, 9);
    for (const opt of message.decisions.options) {
      const tag = opt.recommendation ? ' (Recommended)' : '';
      addText(`${opt.label}${tag}`, 10, 'bold');
      if (opt.pros.length) addText(`Pros: ${opt.pros.join(', ')}`, 9);
      if (opt.cons.length) addText(`Cons: ${opt.cons.join(', ')}`, 9);
    }
    if (message.decisions.recommendedAction) {
      addText(`Recommended action: ${message.decisions.recommendedAction}`, 9, 'bold');
    }
  }

  if (message.employeeContext) {
    const ec = message.employeeContext;
    addText('Employee context (live data)', 10, 'bold');
    addText(
      `${ec.name} (${ec.employeeCode}) · ${ec.jobTitle || 'Role'} · ${ec.department || '—'}`,
      9
    );
    const parts: string[] = [];
    if (ec.tenureMonths != null) parts.push(`${ec.tenureMonths} mo tenure`);
    if (ec.pendingLeaveRequests != null) parts.push(`${ec.pendingLeaveRequests} pending leave`);
    if (ec.approvedLeaveDaysYtd != null) parts.push(`${ec.approvedLeaveDaysYtd} leave days YTD`);
    if (ec.latestPerformanceRating != null) parts.push(`Rating ${ec.latestPerformanceRating}`);
    if (parts.length) addText(parts.join(' · '), 9);
  }

  const refs = getMessageReferences(message);
  if (refs.length) {
    addText('References', 10, 'bold');
    refs.forEach((ref, i) => {
      const match = ref.similarity != null ? ` (${Math.round(ref.similarity * 100)}% match)` : '';
      addText(`${i + 1}. ${ref.title}${match} — ${ref.source}`, 9);
      if (ref.snippet) addText(ref.snippet, 8, 'italic');
      if (ref.href) addText(ref.href, 8, 'italic');
    });
  }

  addText('—', 9);
}

export function exportCoachingMessagePdf(
  message: CoachingPdfMessage,
  options?: { filename?: string }
) {
  const doc = new jsPDF();
  const writer = createPdfWriter(doc);

  writer.addText('Aura HR Coach', 14, 'bold');
  writer.addText(`Exported: ${new Date().toLocaleString()}`, 9, 'italic');
  writer.addText('', 4);

  appendMessageContent(message, writer);

  const base = options?.filename || `hr-coach-response-${Date.now()}`;
  doc.save(`${sanitizeFilename(base)}.pdf`);
}

export function exportCoachingConversationPdf(
  messages: CoachingPdfMessage[],
  options?: { title?: string; filename?: string }
) {
  const doc = new jsPDF();
  const writer = createPdfWriter(doc);

  writer.addText('Aura HR Coach — Conversation', 14, 'bold');
  if (options?.title) writer.addText(options.title, 11, 'bold');
  writer.addText(`Exported: ${new Date().toLocaleString()}`, 9, 'italic');
  writer.addText('', 4);

  for (const message of messages) {
    appendMessageContent(message, writer);
  }

  const base = options?.filename || options?.title || `hr-coach-conversation-${Date.now()}`;
  doc.save(`${sanitizeFilename(base)}.pdf`);
}
