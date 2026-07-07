import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { safeJson, serverError, successItem, validationError } from '@/lib/api/crud-helpers';

const COMMON_LANG_PATTERNS: Record<string, RegExp> = {
  en: /\b(the|is|are|was|were|have|has|do|does|this|that|with|from|your|for|and|you)\b/gi,
  fr: /\b(le|la|les|je|tu|il|elle|nous|vous|ils|elles|est|sont|dans|pour|avec|sur|pas)\b/gi,
  es: /\b(el|la|los|las|yo|tú|él|ella|nosotros|vosotros|ellos|ellas|es|son|está|están|para|con|por|más)\b/gi,
  de: /\b(der|die|das|ich|du|er|sie|es|wir|ihr|sie|Sie|ist|sind|ein|eine|und|mit|auf|nicht)\b/gi,
  ar: /[\u0600-\u06FF]/g,
  zh: /[\u4E00-\u9FFF]/g,
  ja: /[\u3040-\u309F\u30A0-\u30FF]/g,
};

function heuristicDetect(text: string): { languageCode: string; confidence: number } {
  let bestLang = 'en';
  let bestScore = 0;
  const lower = text.slice(0, 500);
  for (const [code, pattern] of Object.entries(COMMON_LANG_PATTERNS)) {
    const matches = lower.match(pattern);
    if (matches) {
      const score = matches.length;
      if (code === 'ar' || code === 'zh' || code === 'ja') {
        const charScore = (matches.length / Math.max(lower.length, 1)) * 100;
        if (charScore > bestScore) {
          bestScore = charScore;
          bestLang = code;
        }
      } else if (score > bestScore) {
        bestScore = score;
        bestLang = code;
      }
    }
  }
  const confidence = Math.min(
    Math.round((bestScore / Math.max(lower.split(/\s+/).length, 1)) * 100),
    95
  );
  return { languageCode: bestLang, confidence: Math.max(confidence, 10) };
}

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const body = await safeJson(request);
    if (!body?.text) return validationError({ message: 'text is required' });
    const { languageCode, confidence } = heuristicDetect(body.text);
    const alternativeLanguages: Array<{ languageCode: string; confidence: number }> = [];
    for (const code of Object.keys(COMMON_LANG_PATTERNS)) {
      if (code !== languageCode) {
        const result = heuristicDetect(body.text.slice(0, 200));
        if (result.languageCode === code) {
          alternativeLanguages.push({
            languageCode: code,
            confidence: Math.round(result.confidence * 0.3),
          });
        }
      }
    }
    const record = await prisma.chatbotLanguageDetection.create({
      data: {
        tenantId,
        text: body.text.slice(0, 1000),
        detectedLanguage: languageCode,
        confidence,
        alternativeLanguages,
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'detect language');
  }
});
