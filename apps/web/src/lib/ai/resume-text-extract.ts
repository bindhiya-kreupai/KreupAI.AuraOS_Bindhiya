/**
 * Extract plain text from uploaded resume files (txt / md / pdf / docx).
 */

import * as mammoth from 'mammoth';

export class ResumeExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResumeExtractError';
  }
}

function looksLikeBinaryGarbage(text: string): boolean {
  if (!text.trim()) return true;
  const sample = text.slice(0, 500);
  const nonPrintable = sample.replace(/[\x09\x0a\x0d\x20-\x7e]/g, '').length;
  return nonPrintable / Math.max(sample.length, 1) > 0.3;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const mod = await import('pdf-parse');
  const pdfParse = (mod.default || mod) as (data: Buffer) => Promise<{ text: string }>;
  const parsed = await pdfParse(buffer);
  return String(parsed.text || '').trim();
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return String(result.value || '').trim();
}

export async function extractResumeTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<string> {
  const lower = fileName.toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (
    lower.endsWith('.txt') ||
    lower.endsWith('.md') ||
    lower.endsWith('.csv') ||
    mime.startsWith('text/')
  ) {
    const text = buffer.toString('utf8').trim();
    if (text.length < 40) {
      throw new ResumeExtractError(`${fileName}: text content is too short`);
    }
    return text;
  }

  if (lower.endsWith('.pdf') || mime === 'application/pdf') {
    const text = await extractPdf(buffer);
    if (text.length < 40 || looksLikeBinaryGarbage(text)) {
      throw new ResumeExtractError(
        `${fileName}: could not extract readable text from PDF (try a text-based PDF)`
      );
    }
    return text;
  }

  if (
    lower.endsWith('.docx') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const text = await extractDocx(buffer);
    if (text.length < 40) {
      throw new ResumeExtractError(`${fileName}: could not extract text from Word document`);
    }
    return text;
  }

  // Last resort — treat as utf8
  const fallback = buffer.toString('utf8').trim();
  if (fallback.length >= 40 && !looksLikeBinaryGarbage(fallback)) {
    return fallback;
  }

  throw new ResumeExtractError(`${fileName}: unsupported type. Upload .txt, .md, .pdf, or .docx`);
}

export const RESUME_UPLOAD_ACCEPT =
  '.txt,.md,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const MAX_BULK_RESUMES = 20;
