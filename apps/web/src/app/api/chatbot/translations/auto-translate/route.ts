import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { serverError, successItem, validationError } from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();
    if (!body?.text || !body?.sourceLanguage || !body?.targetLanguage)
      return validationError({ message: 'text, sourceLanguage, and targetLanguage are required' });
    const { text, sourceLanguage, targetLanguage } = body;
    const translatedText = `[auto] ${text} (${sourceLanguage}→${targetLanguage})`;
    return successItem({ translatedText });
  } catch (error: any) {
    return serverError(error, 'auto-translate');
  }
});
